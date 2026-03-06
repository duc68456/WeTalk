import prisma from '../config/db.js'
import logger from '../utils/logger.js'

const getMyConversation = async (userId) => {
    const myConversations = await prisma.member.findMany({
      where: {
        userId: userId,
        conversation: {
          deletedAt: null
        }
      },
      select: {
        conversation: {
          select: {
            id: true,
            type: true,
            name: true,
             avatarUrl: true,
            createdAt: true,
            members: {
              where: {
                userId: {
                  not: userId
                }
              },
              take: 4,
              select: {
                // userId,
                user: {
                  select: { id: true, name: true, avatarUrl: true, lastActiveAt: true }
                }
              }
            },
            messages: {
              orderBy: { createdAt: 'desc' },
              take: 1,
              include: {
                sender: {
                  select: { name: true }
                }
              }
            }
          }
        }
      }
    })

    return myConversations
}

const getConversationById = async (conversationId, requesterId) => {
  const conversation = await prisma.conversation.findFirst({
    where: {
      id: conversationId,
      deletedAt: null,
      members: {
        some: { userId: requesterId }
      }
    },
    include: {
      members: {
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
              avatarUrl: true,
              lastActiveAt: true,
              createdAt: true,
              updatedAt: true
            }
          },
          // role: true
        }
      }
    }
  })

  return conversation
}

const createConversation = async (type, inviteesIds, creatorId, allMembersIds, name) => {
  if (type === 'DIRECT') {
    logger.info(inviteesIds.length)
    if (inviteesIds.length !== 1) {
      throw new Error('DIRECT_MIN_MEMBER')
    }
    const partnerId = inviteesIds[0]

    const existingConversation = await prisma.conversation.findFirst({
      where: {
        type: 'DIRECT',
        AND: [
          { members: { some: { userId: creatorId } } },
          { members: { some: { userId: partnerId } } }
        ]
      },
      include: {
        members: true
      }
    })

    if (existingConversation) {
      return { 
          data: existingConversation, 
          isAlreadyExisted: true 
      };
    }

    const newConversation = await prisma.conversation.create({
      data: {
        type: 'DIRECT',
        members: {
          create: allMembersIds.map((id) => ({
            user: { connect: { id: id } },
            role: 'PEER'
          }))
        }
      },
      include: {
        members: true
      }
    })

    return { 
      data: newConversation, 
      isAlreadyExisted: false 
    };
  }

  else if (type === 'GROUP') {
    if (inviteesIds.length < 2) {
      throw new Error('GROUP_MIN_MEMBER')
    }

    const newGroup = await prisma.conversation.create({
      data: {
        type: 'GROUP',
        name: name,
        members: {
          create: [
            {
              user: { connect: { id: creatorId } },
              role: 'ADMIN'
            },
            ...inviteesIds.map((id) => ({
              user: { connect: { id: id } },
              role: 'MEMBER'
            }))
          ]
        }
      },
      include: {
        members: true
      }
    })
    return { 
      data: newGroup, 
      isAlreadyExisted: false 
    };
  }
}

const getOrCreateDirectConversation = async (requesterId, partnerId) => {
  if (!requesterId || !partnerId) {
    throw new Error('MISSING_PARTNER')
  }

  if (requesterId === partnerId) {
    throw new Error('CANNOT_CHAT_SELF')
  }

  const partnerExists = await prisma.user.findUnique({
    where: { id: partnerId },
    select: { id: true }
  })
  if (!partnerExists) {
    throw new Error('USER_NOT_FOUND')
  }

  // Concurrency-safe get-or-create.
  // Even if the client (or browser) fires multiple requests quickly, this should resolve to one canonical DIRECT conversation.
  const result = await prisma.$transaction(async (tx) => {
    const existing = await tx.conversation.findFirst({
      where: {
        type: 'DIRECT',
        deletedAt: null,
        AND: [
          { members: { some: { userId: requesterId } } },
          { members: { some: { userId: partnerId } } }
        ]
      },
      select: {
        id: true,
        type: true,
        name: true,
        avatarUrl: true,
        createdAt: true,
        members: {
          where: {
            userId: { not: requesterId }
          },
          take: 4,
          select: {
            user: {
              select: { id: true, name: true, avatarUrl: true, lastActiveAt: true }
            }
          }
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          include: {
            sender: {
              select: { name: true }
            }
          }
        }
      }
    })

    if (existing) return { conversation: existing, isAlreadyExisted: true }

    // Create new DIRECT conversation.
    await tx.conversation.create({
      data: {
        type: 'DIRECT',
        members: {
          create: [
            { user: { connect: { id: requesterId } }, role: 'PEER' },
            { user: { connect: { id: partnerId } }, role: 'PEER' }
          ]
        }
      }
    })

    // Read again to return the canonical row (handles rare cases where multiple creates slip through under weak isolation).
    const canonical = await tx.conversation.findFirst({
      where: {
        type: 'DIRECT',
        deletedAt: null,
        AND: [
          { members: { some: { userId: requesterId } } },
          { members: { some: { userId: partnerId } } }
        ]
      },
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        type: true,
        name: true,
        avatarUrl: true,
        createdAt: true,
        members: {
          where: {
            userId: { not: requesterId }
          },
          take: 4,
          select: {
            user: {
              select: { id: true, name: true, avatarUrl: true, lastActiveAt: true }
            }
          }
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          include: {
            sender: {
              select: { name: true }
            }
          }
        }
      }
    })

    if (!canonical) {
      throw new Error('FAILED_TO_CREATE_DIRECT')
    }

    return { conversation: canonical, isAlreadyExisted: false }
  })

  return result
}

const deleteConversation = async (conversationId, requesterId) => {
  const conversation = await prisma.conversation.findUnique({
    where: { 
      id: conversationId 
    },
    include: {
      members: {
        where: { userId: requesterId }
      }
    }
  });

  if (!conversation || conversation.members.length === 0) {
    throw new Error('NOT_FOUND_OR_NOT_ALLOWED');
  }

  const requesterRole = conversation.members[0].role;

  if (conversation.type === 'GROUP' && requesterRole !== 'ADMIN') {
    throw new Error('ONLY_ADMIN_CAN_DELETE_GROUP');
  }

  const deletedConversation = await prisma.conversation.update({
    where: { 
      id: conversationId 
    },
    data: { 
      deletedAt: new Date()
    }
  });

  return deletedConversation;
}

const updateGroupAvatar = async (conversationId, requesterId, avatarUrl) => {
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: {
      members: {
        where: { userId: requesterId }
      }
    }
  })

  if (!conversation || conversation.deletedAt) {
    throw new Error('NOT_FOUND')
  }

  if (conversation.type !== 'GROUP') {
    throw new Error('NOT_GROUP')
  }

  if (!conversation.members.length || conversation.members[0].status !== 'ACTIVE') {
    throw new Error('NOT_ALLOWED')
  }

  // Optional: only allow ADMIN to change group avatar.
  if (conversation.members[0].role !== 'ADMIN') {
    throw new Error('ONLY_ADMIN_CAN_UPDATE_GROUP')
  }

  const updated = await prisma.conversation.update({
    where: { id: conversationId },
    data: { avatarUrl }
  })

  return updated
}

export default {
  getMyConversation,
  getConversationById,
  createConversation,
  getOrCreateDirectConversation,
  deleteConversation,
  updateGroupAvatar
}