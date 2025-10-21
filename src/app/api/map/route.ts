// Variable en memoria local para guardar el string
let memoryStorage = '';

// Headers CORS para permitir acceso desde cualquier origen
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function POST(req: Request) {
  try {
    // Obtener el string del body (no JSON)
    const stringData = await req.text();
    
    // Guardar en memoria local
    memoryStorage = stringData;
    
    return Response.json({ 
      success: true, 
      message: 'String guardado en memoria',
      stored: stringData 
    }, {
      headers: corsHeaders
    });
  } catch (error) {
    return Response.json({ 
      error: 'Error al procesar el string' 
    }, { 
      status: 500,
      headers: corsHeaders 
    });
  }
}

// Opcional: endpoint GET para ver qué hay guardado
export async function GET() {
  return Response.json({
    stored: memoryStorage,
    isEmpty: memoryStorage === ''
  }, {
    headers: corsHeaders
  });
}

// Manejar preflight requests de CORS
export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: corsHeaders
  });
}