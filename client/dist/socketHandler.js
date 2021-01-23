const ADDR = 'http://138.197.178.99';
// const ADDR = 'http://localhost:3000';
let socket;

socket = io.connect(ADDR);
console.log(`Connecting to socket ${socket.io.engine.hostname}`)
console.log(socket.io.engine)

socket.on('updateGameState', data => {
    handleUpdateGameStateResponse(data);
})

function handleCreateRoom() {
    console.log('Got createRoom from phaser, sending to server...')
    socket.emit('createRoom')
}

function handleUpdateGameStateResponse(data) {
    console.log('Got server response for createRoom:', data)
    document.dispatchEvent(new CustomEvent('updateGameStateResponse', { detail: data }))
}

document.addEventListener('createRoom', handleCreateRoom, false)