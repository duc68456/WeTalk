import express from 'express'
import zod from 'zod'
import { RoleName, MemberStatus } from '@prisma/client'

import logger from '../utils/logger.js'

import memberService from '../services/member.js'

const router = express.Router()

const updateMemberSchema = zod.object({
  role: zod.nativeEnum(RoleName, {
    errorMap: () => ({ message: "Role is not valid" })
  }).optional(),
  
  status: zod.nativeEnum(MemberStatus, {
    errorMap: () => ({ message: "Status is not valid" })
  }).optional(),
}).refine(data => data.role !== undefined || data.status !== undefined, {
  message: "At least one field (role or status) must be provided to update"
})

router.get('/', async (req, res, next) => {
  try {
    const { conversationId } = req.query
    const members = await memberService.getMembersByConversationId(conversationId)

    res.status(200).json({
      message: "Members of this conversation",
      members: members
    })
  }
  catch (error) {
    logger.info(error)
    next(error)
  }
})

router.post('/', async (req, res, next) => {
  try {
    const { userId, conversationId } = req.body

    const memberAddingId = req.user.userId
    const memberAdded = await memberService.addMemberToConversation(memberAddingId, userId, conversationId)

    res.status(201).json({
      message: "Member added succesfully",
      member: memberAdded
    })
  }
  catch (error) {
    logger.error(error)
    next(error)
  }
})

router.delete('/', async (req, res, next) => {
  try {
    const { userId, conversationId } = req.query

    const requesterId = req.user.userId;

    const memberDeleted = await memberService.deleteMember(requesterId, userId, conversationId)

    return res.status(200).json({
      message: "Member deleted succesfully",
      member: memberDeleted
    })
  }
  catch (error) {
    logger.error(error)
    next(error)
  }
})

router.put('/', async (req, res, next) => {
  try {
    const { userId, conversationId } = req.query
    const requesterId = req.user.userId;

    const validatedData = updateMemberSchema.parse(req.body)
    
    const { role, status } = validatedData

    const editedMember = await memberService.updateMember(
      requesterId, 
      userId, 
      conversationId, 
      { role, status }
    )

    return res.status(200).json({
      message: "Member updated successfully",
      member: editedMember
    })
  }
  catch (error) {
    logger.error(error)
    next(error)
  }
})

export default router