import app from './app.js'
import { config } from './config/env.js'
import logger from './lib/logger.js'

const port = Number(config.PORT) || 5001

app.listen(port, '0.0.0.0', () => {
    logger.info(`Server listening at http://localhost:${port}`)
    logger.info(`[SERVER] Mode: ${config.NODE_ENV}`)
})

// Fail fast on unhandled rejections/exceptions using the logger
process.on('unhandledRejection', (reason) => {
    logger.fatal({ msg: 'Unhandled Rejection', error: reason })
    process.exit(1)
})

process.on('uncaughtException', (err) => {
    logger.fatal({ msg: 'Uncaught Exception', error: err.message, stack: err.stack })
    process.exit(1)
})
