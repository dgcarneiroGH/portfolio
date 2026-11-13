export const environment = {
  production: true,
  sanity: {
    projectId: 'a5eryyb2',
    dataset: 'production',
    apiVersion: '2025-05-11',
    // useCdn: true en producción: el CDN es el ajuste correcto para un blog
    // público. Tradeoff aceptado: tras un click en "me resultó útil", un
    // hard-reload inmediato puede mostrar el contador anterior hasta ~60s
    // (Cache-Control max-age=60 del CDN). En sesión la UI se actualiza con
    // el count autoritativo que devuelve la función, así que el usuario
    // siempre ve el número correcto en el momento del click.
    useCdn: true,
    token: undefined
  },
  contactEndpoint: 'https://nomacoda.com/.netlify/functions/contact',
  reviewsEndpoint: 'https://nomacoda.com/.netlify/functions/reviews',
  usefulEndpoint: 'https://nomacoda.com/.netlify/functions/useful'
};
