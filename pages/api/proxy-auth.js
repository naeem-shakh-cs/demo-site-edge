export const config = {
  api: {
    responseLimit: false,
  },
};

const VALID_USERNAME = 'user';
const VALID_PASSWORD = 'pass';

function checkProxyAuth(req) {
  const authHeader = req.headers['proxy-authorization'];
  if (!authHeader?.startsWith('Basic ')) return false;

  const base64 = authHeader.slice('Basic '.length);
  const decoded = Buffer.from(base64, 'base64').toString('utf8');
  const [username, password] = decoded.split(':');

  return username === VALID_USERNAME && password === VALID_PASSWORD;
}

export default async function handler(req, res) {
  const proxyAuthHeader = req.headers['proxy-authorization'];
  console.log('proxy-authorization header received:', proxyAuthHeader);
  console.log('all headers:', JSON.stringify(req.headers, null, 2));

  if (!checkProxyAuth(req)) {
    res.setHeader('Proxy-Authenticate', 'Basic realm="Proxy Auth"');
    res.status(407).end('Proxy Authentication Required');
    return;
  }

  res.socket?.setNoDelay(true);
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Transfer-Encoding', 'chunked');
  res.setHeader('Cache-Control', 'no-cache');
  res.flushHeaders();
  res.write('<pre>' + ' '.repeat(1024) + '\n');

  const chunks = [
    'Proxy auth verified. Starting stream...\n',
    'Sending chunk 1...\n',
    'Sending chunk 2...\n',
    'Sending chunk 3...\n',
    'Sending chunk 4...\n',
    'Sending chunk 5...\n',
    'Almost done...\n',
    'Stream complete.\n',
  ];

  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  for (const chunk of chunks) {
    res.write(chunk);
    if (typeof res.flush === 'function') res.flush();
    await delay(1000);
  }

  res.write('</pre>');
  res.end();
}
