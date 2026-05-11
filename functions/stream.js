export default async function handler(request, response) {
  const encoder = new TextEncoder();

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
  const intervalMs = 1000;

  const stream = new ReadableStream({
    async start(controller) {
      for (const chunk of chunks) {
        controller.enqueue(encoder.encode(chunk));
        await delay(intervalMs);
      }
      controller.close();
    },
  });

  return new Response(stream, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-cache',
      'X-Accel-Buffering': 'no',
    },
  });
}
