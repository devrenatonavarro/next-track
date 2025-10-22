/**
 * Servidor de ejemplo Socket.IO para pruebas
 * 
 * Para usar este servidor:
 * 1. Instala las dependencias: npm install socket.io express
 * 2. Ejecuta: node server-example.js
 * 3. El servidor estará disponible en http://localhost:3001
 */

const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
const httpServer = createServer(app);

// Configurar CORS
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true
}));

const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Datos de ejemplo del mapa
const mapData = {
  id: 'example-map',
  name: 'Mapa de Ejemplo',
  bounds: {
    north: 40.7829,
    south: 40.7489,
    east: -73.9441,
    west: -73.9927
  },
  markers: [
    {
      id: 'marker-1',
      latitude: 40.7614,
      longitude: -73.9776,
      title: 'Times Square',
      description: 'El corazón de Nueva York',
      type: 'poi'
    },
    {
      id: 'marker-2',
      latitude: 40.7829,
      longitude: -73.9654,
      title: 'Central Park',
      description: 'El parque más famoso de NYC',
      type: 'poi'
    }
  ]
};

// Manejo de conexiones
io.on('connection', (socket) => {
  console.log(`Usuario conectado: ${socket.id}`);

  // Enviar mensaje de bienvenida
  socket.emit('message', `¡Bienvenido! Tu ID es: ${socket.id}`);

  // Manejar mensajes
  socket.on('message', (data) => {
    console.log(`Mensaje recibido de ${socket.id}: ${data}`);
    // Reenviar a todos los clientes
    io.emit('message', `[${socket.id.substring(0, 6)}]: ${data}`);
  });

  // Manejar solicitud de datos del mapa
  socket.on('getMapData', () => {
    console.log(`Solicitud de datos del mapa de ${socket.id}`);
    socket.emit('mapData', mapData);
  });

  // Manejar actualizaciones de ubicación
  socket.on('locationUpdate', (data) => {
    console.log(`Actualización de ubicación de ${socket.id}:`, data);
    
    // Agregar ID del socket a los datos
    const locationWithId = {
      ...data,
      userId: socket.id
    };

    // Reenviar a todos los demás clientes
    socket.broadcast.emit('locationUpdate', locationWithId);
  });

  // Manejar unirse a una sala
  socket.on('joinRoom', (roomId) => {
    socket.join(roomId);
    console.log(`${socket.id} se unió a la sala: ${roomId}`);
    socket.to(roomId).emit('userJoined', { 
      userId: socket.id, 
      username: `User-${socket.id.substring(0, 6)}` 
    });
  });

  // Manejar salir de una sala
  socket.on('leaveRoom', (roomId) => {
    socket.leave(roomId);
    console.log(`${socket.id} salió de la sala: ${roomId}`);
    socket.to(roomId).emit('userLeft', { 
      userId: socket.id, 
      username: `User-${socket.id.substring(0, 6)}` 
    });
  });

  // Manejar desconexión
  socket.on('disconnect', (reason) => {
    console.log(`Usuario desconectado: ${socket.id}, razón: ${reason}`);
  });
});

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({ 
    message: 'Servidor Socket.IO funcionando',
    timestamp: new Date().toISOString(),
    connectedClients: io.engine.clientsCount
  });
});

// Ruta para obtener datos del mapa via HTTP
app.get('/api/map', (req, res) => {
  res.json(mapData);
});

const PORT = process.env.PORT || 3001;

httpServer.listen(PORT, () => {
  console.log(`🚀 Servidor Socket.IO iniciado en http://localhost:${PORT}`);
  console.log(`📡 Esperando conexiones de clientes...`);
});

module.exports = { app, io };