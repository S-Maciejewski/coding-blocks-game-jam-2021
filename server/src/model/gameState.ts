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

    startGame() {
        this.roomState = RoomState.IN_PROGRESS;
    }

    addPlayer(_id: string) {
        const newPlayer = new Player();
        newPlayer._id = _id;
        this.players.push(newPlayer);
    }

    removePlayer(_id: string) {
        this.players = this.players.filter(x => x._id !== _id);
    }
}

export enum RoomState {
    WAITING,
    IN_PROGRESS,
    FINISHED
}

function generateRandomCode(): string {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    return _.sample(letters, 5).join('');
}