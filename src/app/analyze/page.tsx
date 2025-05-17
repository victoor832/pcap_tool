"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { pcapAnalyzer, Packet, ProtocolTree } from "@/lib/pcap/pcap-parser";

export default function AnalyzePage({ params }: { 
  params: { slug: string }
}) {
  // Usar el hook useSearchParams para acceder a los parámetros de búsqueda
  const searchParams = useSearchParams();
  const fileName = searchParams.get("file") ?? "captura.pcap";
  
  const [packets, setPackets] = useState<Packet[]>([]);
  const [selectedPacket, setSelectedPacket] = useState<number | null>(null);
  const [protocolTree, setProtocolTree] = useState<ProtocolTree[] | null>(null);
  const [filterText, setFilterText] = useState("");
  const [activeTab, setActiveTab] = useState("packets");
  const [isLoading, setIsLoading] = useState(true);
  
  // Simular carga de archivo PCAP
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      
      // Simular archivo
      const mockFile = new File([""], fileName, { type: "application/vnd.tcpdump.pcap" });
      
      // Cargar archivo en el analizador
      await pcapAnalyzer.loadFile(mockFile);
      
      // Obtener paquetes
      const loadedPackets = pcapAnalyzer.getPackets();
      setPackets(loadedPackets);
      
      // Seleccionar el primer paquete si hay paquetes
      if (loadedPackets.length > 0) {
        setSelectedPacket(loadedPackets[0].id);
        setProtocolTree(pcapAnalyzer.getProtocolTree(loadedPackets[0].id));
      }
      
      setIsLoading(false);
    };
    
    loadData();
  }, [fileName]);
  
  // Manejar cambio de paquete seleccionado
  const handlePacketSelect = (packetId: number) => {
    setSelectedPacket(packetId);
    setProtocolTree(pcapAnalyzer.getProtocolTree(packetId));
  };
  
  // Manejar filtrado de paquetes
  const handleFilterApply = () => {
    const filteredPackets = pcapAnalyzer.getPackets(filterText);
    setPackets(filteredPackets);
    
    // Seleccionar el primer paquete de los resultados filtrados
    if (filteredPackets.length > 0) {
      setSelectedPacket(filteredPackets[0].id);
      setProtocolTree(pcapAnalyzer.getProtocolTree(filteredPackets[0].id));
    } else {
      setSelectedPacket(null);
      setProtocolTree(null);
    }
  };
  
  // Formatear datos hexadecimales para visualización
  const formatHexData = (packet: Packet | null): string => {
    if (!packet) return "";
    
    // Simulación de datos hexadecimales
    let hexOutput = "";
    for (let i = 0; i < 16; i++) {
      // Dirección
      hexOutput += `${(i * 16).toString(16).padStart(4, "0")}   `;
      
      // Bytes en hex
      for (let j = 0; j < 16; j++) {
        const byteValue = Math.floor(Math.random() * 256);
        hexOutput += `${byteValue.toString(16).padStart(2, "0")} `;
        if (j === 7) hexOutput += " ";
      }
      
      hexOutput += "  ";
      
      // Representación ASCII
      for (let j = 0; j < 16; j++) {
        const byteValue = Math.floor(Math.random() * 256);
        const char = byteValue >= 32 && byteValue <= 126 ? String.fromCharCode(byteValue) : ".";
        hexOutput += char;
      }
      
      hexOutput += "\n";
    }
    
    return hexOutput;
  };

  return (
    <main className="flex min-h-screen flex-col">
      <header className="bg-gray-100 dark:bg-gray-800 border-b p-4">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Link 
              href="/" 
              className="text-blue-600 hover:text-blue-800"
            >
              ← Inicio
            </Link>
            <h1 className="text-xl font-semibold">Analizando: {fileName}</h1>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">{packets.length} paquetes</span>
            <button className="bg-blue-600 hover:bg-blue-700 text-white text-sm py-1 px-3 rounded">
              Guardar
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-col flex-grow">
        {/* Barra de filtros */}
        <div className="bg-white dark:bg-gray-800 border-b p-4">
          <div className="container mx-auto flex items-center">
            <div className="flex-grow">
              <input 
                type="text" 
                className="w-full p-2 border rounded-md bg-white dark:bg-gray-700"
                placeholder="Filtro de visualización (ej: ip.addr == 192.168.1.1 && tcp)"
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleFilterApply()}
              />
            </div>
            <button 
              className="ml-2 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
              onClick={handleFilterApply}
            >
              Aplicar
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex-grow flex items-center justify-center">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
              <p>Cargando archivo PCAP...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Contenido principal */}
            <div className="flex-grow flex">
              {/* Lista de paquetes */}
              <div className="w-full overflow-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0">
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
                    {packets.map((packet, index) => (
                      <tr 
                        key={packet.id}
                        className={`${
                          selectedPacket === packet.id 
                            ? "bg-blue-100 dark:bg-blue-900" 
                            : index % 2 === 0 
                              ? "bg-white dark:bg-gray-800" 
                              : "bg-gray-50 dark:bg-gray-700"
                        } hover:bg-blue-50 dark:hover:bg-blue-800 cursor-pointer`}
                        onClick={() => handlePacketSelect(packet.id)}
                      >
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

            {/* Panel de detalles */}
            {selectedPacket && (
              <div className="h-1/2 border-t overflow-hidden flex flex-col">
                <div className="bg-gray-100 dark:bg-gray-800 border-b">
                  <div className="flex">
                    <button 
                      className={`px-4 py-2 text-sm font-medium ${
                        activeTab === "packets" 
                          ? "bg-white dark:bg-gray-700 border-b-2 border-blue-500" 
                          : "hover:bg-gray-200 dark:hover:bg-gray-600"
                      }`}
                      onClick={() => setActiveTab("packets")}
                    >
                      Detalles del paquete
                    </button>
                    <button 
                      className={`px-4 py-2 text-sm font-medium ${
                        activeTab === "bytes" 
                          ? "bg-white dark:bg-gray-700 border-b-2 border-blue-500" 
                          : "hover:bg-gray-200 dark:hover:bg-gray-600"
                      }`}
                      onClick={() => setActiveTab("bytes")}
                    >
                      Bytes
                    </button>
                  </div>
                </div>
                
                <div className="flex-grow overflow-auto p-4">
                  {activeTab === "packets" && protocolTree ? (
                    <div>
                      {protocolTree.map((section, sectionIndex) => (
                        <div key={sectionIndex} className="mb-4">
                          <h3 className="font-semibold mb-2">{section.name}</h3>
                          <div className="pl-4">
                            {section.children?.map((detail, detailIndex) => (
                              <div key={detailIndex} className="grid grid-cols-2 gap-4 mb-1">
                                <div className="text-sm text-gray-600 dark:text-gray-400">{detail.name}</div>
                                <div className="text-sm">{detail.value}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div>
                      <pre className="text-xs font-mono whitespace-pre-wrap">
                        {formatHexData(pcapAnalyzer.getPacket(selectedPacket))}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}