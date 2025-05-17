/**
 * Cliente WebSocket para la captura en tiempo real
 * 
 * Este módulo proporciona una interfaz para conectarse al servidor de captura
 * y recibir paquetes en tiempo real.
 */

import { Packet } from '@/lib/pcap/pcap-parser';

// Tipos de datos para la comunicación con el servidor
export interface NetworkInterface {
  name: string;
  description: string;
}

export interface CaptureSession {
  sessionId: string;
  interface: string;
  filter: string;
  startTime: Date;
  packetCount: number;
}

export type WebSocketMessageType = 
  | { type: 'interfaces', data: NetworkInterface[] }
  | { type: 'capture_started', sessionId: string, message: string }
  | { type: 'capture_stopped', packetCount: number, duration: number }
  | { type: 'packet', data: Packet }
  | { type: 'error', message: string };

// Clase para manejar la conexión WebSocket
export class CaptureClient {
  private ws: WebSocket | null = null;
  private url: string;
  private connected: boolean = false;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private reconnectTimeout: number = 2000;
  private sessionId: string | null = null;
  
  // Callbacks
  private onConnectCallbacks: (() => void)[] = [];
  private onDisconnectCallbacks: (() => void)[] = [];
  private onErrorCallbacks: ((error: string) => void)[] = [];
  private onInterfacesCallbacks: ((interfaces: NetworkInterface[]) => void)[] = [];
  private onPacketCallbacks: ((packet: Packet) => void)[] = [];
  private onCaptureStartedCallbacks: ((sessionId: string, message: string) => void)[] = [];
  private onCaptureStoppedCallbacks: ((packetCount: number, duration: number) => void)[] = [];
  
  constructor(url: string = 'ws://localhost:8080') {
    this.url = url;
  }
  
  // Conectar al servidor
  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.ws && this.connected) {
        resolve();
        return;
      }
      
      try {
        this.ws = new WebSocket(this.url);
        
        this.ws.onopen = () => {
          console.log('Conectado al servidor de captura');
          this.connected = true;
          this.reconnectAttempts = 0;
          this.onConnectCallbacks.forEach(callback => callback());
          resolve();
        };
        
        this.ws.onclose = () => {
          console.log('Desconectado del servidor de captura');
          this.connected = false;
          this.onDisconnectCallbacks.forEach(callback => callback());
          
          // Intentar reconectar
          if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            setTimeout(() => {
              this.connect().catch(err => {
                console.error('Error al reconectar:', err);
              });
            }, this.reconnectTimeout * this.reconnectAttempts);
          }
        };
        
        this.ws.onerror = (error) => {
          console.error('Error en la conexión WebSocket:', error);
          this.onErrorCallbacks.forEach(callback => callback('Error de conexión con el servidor de captura'));
          reject(error);
        };
        
        this.ws.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data) as WebSocketMessageType;
            
            switch (message.type) {
              case 'interfaces':
                this.onInterfacesCallbacks.forEach(callback => callback(message.data));
                break;
              case 'packet':
                this.onPacketCallbacks.forEach(callback => callback(message.data));
                break;
              case 'capture_started':
                this.sessionId = message.sessionId;
                this.onCaptureStartedCallbacks.forEach(callback => callback(message.sessionId, message.message));
                break;
              case 'capture_stopped':
                this.sessionId = null;
                this.onCaptureStoppedCallbacks.forEach(callback => callback(message.packetCount, message.duration));
                break;
              case 'error':
                this.onErrorCallbacks.forEach(callback => callback(message.message));
                break;
            }
          } catch (error) {
            console.error('Error al procesar mensaje:', error);
          }
        };
      } catch (error) {
        console.error('Error al crear conexión WebSocket:', error);
        reject(error);
      }
    });
  }
  
  // Desconectar del servidor
  disconnect(): void {
    if (this.ws) {
      if (this.sessionId) {
        this.stopCapture();
      }
      
      this.ws.close();
      this.ws = null;
      this.connected = false;
    }
  }
  
  // Iniciar captura
  startCapture(interfaceName: string, filter: string = ''): void {
    if (!this.ws || !this.connected) {
      this.onErrorCallbacks.forEach(callback => callback('No hay conexión con el servidor de captura'));
      return;
    }
    
    this.ws.send(JSON.stringify({
      action: 'start_capture',
      interface: interfaceName,
      filter
    }));
  }
  
  // Detener captura
  stopCapture(): void {
    if (!this.ws || !this.connected || !this.sessionId) {
      return;
    }
    
    this.ws.send(JSON.stringify({
      action: 'stop_capture',
      sessionId: this.sessionId
    }));
  }
  
  // Verificar si está conectado
  isConnected(): boolean {
    return this.connected;
  }
  
  // Verificar si hay una captura en curso
  isCapturing(): boolean {
    return this.sessionId !== null;
  }
  
  // Eventos
  onConnect(callback: () => void): void {
    this.onConnectCallbacks.push(callback);
    if (this.connected) {
      callback();
    }
  }
  
  onDisconnect(callback: () => void): void {
    this.onDisconnectCallbacks.push(callback);
  }
  
  onError(callback: (error: string) => void): void {
    this.onErrorCallbacks.push(callback);
  }
  
  onInterfaces(callback: (interfaces: NetworkInterface[]) => void): void {
    this.onInterfacesCallbacks.push(callback);
  }
  
  onPacket(callback: (packet: Packet) => void): void {
    this.onPacketCallbacks.push(callback);
  }
  
  onCaptureStarted(callback: (sessionId: string, message: string) => void): void {
    this.onCaptureStartedCallbacks.push(callback);
  }
  
  onCaptureStopped(callback: (packetCount: number, duration: number) => void): void {
    this.onCaptureStoppedCallbacks.push(callback);
  }
}

// Exportar una instancia única del cliente
export const captureClient = new CaptureClient();
