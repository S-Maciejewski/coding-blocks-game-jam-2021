const ADDR = 'http://138.197.178.99';
let socket = io.connect(ADDR);
console.log(`Connecting to socket ${socket.io.engine.hostname}`)
console.log(socket.io.engine)

socket.on('createRoom', data => {
    handleCreateRoomResponse(data);
})

// function init() {
// socket.on('test', handleTestEvent);
// socket.on('testFromServer', handleTestFromServerEvent);
// 
// socket.emit('test', 'test message from client');
// }
// 
// function handleTestEvent(e) {
// console.log(`test response from server ${e}`);
// }
// 
// function handleTestFromServerEvent(e) {
// console.log(`testFromServer message from server ${e}`);
// }

function handleCreateRoom() {
    console.log('got createRoom from phaser, sending to server...')
    socket.emit('createRoom', {})
}

function handleCreateRoomResponse(data) {
    console.log('Got server response for createRoom:', data)
    document.dispatchEvent(new Event('createRoomResponse', data))
}

// window.addEventListener("load", init, false);

document.addEventListener('createRoom', handleCreateRoom, false)