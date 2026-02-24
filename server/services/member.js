import prisma from '../config/db.js'

const getMembersByConversationId = async (conversationId) => {
  if (!conversationId) {
    throw new Error('MISSING_ID_TO_GET_MEMBERS')
  }

  const isConversationExist = await prisma.conversation.findUnique({
    where: {
      id: conversationId
    }
  })

  if (!isConversationExist) {
    throw new Error('CONVERSATION_NOT_FOUND')
  }

  const members = await prisma.member.findMany({
    where: {
      conversationId: conversationId
    }
  })

  return members
}

const addMemberToConversation = async (memberAddingId, userId, conversationId) => {
  const isHaveAuthority = await prisma.member.findUnique({
    where: {
      userId_conversationId: {
        userId: memberAddingId,
        conversationId: conversationId
      }
    }
  })

  if (!isHaveAuthority) {
    throw new Error('NOT_ALLOWED')
  }

  const memberAdded = await prisma.member.create({
    data: {
      user: { connect: { id: userId } },
      conversation: { connect: { id: conversationId } },
      role: 'MEMBER'
    }
  })

  return memberAdded
}

const deleteMember = async (requesterId, userId, conversationId) => {
  if (userId !== requesterId) {
    const requesterMember = await prisma.member.findUnique({
      where: {
        userId_conversationId: {
          userId: requesterId,
          conversationId: conversationId
        }
      },
    });

    if (!requesterMember || (requesterMember.role !== 'ADMIN')) {
      throw new Error('NOT_ALLOWED')
    }
  }

  const memberDeleted = await prisma.member.delete({
    where: {
      userId_conversationId: {
        userId: userId,
        conversationId: conversationId
      }
    }
  })

  return memberDeleted
}

const updateMember = async (requesterId, userId, conversationId, updateData) => {
  const { role, status } = updateData;

  const requesterMember = await prisma.member.findUnique({
    where: {
      userId_conversationId: {
        userId: requesterId,
        conversationId: conversationId
      }
    },
  });

  if (!requesterMember) {
    throw new Error('NOT_ALLOWED');
  }

  if (role !== undefined) {
    if (requesterMember.role !== 'ADMIN') {
      throw new Error('NOT_ALLOWED');
    }
  }

  if (status !== undefined) {
    if (requesterId !== userId) {
      if (requesterMember.role !== 'ADMIN') {
        throw new Error('NOT_ALLOWED'); 
      }
    }
  }

  const editedMember = await prisma.member.update({
    where: {
      userId_conversationId: {
        userId: userId,
        conversationId: conversationId
      }
    },
    data: {
      role: role,
      status: status
    }
  });

  return editedMember;
}

export default {
  getMembersByConversationId,
  addMemberToConversation,
  deleteMember,
  updateMember
}