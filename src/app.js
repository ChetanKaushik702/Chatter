const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const { getMessage } = require('./utils/messages')
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 3000

// Setting the location to serve static resources
app.use(express.static('public'))
app.use(express.urlencoded({extended: true}))

io.on('connection', (socket) => {
    console.log('Connection established!')
    
    socket.on('join', (options, callback) => {
        
        const { error, user } = addUser({id: socket.id, ...options})
        
        if (error) {
            return callback(error)
        }
        
        // joining the room
        socket.join(user.room)
        
        socket.emit('messageEvent', getMessage('Welcome!', 'Admin'))
        socket.broadcast.to(user.room).emit('messageEvent', getMessage(`${user.username} has joined!`, 'Admin'))

        io.to(user.room).emit('renderUsers', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })

        socket.on('sendMessage', (message, callback) => {
            const user = getUser(socket.id)
            io.to(user.room).emit('messageEvent', getMessage(message, user.username))
            callback('Message delievered!')
        })

        socket.on('sendLocation', (location, callback) => {
            const user = getUser(socket.id)
            io.to(user.room).emit('locationMessage', getMessage(`https://google.com/maps?q=${location.latitude},${location.longitude}`, user.username))
            callback('Location shared!')
        })

        socket.on('disconnect', () => {
            const user = removeUser(socket.id)
            if (user) {
                io.to(user.room).emit('messageEvent', getMessage(`${user.username} has left!`, 'Admin'))
                
                io.to(user.room).emit('renderUsers', {
                    room: user.room,
                    users: getUsersInRoom(user.room)
                })
            }
        })

    })
})


server.listen(port, () => {
    console.log(`Server is running on ${port}...`)
})