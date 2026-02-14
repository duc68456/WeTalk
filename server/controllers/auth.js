import express from 'express'
import bcrypt from 'bcryptjs'
import zod from 'zod'
import prisma from '../config/db.js'
import logger from '../utils/logger.js'

const router = express.Router()

const registerSchema = zod.object({
  email: zod.string().email("Email is invalid"),
  password: zod.string().min(6, "Password length must be at least 6 characters"),
  name: zod.string().min(1, "Name cannot be left blank")
})

router.post('/register', async (req, res, next) => {
  try {
    const validatedData = registerSchema.parse(req.body)

    const { email, password, name } = validatedData

    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    const newUser = await prisma.user.create({
      data: {
        email: email,
        password: hashedPassword,
        name: name
      }
    })

    // logger.info(newUser)

    res.status(201).json({
      message: "Registered Succesfully",
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name
      }
    })
  }
  catch (error) {
    // if (error instanceof zod.ZodError) {
    //   logger.info('This is the object error: ', error)
    //   logger.info('This is the array errors: ', error.issues)
    //   const errorMessages = error.issues.map((err) => err.message);
    //   logger.error(errorMessages).join(', ')
    // }
    next(error)
  }
})

export default router