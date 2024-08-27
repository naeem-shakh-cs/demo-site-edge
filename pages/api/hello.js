// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

export default function handler(req, res) {
  console.log('vars length:', Object.keys(process.env).length);
  res.setHeader('Content-Type', 'application/json');
  res.status(200).json({ name: "John Doe" });
}
