import prisma from '../config/db.js'

import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

import config from '../utils/config.js'

const register = async (email, password, name) => {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const newUser = await prisma.user.create({
    data: {
      email: email,
      password: hashedPassword,
      name: name
    }
  });

  return newUser
}

const login = async (email, password) => {
  const user = await prisma.user.findUnique({
    where: { email: email }
  });

  if(!user) {
    throw new Error('INVALID_LOGIN_INFO')
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw new Error('INVALID_LOGIN_INFO')
  }

  const token = jwt.sign(
    {
      userId: user.id,
      email: user.email
    },
    config.JWT_SECRET
  );

  return {
    user: user,
    token: token
  }
}

export default {
  register,
  login
}