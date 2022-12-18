require('dotenv').config()
const express = require('express')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const mongoose = require('mongoose')
const router = require('./routes/index')
const errorMiddleware = require('./middlewares/errorMiddleware')

const server = express()
const PORT = process.env.PORT || 5000

server.use(express.json())
server.use(express.urlencoded({extended: true}))
server.use(cookieParser())
server.use(cors())
server.use('/api', router)
server.use(errorMiddleware)

const start = async () => {
    try {
        mongoose.set("strictQuery", false)
        await mongoose.connect(process.env.mongoDB)
            .then(() => {
                console.log('Database has been connected!')
            })
            .catch((err) => {
                console.log(err)
            })
        server.listen(PORT, () => {
            console.log(`Server has been started on port ${PORT}!`)
        })
    } catch (err) {
        console.log(err)
    }
}

start()
