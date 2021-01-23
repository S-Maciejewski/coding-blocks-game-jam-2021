import Player from "./player";

export default class GameState {
    roomCode: string;
    roomState: RoomState;
    players: Player[];
}

export enum RoomState {
    WAITING,
    IN_PROGRESS,
    FINISHED
}