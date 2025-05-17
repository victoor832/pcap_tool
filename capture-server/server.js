/**
 * Servidor de captura en tiempo real para Wireshark Web
 * 
 * Este servidor utiliza la biblioteca pcap para capturar paquetes de red
 * y WebSockets para enviarlos en tiempo real al cliente.
 * 
 * Requiere permisos de administrador (sudo) para acceder a las interfaces de red.
 */

const WebSocket = require('ws');
const pcap = require('pcap');
const express = require('express');
const cors = require('cors');
const http = require('http');
const os = require('os');

// Crear servidor HTTP y WebSocket
const app = express();
app.use(cors());
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Puerto para el servidor
const PORT = process.env.PORT || 8080;

// Almacenar las sesiones de captura activas
const captureSessions = new Map();

// Ruta para obtener las interfaces de red disponibles
app.get('/api/interfaces', (req, res) => {
  try {
    const interfaces = [];
    const networkInterfaces = os.networkInterfaces();
    
    for (const [name, netInterface] of Object.entries(networkInterfaces)) {
      for (const iface of netInterface) {
        if (iface.family === 'IPv4') {
          interfaces.push({
            name,
            address: iface.address,
            netmask: iface.netmask,
            mac: iface.mac || 'Unknown'
          });
          break;
        }
      }
    }
    
    res.json({ interfaces });
  } catch (error) {
    console.error('Error al obtener interfaces:', error);
    res.status(500).json({ error: error.message });
  }
});

// Manejar conexiones WebSocket
wss.on('connection', (ws) => {
  console.log('Cliente conectado');
  
  // Enviar lista de interfaces disponibles al cliente
  try {
    const deviceList = pcap.findalldevs();
    ws.send(JSON.stringify({
      type: 'interfaces',
      data: deviceList.map(device => ({
        name: device.name,
        description: device.description || device.name
      }))
    }));
  } catch (error) {
    ws.send(JSON.stringify({
      type: 'error',
      message: 'Error al obtener interfaces: ' + error.message
    }));
  }
  
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      
      if (data.action === 'start_capture') {
        // Iniciar captura
        try {
          console.log(`Iniciando captura en interfaz ${data.interface} con filtro: ${data.filter || 'ninguno'}`);
          
          let session;
          const sessionId = Date.now().toString();
          
          // Manejo especial para la interfaz 'any'
          if (data.interface === 'any') {
            try {
              // Para la interfaz 'any', especificamos explícitamente promisc: false
              session = pcap.createSession(data.interface, {
                filter: data.filter || '',
                promisc: false,
                buffer_size: 10 * 1024 * 1024
              });
            } catch (anyError) {
              // Si falla el intento con 'any', intenta con la primera interfaz disponible
              console.log("Error con interfaz 'any', intentando con interfaz alternativa...");
              const devices = pcap.findalldevs();
              const firstRealDevice = devices.find(d => 
                !['any', 'bluetooth-monitor', 'nflog', 'nfqueue', 'dbus-system', 'dbus-session'].includes(d.name)
              );
              
              if (firstRealDevice) {
                console.log(`Usando interfaz alternativa: ${firstRealDevice.name}`);
                session = pcap.createSession(firstRealDevice.name, {
                  filter: data.filter || '',
                  promisc: true,
                  buffer_size: 10 * 1024 * 1024
                });
              } else {
                throw new Error("No se encontró ninguna interfaz de red utilizable");
              }
            }
          } else {
            // Para otras interfaces, usamos la lógica existente
            const specialInterfaces = ['bluetooth-monitor', 'nflog', 'nfqueue', 'dbus-system', 'dbus-session'];
            const usePromiscuous = !specialInterfaces.includes(data.interface);
            
            session = pcap.createSession(data.interface, {
              filter: data.filter || '',
              promisc: usePromiscuous,
              buffer_size: 10 * 1024 * 1024
            });
          }
          
          captureSessions.set(sessionId, {
            session,
            ws,
            packetCount: 0,
            startTime: new Date()
          });
          
          session.on('packet', (rawPacket) => {
            try {
              const packet = pcap.decode.packet(rawPacket);
              const captureInfo = captureSessions.get(sessionId);
              
              if (captureInfo) {
                captureInfo.packetCount++;
                
                // Convertir el paquete a un formato más simple para enviar al cliente
                const simplifiedPacket = simplifyPacket(packet, captureInfo.packetCount);
                
                ws.send(JSON.stringify({
                  type: 'packet',
                  data: simplifiedPacket
                }));
              }
            } catch (error) {
              console.error('Error al procesar paquete:', error);
            }
          });
          
          ws.send(JSON.stringify({
            type: 'capture_started',
            sessionId,
            message: `Captura iniciada en interfaz ${data.interface}`
          }));
        } catch (error) {
          console.error('Error al iniciar captura:', error);
          ws.send(JSON.stringify({
            type: 'error',
            message: 'Error al iniciar captura: ' + error.message
          }));
        }
      } else if (data.action === 'stop_capture') {
        // Detener captura
        const captureInfo = captureSessions.get(data.sessionId);
        
        if (captureInfo) {
          console.log(`Deteniendo captura de sesión ${data.sessionId}`);
          captureInfo.session.close();
          
          const duration = Math.round((new Date() - captureInfo.startTime) / 1000);
          
          ws.send(JSON.stringify({
            type: 'capture_stopped',
            packetCount: captureInfo.packetCount,
            duration: duration
          }));
          
          captureSessions.delete(data.sessionId);
        } else {
          ws.send(JSON.stringify({
            type: 'error',
            message: 'Sesión de captura no encontrada'
          }));
        }
      }
    } catch (error) {
      console.error('Error al procesar mensaje:', error);
      ws.send(JSON.stringify({
        type: 'error',
        message: 'Error al procesar mensaje: ' + error.message
      }));
    }
  });
  
  ws.on('close', () => {
    // Limpiar todas las sesiones asociadas a este cliente
    for (const [sessionId, captureInfo] of captureSessions.entries()) {
      if (captureInfo.ws === ws) {
        console.log(`Cliente desconectado, cerrando sesión ${sessionId}`);
        captureInfo.session.close();
        captureSessions.delete(sessionId);
      }
    }
    console.log('Cliente desconectado');
  });
});

// Función para simplificar el paquete para enviar al cliente
function simplifyPacket(packet, id) {
  try {
    const decodedPacket = {
      id,
      time: new Date().toISOString(),
      length: packet.pcap_header.len,
      protocol: 'Unknown',
      source: '',
      destination: '',
      info: ''
    };
    
    // Ethernet
    if (packet.payload && packet.payload.ethertype) {
      // IPv4
      if (packet.payload.ethertype === 2048 && packet.payload.payload) {
        const ip = packet.payload.payload;
        
        // Verificar y manejar diferentes tipos de dirección IP
        if (ip.saddr) {
          decodedPacket.source = Array.isArray(ip.saddr) ? ip.saddr.join('.') : 
                               (typeof ip.saddr === 'string' ? ip.saddr : ip.saddr.toString());
        }
        
        if (ip.daddr) {
          decodedPacket.destination = Array.isArray(ip.daddr) ? ip.daddr.join('.') : 
                                    (typeof ip.daddr === 'string' ? ip.daddr : ip.daddr.toString());
        }
        
        // TCP
        if (ip.protocol === 6 && ip.payload) {
          decodedPacket.protocol = 'TCP';
          const tcp = ip.payload;
          decodedPacket.info = `${tcp.sport} → ${tcp.dport} [Flags: ${getTcpFlags(tcp)}]`;
          
          // HTTP
          if ((tcp.sport === 80 || tcp.dport === 80 || tcp.sport === 443 || tcp.dport === 443) && tcp.data) {
            try {
              const data = tcp.data.toString('utf8', 0, Math.min(tcp.data.length, 100));
              if (data.startsWith('GET') || data.startsWith('POST') || data.startsWith('HTTP')) {
                decodedPacket.protocol = 'HTTP';
                decodedPacket.info = data.split('\n')[0];
              }
            } catch (e) {
              // Ignorar errores al intentar decodificar datos binarios como texto
            }
          }
        }
        // UDP
        else if (ip.protocol === 17 && ip.payload) {
          decodedPacket.protocol = 'UDP';
          const udp = ip.payload;
          decodedPacket.info = `${udp.sport} → ${udp.dport} Len=${udp.length}`;
          
          // DNS
          if ((udp.sport === 53 || udp.dport === 53) && udp.data) {
            decodedPacket.protocol = 'DNS';
            decodedPacket.info = 'DNS Query/Response';
          }
        }
        // ICMP
        else if (ip.protocol === 1 && ip.payload) {
          decodedPacket.protocol = 'ICMP';
          decodedPacket.info = `Type: ${ip.payload.type}, Code: ${ip.payload.code}`;
        }
      }
      // ARP
      else if (packet.payload.ethertype === 2054 && packet.payload.payload) {
        decodedPacket.protocol = 'ARP';
        const arp = packet.payload.payload;
        if (arp.sender_pa && arp.target_pa) {
          // Verificar si las direcciones ARP son arrays antes de usar join
          decodedPacket.source = Array.isArray(arp.sender_pa) ? arp.sender_pa.join('.') : 
                               (typeof arp.sender_pa === 'string' ? arp.sender_pa : arp.sender_pa.toString());
          
          decodedPacket.destination = Array.isArray(arp.target_pa) ? arp.target_pa.join('.') : 
                                    (typeof arp.target_pa === 'string' ? arp.target_pa : arp.target_pa.toString());
          
          // Mensaje de información utilizando la misma lógica de manejo de direcciones
          const senderStr = Array.isArray(arp.sender_pa) ? arp.sender_pa.join('.') : 
                         (typeof arp.sender_pa === 'string' ? arp.sender_pa : arp.sender_pa.toString());
          
          const targetStr = Array.isArray(arp.target_pa) ? arp.target_pa.join('.') : 
                         (typeof arp.target_pa === 'string' ? arp.target_pa : arp.target_pa.toString());
          
          decodedPacket.info = arp.operation === 1 ? 'Who has ' + targetStr + '?' : 'Reply ' + senderStr;
        }
      }
    }
    
    return decodedPacket;
  } catch (error) {
    console.error('Error al decodificar paquete:', error);
    return {
      id,
      time: new Date().toISOString(),
      length: packet.pcap_header ? packet.pcap_header.len : 0,
      protocol: 'Error',
      source: '',
      destination: '',
      info: 'Error al decodificar paquete'
    };
  }
}

function getTcpFlags(tcp) {
  if (!tcp.flags) return '';
  
  const flags = [];
  if (tcp.flags.syn) flags.push('SYN');
  if (tcp.flags.ack) flags.push('ACK');
  if (tcp.flags.fin) flags.push('FIN');
  if (tcp.flags.rst) flags.push('RST');
  if (tcp.flags.psh) flags.push('PSH');
  if (tcp.flags.urg) flags.push('URG');
  return flags.join(' ');
}

// Iniciar el servidor
server.listen(PORT, () => {
  console.log(`Servidor de captura iniciado en el puerto ${PORT}`);
  console.log('NOTA: Este servidor debe ejecutarse con permisos de administrador (sudo)');
});