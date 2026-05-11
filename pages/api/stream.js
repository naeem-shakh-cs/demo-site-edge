export const config = {
  api: {
    responseLimit: false,
  },
};

export default async function handler(req, res) {
  res.socket?.setNoDelay(true);
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Transfer-Encoding', 'chunked');
  res.setHeader('Cache-Control', 'no-cache');
  res.flushHeaders();
  // Padding flushes the browser's 1KB render buffer so chunks appear immediately
  res.write('<pre>' + ' '.repeat(1024) + '\n');

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
  const intervalMs = 500;

  for (const chunk of chunks) {
    res.write(chunk);
    if (typeof res.flush === 'function') res.flush();
    await delay(intervalMs);
  }

  res.write('</pre>');
  res.end();
}
