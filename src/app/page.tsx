'use client';

import useSWR from 'swr';

// Fetcher function para SWR
const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function Home() {
  // SWR con polling cada 5 segundos
  const { data, error, isLoading } = useSWR(
    '/api/map',
    fetcher,
    {
      refreshInterval: 5000, // 5 segundos
      revalidateOnFocus: false,
      revalidateOnReconnect: true
    }
  );

  return (
    <div className="min-h-screen p-8 flex flex-col items-center justify-center gap-8">
      <h1 className="text-3xl font-bold text-center">
        Memory Storage Monitor
      </h1>
      
      <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg shadow-md max-w-2xl w-full">
        <h2 className="text-xl font-semibold mb-4">
          Contenido en Memoria (actualiza cada 5s)
        </h2>
        
        {isLoading && (
          <p className="text-blue-500">Cargando...</p>
        )}
        
        {error && (
          <p className="text-red-500">Error al cargar datos</p>
        )}
        
        {data && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Estado:</span>
              <span className={`px-2 py-1 rounded text-xs ${data.isEmpty ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                {data.isEmpty ? 'Vacío' : 'Con datos'}
              </span>
            </div>
            
            <div>
              <span className="text-sm font-medium block mb-2">Contenido:</span>
              <div className="bg-white dark:bg-gray-900 p-3 rounded border min-h-[60px] font-mono text-sm whitespace-pre-wrap">
                {data.stored || '<vacío>'}
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div className="text-center text-sm text-gray-600 dark:text-gray-400">
        <p>Para enviar datos:</p>
        <code className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">
          POST /api/map
        </code>
      </div>
    </div>
  );
}
