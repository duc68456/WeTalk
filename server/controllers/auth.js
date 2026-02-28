import express from 'express'
import zod from 'zod'

import logger from '../utils/logger.js'

const router = express.Router();

import authService from '../services/auth.js'

const registerSchema = zod.object({
  email: zod.string().email("Email is invalid"),
  password: zod.string().min(6, "Password length must be at least 6 characters"),
  name: zod.string().min(1, "Name cannot be left blank")
});

const loginSchema = zod.object({
  email: zod.string().email("Email is invalid"),
  password: zod.string().min(1, "Password cannot be left blank")
});

router.post('/register', async (req, res, next) => {
  try {
    const validatedData = registerSchema.parse(req.body);

    const { email, password, name } = validatedData;

    // const newUser = await userService.createUser(email, password, name)
    const newUser = await authService.register(email, password, name)

    res.status(201).json({
      message: "Registered Succesfully",
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        avatarUrl: newUser.avatarUrl
      }
    });
  }
  catch (error) {
    next(error);
  }
})

router.post('/login', async (req, res, next) => {
  try {
    const validatedData = loginSchema.parse(req.body);

    const { email, password } = validatedData;

    const result = await authService.login(email, password)

    const user = result.user

    res.status(200).json({
      message: 'Login succesfully',
      token: result.token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl
      }
    });
  }
  catch (error) {
    next(error);
  }
})

export default router