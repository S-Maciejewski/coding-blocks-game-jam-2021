
import io from 'socket.io-client';
import Player from '../prefabs/player';

const SERVER_ADDR = 'http://138.197.178.99';
export default class MenuScene extends Phaser.Scene
{
    socket: SocketIOClient.Socket;
    gameState: any;

    constructor ()
    {
        super('MenuScene');
    }

    preload ()
    {

    }

    create ()
    {
        this.socket = io(SERVER_ADDR);

        const screenCenterX = this.cameras.main.worldView.x + this.cameras.main.width / 2;
        const screenCenterY = this.cameras.main.worldView.y + this.cameras.main.height / 2;
        
        var roomCodeInputField = (<HTMLInputElement>document.getElementById('roomCode'));
        roomCodeInputField.style.display = 'initial';
        roomCodeInputField.style.position = 'absolute';

        const createRoomButton = this.add.text(screenCenterX, screenCenterY, 'Create Room');
        createRoomButton.x -= createRoomButton.width/2;
        createRoomButton.setInteractive();
        createRoomButton.on('pointerdown', () => { this.socket.emit('createRoom'); });

        const joinRoomButton = this.add.text(screenCenterX, screenCenterY + 50, 'Join Room');
        joinRoomButton.x -= joinRoomButton.width/2;
        joinRoomButton.setInteractive();
        joinRoomButton.on('pointerdown', () => { this.socket.emit('joinRoom', roomCodeInputField.value); });
    }
}
