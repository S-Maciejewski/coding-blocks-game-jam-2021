import express from 'express';
import io from 'socket.io';
import EventType from './model/eventTypes';
import { createServer, Server } from 'http';
import GameState from './model/gameState';
const cors = require('cors');

export class GameServer {
    private _app: express.Application;
    private server: Server;
    private ioServer!: SocketIO.Server;
    private port: number;

    private games: GameState[];

    constructor(port: number) {
        this._app = express();
        this._app.use(cors());
        this._app.options('*', cors());
        this.server = createServer(this._app);
        this.port = port;
        this.initSocket();
        this.listen();
    }

    private initSocket(): void {
        this.ioServer = io(this.server);
    }

    private listen(): void {
        this.server.listen(this.port, () => {
            console.log(`Running server on port ${this.port}`);
        });

        this.ioServer.on(EventType.CONNECT, (socket: io.Socket) => {

            this.ioServer.on(EventType.CREATE_ROOM, () => {
                this.handleCreateRoom(socket);
            });

            this.ioServer.on(EventType.JOIN_ROOM, (code: string | undefined) => {
                this.handleJoinRoom(socket, code);
            });

            // socket.emit('startGame', this.gameState);
            this.ioServer.emit('playerJoined' /* newly created player */);
        });
    }

    private handleCreateRoom(socket: io.Socket): void {
        let newGameState = new GameState();
        this.games.push(newGameState);
        socket.emit(EventType.UPDATE_GAME_STATE, newGameState);
    }

    private handleJoinRoom(socket: io.Socket, roomCode: string | undefined): void {
        socket.emit(EventType.UPDATE_GAME_STATE, roomCode);
    }

    get app(): express.Application {
        return this._app;
    }
}
