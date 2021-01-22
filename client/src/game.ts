import 'phaser';
import MenuScene from './scenes/menu-scene';

const config = {
    type: Phaser.AUTO,
    backgroundColor: '#125555',
    width: 800,
    height: 600,
    scene: MenuScene
};

const game = new Phaser.Game(config);
