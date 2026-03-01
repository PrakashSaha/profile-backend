import app from './app.js'
import { config } from './config/env.js'

const port = config.PORT

app.listen(Number(port), '0.0.0.0', () => {
    console.log(`[SERVER] API listening on http://localhost:${port}`)
    console.log(`[SERVER] Mode: ${config.NODE_ENV}`)
})
