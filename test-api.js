#!/usr/bin/env node

/**
 * Script para probar la API de ubicación
 * Uso: node test-api.js [latitud] [longitud]
 * Ejemplo: node test-api.js 19.4326 -99.1332
 */

const readline = require('readline');

const API_URL = 'http://localhost:3000/api/location';

// Función para enviar ubicación
async function sendLocation(lat, lng) {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        latitude: parseFloat(lat),
        longitude: parseFloat(lng),
        id: `test-${Date.now()}`
      }),
    });

    const result = await response.json();
    
    if (result.success) {
      console.log('✅ Ubicación enviada exitosamente:');
      console.log(`   Lat: ${result.location.latitude}`);
      console.log(`   Lng: ${result.location.longitude}`);
      console.log(`   Timestamp: ${result.location.timestamp}`);
    } else {
      console.log('❌ Error:', result.message);
    }
  } catch (error) {
    console.log('❌ Error de red:', error.message);
  }
}

// Función para obtener ubicación actual
async function getCurrentLocation() {
  try {
    const response = await fetch(API_URL);
    const result = await response.json();
    
    if (result.success) {
      console.log('📍 Ubicación actual:');
      console.log(`   Lat: ${result.location.latitude}`);
      console.log(`   Lng: ${result.location.longitude}`);
      console.log(`   Timestamp: ${result.location.timestamp}`);
      console.log(`   ID: ${result.location.id}`);
    } else {
      console.log('❌ Error:', result.message);
    }
  } catch (error) {
    console.log('❌ Error de red:', error.message);
  }
}

// Función para enviar ubicaciones de prueba aleatorias
function sendRandomLocations() {
  const locations = [
    { name: 'Ciudad de México', lat: 19.4326, lng: -99.1332 },
    { name: 'Nueva York', lat: 40.7128, lng: -74.0060 },
    { name: 'Londres', lat: 51.5074, lng: -0.1278 },
    { name: 'Tokio', lat: 35.6762, lng: 139.6503 },
    { name: 'Sydney', lat: -33.8688, lng: 151.2093 },
  ];

  let index = 0;
  
  const interval = setInterval(async () => {
    const location = locations[index];
    console.log(`\n🌍 Enviando ubicación: ${location.name}`);
    await sendLocation(location.lat, location.lng);
    
    index = (index + 1) % locations.length;
  }, 3000);

  console.log('\n🔄 Enviando ubicaciones cada 3 segundos...');
  console.log('Presiona Ctrl+C para detener\n');

  // Cleanup al recibir señal de interrupción
  process.on('SIGINT', () => {
    clearInterval(interval);
    console.log('\n👋 Script detenido');
    process.exit(0);
  });
}

// Función principal
async function main() {
  const args = process.argv.slice(2);
  
  console.log('🧪 Probador de API de Ubicación\n');
  
  if (args.length === 0) {
    // Modo interactivo
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    console.log('Opciones:');
    console.log('1. Obtener ubicación actual');
    console.log('2. Enviar ubicación específica');
    console.log('3. Enviar ubicaciones aleatorias');
    console.log('4. Salir\n');

    rl.question('Selecciona una opción (1-4): ', async (option) => {
      switch (option) {
        case '1':
          await getCurrentLocation();
          rl.close();
          break;
        case '2':
          rl.question('Latitud: ', (lat) => {
            rl.question('Longitud: ', async (lng) => {
              await sendLocation(lat, lng);
              rl.close();
            });
          });
          break;
        case '3':
          rl.close();
          sendRandomLocations();
          break;
        case '4':
          rl.close();
          break;
        default:
          console.log('Opción inválida');
          rl.close();
      }
    });
  } else if (args.length === 2) {
    // Modo directo con argumentos
    const [lat, lng] = args;
    await sendLocation(lat, lng);
  } else {
    console.log('Uso: node test-api.js [latitud] [longitud]');
    console.log('Ejemplo: node test-api.js 19.4326 -99.1332');
  }
}

// Ejecutar solo si es el archivo principal
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { sendLocation, getCurrentLocation };