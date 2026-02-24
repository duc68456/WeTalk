import prisma from '../config/db.js'
import Message from '../models/message.js'

const postMessageToConversation = async (senderId, conversationId, content) => {
  const isMember = await prisma.member.findFirst({
    where: {
      userId: senderId,
      conversationId: conversationId,
      status: 'ACTIVE'
    }
  })

  if (!isMember) {
    throw new Error('NOT_ALLOWED')
  }

  const newMessage = await Message.create({
    conversationId: conversationId,
    senderId: senderId,
    content: content
  })

  return newMessage
}

const getMessagesByConversationId = async (userId, conversationId, page, limit) => {
  const isMember = await prisma.member.findFirst({
    where: {
      userId: userId,
      conversationId: conversationId,
      status: 'ACTIVE'
    }
  })

  if (!isMember) {
    throw new Error('NOT_ALLOWED')
  }

  const takeNum = parseInt(limit, 10);
  const pageNum = parseInt(page, 10);
  const skipNum = (pageNum - 1) * takeNum;

  const messages = await Message.find({ conversationId: conversationId })
    .sort({ createdAt: -1 })
    .skip(skipNum)
    .limit(takeNum)
    .lean();

  const totalMessages = await Message.countDocuments({ conversationId: conversationId });

  return {
    data: messages,
    pagination: {
      currentPage: pageNum,
      totalPages: Math.ceil(totalMessages / takeNum),
      totalItems: totalMessages
    }
  };
}

export default {
  postMessageToConversation,
  getMessagesByConversationId
}