import { Handler, HandlerResponse } from '@netlify/functions';

const handler: Handler = async (event, context): Promise<HandlerResponse> => {
  const allowedOrigins = [
    'https://nomacoda.com',
    'http://localhost:4200',
    'http://localhost:4201',
    'http://localhost:4202'
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
    const portfolioToken = process.env.PORTFOLIO_TOKEN;
    const n8nWebhookUrl = process.env.N8N_CONTACT_WEBHOOK_URL;

    if (!portfolioToken || !n8nWebhookUrl) {
      return {
        statusCode: 500,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Server configuration error' })
      };
    }

    const data = JSON.parse(event.body || '{}');

    if (!data.fullName || !data.email || !data.message) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Missing required fields' })
      };
    }

    const response = await fetch(n8nWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Portfolio-Token': portfolioToken
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error(`N8N webhook failed: ${response.statusText}`);
    }

    const result = await response.json();

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({ success: true, data: result })
    };
  } catch (error) {
    console.error('Contact function error:', error);

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
