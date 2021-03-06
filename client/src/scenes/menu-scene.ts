
import GameState from '../models/gameState';
import Player from '../models/player';

export default class MenuScene extends Phaser.Scene {
    socket: SocketIOClient.Socket;
    gameState: GameState;
    playerId: string;

    createRoomButton: Phaser.GameObjects.Text;
    joinRoomButton: Phaser.GameObjects.Text;
    roomCodeInputField: HTMLInputElement;

    gameJoinStatusText: Phaser.GameObjects.Text;
    noGameFound = false;

    playersListText: Phaser.GameObjects.Text;
    roomCodeText: Phaser.GameObjects.Text;
    startGameButton: Phaser.GameObjects.Text;

    constructor() {
        super('MenuScene');
        this.startGame = this.startGame.bind(this);
        this.proceedToRoomView = this.proceedToRoomView.bind(this);
        this.handleJoinRoomButton = this.handleJoinRoomButton.bind(this);
        this.handleStartGameButton = this.handleStartGameButton.bind(this);
        this.handleCreateRoomButton = this.handleCreateRoomButton.bind(this);
        this.handleNewGameStateResponse = this.handleNewGameStateResponse.bind(this);
        this.updateGameStateResponse = this.updateGameStateResponse.bind(this);
    }

    preload() {
        document.addEventListener('playerId', (data: CustomEvent) => {
            this.playerId = data.detail;
            console.log(`Player id: ${this.playerId}`);
        })

        document.addEventListener('updateGameStateResponse', this.updateGameStateResponse);

        document.addEventListener('noGameFound', () => {
            this.noGameFound = true;
            console.log('Phaser: No game found');
        });

        document.addEventListener('updateGameStateStartResponse', (data: CustomEvent) => {
            this.handleNewGameStateResponse(data.detail);
            this.startGame();
        });
    }

    updateGameStateResponse(data: CustomEvent) {
        this.handleNewGameStateResponse(data.detail);
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
            this.handleJoinRoomButton(this.roomCodeInputField.value.toUpperCase())
        });
    }

    handleNewGameStateResponse(newState: GameState) {
        // console.log('Phaser: updating game state', this.gameState);
        this.gameState = newState;
        if (this.gameState.players.length === 1) {
            this.drawStartGameButton();
        }
        else if (this.startGameButton === undefined) {
            this.drawWaitingForHostText();
        }
        // console.log('Phaser: game state updated', this.gameState);
        this.drawUserIds();
        this.drawRoomCode(this.gameState.roomCode);
    }

    handleCreateRoomButton() {
        document.dispatchEvent(new Event('createRoom', {}));
        this.proceedToRoomView()
    }

    handleStartGameButton() {
        document.dispatchEvent(new CustomEvent('startGame'));
    }

    startGame() {
        this.startGameButton.on('pointerdown', () => { });
        this.startGameButton.text = 'Game starting in 3!';
        setTimeout(() => {
            this.startGameButton.text = 'Game starting in 2!';
            setTimeout(() => {
                this.startGameButton.text = 'Game starting in 1!';
                setTimeout(() => {
                    // TODO: Remove event listener for update
                    document.removeEventListener('updateGameStateResponse', this.updateGameStateResponse);
                    this.scene.start('GameScene', { gameState: this.gameState, playerId: this.playerId });

                }, 1000);
            }, 1000);
        }, 1000);
    }

    handleJoinRoomButton(code: string) {
        console.log('Phaser: trying to join room with code:', code);
        this.noGameFound = false;
        document.dispatchEvent(new CustomEvent('joinRoom', { detail: { code } }));
        this.gameJoinStatusText = this.add.text(this.cameras.main.worldView.x + this.cameras.main.width / 2, 200, 'Joining the room...');
        this.gameJoinStatusText.x -= this.createRoomButton.width / 2;

        setTimeout(() => {
            if (this.noGameFound) {
                this.gameJoinStatusText.text = 'No game found';
            } else {
                console.log(`Joining room for code ${code}`);
                this.gameJoinStatusText.text = '';
                this.gameJoinStatusText.destroy();

                this.proceedToRoomView();
            }
        }, 0);
    }

    proceedToRoomView() {
        console.log('Entering game lobby', this.gameState)
        this.createRoomButton.destroy();
        this.joinRoomButton.destroy();
        this.roomCodeInputField.style.display = 'none';
        this.drawUserIds();
        this.drawRoomCode(this.gameState.roomCode);
    }

    drawWaitingForHostText() {
        const screenCenterX = this.cameras.main.worldView.x + this.cameras.main.width / 2;
        const screenCenterY = this.cameras.main.worldView.y + this.cameras.main.height / 2;

        this.startGameButton = this.add.text(screenCenterX, screenCenterY, 'Waiting for host to start the game!');
        this.startGameButton.x -= this.startGameButton.width / 2;
    }

    drawStartGameButton() {
        const screenCenterX = this.cameras.main.worldView.x + this.cameras.main.width / 2;
        const screenCenterY = this.cameras.main.worldView.y + this.cameras.main.height / 2;

        this.startGameButton = this.add.text(screenCenterX, screenCenterY, 'Start game!');
        this.startGameButton.x -= this.startGameButton.width / 2;
        this.startGameButton.setInteractive();
        this.startGameButton.on('pointerdown', this.handleStartGameButton);
    }

    drawUserIds() {
        const screenCenterX = this.cameras.main.worldView.x + this.cameras.main.width / 2;
        const screenCenterY = this.cameras.main.worldView.y + this.cameras.main.height / 2;

        this.playersListText = this.add.text(screenCenterX, screenCenterY - 0.2 * screenCenterY,
            this.gameState.players.map((p: Player) => p._id).join('\n'));
        this.playersListText.x -= this.playersListText.width / 2;
    }

    drawRoomCode(roomCode: string) {
        const screenCenterX = this.cameras.main.worldView.x + this.cameras.main.width / 2;
        const screenCenterY = this.cameras.main.worldView.y + this.cameras.main.height / 2;

        this.roomCodeText = this.add.text(screenCenterX, screenCenterY - 0.4 * screenCenterY,
            `Room code: ${roomCode}`);
        this.roomCodeText.setFontSize(20);
        this.roomCodeText.x -= this.roomCodeText.width / 2;
    }
}
