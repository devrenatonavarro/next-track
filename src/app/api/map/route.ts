// Variable en memoria local para guardar el string
let memoryStorage = '';

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
    });
  } catch (error) {
    return Response.json({ 
      error: 'Error al procesar el string' 
    }, { status: 500 });
  }
}

// Opcional: endpoint GET para ver qué hay guardado
export async function GET() {
  return Response.json({
    stored: memoryStorage,
    isEmpty: memoryStorage === ''
  });
}