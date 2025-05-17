"use client";

import Link from "next/link";

export default function DocsPage() {
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

        <h1 className="text-3xl font-bold mb-6">Documentación de Wireshark Web</h1>
        
        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4">Introducción</h2>
            <p className="mb-4">
              Wireshark Web es una aplicación diseñada para el análisis de tráfico de red directamente en tu navegador. 
              Esta herramienta ha sido creada pensando en estudiantes y participantes de competiciones CTF (Capture The Flag), 
              ofreciendo una alternativa accesible a la versión de escritorio de Wireshark, especialmente útil cuando no se 
              disponen de permisos de administrador (sudo) para instalar o ejecutar software de captura de paquetes.
            </p>
            <p>
              Wireshark Web busca replicar las funcionalidades esenciales de Wireshark, permitiendo la carga de archivos 
              de captura de paquetes (PCAP) y la simulación de captura de tráfico en tiempo real. Podrás inspeccionar paquetes, 
              analizar protocolos y aplicar filtros para encontrar la información que necesitas.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Funcionalidades Principales</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-medium mb-2">Carga de Archivos PCAP</h3>
                <p className="mb-2">
                  Esta funcionalidad te permite analizar archivos de captura de paquetes previamente guardados.
                </p>
                <ol className="list-decimal pl-6 space-y-2">
                  <li>Desde la página de inicio, haz clic en "Subir archivo" o navega directamente a la sección "Cargar PCAP".</li>
                  <li>
                    Puedes subir un archivo de dos maneras:
                    <ul className="list-disc pl-6 mt-1">
                      <li>Haz clic en el botón "Seleccionar archivo" y elige un archivo .pcap o .pcapng de tu sistema.</li>
                      <li>Arrastra y suelta un archivo .pcap o .pcapng directamente sobre el área designada.</li>
                    </ul>
                  </li>
                  <li>Una vez seleccionado el archivo, se mostrará su nombre y tamaño. Haz clic en el botón "Analizar archivo".</li>
                  <li>Serás redirigido a la página de análisis, donde se mostrarán los paquetes contenidos en el archivo.</li>
                </ol>
              </div>

              <div>
                <h3 className="text-xl font-medium mb-2">Captura de Tráfico en Tiempo Real</h3>
                <p className="mb-2">
                  Esta funcionalidad simula la captura de paquetes de red en tiempo real.
                </p>
                <ol className="list-decimal pl-6 space-y-2">
                  <li>Desde la página de inicio, haz clic en "Iniciar captura" o navega directamente a la sección "Captura en Vivo".</li>
                  <li>
                    Configura la captura:
                    <ul className="list-disc pl-6 mt-1">
                      <li>Interfaz de Red: Selecciona una interfaz de la lista desplegable.</li>
                      <li>Filtro de Captura (Opcional): Puedes ingresar un filtro utilizando la sintaxis de Wireshark/BPF para capturar solo paquetes específicos (ej. tcp port 80).</li>
                    </ul>
                  </li>
                  <li>Haz clic en el botón "Iniciar captura".</li>
                  <li>Verás estadísticas como el tiempo de captura y el número de paquetes capturados actualizarse en tiempo real. Una tabla mostrará los paquetes más recientes.</li>
                  <li>Haz clic en el botón "Detener captura" para finalizar el proceso.</li>
                  <li>Después de detener la captura, si se han capturado paquetes, aparecerá un botón "Guardar captura". Al hacer clic, serás redirigido a la página de análisis con los paquetes capturados.</li>
                </ol>
              </div>

              <div>
                <h3 className="text-xl font-medium mb-2">Análisis de Paquetes</h3>
                <p className="mb-2">
                  Una vez que hayas cargado un archivo PCAP o finalizado una captura en tiempo real, accederás a la página de análisis.
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Lista de Paquetes: Navega por la lista de paquetes. Puedes hacer clic en cualquier paquete para ver sus detalles.</li>
                  <li>Seleccionar un Paquete: Al hacer clic en una fila de la lista de paquetes, esta se resaltará y los paneles inferiores se actualizarán con la información del paquete seleccionado.</li>
                  <li>Panel de Detalles del Paquete: Explora la estructura jerárquica de los protocolos. Puedes expandir y contraer las diferentes capas para ver campos específicos y sus valores.</li>
                  <li>Panel de Bytes del Paquete: Observa la representación hexadecimal y ASCII de los datos brutos del paquete.</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-medium mb-2">Filtrado de Paquetes</h3>
                <p className="mb-2">
                  En la página de análisis, puedes utilizar la barra de filtros de visualización para refinar la lista de paquetes mostrados.
                </p>
                <ol className="list-decimal pl-6 space-y-2">
                  <li>Escribe tu expresión de filtro en el campo de texto. La sintaxis es similar a la de Wireshark (ej. ip.addr == 192.168.1.1 && tcp.port == 443, http.request.method == GET).</li>
                  <li>Haz clic en el botón "Aplicar" o presiona Enter.</li>
                  <li>La lista de paquetes se actualizará para mostrar solo aquellos que coincidan con el filtro aplicado.</li>
                </ol>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Consejos para Competiciones CTF</h2>
            <p className="mb-4">
              Wireshark Web puede ser una herramienta valiosa en competiciones CTF que involucren análisis de tráfico de red:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <span className="font-medium">Identificar Protocolos y Puertos:</span> Rápidamente visualiza los protocolos utilizados y los puertos de comunicación para entender los servicios en juego.
              </li>
              <li>
                <span className="font-medium">Seguir Flujos de Comunicación:</span> Filtra por direcciones IP y puertos para reconstruir conversaciones.
              </li>
              <li>
                <span className="font-medium">Extraer Información Sensible:</span> Busca credenciales, tokens, mensajes ocultos o archivos transferidos inspeccionando el contenido de los paquetes (especialmente en protocolos no cifrados como HTTP, FTP, Telnet).
              </li>
              <li>
                <span className="font-medium">Analizar Tráfico Malicioso:</span> Identifica patrones de ataques, como escaneos de puertos, intentos de explotación o comunicación con servidores de Comando y Control (C&C).
              </li>
              <li>
                <span className="font-medium">Reconstruir Archivos:</span> En algunos casos, es posible reconstruir archivos transferidos a través de la red examinando las cargas útiles de los paquetes.
              </li>
              <li>
                <span className="font-medium">Utilizar Filtros Efectivamente:</span> Aprende a usar los filtros de visualización para aislar rápidamente el tráfico relevante. Por ejemplo, http contains "flag" o tcp.port == 4444.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Filtros Comunes</h2>
            <p className="mb-4">
              Aquí hay algunos filtros útiles que puedes utilizar en la barra de filtros de visualización:
            </p>
            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-4">Filtro</th>
                    <th className="text-left py-2 px-4">Descripción</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="py-2 px-4 font-mono text-sm">ip.addr == 192.168.1.1</td>
                    <td className="py-2 px-4">Muestra paquetes con la dirección IP especificada como origen o destino</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 px-4 font-mono text-sm">tcp.port == 80</td>
                    <td className="py-2 px-4">Muestra paquetes TCP con puerto 80 (HTTP) como origen o destino</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 px-4 font-mono text-sm">http</td>
                    <td className="py-2 px-4">Muestra solo paquetes HTTP</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 px-4 font-mono text-sm">dns</td>
                    <td className="py-2 px-4">Muestra solo paquetes DNS</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 px-4 font-mono text-sm">http.request.method == "POST"</td>
                    <td className="py-2 px-4">Muestra solo solicitudes HTTP POST</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 px-4 font-mono text-sm">http contains "password"</td>
                    <td className="py-2 px-4">Muestra paquetes HTTP que contienen la palabra "password"</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 px-4 font-mono text-sm">!(arp or icmp or dns)</td>
                    <td className="py-2 px-4">Excluye paquetes ARP, ICMP y DNS</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-4 font-mono text-sm">tcp.flags.syn == 1 and tcp.flags.ack == 0</td>
                    <td className="py-2 px-4">Muestra intentos de conexión TCP (paquetes SYN)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Limitaciones Actuales</h2>
            <p className="mb-4">
              Es importante tener en cuenta las siguientes limitaciones de la versión actual de Wireshark Web:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>La captura en tiempo real es simulada y no captura tráfico real de la red.</li>
              <li>No todas las funcionalidades avanzadas de Wireshark de escritorio están disponibles.</li>
              <li>El rendimiento puede verse afectado al cargar archivos PCAP muy grandes.</li>
              <li>Algunos protocolos específicos pueden no estar completamente soportados en el análisis detallado.</li>
            </ul>
            <p className="mt-4">
              Estas limitaciones se irán abordando en futuras actualizaciones de la aplicación.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Recursos Adicionales</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <a href="https://www.wireshark.org/docs/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  Documentación oficial de Wireshark
                </a>
              </li>
              <li>
                <a href="https://wiki.wireshark.org/DisplayFilters" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  Guía de filtros de visualización de Wireshark
                </a>
              </li>
              <li>
                <a href="https://www.sans.org/blog/network-forensics-with-wireshark/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  Análisis forense de red con Wireshark (SANS)
                </a>
              </li>
              <li>
                <a href="https://ctftime.org/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  CTFtime - Calendario de competiciones CTF
                </a>
              </li>
            </ul>
          </section>
        </div>
      </div>
    </main>
  );
}
