import express from 'express'

const app = express()

// Home route - HTML
app.get('/', (req, res) => {
  res.send(`
    <html>
      <head>
        <title>Multi-Tenant API</title>
      </head>
      <body>
        <h1>Welcome to the Multi-Tenant API</h1>
        <p>Try visiting <a href="/api-data">/api-data</a> for some sample JSON data.</p>
      </body>
    </html>
  `)
})

// Example API endpoint - JSON
app.get('/api-data', (req, res) => {
  res.json({
    message: 'Here is some sample API data',
    items: ['apple', 'banana', 'cherry'],
  })
})

// Health check
app.get('/healthz', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.set('port', process.env.PORT || 3000)

app.listen(app.get('port'), () => {
  console.log(`Server running on http://localhost:${app.get('port')}`)
})

export default app