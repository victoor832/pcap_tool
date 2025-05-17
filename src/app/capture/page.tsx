"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { captureClient, NetworkInterface } from "@/lib/capture/websocket-client";
import { Packet } from "@/lib/pcap/pcap-parser";

export default function CapturePage() {
  const [isCapturing, setIsCapturing] = useState(false);
  const [captureTime, setCaptureTime] = useState(0);
  const [packetCount, setPacketCount] = useState(0);
  const [capturedPackets, setCapturedPackets] = useState<Packet[]>([]);
  const [interfaces, setInterfaces] = useState<NetworkInterface[]>([]);
  const [selectedInterface, setSelectedInterface] = useState<string>("");
  const [captureFilter, setCaptureFilter] = useState("");
  const [captureInterval, setCaptureInterval] = useState<NodeJS.Timeout | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  
  // Conectar al servidor WebSocket al cargar la página
  useEffect(() => {
    captureClient.connect()
      .then(() => {
        setIsConnected(true);
        setError(null);
      })
      .catch(err => {
        setError("No se pudo conectar al servidor de captura. Asegúrate de que el servidor esté en ejecución.");
        setIsConnected(false);
      });
    
    // Configurar eventos
    captureClient.onConnect(() => {
      setIsConnected(true);
      setError(null);
      setStatusMessage("Conectado al servidor de captura");
    });
    
    captureClient.onDisconnect(() => {
      setIsConnected(false);
      setIsCapturing(false);
      setStatusMessage("Desconectado del servidor de captura");
    });
    
    captureClient.onError((errorMsg) => {
      setError(errorMsg);
      if (isCapturing) {
        setIsCapturing(false);
      }
    });
    
    captureClient.onInterfaces((networkInterfaces) => {
      setInterfaces(networkInterfaces);
      if (networkInterfaces.length > 0) {
        setSelectedInterface(networkInterfaces[0].name);
      }
    });
    
    captureClient.onPacket((packet) => {
      setPacketCount(prev => prev + 1);
      setCapturedPackets(prev => [packet, ...prev].slice(0, 100));
    });
    
    captureClient.onCaptureStarted((sessionId, message) => {
      setStatusMessage(message);
    });
    
    captureClient.onCaptureStopped((count, duration) => {
      setStatusMessage(`Captura detenida. ${count} paquetes capturados en ${duration} segundos.`);
    });
    
    return () => {
      // Limpiar al desmontar
      if (captureInterval) {
        clearInterval(captureInterval);
      }
      captureClient.disconnect();
    };
  }, []);
  
  // Iniciar captura
  const startCapture = () => {
    if (!isConnected) {
      setError('No hay conexión con el servidor de captura');
      return;
    }
    
    if (!selectedInterface) {
      setError('Selecciona una interfaz de red');
      return;
    }
    
    setIsCapturing(true);
    setPacketCount(0);
    setCaptureTime(0);
    setCapturedPackets([]);
    setError(null);
    
    // Iniciar la captura real
    captureClient.startCapture(selectedInterface, captureFilter);
    
    // Iniciar el contador de tiempo
    const interval = setInterval(() => {
      setCaptureTime(prev => prev + 1);
    }, 1000);
    
    setCaptureInterval(interval);
  };
  
  // Detener captura
  const stopCapture = () => {
    captureClient.stopCapture();
    setIsCapturing(false);
    
    // Limpiar el intervalo de tiempo
    if (captureInterval) {
      clearInterval(captureInterval);
      setCaptureInterval(null);
    }
  };
  
  // Guardar la captura actual como archivo PCAP
  const saveCapture = () => {
    if (capturedPackets.length === 0) return;
    
    // En una implementación real, aquí convertiríamos los paquetes capturados a formato PCAP
    // y los guardaríamos como un archivo
    
    // Simulación: redirigir a la página de análisis con un nombre de archivo simulado
    const fileName = `captura_${new Date().toISOString().replace(/[:.]/g, "-")}.pcap`;
    window.location.href = `/analyze?file=${encodeURIComponent(fileName)}`;
  };
  
  // Formatear el tiempo
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-6 md:p-24">
      <div className="w-full max-w-4xl">
        <div className="mb-8">
          <Link 
            href="/" 
            className="text-blue-600 hover:text-blue-800 flex items-center"
          >
            ← Volver al inicio
          </Link>
        </div>

        <h1 className="text-3xl font-bold mb-6">Captura de tráfico en tiempo real</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <p>{error}</p>
          </div>
        )}
        
        {statusMessage && !error && (
          <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-4">
            <p>{statusMessage}</p>
          </div>
        )}
        
        <div className="bg-white dark:bg-gray-800 border rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Configuración de captura</h2>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              Interfaz de red
            </label>
            <select 
              className="w-full p-2 border rounded-md bg-white dark:bg-gray-700"
              value={selectedInterface}
              onChange={(e) => setSelectedInterface(e.target.value)}
              disabled={isCapturing || !isConnected}
            >
              {interfaces.length === 0 && (
                <option value="">No hay interfaces disponibles</option>
              )}
              {interfaces.map(iface => (
                <option key={iface.name} value={iface.name}>
                  {iface.name} - {iface.description}
                </option>
              ))}
            </select>
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">
              Filtro de captura (opcional)
            </label>
            <input 
              type="text" 
              className="w-full p-2 border rounded-md bg-white dark:bg-gray-700"
              placeholder="Ejemplo: tcp port 80 or udp port 53"
              value={captureFilter}
              onChange={(e) => setCaptureFilter(e.target.value)}
              disabled={isCapturing || !isConnected}
            />
            <p className="mt-1 text-xs text-gray-500">
              Utiliza la sintaxis de filtros de Wireshark/BPF
            </p>
          </div>
          
          <div className="flex space-x-4">
            {isCapturing ? (
              <button
                onClick={stopCapture}
                className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-6 rounded"
                disabled={!isConnected}
              >
                Detener captura
              </button>
            ) : (
              <button
                onClick={startCapture}
                className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-6 rounded"
                disabled={!isConnected || !selectedInterface}
              >
                Iniciar captura
              </button>
            )}
            
            {capturedPackets.length > 0 && (
              <button
                onClick={saveCapture}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded"
              >
                Guardar captura
              </button>
            )}
          </div>
        </div>
        
        {isCapturing && (
          <div className="bg-white dark:bg-gray-800 border rounded-lg p-6 mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Captura en progreso</h2>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-red-500 rounded-full mr-2 animate-pulse"></div>
                <span className="text-sm">En vivo</span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
                <div className="text-sm text-gray-500 mb-1">Tiempo de captura</div>
                <div className="text-2xl font-semibold">{formatTime(captureTime)}</div>
              </div>
              <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
                <div className="text-sm text-gray-500 mb-1">Paquetes capturados</div>
                <div className="text-2xl font-semibold">{packetCount.toLocaleString()}</div>
              </div>
            </div>
            
            <div className="border rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No.</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tiempo</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Origen</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Destino</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Protocolo</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Longitud</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Info</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200">
                  {capturedPackets.slice(0, 10).map((packet) => (
                    <tr key={packet.id} className={packet.id % 2 === 0 ? "bg-gray-50 dark:bg-gray-700" : ""}>
                      <td className="px-6 py-2 whitespace-nowrap text-sm">{packet.id}</td>
                      <td className="px-6 py-2 whitespace-nowrap text-sm">{packet.time}</td>
                      <td className="px-6 py-2 whitespace-nowrap text-sm">{packet.source}</td>
                      <td className="px-6 py-2 whitespace-nowrap text-sm">{packet.destination}</td>
                      <td className="px-6 py-2 whitespace-nowrap text-sm">{packet.protocol}</td>
                      <td className="px-6 py-2 whitespace-nowrap text-sm">{packet.length}</td>
                      <td className="px-6 py-2 whitespace-nowrap text-sm">{packet.info}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Acerca de la captura en tiempo real</h2>
          <p className="mb-4">
            La captura en tiempo real te permite analizar el tráfico de red mientras se genera, sin necesidad de permisos de administrador en tu máquina.
          </p>
          <p className="mb-4">
            Esta funcionalidad utiliza una combinación de tecnologías web modernas para capturar y analizar paquetes directamente desde tu navegador:
          </p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>WebSockets para comunicación en tiempo real</li>
            <li>Servidor Node.js con la biblioteca pcap para captura de paquetes</li>
            <li>Procesamiento de paquetes en tiempo real</li>
          </ul>
          <p className="mb-4">
            Los datos capturados se procesan en el servidor y se envían al navegador en tiempo real, garantizando un rendimiento óptimo incluso con grandes volúmenes de tráfico.
          </p>
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded p-4">
            <div className="font-medium mb-1">Nota importante:</div>
            <p>
              El servidor de captura debe ejecutarse con permisos de administrador (sudo) para acceder a las interfaces de red. Asegúrate de que el servidor esté en ejecución antes de intentar iniciar una captura.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}