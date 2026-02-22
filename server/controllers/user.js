import express from 'express'

import logger from '../utils/logger.js'

import userService from '../services/user.js'

const router = express.Router()

router.get('/me', async (req, res, next) => {
  try {
    const userId = req.user.userId

    const user = await userService.getUserById(userId)

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
    const { email } = req.query

    const user = await userService.searchUser(email)

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

    const user = await userService.getUserById(userId)

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