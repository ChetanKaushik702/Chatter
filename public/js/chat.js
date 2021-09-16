const socket = io()

const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('#message-input')
const $messageFormBtn = $messageForm.querySelector('#btn-submit')
const $showLocationBtn = document.querySelector('#show-location')
const $messages = document.querySelector('#messages')
const $renderUsers = document.querySelector('#renderUsers')

// Template
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationTemplate = document.querySelector('#location-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

// Options
const {username, room} = Qs.parse(location.search, {ignoreQueryPrefix: true})

// message event
socket.on('messageEvent', (message) => {
    // render message template
    const html = Mustache.render(messageTemplate, {
        text: message.text,
        userName: message.userName,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
})

// location message event
socket.on('locationMessage', (locationURL) => {
    
    // render location template
    const html = Mustache.render(locationTemplate, {
        locationURL: locationURL.text,
        userName: locationURL.userName,
        createdAt: moment(locationURL.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
})

// render users in a room
socket.on('renderUsers', ({room, users}) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })

    $renderUsers.innerHTML = html
})

$messageForm.addEventListener('submit', (event) => {
    event.preventDefault()
    const message = $messageFormInput.value

    // disable the submit button
    $messageFormBtn.setAttribute('disabled', 'disabled')

    if (message !== '')
    socket.emit('sendMessage', message, (status) => {
        // enable the form to send a new message
        $messageFormBtn.removeAttribute('disabled')
        $messageFormInput.value = ''
        $messageFormInput.focus()
    })
})

$showLocationBtn.addEventListener('click', () => {
    if (!navigator.geolocation) {
        return alert('Geolocation is not supported by your browser.')
    }

    // disabling the show location button
    $showLocationBtn.setAttribute('disabled', 'disabled')

    navigator.geolocation.getCurrentPosition((position) => {
        const location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }
        socket.emit('sendLocation', location, (message) => {
            // enabling the show location button
            $showLocationBtn.removeAttribute('disabled')
        })
    })
})

// sending join event
socket.emit('join', {username, room}, (err) => {
    if (err) {
        alert(err)
        location.href = '/'
    }
})