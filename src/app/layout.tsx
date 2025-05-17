import Link from "next/link";
import "./globals.css";

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>
        <div className="min-h-screen flex flex-col">
          <header className="bg-blue-800 text-white p-4">
            <div className="container mx-auto flex justify-between items-center">
              <Link href="/" className="text-xl font-bold flex items-center">
                <svg 
                  className="w-8 h-8 mr-2" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path 
                    d="M12 2L2 7L12 12L22 7L12 2Z" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                  />
                  <path 
                    d="M2 17L12 22L22 17" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                  />
                  <path 
                    d="M2 12L12 17L22 12" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                  />
                </svg>
                Wireshark Web
              </Link>
              <nav className="hidden md:flex space-x-6">
                <Link href="/upload" className="hover:text-blue-200 transition-colors">
                  Cargar PCAP
                </Link>
                <Link href="/capture" className="hover:text-blue-200 transition-colors">
                  Captura en vivo
                </Link>
                <Link href="/docs" className="hover:text-blue-200 transition-colors">
                  Documentación
                </Link>
              </nav>
            </div>
          </header>
          
          {children}
          
          <footer className="bg-gray-100 dark:bg-gray-800 p-6 mt-auto">
            <div className="container mx-auto">
              <div className="flex flex-col md:flex-row justify-between items-center">
                <div className="mb-4 md:mb-0">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Wireshark Web - Versión 0.1.0
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-500">
                    Desarrollado para competiciones CTF y análisis de red educativo
                  </p>
                </div>
                <div className="flex space-x-4">
                  <Link href="/docs" className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">
                    Documentación
                  </Link>
                  <Link href="/about" className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">
                    Acerca de
                  </Link>
                  <Link href="/privacy" className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">
                    Privacidad
                  </Link>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
