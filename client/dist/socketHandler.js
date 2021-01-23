const ADDR = 'http://138.197.178.99'
// const ADDR = 'http://localhost:3000'
let socket

socket = io.connect(ADDR);
console.log(`Connecting to socket ${socket.io.engine.hostname}`)
console.log(socket.io.engine)

// TODO: replace strings in event types with enum (JSON in this case, as both socket handler and phaser should use it)
socket.on('updateGameState', data => {
    handleUpdateGameStateResponse(data)
})

socket.on('noGameFound', handleNoGameFoundResponse)

socket.on('updateGameStateStart', data => {
    handleUpdateGameStateStartResponse(data)
})

function handleCreateRoom() {
    console.log('Got createRoom from phaser, sending to server...')
    socket.emit('createRoom')
}

function handleUpdateGameStateResponse(data) {
    console.log('Got updated state from server:', data)
    document.dispatchEvent(new CustomEvent('updateGameStateResponse', { detail: data }))
}

function handleUpdateGameStateStartResponse(data) {
    console.log('Got server response for start game:', data)
    document.dispatchEvent(new CustomEvent('updateGameStateStartResponse', { detail: data }))
}

function handleJoinRoom(customEvent) {
    console.log('Got joinRoom from phaser, sending to server...')
    socket.emit('joinRoom', customEvent.detail.code)
}

function handleNoGameFoundResponse() {
    console.log('No game found received from server')
    document.dispatchEvent(new CustomEvent('noGameFound'))
}

function handleStartGame() {
    console.log('Got startGame from phaser, sending to server...')
    socket.emit('startGame')
}

document.addEventListener('createRoom', handleCreateRoom)

document.addEventListener('joinRoom', (e => {
    handleJoinRoom(e)
}))

document.addEventListener('startGame', handleStartGame)