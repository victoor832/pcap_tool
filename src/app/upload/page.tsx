"use client";

import { useState } from "react";
import Link from "next/link";

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.name.endsWith(".pcap") || droppedFile.name.endsWith(".pcapng")) {
        setFile(droppedFile);
      } else {
        alert("Por favor, sube un archivo con formato .pcap o .pcapng");
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      if (selectedFile.name.endsWith(".pcap") || selectedFile.name.endsWith(".pcapng")) {
        setFile(selectedFile);
      } else {
        alert("Por favor, sube un archivo con formato .pcap o .pcapng");
      }
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(0);

    // Simulación de carga para demostración
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 300);

    // Aquí iría la lógica real de carga del archivo
    // const formData = new FormData();
    // formData.append("file", file);
    // const response = await fetch("/api/upload", { method: "POST", body: formData });

    // Simulamos que la carga toma 3 segundos
    setTimeout(() => {
      clearInterval(interval);
      setUploadProgress(100);
      
      // Redirigir a la página de análisis (simulado)
      setTimeout(() => {
        window.location.href = "/analyze?file=" + encodeURIComponent(file.name);
      }, 500);
    }, 3000);
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

        <h1 className="text-3xl font-bold mb-6">Cargar archivo PCAP</h1>
        
        <div 
          className={`border-2 border-dashed rounded-lg p-12 text-center mb-8 ${
            isDragging ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" : "border-gray-300"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {file ? (
            <div>
              <div className="text-xl mb-2">Archivo seleccionado:</div>
              <div className="font-medium text-2xl mb-4">{file.name}</div>
              <div className="text-gray-500 mb-4">{(file.size / (1024 * 1024)).toFixed(2)} MB</div>
              
              {isUploading ? (
                <div className="w-full max-w-md mx-auto">
                  <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                    <div 
                      className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" 
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                  <div className="text-sm text-gray-500">
                    {uploadProgress < 100 ? "Subiendo archivo..." : "Procesando archivo..."}
                  </div>
                </div>
              ) : (
                <button
                  onClick={handleUpload}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded"
                >
                  Analizar archivo
                </button>
              )}
            </div>
          ) : (
            <>
              <svg 
                className="mx-auto h-12 w-12 text-gray-400 mb-4" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth="2" 
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              <p className="text-lg mb-4">
                Arrastra y suelta tu archivo PCAP aquí, o
              </p>
              <label className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded cursor-pointer">
                Seleccionar archivo
                <input 
                  type="file" 
                  accept=".pcap,.pcapng" 
                  className="hidden" 
                  onChange={handleFileChange}
                />
              </label>
              <p className="mt-2 text-sm text-gray-500">
                Formatos soportados: .pcap, .pcapng
              </p>
            </>
          )}
        </div>

        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Información sobre archivos PCAP</h2>
          <p className="mb-4">
            Los archivos PCAP (Packet Capture) contienen datos de paquetes de red capturados por herramientas como Wireshark, tcpdump o cualquier otra aplicación que utilice la biblioteca libpcap.
          </p>
          <p className="mb-4">
            Al subir un archivo PCAP, nuestra aplicación analizará su contenido y te mostrará:
          </p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>Detalles de cada paquete capturado</li>
            <li>Protocolos utilizados en la comunicación</li>
            <li>Direcciones IP de origen y destino</li>
            <li>Puertos utilizados</li>
            <li>Contenido de los paquetes</li>
            <li>Estadísticas y visualizaciones</li>
          </ul>
          <p>
            Esta herramienta es especialmente útil para competiciones CTF donde necesitas analizar capturas de tráfico de red para encontrar información oculta o entender patrones de comunicación.
          </p>
        </div>
      </div>
    </main>
  );
}
