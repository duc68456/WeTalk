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
import prisma from './config/db.js'
import jwt from 'jsonwebtoken'

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
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
  })
)

app.set('io', io)

// Socket auth: validate JWT token and attach user id.
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

// Simple in-memory online tracking.
const onlineUserIds = new Set()

io.on('connection', (socket) => {
  logger.info('A User has connected, they connect id is:', socket.id)

  const userId = socket.data?.userId
  if (userId) {
    // Join a user-specific room so we can push events even when the client
    // hasn't joined a conversation room yet (e.g., first message of a new chat).
    socket.join(`user:${userId}`)

    onlineUserIds.add(userId)
    // Fire-and-forget lastActive update.
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
      // Notify everyone (client can decide if it cares).
      io.emit('presence:update', { userId, isOnline: false, lastActiveAt: new Date().toISOString() })
    }
  })

  socket.on('join_room', (conversationId) => {
    socket.join(conversationId)
    logger.info('User with id', socket.id, 'has joined room', conversationId)

    if (userId) {
      // Notify the room that this user is online.
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

app.use(errorHandler)

export default server