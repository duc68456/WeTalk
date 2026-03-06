import express from 'express'

import logger from '../utils/logger.js'

import userService from '../services/user.js'
import uploadCloud from '../config/cloudinary.js'
import auth from '../middlewares/auth.js'

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

router.get('/search', auth, async (req, res, next) => {
  try {
    const { email } = req.query

    const requesterUserId = req.user?.userId
    const user = await userService.searchUserForRequester(email, requesterUserId)

    return res.status(200).json({
      message: 'User found',
      user
    })
  }
  catch (error) {
    logger.error(error)

    const code = error?.message || error
    if (code === 'EMAIL_REQUIRED') {
      return res.status(400).json({ message: 'Email is required' })
    }
    if (code === 'EMAIL_INVALID') {
      return res.status(400).json({ message: 'Invalid email format' })
    }
    if (code === 'CANNOT_SEARCH_SELF') {
      return res.status(400).json({ message: 'You cannot search yourself' })
    }
    if (code === 'USER_NOT_FOUND') {
      return res.status(404).json({ message: 'User not found' })
    }

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

router.patch('/update-profile', async (req, res, next) => {
  try {
    const userId = req.user.userId
    const { name } = req.body

    const updatedUser = await userService.updateUser(userId, name)

    res.status(200).json(updatedUser)
  }
  catch (error) {
    logger.error(error)
    next(error)
  }
})

router.patch('/update-avatar', uploadCloud.single('avatar'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'There is no image file' });
    }

    const avatarUrl = req.file.path;
    const userId = req.user.userId

    const updatedUser = await userService.updateAvatarUser(avatarUrl, userId)

    res.status(200).json({
      message: "Avatar updated succesfully",
      user: updatedUser
    })
  }
  catch (error) {
    logger.error(error)
    next(error)
  }
})

export default router