import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-6 md:p-24">
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold text-center mb-8">Wireshark Web</h1>
        <p className="text-center mb-8">
          Análisis de tráfico de red en el navegador para competiciones CTF
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <div className="border rounded-lg p-6 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <h2 className="text-2xl font-semibold mb-4">Cargar archivo PCAP</h2>
            <p className="mb-4">
              Sube un archivo PCAP para analizarlo en detalle. Compatible con formatos .pcap y .pcapng.
            </p>
            <Link 
              href="/upload" 
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded"
            >
              Subir archivo
            </Link>
          </div>

          <div className="border rounded-lg p-6 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <h2 className="text-2xl font-semibold mb-4">Captura en tiempo real</h2>
            <p className="mb-4">
              Captura y analiza el tráfico de red en tiempo real directamente desde tu navegador.
            </p>
            <Link 
              href="/capture" 
              className="inline-block bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded"
            >
              Iniciar captura
            </Link>
          </div>
        </div>

        <div className="border rounded-lg p-6 mb-12">
          <h2 className="text-2xl font-semibold mb-4">Características principales</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start">
              <div className="mr-2 mt-1 text-blue-600">✓</div>
              <div>Análisis detallado de paquetes</div>
            </div>
            <div className="flex items-start">
              <div className="mr-2 mt-1 text-blue-600">✓</div>
              <div>Filtrado avanzado de tráfico</div>
            </div>
            <div className="flex items-start">
              <div className="mr-2 mt-1 text-blue-600">✓</div>
              <div>Soporte para múltiples protocolos</div>
            </div>
            <div className="flex items-start">
              <div className="mr-2 mt-1 text-blue-600">✓</div>
              <div>Visualización de flujos de red</div>
            </div>
            <div className="flex items-start">
              <div className="mr-2 mt-1 text-blue-600">✓</div>
              <div>Extracción de archivos y contenido</div>
            </div>
            <div className="flex items-start">
              <div className="mr-2 mt-1 text-blue-600">✓</div>
              <div>Estadísticas y gráficos</div>
            </div>
            <div className="flex items-start">
              <div className="mr-2 mt-1 text-blue-600">✓</div>
              <div>Interfaz similar a Wireshark</div>
            </div>
            <div className="flex items-start">
              <div className="mr-2 mt-1 text-blue-600">✓</div>
              <div>No requiere permisos de administrador</div>
            </div>
          </div>
        </div>

        <div className="text-center">
          <p className="mb-2">
            Desarrollado para competiciones CTF y análisis de red educativo
          </p>
          <p className="text-sm text-gray-500">
            Wireshark Web - Versión 0.1.0
          </p>
        </div>
      </div>
    </main>
  );
}
