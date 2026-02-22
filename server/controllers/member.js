import express from 'express'
import zod from 'zod'
import { RoleName } from '@prisma/client'

import logger from '../utils/logger.js'

import memberService from '../services/member.js'

const router = express.Router()

const updateMemberSchema = zod.object({
  role: zod.nativeEnum(RoleName, {
    errorMap: () => ({ message: "Role is not valid" })
  }),
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

    const validatedData = updateMemberSchema.parse(req.body)

    const { role } = validatedData
    const requesterId = req.user.userId;

    const editedMember = await memberService.editRoleOfMember(requesterId, userId, conversationId, role)

    return res.status(200).json({
      message: "Member's role editted succesfully",
      member: editedMember
    })
  }
  catch (error) {
    logger.error(error)
    next(error)
  }
})

export default router