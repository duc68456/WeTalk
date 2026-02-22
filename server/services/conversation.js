import prisma from '../config/db.js'
import logger from '../utils/logger.js'

const getMyConversation = async (userId) => {
    const memberRecords = await prisma.member.findMany({
      where: {
        userId: userId
      },
      include: {
        conversation: {
          include: {
            members: {
              include: {
                user: {
                  select: { id: true, name: true }
                }
              }
            }
          }
        }
      }
    })

    return memberRecords
}

const getConversationById = async (conversationId, requesterId) => {
  // logger.info('conversationId in service: ', conversationId)

  const conversation = await prisma.conversation.findFirst({
    where: {
      id: conversationId,
      members: {
        some: { userId: requesterId }
      }
    },
    include: {
      members: {
        include: {
          user: true,
          role: true
        }
      }
    }
  })

  // logger.info('conversation in service: ', conversation)

  return conversation
}

const createConversation = async (type, inviteesIds, creatorId, allMembersIds) => {
  if (type === 'DIRECT') {
    logger.info(inviteesIds.length)
    if (inviteesIds.length !== 1) {
      // return res.status(400).json({ message: "DIRECT chat can only have 2 participant" });
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
      // return res.status(200).json({
      //   message: "This conversation already exist",
      //   conversation: existingConversation
      // })
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

    // logger.info(newConversation)

    return { 
      data: newConversation, 
      isAlreadyExisted: false 
    };
  }

  else if (type === 'GROUP') {
    if (inviteesIds.length < 2) {
      // return res.status(422).json({ message: "Group must have at least 3 members" })
      throw new Error('GROUP_MIN_MEMBER')
    }

    const newGroup = await prisma.conversation.create({
      data: {
        type: 'GROUP',
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

export default {
  getMyConversation,
  getConversationById,
  createConversation
}