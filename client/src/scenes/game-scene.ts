import GameState from "../models/gameState";
import Player from "../models/player";

export default class GameScene extends Phaser.Scene {
    gameState: GameState;
    player: Player;
    playerId: string;
    players: Player[] = [];
    cursors: Phaser.Types.Input.Keyboard.CursorKeys;

    acceleration: number = 0.0065;
    breakingPower: number = 0.008;
    reverseAcceleration: number = 0.001;
    deacceleration: number = 0.002;

    turningAcceleration: number = 0.002;
    maxSpeed: number = 3;

    carWidth: number = 72;
    carHeight: number = 122;

    rock: Phaser.Physics.Matter.Image;
    tires: Phaser.GameObjects.Image[] = [];

    constructor() {
        super('GameScene');
        this.updateOtherPlayers = this.updateOtherPlayers.bind(this);
    }

    init(data) {
        this.gameState = data.gameState;
        this.playerId = data.playerId;
    }

    preload() {
        this.load.image('car_0', 'assets/car_0.png');
        this.load.image('car_1', 'assets/car_1.png');
        this.load.image('car_2', 'assets/car_2.png');
        this.load.image('car_3', 'assets/car_3.png');
        this.load.image('car_4', 'assets/car_4.png');

        this.load.image('rock', 'assets/rock.png');

        document.addEventListener('updateGameStateResponse', (data: CustomEvent) => {
            this.gameState = data.detail;
        });

        // this.load.image('tire', 'assets/tire.png');
    }

    create() {
        var roomCodeInputField = (<HTMLInputElement>document.getElementById('roomCode'));
        roomCodeInputField.style.display = 'none';

        // tires
        // this.tires.push(this.add.image(200, 200, 'tire'));
        // this.tires.push(this.add.image(200, 200, 'tire'));

        // level
        for(var i = 0; i < 4; i++) {
            this.rock = this.matter.add.image(500 + (300*i), 400, 'rock');
            this.rock.setOnCollide(x => this.player.speed = 0);
            this.rock.setStatic(true);
        }

        for(var i = 0; i < 4; i++) {
            this.rock = this.matter.add.image(300 + (410*i), 750, 'rock');
            this.rock.setOnCollide(x => this.player.speed = 0);
            this.rock.setStatic(true);
        }

        for (var i = 0; i < this.gameState.players.length; i++) {
            let gameStatePlayer = this.gameState.players[i];
            let newPlayer = new Player();
            newPlayer._id = gameStatePlayer._id
            newPlayer.x = gameStatePlayer.x;
            newPlayer.y = gameStatePlayer.y;
            newPlayer.car = this.matter.add.image(newPlayer.x, newPlayer.y, `car_${i}`);
            newPlayer.car.setAngle(gameStatePlayer.rotation);
            newPlayer.car.setFrictionAir(0.5);
            newPlayer.car.setMass(1000);
            newPlayer.car.setFriction(0.2);
            newPlayer.car.setBounce(1);
            newPlayer.speed = gameStatePlayer.speed;
            newPlayer.text = this.add.text(gameStatePlayer.x, gameStatePlayer.y, newPlayer._id);
            this.players.push(newPlayer);
        }

        this.player = this.players.find(p => p._id === this.playerId);

        this.matter.world.setBounds(0, 0, 1920, 1080);

        this.cursors = this.input.keyboard.createCursorKeys();
        this.player.car.setOnCollide(x => this.player.speed = 0);

        this.cameras.main.setBounds(0, 0, 1920, 1080);
        this.cameras.main.startFollow(this.player.car);

    }

    update(time, delta) {

        let velocityVector = new Phaser.Math.Vector2((this.player.car.body as any).velocity.x, (this.player.car.body as any).velocity.y);
        if (this.cursors.up.isDown) {
            this.accelerate(velocityVector);
        } else if (this.cursors.down.isDown) {
            this.brake(velocityVector);
        } else {
            this.deaccelerate(velocityVector);
        }

        this.applyForce(delta);

        if (this.cursors.left.isDown) {
            this.turnLeft(delta);
        } else if (this.cursors.right.isDown) {
            this.turnRight(delta);
        }

        this.player.x = this.player.car.x;
        this.player.y = this.player.car.y;
        this.player.rotation = this.player.car.rotation;

        this.player.text.x = this.player.x - 100;
        this.player.text.y = this.player.y - 100;
        this.player.text.text = `${this.player._id}\n${this.player.x.toFixed(0)}, ${this.player.y.toFixed(0)}`;

        this.updateOtherPlayers();

        document.dispatchEvent(new CustomEvent('updatePlayer', {
            detail: {
                x: this.player.x,
                y: this.player.y,
                speed: this.player.speed,
                rotation: this.player.rotation
            }
        }));
    }

    updateOtherPlayers() {
        for (var i = 0; i < this.gameState.players.length; i++) {
            if (this.gameState.players[i]._id !== this.playerId) {
                let otherPlayer = this.gameState.players[i];

                let index = this.players.findIndex((x: Player) => x._id === otherPlayer._id);
                this.players[index].text.setPosition(otherPlayer.x, otherPlayer.y);
                this.players[index].car.setPosition(otherPlayer.x, otherPlayer.y);
                this.players[index].car.setRotation(otherPlayer.rotation);
            }
        }
    }

    accelerate(velocityVector: Phaser.Math.Vector2) {
        if (velocityVector.length() < this.maxSpeed) {
            this.player.speed += this.acceleration;
        }

        if (this.player.speed < 0.14 && this.player.isReversing) {
            this.player.isReversing = false;
        }
    }

    deaccelerate(velocityVector: Phaser.Math.Vector2) {
        if (velocityVector.length() > 0.14) {
            this.player.speed -= this.deacceleration * (this.player.isReversing ? -1 : 1);
        } else {
            this.player.speed = 0;
        }
    }

    brake(velocityVector: Phaser.Math.Vector2) {
        if (this.player.speed > 0.14 && !this.player.isReversing) {
            this.player.speed -= this.breakingPower;
        } else {
            this.player.speed -= this.reverseAcceleration;
            this.player.isReversing = true;
        }
    }

    applyForce(delta: number) {
        let carRotation = this.player.car.rotation + (Math.PI / 2);
        let directionVector = new Phaser.Math.Vector2(Math.cos(carRotation), Math.sin(carRotation));
        this.player.car.applyForce(directionVector.normalize().scale(-this.player.speed * delta));

    }

    turnLeft(delta: number) {
        let velocityVector = new Phaser.Math.Vector2((this.player.car.body as any).velocity.x, (this.player.car.body as any).velocity.y);
        this.player.car.setAngularVelocity(-this.turningAcceleration * velocityVector.length() * delta * (this.player.isReversing ? -1 : 1));
    }

    turnRight(delta: number) {
        let velocityVector = new Phaser.Math.Vector2((this.player.car.body as any).velocity.x, (this.player.car.body as any).velocity.y);
        this.player.car.setAngularVelocity(this.turningAcceleration * velocityVector.length() * delta * (this.player.isReversing ? -1 : 1));
    }
}
