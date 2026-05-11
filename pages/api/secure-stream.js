export const config = {
  api: {
    responseLimit: false,
  },
};

const VALID_USERNAME = 'admin';
const VALID_PASSWORD = 'secret';

function checkBasicAuth(req) {
  const authHeader = req.headers['authorization'];
  if (!authHeader?.startsWith('Basic ')) return false;

  const base64 = authHeader.slice('Basic '.length);
  const decoded = Buffer.from(base64, 'base64').toString('utf8');
  const [username, password] = decoded.split(':');

  return username === VALID_USERNAME && password === VALID_PASSWORD;
}

export default async function handler(req, res) {
  if (!checkBasicAuth(req)) {
    res.setHeader('WWW-Authenticate', 'Basic realm="Secure Stream"');
    res.status(401).end('Unauthorized');
    return;
  }

  res.socket?.setNoDelay(true);
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Transfer-Encoding', 'chunked');
  res.setHeader('Cache-Control', 'no-cache');
  res.flushHeaders();
  res.write('<pre>' + ' '.repeat(1024) + '\n');

  const chunks = [
    'Auth verified. Starting secure stream...\n',
    'Sending chunk 1...\n',
    'Sending chunk 2...\n',
    'Sending chunk 3...\n',
    'Sending chunk 4...\n',
    'Sending chunk 5...\n',
    'Sending chunk 6...\n',
    'Sending chunk 7...\n',
    'Almost done...\n',
    'Secure stream complete.\n',
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
