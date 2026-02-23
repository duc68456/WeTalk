import Message from '../models/message.js'

const postMessageToConversation = async (senderId, conversationId, content) => {
  const newMessage = await Message.create({
    conversationId: conversationId,
    senderId: senderId,
    content: content
  })

  return newMessage
}

export default {
  postMessageToConversation
}