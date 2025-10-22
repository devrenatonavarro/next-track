# Next Track - Mapa en Tiempo Real con Socket.IO + Leaflet

Esta aplicación incluye un sistema completo de tracking en tiempo real con Socket.IO integrado en Next.js y visualización con Leaflet.

## 🚀 Características

- ✅ **Servidor Socket.IO integrado** en Next.js para VPS
- ✅ **Mapa interactivo** con Leaflet/OpenStreetMap
- ✅ **API REST** para actualizaciones externas (`/api/location`)
- ✅ **WebSocket** para actualizaciones en tiempo real
- ✅ **Variable en memoria** para almacenar ubicación actual
- ✅ **Interfaz responsive** con Tailwind CSS
- ✅ **Múltiples formas** de actualizar ubicación (GPS, manual, API)
- ✅ **Script de pruebas** incluido

## 📦 Instalación Rápida

```bash
# 1. Instalar dependencias
npm install

# 2. Ejecutar el servidor (Socket.IO + Next.js)
npm run dev

# 3. Abrir en el navegador
# http://localhost:3000/map
```

## 🛠️ Arquitectura

### Servidor Personalizado (`server.js`)
- **Socket.IO Server** integrado con Next.js
- **Variable en memoria** para ubicación actual
- **Endpoint API** `/api/location` (GET/POST)
- **WebSocket events** para tiempo real

### Frontend (`/map`)
- **Mapa Leaflet** con marcador dinámico
- **Cliente Socket.IO** para actualizaciones automáticas
- **Controles** para GPS, manual y API
- **Log de eventos** en tiempo real

## 🗺️ Uso del Sistema

### 1. Abrir la Aplicación
```bash
npm run dev
# Navegar a: http://localhost:3000/map
```

### 2. Actualizar Ubicación

#### Via GPS (Navegador)
- Clic en "📍 Usar Mi Ubicación GPS"
- Permitir acceso a ubicación
- Se actualiza automáticamente via WebSocket

#### Via Manual (Interfaz)
- Ingresar latitud y longitud
- Clic en "📝 Actualizar Manualmente"
- Se envía via API HTTP

#### Via API Externa
```bash
# POST /api/location
curl -X POST http://localhost:3000/api/location \
  -H "Content-Type: application/json" \
  -d '{
    "latitude": 19.4326,
    "longitude": -99.1332,
    "id": "external-device"
  }'
```

#### Via Script de Pruebas
```bash
# Ubicación específica
node test-api.js 19.4326 -99.1332

# Modo interactivo
node test-api.js

# Ubicaciones aleatorias automáticas
# (seleccionar opción 3 en modo interactivo)
```

## 🔧 API Endpoints

### GET `/api/location`
Obtiene la ubicación actual almacenada en memoria.

**Respuesta:**
```json
{
  "success": true,
  "location": {
    "latitude": 19.4326,
    "longitude": -99.1332,
    "timestamp": "2024-10-21T18:30:00.000Z",
    "id": "device-123"
  }
}
```

### POST `/api/location`
Actualiza la ubicación en memoria y notifica via WebSocket.

**Cuerpo de la petición:**
```json
{
  "latitude": 19.4326,
  "longitude": -99.1332,
  "id": "optional-device-id"
}
```

**Respuesta:**
```json
{
  "success": true,
  "message": "Ubicación actualizada",
  "location": {
    "latitude": 19.4326,
    "longitude": -99.1332,
    "timestamp": "2024-10-21T18:30:00.000Z",
    "id": "device-123"
  }
}
```

## 📡 Eventos WebSocket

### Cliente → Servidor
- `getCurrentLocation` - Solicita ubicación actual
- `updateLocation` - Actualiza ubicación via WebSocket

### Servidor → Cliente
- `locationUpdate` - Nueva ubicación disponible (automático)

## 🚀 Despliegue en VPS

### 1. Configuración de Producción

```bash
# Variables de entorno
export NODE_ENV=production
export PORT=3000

# Build y start
npm run build
npm start
```

### 2. Con PM2 (Recomendado)
```bash
# Instalar PM2
npm install -g pm2

# Crear archivo ecosystem
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'next-track',
    script: 'server.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
}
EOF

# Ejecutar
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### 3. Con Nginx (Proxy Reverso)
```nginx
server {
    listen 80;
    server_name tu-dominio.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 🔒 Variables de Entorno

```bash
# .env.local (desarrollo)
NEXT_PUBLIC_SOCKET_URL=http://localhost:3000

# .env.production (producción)
NEXT_PUBLIC_SOCKET_URL=https://tu-dominio.com
NODE_ENV=production
PORT=3000
```

## 🧪 Scripts de Prueba

### Probar API
```bash
# Ubicación específica
node test-api.js 19.4326 -99.1332

# Modo interactivo
node test-api.js
```

### Ubicaciones de Prueba
El script incluye ubicaciones predefinidas:
- Ciudad de México: `19.4326, -99.1332`
- Nueva York: `40.7128, -74.0060`
- Londres: `51.5074, -0.1278`
- Tokio: `35.6762, 139.6503`
- Sydney: `-33.8688, 151.2093`

## 📱 Integración con Dispositivos

### Enviar desde dispositivo móvil
```javascript
// JavaScript (App móvil, IoT device, etc.)
async function sendLocation(lat, lng, deviceId) {
  const response = await fetch('https://tu-servidor.com/api/location', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      latitude: lat,
      longitude: lng,
      id: deviceId
    })
  });
  
  return await response.json();
}
```

### Escuchar actualizaciones
```javascript
// En otra página/app
const socket = io('https://tu-servidor.com');

socket.on('locationUpdate', (location) => {
  console.log('Nueva ubicación:', location);
  // Actualizar UI, base de datos, etc.
});
```

## � Monitoreo y Logs

El servidor registra automáticamente:
- Conexiones/desconexiones de WebSocket
- Actualizaciones de ubicación
- Errores de API

```bash
# Ver logs en tiempo real (con PM2)
pm2 logs next-track

# Ver estado
pm2 status
```

## ⚡ Rendimiento

- **Memoria**: Variable en memoria (rápida, se pierde al reiniciar)
- **Conexiones**: Socket.IO maneja múltiples clientes
- **API**: Sin base de datos (ultra rápido)

Para persistencia, considera agregar:
- Redis para estado temporal
- PostgreSQL/MongoDB para histórico

## 🚨 Consideraciones de Seguridad

### Para Producción:
1. **CORS**: Configurar dominios específicos
2. **Rate Limiting**: Limitar peticiones por IP
3. **HTTPS**: Usar certificados SSL
4. **Autenticación**: Validar dispositivos/usuarios
5. **Validación**: Verificar coordenadas válidas

```javascript
// Ejemplo de validación adicional
function isValidCoordinate(lat, lng) {
  return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
}
```

## 🛠️ Personalización

### Cambiar Mapa Base
```javascript
// En MapComponent.tsx
<TileLayer
  url="https://{s}.tile.thunderforest.com/landscape/{z}/{x}/{y}.png?apikey=TU_API_KEY"
  attribution="Maps © Thunderforest"
/>
```

### Agregar Múltiples Marcadores
```javascript
// Modificar currentLocation para ser un array
let currentLocations = [];

// Almacenar múltiples dispositivos
currentLocations.push({
  latitude, longitude, timestamp, id: deviceId
});
```

---

¡Tu sistema de tracking en tiempo real está listo! 🎯�