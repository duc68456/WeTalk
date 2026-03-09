import express from 'express'
import cors from 'cors'
import path from 'path';
import { fileURLToPath } from 'url';

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
import prisma from './config/db.js'
import jwt from 'jsonwebtoken'

const app = express()
const server = createServer(app)

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true)
    if (allowedOrigins.includes(origin)) return callback(null, true)
    
    return callback(null, false) 
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}

const io = new Server(server, {
  cors: corsOptions
})


const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000',
  'https://wetalk-58940d14d1e3.herokuapp.com'
]

app.use(cors(corsOptions))
app.options(/.*/, cors(corsOptions))

app.set('io', io)

io.use((socket, next) => {
  try {
    const token = socket.handshake?.auth?.token
    if (!token) return next(new Error('UNAUTHORIZED'))

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const userId = decoded?.userId || decoded?.id
    if (!userId) return next(new Error('UNAUTHORIZED'))

    socket.data.userId = userId
    next()
  } catch (err) {
    next(new Error('UNAUTHORIZED'))
  }
})

const onlineUserIds = new Set()

io.on('connection', (socket) => {
  logger.info('A User has connected, they connect id is:', socket.id)

  const userId = socket.data?.userId
  if (userId) {
    socket.join(`user:${userId}`)

    onlineUserIds.add(userId)
    prisma.user
      .update({ where: { id: userId }, data: { lastActiveAt: new Date() } })
      .catch((e) => logger.error('Failed to update lastActiveAt on connect', e))

    socket.emit('presence:init', {
      onlineUserIds: Array.from(onlineUserIds)
    })
  }

  socket.on('disconnect', () => {
    logger.info('User with id', socket.id, 'has disconnected')

    if (userId) {
      onlineUserIds.delete(userId)
      prisma.user
        .update({ where: { id: userId }, data: { lastActiveAt: new Date() } })
        .catch((e) => logger.error('Failed to update lastActiveAt on disconnect', e))
      io.emit('presence:update', { userId, isOnline: false, lastActiveAt: new Date().toISOString() })
    }
  })

  socket.on('join_room', (conversationId) => {
    socket.join(conversationId)
    logger.info('User with id', socket.id, 'has joined room', conversationId)

    if (userId) {
      io.to(conversationId).emit('presence:update', { userId, isOnline: true })
    }
  })

  socket.on('typing:start', ({ conversationId }) => {
    if (!conversationId || !userId) return
    const displayName = socket.handshake?.auth?.name
    socket.to(conversationId).emit('typing:update', { conversationId, userId, displayName, isTyping: true })
  })

  socket.on('typing:stop', ({ conversationId }) => {
    if (!conversationId || !userId) return
    const displayName = socket.handshake?.auth?.name
    socket.to(conversationId).emit('typing:update', { conversationId, userId, displayName, isTyping: false })
  })
})

app.use(express.json())

app.use('/api/auth', authController)
app.use('/api/conversation', authMiddleware, conversationController)
app.use('/api/member', authMiddleware, memberController)
app.use('/api/user', authMiddleware, userController)

app.use('/api/message', authMiddleware, messageController)

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const clientBuildPath = path.join(__dirname, '..', 'client', 'dist');

app.use(express.static(clientBuildPath));

app.use('/api', (req, res) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

app.get(/^(?!\/api\/)(?!\/assets\/).*/, (req, res, next) => {
  res.sendFile(path.join(clientBuildPath, 'index.html'), (err) => {
    if (err) return next(err)
  })
})

app.use(errorHandler)

export default server