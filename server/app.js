import express from 'express'

import authController from './controllers/auth.js'
import conversationController from './controllers/conversation.js'
import memberController from './controllers/member.js'
import userController from './controllers/user.js'

import authMiddleware from './middlewares/auth.js'
import errorHandler from './middlewares/errorHandler.js'

const app = express()

app.use(express.json())

app.use('/api/auth', authController)
app.use('/api/conversation', authMiddleware, conversationController)
app.use('/api/member', authMiddleware, memberController)
app.use('/api/user', authMiddleware, userController)

app.use(errorHandler)

export default app