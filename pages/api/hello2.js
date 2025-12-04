// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

export default function handler(req, res) {
  console.log('method', req.method)
  console.log('vars length:',process.env.AH_COLLECTION_ID5);
  res.setHeader('Content-Type', 'application/json');

  res.setHeader('Cache-Control', 's-maxage=500');
  res.setHeader('Cache-Tag', 'hello2');
  res.status(200).json({ name: "John Doe 2" });
}
