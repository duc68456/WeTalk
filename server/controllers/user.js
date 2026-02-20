import express from 'express'
import prisma from '../config/db.js'

import logger from '../utils/logger.js'

const router = express.Router()

router.get('/me', async (req, res, next) => {
  try {
    // logger.info('req arrived me')
    // logger.info('req user: ', req.user)
    const userId = req.user.userId

    logger.info('user id: ', userId)

    const user = await prisma.user.findUnique({
      where: {
        id: userId
      },
      // include: {
      //   members: true
      // }
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: { members : true }
        }
      }
    })

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      })
    }

    return res.status(200).json({
      message: "Information of this user",
      user: user
    })
  }
  catch (error) {
    logger.error(error)
    next(error)
  }
})

router.get('/search', async (req, res, next) => {
  try {
    // logger.info('req ok')
    // logger.info('query: ', req.query)
    const { email } = req.query

    const user = await prisma.user.findFirst({
      where: {
        email: email
      }
    })

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      })
    }

    return res.status(200).json({
      message: "Information of this user",
      user: user
    })
  }
  catch (error) {
    logger.error(error)
    next(error)
  }
})

router.get('/:userId', async (req, res, next) => {
  try {
    const { userId } = req.params

    const user = await prisma.user.findUnique({
      where: {
        id: userId
      },
      select: {
        email: true,
        name: true
      }
    })

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      })
    }

    return res.status(200).json({
      message: "Information of this user",
      user: user
    })
  }
  catch (error) {
    logger.error(error)
    next(error)
  }
})

export default router