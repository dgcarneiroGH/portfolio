import { Handler, HandlerResponse } from '@netlify/functions';

// Allowlist de formato de documento de Sanity: alfanumérico + guiones, 1-80 chars,
// sin puntos (excluye rutas y el prefijo de borradores "drafts.")
const POST_ID_PATTERN = /^[a-zA-Z0-9][a-zA-Z0-9_-]{0,79}$/;

const handler: Handler = async (event, context): Promise<HandlerResponse> => {
  const allowedOrigins = [
    'https://nomacoda.com',
    'http://localhost:4200',
    'http://localhost:4201',
    'http://localhost:4202',
    'http://localhost:8888',
  ];

  const origin = event.headers.origin;
  const allowedOrigin =
    origin && allowedOrigins.includes(origin) ? origin : allowedOrigins[0];

  const corsHeaders = {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        ...corsHeaders,
        'Access-Control-Max-Age': '86400' // Cache preflight for 1 day
      },
      body: ''
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  if (!origin || !allowedOrigins.includes(origin)) {
    return {
      statusCode: 403,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Forbidden: Invalid origin' })
    };
  }

  try {
    const data = JSON.parse(event.body || '{}');

    // Validación del postId ANTES del check de configuración: un body inválido
    // es un 400 del cliente aunque el servidor esté mal configurado.
    if (
      typeof data.postId !== 'string' ||
      !POST_ID_PATTERN.test(data.postId) ||
      data.postId.startsWith('drafts.')
    ) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Invalid or missing postId' })
      };
    }

    const sanityToken = process.env.SANITY_WRITE_TOKEN?.trim();
    const sanityDataset = process.env.SANITY_DATASET?.trim();

    if (!sanityToken || !sanityDataset) {
      return {
        statusCode: 500,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Server configuration error' })
      };
    }

    const response = await fetch(
      `https://a5eryyb2.api.sanity.io/v2025-05-11/data/mutate/${sanityDataset}?returnDocuments=true`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sanityToken}`
        },
        // Patch por query: solo los documentos de tipo "post" son incrementables.
        // El endpoint es públicamente alcanzable (CORS-gated, sin auth de
        // usuario), así que un id con formato válido de OTRO tipo de documento
        // (p. ej. una category) no debe mutarse; si la query no matchea nada,
        // Sanity responde 200 con results: [] y el shape-guard de abajo
        // responde 500 sin haber escrito nada.
        //
        // `inc` falla con 400 ("Cannot increment usefulCount because it is
        // not present") si el campo no existe en el documento, así que la
        // primera mutación lo inicializa a 0 cuando está ausente o es null.
        // Sanity aplica las mutaciones de un request en orden como transacción
        // única: si el campo ya tiene valor, el primer patch no matchea y el
        // segundo simplemente incrementa.
        body: JSON.stringify({
          mutations: [
            {
              patch: {
                query: '*[_type == "post" && _id == $id && usefulCount == null]',
                params: { id: data.postId },
                set: { usefulCount: 0 }
              }
            },
            {
              patch: {
                query: '*[_type == "post" && _id == $id]',
                params: { id: data.postId },
                inc: { usefulCount: 1 }
              }
            }
          ]
        })
      }
    );

    if (!response.ok) {
      // El body del error de Sanity describe el fallo exacto (p. ej.
      // validationError en las mutaciones); sin este log solo veríamos
      // "400 Bad Request".
      const sanityError = await response.text();
      console.error('Sanity mutation failed:', response.status, sanityError);
      throw new Error(
        `Sanity mutation failed: ${response.status} ${response.statusText}`
      );
    }

    const result = (await response.json()) as {
      results?: Array<{ document?: { usefulCount?: unknown } }>;
    };

    // El resultado autoritativo es el ÚLTIMO: corresponde al patch de inc,
    // que es el que contiene el contador ya incrementado (el primer patch,
    // el de inicialización, devolvería 0 cuando matchea).
    const results = result.results ?? [];
    const count = results[results.length - 1]?.document?.usefulCount;

    if (typeof count !== 'number') {
      throw new Error('Unexpected Sanity response: usefulCount not found');
    }

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({ success: true, count })
    };
  } catch (error) {
    console.error('Useful function error:', error);

    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      })
    };
  }
};

export { handler };
