import * as _ from 'underscore';
import Player from './player';

export default class GameState {
    roomCode: string;
    roomState: RoomState;
    players: Player[] = [];


    constructor() {
        this.roomCode = generateRandomCode();
        this.roomState = RoomState.WAITING;
    }


}

enum RoomState {
    WAITING,
    IN_PROGRESS,
    FINISHED
}

function generateRandomCode(): string {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    return _.sample(letters, 5).join('');
}