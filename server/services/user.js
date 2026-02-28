import prisma from '../config/db.js'

// import bcrypt from 'bcryptjs'

const getUserById = async (userId) => {
  const user = await prisma.user.findUnique({
    where: {
      id: userId
    },
    select: {
      id: true,
      email: true,
      name: true,
      avatarUrl: true,
      createdAt: true,
      updatedAt: true,
      _count: {
        select: { members : true }
      }
    }
  })

  if (!user) {
    throw new Error('USER_NOT_FOUND')
  }

  return user
}

const searchUser = async (email) => {
  const user = await prisma.user.findFirst({
    where: {
      email: email
    }
  })

  if (!user) {
    throw new Error('USER_NOT_FOUND')
  }

  return user
}

const updateUser = async (userId, name) => {
  const user = await prisma.user.update({
    where: {
      id: userId
    },
    data: {
      name: name
   }
  })

  return user
}

const updateAvatar = async (userId, avatarUrl) => {
  const user = await prisma.user.update({
    where: {
      id: userId
    },
    data: {
      avatarUrl: avatarUrl
    }
  })

  return user
}

const updateAvatarUser = async (avatarUrl, userId) => {
  const user = await prisma.user.update({
    where: {
      id: userId
    },
    data: {
      avatarUrl: avatarUrl
    }
  })

  return user
}

export default {
  getUserById,
  searchUser,
  updateUser,
  updateAvatar,
  updateAvatarUser
}