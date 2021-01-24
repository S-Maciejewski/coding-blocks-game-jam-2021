import 'phaser';
import GameScene from './scenes/game-scene';
import MenuScene from './scenes/menu-scene';

const config = {
    type: Phaser.AUTO,
    backgroundColor: '#70c9cc',
    width: 800,
    height: 600,
    scene: [MenuScene, GameScene],
    physics: {
        default: 'matter',
        matter: {
            debug: false,
            gravity: {
                x: 0,
                y: 0
            }
        }
    },
};

const game = new Phaser.Game(config);
