import Player from "../prefabs/player";

export default class GameScene extends Phaser.Scene
{
    gameState: any;
    player: Player;
    cursors: Phaser.Types.Input.Keyboard.CursorKeys;

    acceleration: number = 0.02;
    breakingPower: number = 0.5;
    reverseAcceleration: number = 0.01;
    deacceleration: number = 0.01;

    turningAcceleration: number = 0.005;
    maxSpeed: number = 5;

    constructor ()
    {
        super('GameScene');
    }

    init (data)
    {
        console.log('init', data);
    }

    preload ()
    {
        this.load.image('yellow_car', 'assets/yellow_car.png')
    }

    create ()
    {
        var roomCodeInputField = (<HTMLInputElement>document.getElementById('roomCode'));
        roomCodeInputField.style.display = 'none';

        this.player = new Player();
        this.player.x = 200;
        this.player.y = 200;
        this.player.car = this.matter.add.image(this.player.x, this.player.y, 'yellow_car');
        this.player.car.setAngle(90);
        this.player.car.setFrictionAir(0.5);
        this.player.car.setMass(1000);
        this.player.car.setFriction(0.2);
        this.player.currentSpeed = 0;

        this.cursors = this.input.keyboard.createCursorKeys();
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
    }

    accelerate(velocityVector: Phaser.Math.Vector2) {
        this.player.isReversing = false;
        if(velocityVector.length() < this.maxSpeed) {
            this.player.currentSpeed += this.acceleration;
        }
    }
    
    deaccelerate(velocityVector: Phaser.Math.Vector2) {
        if(velocityVector.length() > 0.01) {
            this.player.currentSpeed -= this.deacceleration * (this.player.isReversing ? -1 : 1);
        }
    }

    brake(velocityVector: Phaser.Math.Vector2) {
        if(velocityVector.length() > 0) {
            this.player.currentSpeed -= this.breakingPower;
        } else {
            this.player.currentSpeed -= this.reverseAcceleration;
            this.player.isReversing = true;
        }
    }

    applyForce() {
        let carRotation = this.player.car.rotation+ (Math.PI/2);
        let directionVector = new Phaser.Math.Vector2(Math.cos(carRotation), Math.sin(carRotation));
        this.player.car.applyForce(directionVector.normalize().scale(-this.player.currentSpeed));

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
