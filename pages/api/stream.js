export const config = {
  api: {
    responseLimit: false,
  },
};

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Transfer-Encoding', 'chunked');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('X-Accel-Buffering', 'no');

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

  for (const chunk of chunks) {
    res.write(chunk);
    await delay(intervalMs);
  }

  res.end();
}
