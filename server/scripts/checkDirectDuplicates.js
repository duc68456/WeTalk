import prisma from '../config/db.js'

// Usage:
//   ME=<uuid> PARTNER=<uuid> node scripts/checkDirectDuplicates.js
//
// Prints DIRECT (not deleted) conversation rows where both users are members.

const me = process.env.ME
const partner = process.env.PARTNER

if (!me || !partner) {
  console.log('Set ME and PARTNER env vars to user UUIDs')
  process.exit(0)
}

const rows = await prisma.conversation.findMany({
  where: {
    type: 'DIRECT',
    deletedAt: null,
    AND: [{ members: { some: { userId: me } } }, { members: { some: { userId: partner } } }]
  },
  select: {
    id: true,
    createdAt: true
  },
  orderBy: {
    createdAt: 'asc'
  }
})

console.log(rows)
await prisma.$disconnect()
