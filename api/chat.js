export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-api-key')

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  // Get key from header or body
  const apiKey = req.headers['x-api-key'] || req.body?.apiKey
  
  if (!apiKey) {
    return res.status(401).json({ error: { message: 'Clé API manquante' } })
  }

  try {
    // Non-streaming call for reliability
    const body = { ...req.body }
    delete body.apiKey
    body.stream = false

    const upstream = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify(body)
    })

    const data = await upstream.json()
    return res.status(upstream.status).json(data)

  } catch (err) {
    return res.status(500).json({ error: { message: err.message } })
  }
}
