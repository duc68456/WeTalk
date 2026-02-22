import prisma from '../config/db.js'

const getUserById = async (userId) => {
  const user = await prisma.user.findUnique({
    where: {
      id: userId
    },
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

export default {
  getUserById,
  searchUser
}