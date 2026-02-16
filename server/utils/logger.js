const info = (...params) => {
  if (process.env.NODE_ENV !== 'test') {
    console.log(...params)
  }
}

const error = (...params) => {
  if (process.env.NODE_ENV !== 'test') {
    console.error(...params)
  }
}

const table = (...params) => {
  if (process.env.NODE_ENV !== 'test') {
    console.table(...params)
  }
}

export default {
  info,
  error,
  table
}
