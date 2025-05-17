# Servidor de Captura en Tiempo Real para Wireshark Web

Este servidor permite la captura de tráfico de red en tiempo real para la aplicación Wireshark Web. Utiliza la biblioteca `pcap` para capturar paquetes y WebSockets para enviarlos en tiempo real al cliente.

## Requisitos

- Node.js (v14 o superior)
- npm o yarn
- Permisos de administrador (sudo) para acceder a las interfaces de red

## Instalación

1. Crea un directorio para el servidor:
```bash
mkdir -p capture-server
cd capture-server
```

2. Copia los archivos `package.json` y `server.js` en este directorio.

3. Instala las dependencias:
```bash
npm install
```

## Ejecución

El servidor debe ejecutarse con permisos de administrador para poder acceder a las interfaces de red:

```bash
sudo node server.js
```

Por defecto, el servidor se ejecuta en el puerto 8080. Puedes cambiar el puerto utilizando la variable de entorno `PORT`:

```bash
sudo PORT=3001 node server.js
```

## Configuración del Cliente

El cliente (frontend) debe configurarse para conectarse al servidor WebSocket. Por defecto, el cliente intenta conectarse a `ws://localhost:8080`. Si has cambiado el puerto o estás ejecutando el servidor en otra máquina, debes actualizar la URL en el archivo `src/lib/capture/websocket-client.ts`.

## Consideraciones de Seguridad

- Este servidor no implementa autenticación ni cifrado. En un entorno de producción, deberías implementar HTTPS/WSS y algún mecanismo de autenticación.
- El servidor tiene acceso completo a las interfaces de red, lo que puede suponer un riesgo de seguridad. Asegúrate de ejecutarlo en un entorno controlado.
- Los filtros de captura se pasan directamente a la biblioteca pcap. Asegúrate de validar y sanitizar los filtros para evitar inyecciones de código.

## Limitaciones

- La biblioteca pcap puede requerir compilación nativa, lo que puede complicar su despliegue en algunos entornos.
- El rendimiento puede verse afectado al capturar grandes volúmenes de tráfico.
- No todas las funcionalidades de Wireshark están implementadas.

## Solución de Problemas

- **Error "Operation not permitted"**: Asegúrate de ejecutar el servidor con permisos de administrador (sudo).
- **Error "No such device exists"**: Verifica que la interfaz de red seleccionada existe y está disponible.
- **Error "PCAP_ERROR_ACTIVATED"**: Asegúrate de que no hay otra aplicación utilizando la misma interfaz de red.
- **Error "Cannot find module 'pcap'"**: Asegúrate de haber instalado todas las dependencias con `npm install`.

===== END FILE: README-capture-server.md =====

## Instrucciones de Instalación y Ejecución

Para implementar la captura de tráfico en tiempo real en Wireshark Web, sigue estos pasos:

1. **Configuración del Servidor Backend**:
   - Crea un directorio para el servidor: `mkdir -p capture-server`
   - Copia los archivos `package.json` y `server.js` en este directorio
   - Instala las dependencias: `cd capture-server && npm install`
   - Ejecuta el servidor con permisos de administrador: `sudo node server.js`

2. **Configuración del Frontend**:
   - Crea el directorio para el cliente WebSocket: `mkdir -p src/lib/capture`
   - Copia el archivo `websocket-client.ts` en este directorio
   - Reemplaza el archivo `src/app/capture/page.tsx` con la nueva versión

3. **Prueba la Captura en Tiempo Real**:
   - Asegúrate de que el servidor está en ejecución
   - Abre la aplicación Wireshark Web en tu navegador
   - Navega a la página de captura
   - Selecciona una interfaz de red y opcionalmente un filtro
   - Haz clic en "Iniciar captura"

## Consideraciones Adicionales

1. **Permisos**: El servidor necesita ejecutarse con permisos de administrador (sudo) para acceder a las interfaces de red.

2. **Seguridad**: Esta implementación es básica y no incluye autenticación ni cifrado. En un entorno de producción, deberías implementar HTTPS/WSS y algún mecanismo de autenticación.

3. **Compatibilidad**: La biblioteca pcap puede requerir compilación nativa, lo que puede complicar su despliegue en algunos entornos.

4. **Despliegue**: Para un despliegue en producción, considera:
   - Usar un proxy inverso como Nginx
   - Configurar HTTPS/WSS
   - Implementar autenticación
   - Considerar limitaciones de recursos (memoria, CPU)

5. **Rendimiento**: La captura de tráfico en tiempo real puede consumir muchos recursos, especialmente en redes con mucho tráfico. Considera implementar limitaciones de velocidad o filtrado para evitar problemas de rendimiento.

6. **Filtros**: Los filtros de captura utilizan la sintaxis de Wireshark/BPF. Asegúrate de validar y sanitizar los filtros para evitar inyecciones de código.

7. **Integración con Vercel**: Si despliegas la aplicación en Vercel, ten en cuenta que el servidor de captura debe ejecutarse en un servidor separado, ya que Vercel no permite ejecutar servidores persistentes.
