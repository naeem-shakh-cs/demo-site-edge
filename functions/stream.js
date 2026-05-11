export default async function handler(request, response) {
  response.setHeader('Content-Type', 'text/plain; charset=utf-8');
  response.setHeader('Transfer-Encoding', 'chunked');
  response.setHeader('Cache-Control', 'no-cache');
  response.setHeader('X-Accel-Buffering', 'no');
  response.status(200);

  const chunks = [
    'Starting stream...\n',
    'Processing step 1...\n',
    'Processing step 2...\n',
    'Processing step 3...\n',
    'Processing step 4...\n',
    'Processing step 5...\n',
    'Processing step 6...\n',
    'Processing step 7...\n',
    'Almost done...\n',
    'Stream complete.\n',
  ];

  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  for (const chunk of chunks) {
    response.write(chunk);
    await delay(1000);
  }

  response.end();
}
