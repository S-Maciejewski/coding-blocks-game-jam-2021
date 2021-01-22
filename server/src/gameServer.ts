import express from 'express';
import io from 'socket.io';
import EventType from './model/messageType';
import { createServer, Server } from 'http';
const cors = require('cors');

export class GameServer {
    private _app: express.Application;
    private server: Server;
    private ioServer!: SocketIO.Server;
    private port: number;

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
            console.log(`Client ${socket.id} connected`);

            socket.on(EventType.TEST_MESSAGE, (m: any) => {
                console.log(`Got test message: ${m}`);
                this.ioServer.emit(EventType.TEST_MESSAGE, m);
            });

            socket.on(EventType.DISCONNECT, () => {
                console.log(`Client ${socket.id} disconnected`);
            });
        });
    }

    get app(): express.Application {
        return this._app;
    }
}
