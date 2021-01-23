import Player from "../prefabs/player";

export default class GameScene extends Phaser.Scene
{
    gameState: any;
    player: Player;
    cursors: Phaser.Types.Input.Keyboard.CursorKeys;

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
        this.player.car.setFrictionAir(0.1);
        this.player.car.setMass(1000);
        
        this.cursors = this.input.keyboard.createCursorKeys();
    }

    update() 
    {
        this.input.keyboard.on('keydown_W', this.accelerate, this);
        this.input.keyboard.on('keydown_S', this.brake, this);

        this.player.x = this.player.car.x;
        this.player.y = this.player.car.y;
    }

    accelerate(event) {
        this.player.car.applyForce(new Phaser.Math.Vector2(this.player.x, this.player.y));
    }

    brake(event) {
        this.player.car.applyForce(new Phaser.Math.Vector2(this.player.x, this.player.y));
    }
}
