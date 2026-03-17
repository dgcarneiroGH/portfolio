export const environment = {
  production: false,
  sanity: {
    projectId: 'a5eryyb2',
    dataset: 'development',
    apiVersion: '2025-05-11', // or new Date().toISOString().slice(0,10)
    useCdn: true, // true for cached reads, false if you want fresh data
    token: undefined // Do NOT put a write token in the client in production!
  },
  n8nWebhookUrl: 'https://n8n.nomacoda.com/webhook-test/portfolio-contact-form'
};
