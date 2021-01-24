import express from 'express';
import io from 'socket.io';
import EventType from './models/eventTypes';
import { createServer, Server } from 'http';
import GameState, { RoomState } from './models/gameState';
import Player from './models/player';
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

        this.games = [];
        // setInterval(this.printMonitoringLog, 10000);
    }

    private initSocket(): void {
        this.ioServer = io(this.server);
    }

    private listen(): void {
        this.server.listen(this.port, () => {
            console.log(`Running server on port ${this.port}`);
        });

        this.ioServer.on(EventType.CONNECT, (socket: io.Socket) => {
            console.log(`New connection - ${socket.id}`);

            socket.on(EventType.CREATE_ROOM, () => {
                this.handleCreateRoom(socket);
            });

            socket.on(EventType.JOIN_ROOM, (code: string | undefined) => {
                this.handleJoinRoom(socket, code);
            });

            socket.on(EventType.DISCONNECT, () => {
                this.handleDisconnect(socket);
            });

            socket.on(EventType.START_GAME, () => {
                this.handleStartGame(socket);
            });

            socket.on(EventType.UPDATE_PLAYER, (player: Player) => {
                this.handlePlayerUpdate(socket, player);
            });
        });
    }

    private handleCreateRoom(socket: io.Socket): void {
        const newGameState = new GameState();

        socket.join(newGameState.roomCode);
        newGameState.addPlayer(socket.id);

        console.log(`New room created by ${socket.id} code: ${newGameState.roomCode}`);
        this.games.push(newGameState);
        socket.emit(EventType.UPDATE_GAME_STATE, newGameState);
    }

    private handleJoinRoom(socket: io.Socket, roomCode: string | undefined): void {
        console.log(`Player ${socket.id} trying to join room with code ${roomCode}`);
        if (roomCode === undefined) {
            const gamesWaiting = this.games.filter((x: GameState) => x.roomState === RoomState.WAITING);

            if (gamesWaiting.length !== 0) {
                gamesWaiting[0].addPlayer(socket.id);
                socket.emit(EventType.UPDATE_GAME_STATE, gamesWaiting[0]);

            } else {
                const newGameState = new GameState();

                socket.join(newGameState.roomCode);
                newGameState.addPlayer(socket.id);

                this.games.push(newGameState);
                socket.emit(EventType.UPDATE_GAME_STATE, newGameState);
            }

        } else {
            const game = this.games.find((x: GameState) => x.roomCode === roomCode);
            if (game === undefined) {
                socket.emit(EventType.NO_GAME_FOUND);

            } else {
                socket.join(game.roomCode);
                game.addPlayer(socket.id);
                this.ioServer.in(game.roomCode).emit(EventType.UPDATE_GAME_STATE, game);
            }
        }
    }

    private handleDisconnect(socket: io.Socket): void {
        console.log(`${socket.id} disconnected`);
        const game = this.games.find((x: GameState) => x.players.find((y: Player) => y._id == socket.id));
        if (game) {
            game.removePlayer(socket.id);
            this.ioServer.in(game.roomCode).emit(EventType.UPDATE_GAME_STATE, game);
            socket.leaveAll();
            if (game.players.length === 0) {
                console.log(`Closing the room ${game.roomCode}`);
                this.games = this.games.filter((x: GameState) => x.roomCode !== game.roomCode);
            }
        }
        socket.emit(EventType.UPDATE_GAME_STATE, game);
    }

    private handleStartGame(socket: io.Socket): void {
        const game = this.games.find((x: GameState) => x.players.find((y: Player) => y._id == socket.id));
        if (game) {
            game.roomState = RoomState.IN_PROGRESS;
            game.setPlayerPositions();
            this.ioServer.in(game.roomCode).emit(EventType.UPDATE_GAME_STATE_START, game);
        } else {
            console.warn(`Could not find a game to start for player ${socket.id}`);
        }
    }

    private handlePlayerUpdate(socket: io.Socket, player: Player) {
        const game = this.games.find((x: GameState) => x.players.find((y: Player) => y._id === socket.id));
        if (game) {
            // TODO Update the player
            game.updatePlayer(player);
            // TODO Propagate updated player response
            this.ioServer.in(game.roomCode).emit(EventType.UPDATE_GAME_STATE, game);
        } else {
            console.warn(`Could not find a game to update the player ${socket.id}`);
        }
    }

    private printMonitoringLog() {
        if (this.games && this.games.length !== 0) {
            console.log(`Games: ${this.games.length}, Players: ${this.games.reduce((acc: number, val: GameState) =>
                acc += val.players.length, 0)}`);
        } else {
            console.log(`No games running at the moment`);
        }
    }

    get app(): express.Application {
        return this._app;
    }
}
