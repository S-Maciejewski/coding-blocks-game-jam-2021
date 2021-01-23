
export default class Player {
    _id: string;
    x: number;
    y: number;
    rotation: number;
    speed: number;
    car: Phaser.Physics.Matter.Image;
    text: Phaser.GameObjects.Text;
    isReversing: boolean;
    currentSpeed: number;
}