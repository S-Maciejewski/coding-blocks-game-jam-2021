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

    // car: 75 x 128
    setPlayerPositions(): void {
        for (let i = 0; i < this.players.length; i++) {
            if (i === 0) {
                this.players[i] = { ...this.players[i], x: 200, y: 200, rotation: 90, speed: 0 };
            } else {
                this.players[i] = { ...this.players[i], x: 200, y: 200 + (100 * 1), rotation: 90, speed: 0 };
            }
        }
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