import express from 'express'
import cors from 'cors'

import { createServer } from 'node:http'
import { Server } from 'socket.io'

import authController from './controllers/auth.js'
import conversationController from './controllers/conversation.js'
import memberController from './controllers/member.js'
import userController from './controllers/user.js'

import messageController from './controllers/message.js'

import authMiddleware from './middlewares/auth.js'
import errorHandler from './middlewares/errorHandler.js'

import logger from './utils/logger.js'

const app = express()
const server = createServer(app)
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true
  }
})

app.use(
  cors({
    origin: [
      'http://localhost:5173'
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
  })
)

app.set('io', io)

io.on('connection', (socket) => {
  logger.info('A User has connected, they connect id is:', socket.id)

  socket.on('disconnect', () => {
    logger.info('User with id', socket.id, 'has disconnected')
  })

  socket.on('join_room', (conversationId) => {
    socket.join(conversationId)
    logger.info('User with id', socket.id, 'has joined room', conversationId)
  })
})

app.use(express.json())

app.use('/api/auth', authController)
app.use('/api/conversation', authMiddleware, conversationController)
app.use('/api/member', authMiddleware, memberController)
app.use('/api/user', authMiddleware, userController)

app.use('/api/message', authMiddleware, messageController)

app.use(errorHandler)

export default server