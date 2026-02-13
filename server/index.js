import app from './app.js'
import config from './utils/config.js'

app.listen(config.PORT)
  .then(
    console.log(`app is listening on PORT ${config.PORT}`)
  )