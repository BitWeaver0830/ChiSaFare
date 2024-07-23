const path = require('path')
const fs = require('fs')
const DIRNAME = path.resolve(path.dirname('')) // __dirname is not available in REPL.
const express = require("express")
const bodyParser = require("body-parser")
const envConfig = require('dotenv').config({
  path: path.resolve(DIRNAME, './.env')
})
const helmet = require("helmet")
const api = require("./routes/api.route")
const ADDRESS = process.env.ADDRESS || '127.0.0.1'
const PORT = process.env.PORT || 3000
const logger = require("./utils/winston/winston")
const errorHandler = require("./middlewares/errorHandler")
const methodOverride = require("method-override")
const mongoose = require("mongoose")
const cors = require("cors")
const ateco = require("./services/ateco.service")
const expiredAlert = require("./utils/mail/expiredAlert")
const socketIo = require("./chat/socketIo")
const http = require("http")
const https = require('https')

global.__basedir = DIRNAME

const app = express()
app.use(
  cors({
    origin: "*",
  })
)
app.use(methodOverride())
app.use(bodyParser.json({
  limit: "150mb"
}))
app.use(
  bodyParser.urlencoded({
    limit: "150mb",
    extended: true,
    parameterLimit: 50000,
  })
)
app.use(
  helmet({
    crossOriginEmbedderPolicy: false,
  })
)
app.use(
  helmet.contentSecurityPolicy({
    crossOriginEmbedderPolicy: "false",
    directives: {
      scriptSrc: [
        "'self'",
        "cdn.jsdelivr.net",
        "code.jquery.com",
        "cdnjs.cloudflare.com",
        "unpkg.com",
        "chi-sa-fare-bucket.s3.eu-central-1.amazonaws.com",
        "http://ajax.googleapis.com",
        "'unsafe-inline'",
      ],
      imgSrc: [
        "'self'",
        "data:",
        "tile.openstreetmap.org",
        "unpkg.com",
        "https://cdnjs.cloudflare.com",
        "chi-sa-fare-bucket.s3.eu-central-1.amazonaws.com",
      ],
      defaultSrc: [
        "'self'",
        "chi-sa-fare-bucket.s3.eu-central-1.amazonaws.com",
        "nominatim.openstreetmap.org",
        "ws://" + ADDRESS + ":3001",
        "https://cdnjs.cloudflare.com",
      ],
      scriptSrcAttr: [
        "'self'",
        "cdn.jsdelivr.net",
        "code.jquery.com",
        "cdnjs.cloudflare.com",
        "unpkg.com",
        "chi-sa-fare-bucket.s3.eu-central-1.amazonaws.com",
        "http://ajax.googleapis.com",
        "'unsafe-inline'",
      ],
    },
  })
)

logger.info('\Connecting at mongoDB...:\n') && logger.info(process.env.MONGODB_url)

mongoose
  .connect(process.env.MONGODB_url)
  .then((res) => logger.info("Connected successfully to mongoDB"))
  .catch((err) => logger.error('\nERROR RESPONSE:\n') && logger.error(err.message))

app.use("/api", api)
app.use(errorHandler)
app.use(express.static("public"))

logger.info(`Running in ${process.env.NODE_ENV} mode`)

// web Server
let server = null
let protocol = ''
if (PORT === '443') {
  http.createServer((req, res) => {
    res.writeHead(301, {
      Location: `https://${req.headers.host}${req.url}`
    });
    res.end();
  }).listen(80)

  try {
    let options = {
      key: fs.readFileSync('/root/certificates/private.key'),
      cert: fs.readFileSync('/root/certificates/certificate.crt'),
      ca: fs.readFileSync('/root/certificates/ca_bundle.crt'),
    }
    protocol = 'https'
    server = https.createServer(options, app)
  } catch (error) {
    console.error("Error reading file:", error);
  }
} else {
  protocol = 'http'
  server = http.createServer(app)
}

// socket.io for chat
socketIo.initSocketIo(server)

// Server will start with specific port
server.listen(PORT, async () => {
  logger.info("Listening on ", protocol + "://" + ADDRESS + ":" + PORT)
})

try {
  // one time at starting
  expiredAlert.sendAlertExpiredEmails()
  // and then next 24 hr = 86400000 ms
  setInterval(() => {
    expiredAlert.sendAlertExpiredEmails()
  }, 86400000)
} catch (error) {
  logger.error("send Alert email: " + error.message)
}