import zod from 'zod'

const errorHandler = (err, req, res, next) => {
  if (err instanceof zod.ZodError) {
    const paths = err.issues.map(e => e.path)
    const messages = err.issues.map(e => e.message)
    return res.status(400).json({
      message: `These fields are invalid: ${paths.join(', ')}`,
      details: messages
    })
  }
  else if(err.code === 'P2002') {
    const field = err.meta.target[0]
    res.status(409).json({
      message: `This ${field} is already exist`
    })
  }
  else if(err.code === 'P2025') {
    // const field = err.meta.target[0]
    const field = err.meta.modelName
    res.status(409).json({
      message: `${field} was not found for delete`
    })
  }
  else {
    res.status(500).json({
      message: 'the error cannot be idenify'
    })
  }
}

export default errorHandler