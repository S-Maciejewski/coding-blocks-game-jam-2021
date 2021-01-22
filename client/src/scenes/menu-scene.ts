
import * as io from 'socket.io-client';
import Player from '../prefabs/player';

const SERVER_ADDR = 'ws://localhost:3000';

export default class MenuScene extends Phaser.Scene
{
    socket: SocketIOClient.Socket;
    gameState: any;

    constructor ()
    {
        super('GameScene');
    }

    preload ()
    {
    }

    create ()
    {
        socket = io.connect(SERVER_ADDR);

        const screenCenterX = this.cameras.main.worldView.x + this.cameras.main.width / 2;
        const screenCenterY = this.cameras.main.worldView.y + this.cameras.main.height / 2;
        
        var roomCodeInputField = this.getChildByName('roomCode');
        roomCodeInputField.styles.display = 'initial';

        const createRoomButton = this.add.text(screenCenterX, screenCenterY, 'Create Room');
        createRoomButton.setInteractive();
        createRoomButton.on('pointerdown', () => { this.socket.emit('createRoom'); });

        const joinRoomButton = this.add.text(screenCenterX, screenCenterY + 50, 'Join Room');
        joinRoomButton.setInteractive();
        joinRoomButton.on('pointerdown', () => { this.socket.emit('joinRoom', roomCodeInputField.value); });

    }
}
