import mongoose from 'mongoose'

const messageSchema = new mongoose.Schema({
  conversationId: {
      type: String,
      required: [true, 'conversationId is required'],
      // index: true,
  },

  senderId: {
      type: String,
      required: [true, 'senderId is required'],
  },

  content: {
    type: String,
    required: function() {
      return this.messageType === 'TEXT'; 
    },
    trim: true,
  },

  messageType: {
    type: String,
    enum: ['TEXT', 'IMAGE', 'FILE', 'SYSTEM'],
    default: 'TEXT',
  },

  fileUrl: {
    type: String,
    required: function() {
      return this.messageType === 'IMAGE' || this.messageType === 'FILE';
    },
    default: null,
  },

  readBy: [
    {
      type: String,
    },
  ],
  
  isDeleted: {
    type: Boolean,
    default: false,
  },
},
{
  timestamps: true,
})

messageSchema.index({ conversationId: 1, createdAt: -1 });

const Message = mongoose.model('Message', messageSchema);

export default Message;