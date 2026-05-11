export default async function handler(req, context) {
  const originResponse = await fetch(req);

  // Consuming the body here forces the edge to wait for the full response
  const body = await originResponse.text();

  return new Response(body, {
    status: originResponse.status,
    headers: originResponse.headers,
  });
}