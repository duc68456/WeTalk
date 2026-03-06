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
      lastActiveAt: true,
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
  const normalizedEmail = (email || '').toString().trim().toLowerCase()

  if (!normalizedEmail) {
    throw new Error('EMAIL_REQUIRED')
  }

  // basic email format check
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(normalizedEmail)) {
    throw new Error('EMAIL_INVALID')
  }

  const user = await prisma.user.findFirst({
    where: {
      email: normalizedEmail
    },
    select: {
      id: true,
      email: true,
      name: true,
      avatarUrl: true,
      lastActiveAt: true,
      createdAt: true
    }
  })

  if (!user) {
    throw new Error('USER_NOT_FOUND')
  }

  return user
}

const searchUserForRequester = async (email, requesterUserId) => {
  const user = await searchUser(email)

  // Zalo-style: searching yourself is not useful for "add friend" flows
  if (requesterUserId && user.id === requesterUserId) {
    throw new Error('CANNOT_SEARCH_SELF')
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
  searchUserForRequester,
  updateUser,
  updateAvatarUser
}