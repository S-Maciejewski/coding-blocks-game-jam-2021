const ADDR = 'http://138.197.178.99'
// const ADDR = 'http://localhost:3000'
let socket

socket = io.connect(ADDR);
console.log(`Connecting to socket ${socket.io.engine.hostname}`)
console.log(socket.io.engine)

// TODO: replace strings in event types with enum (JSON in this case, as both socket handler and phaser should use it)
// Socket listeners
socket.on('updateGameState', data => {
    handleUpdateGameStateResponse(data)
})

socket.on('noGameFound', handleNoGameFoundResponse)

socket.on('updateGameStateStart', data => {
    handleUpdateGameStateStartResponse(data)
})


// Response handlers
function handleUpdateGameStateResponse(data) {
    // console.log('Got updated state from server:', data)
    document.dispatchEvent(new CustomEvent('updateGameStateResponse', { detail: data }))
}

function handleUpdateGameStateStartResponse(data) {
    console.log('Got server response for start game:', data)
    document.dispatchEvent(new CustomEvent('updateGameStateStartResponse', { detail: data }))
}

function handleNoGameFoundResponse() {
    console.log('No game found received from server')
    document.dispatchEvent(new CustomEvent('noGameFound'))
}

// Handlers
function handleCreateRoom() {
    console.log('Got createRoom from phaser, sending to server...')
    socket.emit('createRoom')
}

function handleJoinRoom(customEvent) {
    console.log('Got joinRoom from phaser, sending to server...')
    socket.emit('joinRoom', customEvent.detail.code)
}


function handleStartGame() {
    console.log('Got startGame from phaser, sending to server...')
    socket.emit('startGame')
}

function handlePlayerUpdate(customEvent) {
    socket.emit('updatePlayer', { _id: socket.id, ...customEvent.detail })
}

// Event listeners
document.addEventListener('createRoom', handleCreateRoom)

document.addEventListener('joinRoom', (customEvent => {
    handleJoinRoom(customEvent)
}))

document.addEventListener('startGame', handleStartGame)

document.addEventListener('updatePlayer', (customEvent => {
    handlePlayerUpdate(customEvent)
}))

// Dispatch event with player id after connecting to socket (TODO - connection status monitoring)
setTimeout(() => {
    document.dispatchEvent(new CustomEvent('playerId', { detail: socket.io.engine.id }));
}, 500)