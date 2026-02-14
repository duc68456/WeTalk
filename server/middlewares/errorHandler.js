import zod from 'zod'

const errorHandler = (err, req, res, next) => {
  if (err instanceof zod.ZodError) {
    const paths = err.issues.map(e => e.path)
    const messages = err.issues.map(e => e.message)
    res.status(400).json({
      message: `These fields are invalid: ${paths.join(', ')}`,
      details: messages
    })
  }
  if(err.code === 'P2002') {
    const field = err.meta.target[0]
    res.status(409).json(`This ${field} is already exist`)
  }
  else {
    res.status(500).json('the error cannot be idenify')
  }
}

export default errorHandler