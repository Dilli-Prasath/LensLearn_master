/**
 * Vercel Serverless Function — Ollama Cloud Proxy
 *
 * Proxies browser requests to https://ollama.com/api/*
 * solving the CORS issue (browser → same-origin proxy → Ollama Cloud).
 *
 * The API key is read from server-side env vars only.
 * Supports streaming for /api/chat responses.
 *
 * All /api/ollama-cloud/* requests are rewritten to this function
 * via vercel.json rewrites.
 */

export const config = { runtime: 'edge' };

export default async function handler(req) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders(),
    });
  }

  // Read API key from server env (never exposed to browser)
  const apiKey = process.env.OLLAMA_API_KEY || process.env.VITE_OLLAMA_API_KEY;
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: 'Ollama API key not configured on server' }),
      { status: 500, headers: { ...corsHeaders(), 'Content-Type': 'application/json' } }
    );
  }

  // Extract the Ollama API path from the URL
  // /api/ollama-cloud/api/tags → /api/tags
  // /api/ollama-cloud/api/chat → /api/chat
  const url = new URL(req.url);
  const ollamaPath = url.pathname.replace(/^\/api\/ollama-cloud/, '') || '/';
  const targetUrl = `https://ollama.com${ollamaPath}`;

  try {
    // Forward the request to Ollama Cloud
    const fetchOptions = {
      method: req.method,
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    };

    // Forward body for POST/PUT/PATCH
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      fetchOptions.body = await req.text();
    }

    const response = await fetch(targetUrl, fetchOptions);

    // Check if this is a streaming response (for /api/chat with stream: true)
    const contentType = response.headers.get('Content-Type') || 'application/json';
    const isStreaming = contentType.includes('ndjson') ||
                        contentType.includes('stream') ||
                        contentType.includes('event-stream');

    if (isStreaming && response.body) {
      // Stream the response through as-is
      return new Response(response.body, {
        status: response.status,
        headers: {
          ...corsHeaders(),
          'Content-Type': contentType,
          'Cache-Control': 'no-cache',
        },
      });
    }

    // Non-streaming: return the full response
    const body = await response.text();
    return new Response(body, {
      status: response.status,
      headers: {
        ...corsHeaders(),
        'Content-Type': contentType,
      },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: `Proxy error: ${err.message}` }),
      { status: 502, headers: { ...corsHeaders(), 'Content-Type': 'application/json' } }
    );
  }
}

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}
