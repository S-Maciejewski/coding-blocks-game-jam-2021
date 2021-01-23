import GameState from "../models/gameState";
import Player from "../models/player";

export default class GameScene extends Phaser.Scene
{
    gameState: GameState;
    player: Player;
    otherPlayers: Player[] = [];
    cursors: Phaser.Types.Input.Keyboard.CursorKeys;

    acceleration: number = 0.02;
    breakingPower: number = 0.05;
    reverseAcceleration: number = 0.01;
    deacceleration: number = 0.01;

    turningAcceleration: number = 0.01;
    maxSpeed: number = 5;

    carWidth: number = 75;
    carHeight: number = 128;

    rock: Phaser.Physics.Matter.Image;
    tires: Phaser.GameObjects.Image[] = [];

    constructor ()
    {
        super('GameScene');
    }

    init (data)
    {
        this.gameState = data;
    }

    preload ()
    {
        this.load.image('car_0', 'assets/car_0.png');
        this.load.image('car_1', 'assets/car_1.png');
        this.load.image('car_2', 'assets/car_2.png');
        this.load.image('car_3', 'assets/car_3.png');
        this.load.image('car_4', 'assets/car_4.png');

        this.load.image('rock', 'assets/rock.png');

        this.load.image('tire', 'assets/tire.png');
    }

    create ()
    {
        var roomCodeInputField = (<HTMLInputElement>document.getElementById('roomCode'));
        roomCodeInputField.style.display = 'none';

        // tires
        // this.tires.push(this.add.image(200, 200, 'tire'));
        // this.tires.push(this.add.image(200, 200, 'tire'));

        // level
        this.rock = this.matter.add.image(500, 400, 'rock');
        this.rock.setOnCollide(x => this.player.speed = 0);
        this.rock.setStatic(true);

        for(var i = 1; i < this.gameState.players.length; i++) {
            let gameStatePlayer = this.gameState.players[i];
            let newPlayer = new Player();
            newPlayer._id = gameStatePlayer._id
            newPlayer.x = 200 * (i+1);
            newPlayer.y = 200;
            newPlayer.car = this.matter.add.image(newPlayer.x, newPlayer.y, `car_${i}`);
            newPlayer.car.setAngle(90);
            newPlayer.car.setFrictionAir(0.5);
            newPlayer.car.setMass(1000);
            newPlayer.car.setFriction(0.2);
            newPlayer.car.setBounce(1);
            newPlayer.speed = 0;
            newPlayer.text = this.add.text(200 * (i+1), 200, newPlayer._id);
        }

        this.player = new Player();
        this.player._id = 'test-id';
        this.player.x = 200;
        this.player.y = 200;
        this.player.car = this.matter.add.image(this.player.x, this.player.y, 'car_0');
        this.player.car.setAngle(90);
        this.player.car.setFrictionAir(0.5);
        this.player.car.setMass(1000);
        this.player.car.setFriction(0.2);
        this.player.car.setBounce(1);
        this.player.speed = 0;
        this.player.text = this.add.text(200, 200, this.player._id);

        this.matter.world.setBounds(0,0,1920,1080);

        this.cursors = this.input.keyboard.createCursorKeys();
        this.player.car.setOnCollide(x => this.player.speed = 0);

        this.cameras.main.setBounds(0, 0, 1920, 1080);
        this.cameras.main.startFollow(this.player.car);

    }

    update() 
    {
        let velocityVector = new Phaser.Math.Vector2((this.player.car.body as any).velocity.x, (this.player.car.body as any).velocity.y);
        if(this.cursors.up.isDown) {
            this.accelerate(velocityVector);
        } else if(this.cursors.down.isDown) {
            this.brake(velocityVector);
        } else {
            this.deaccelerate(velocityVector);
        }

        this.applyForce();

        if(this.cursors.left.isDown) {
            this.turnLeft();
        } else if(this.cursors.right.isDown) {
            this.turnRight();
        }

        this.player.x = this.player.car.x;
        this.player.y = this.player.car.y;

        this.player.text.x = this.player.x-100;
        this.player.text.y = this.player.y-100;
        this.player.text.text = `${this.player._id}\n${this.player.x.toFixed(0)}, ${this.player.y.toFixed(0)}`;

        document.dispatchEvent(new CustomEvent('updatePlayer', {detail: {
            x: this.player.x, 
            y: this.player.y, 
            speed: this.player.speed,
            rotation: this.player.rotation
        }}));
    }

    accelerate(velocityVector: Phaser.Math.Vector2) {
        if(velocityVector.length() < this.maxSpeed) {
            this.player.speed += this.acceleration;
        } 

        if(this.player.speed < 0.1 && this.player.isReversing) {
            this.player.isReversing = false;
        }
    }
    
    deaccelerate(velocityVector: Phaser.Math.Vector2) {
        if(velocityVector.length() > 0.1) {
            this.player.speed -= this.deacceleration * (this.player.isReversing ? -1 : 1);
        }
    }

    brake(velocityVector: Phaser.Math.Vector2) {
        if (this.player.speed > 0.1 && !this.player.isReversing) {
            this.player.speed -= this.breakingPower;
        } else {
            this.player.speed -= this.reverseAcceleration;
            this.player.isReversing = true;
        }
    }

    applyForce() {
        let carRotation = this.player.car.rotation+ (Math.PI/2);
        let directionVector = new Phaser.Math.Vector2(Math.cos(carRotation), Math.sin(carRotation));
        this.player.car.applyForce(directionVector.normalize().scale(-this.player.speed));

    }

    turnLeft() {
        let velocityVector = new Phaser.Math.Vector2((this.player.car.body as any).velocity.x, (this.player.car.body as any).velocity.y);
        this.player.car.setAngularVelocity(-this.turningAcceleration * velocityVector.length() * (this.player.isReversing ? -1 : 1));
    }

    turnRight() {
        let velocityVector = new Phaser.Math.Vector2((this.player.car.body as any).velocity.x, (this.player.car.body as any).velocity.y);
        this.player.car.setAngularVelocity(this.turningAcceleration * velocityVector.length() * (this.player.isReversing ? -1 : 1));
    }
}
