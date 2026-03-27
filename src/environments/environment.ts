export const environment = {
  production: false,
  sanity: {
    projectId: 'a5eryyb2',
    dataset: 'development',
    apiVersion: '2025-05-11',
    useCdn: true, // true for cached reads, false if you want fresh data
    token: undefined
  },
  contactEndpoint: 'http://localhost:8888/.netlify/functions/contact',
  reviewsEndpoint: 'http://localhost:8888/.netlify/functions/reviews'
};
