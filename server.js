const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { Server } = require('socket.io');

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = process.env.PORT || 3000;

// Variable en memoria para almacenar la ubicación
let currentLocation = {
  latitude: 19.4326, // Ciudad de México por defecto
  longitude: -99.1332,
  timestamp: new Date().toISOString(),
  id: 'default'
};

// Cuando se está en desarrollo
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      const { pathname, query } = parsedUrl;

      // Endpoint para actualizar ubicación
      if (pathname === '/api/location' && req.method === 'POST') {
        let body = '';
        
        req.on('data', chunk => {
          body += chunk.toString();
        });
        
        req.on('end', () => {
          try {
            const data = JSON.parse(body);
            
            // Validar datos
            if (typeof data.latitude === 'number' && typeof data.longitude === 'number') {
              // Actualizar ubicación en memoria
              currentLocation = {
                latitude: data.latitude,
                longitude: data.longitude,
                timestamp: new Date().toISOString(),
                id: data.id || 'default'
              };
              
              console.log('📍 Ubicación actualizada:', currentLocation);
              
              // Emitir a todos los clientes conectados
              io.emit('locationUpdate', currentLocation);
              
              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ 
                success: true, 
                message: 'Ubicación actualizada',
                location: currentLocation 
              }));
            } else {
              res.writeHead(400, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ 
                success: false, 
                message: 'Latitud y longitud son requeridas y deben ser números' 
              }));
            }
          } catch (error) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ 
              success: false, 
              message: 'JSON inválido' 
            }));
          }
        });
        
        return;
      }
      
      // Endpoint para obtener ubicación actual
      if (pathname === '/api/location' && req.method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
          success: true, 
          location: currentLocation 
        }));
        return;
      }

      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  });

  // Configurar Socket.IO
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  // Manejar conexiones de WebSocket
  io.on('connection', (socket) => {
    console.log(`🔌 Cliente conectado: ${socket.id}`);
    
    // Enviar ubicación actual al cliente recién conectado
    socket.emit('locationUpdate', currentLocation);
    
    // Manejar solicitud de ubicación actual
    socket.on('getCurrentLocation', () => {
      socket.emit('locationUpdate', currentLocation);
    });
    
    // Manejar actualización de ubicación desde WebSocket
    socket.on('updateLocation', (data) => {
      if (typeof data.latitude === 'number' && typeof data.longitude === 'number') {
        currentLocation = {
          latitude: data.latitude,
          longitude: data.longitude,
          timestamp: new Date().toISOString(),
          id: data.id || socket.id
        };
        
        console.log('📍 Ubicación actualizada via WebSocket:', currentLocation);
        
        // Emitir a todos los clientes
        io.emit('locationUpdate', currentLocation);
      }
    });
    
    socket.on('disconnect', () => {
      console.log(`❌ Cliente desconectado: ${socket.id}`);
    });
  });

  httpServer
    .once('error', (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`🚀 Servidor listo en http://${hostname}:${port}`);
      console.log(`📡 Socket.IO servidor iniciado`);
      console.log(`📍 Ubicación inicial:`, currentLocation);
    });
});