import express from 'express'
import authController from './controllers/auth.js'
import conversationController from './controllers/conversation.js'

import authMiddleware from './middlewares/auth.js'
import errorHandler from './middlewares/errorHandler.js'

const app = express()

app.use(express.json())

app.use('/api/auth', authController)
app.use('/api/conversation', authMiddleware, conversationController)

app.use(errorHandler)

export default app