export const environment = {
  production: false,
  sanity: {
    projectId: 'a5eryyb2',
    dataset: 'development',
    apiVersion: '2025-05-11',
    // useCdn: false en local: el CDN cachea las queries 60s (Cache-Control
    // max-age=60) y enmascara los writes de la función useful al recargar.
    useCdn: false,
    token: undefined
  },
  contactEndpoint: 'http://localhost:8888/.netlify/functions/contact',
  reviewsEndpoint: 'http://localhost:8888/.netlify/functions/reviews',
  usefulEndpoint: 'http://localhost:8888/.netlify/functions/useful'
};
