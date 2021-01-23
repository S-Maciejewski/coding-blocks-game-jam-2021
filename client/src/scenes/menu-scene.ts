
import GameState from '../models/gameState';
import Player from '../models/player';

export default class MenuScene extends Phaser.Scene {
    socket: SocketIOClient.Socket;
    gameState: any;

    createRoomButton: Phaser.GameObjects.Text;
    joinRoomButton: Phaser.GameObjects.Text;
    roomCodeInputField: HTMLInputElement;

    noGameFoundText: Phaser.GameObjects.Text;
    noGameFound = false;

    playersListText: Phaser.GameObjects.Text;
    startGameButton: Phaser.GameObjects.Text;

    constructor() {
        super('MenuScene');
        this.proceedToRoomView = this.proceedToRoomView.bind(this);
        this.handleJoinRoomButton = this.handleJoinRoomButton.bind(this);
        this.handleStartGameButton = this.handleStartGameButton.bind(this);
        this.handleCreateRoomButton = this.handleCreateRoomButton.bind(this);
        this.handleNewGameStateResponse = this.handleNewGameStateResponse.bind(this);
    }

    preload() {
        document.addEventListener('updateGameStateResponse', (data: CustomEvent) => {
            this.handleNewGameStateResponse(data.detail);
        });

        document.addEventListener('noGameFound', () => {
            this.noGameFound = true;
            console.log('Phaser: No game found');
        });
    }

    create() {
        const screenCenterX = this.cameras.main.worldView.x + this.cameras.main.width / 2;
        const screenCenterY = this.cameras.main.worldView.y + this.cameras.main.height / 2;

        this.roomCodeInputField = (<HTMLInputElement>document.getElementById('roomCode'));
        this.roomCodeInputField.style.display = 'initial';
        this.roomCodeInputField.style.position = 'absolute';
        this.roomCodeInputField.style.left = '300px';
        this.roomCodeInputField.style.top = '400px';

        this.createRoomButton = this.add.text(screenCenterX, screenCenterY, 'Create Room');
        this.createRoomButton.x -= this.createRoomButton.width / 2;
        this.createRoomButton.setInteractive();
        this.createRoomButton.on('pointerdown', this.handleCreateRoomButton);

        this.joinRoomButton = this.add.text(screenCenterX, screenCenterY + 50, 'Join Room');
        this.joinRoomButton.x -= this.joinRoomButton.width / 2;
        this.joinRoomButton.setInteractive();
        this.joinRoomButton.on('pointerdown', () => {
            this.handleJoinRoomButton(this.roomCodeInputField.value)
        });
    }

    handleNewGameStateResponse(newState: GameState) {
        console.log('Phaser: updating game state', this.gameState);
        this.gameState = newState;
        console.log('Phaser: game state updated', this.gameState);
    }

    handleCreateRoomButton() {
        document.dispatchEvent(new Event('createRoom', {}));
        this.proceedToRoomView()
    }

    handleStartGameButton() {
        this.scene.start('GameScene', this.gameState);
    }

    handleJoinRoomButton(code: string) {
        console.log('Phaser: trying to join room with code:', code);
        this.noGameFound = false;
        document.dispatchEvent(new CustomEvent('joinRoom', { detail: { code } }));
        setTimeout(() => {
            if (this.noGameFound) {
                this.noGameFoundText = this.add.text(this.cameras.main.worldView.x + this.cameras.main.width / 2, 200, 'No game found');
                this.noGameFoundText.x -= this.createRoomButton.width / 2;
            } else {
                console.log(`Joining room for code ${code}`);
                if (this.noGameFoundText)
                    this.noGameFoundText.destroy();

                this.proceedToRoomView()
            }
        }, 3000)
    }

    proceedToRoomView() {
        console.log('Entering game lobby', this.gameState)
        this.createRoomButton.destroy();
        this.joinRoomButton.destroy();
        this.roomCodeInputField.style.display = 'none';

        const screenCenterX = this.cameras.main.worldView.x + this.cameras.main.width / 2;
        const screenCenterY = this.cameras.main.worldView.y + this.cameras.main.height / 2;

        this.startGameButton = this.add.text(screenCenterX, screenCenterY, 'Start game!');
        this.startGameButton.x -= this.startGameButton.width / 2;
        this.startGameButton.setInteractive();
        this.startGameButton.on('pointerdown', this.handleStartGameButton);

        this.playersListText = this.add.text(screenCenterX, screenCenterY - 0.2 * screenCenterY,
            this.gameState.players.map((p: Player) => p._id).join('\n'));
        this.playersListText.x -= this.playersListText.width / 2;
    }

}
