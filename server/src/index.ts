import { GameServer } from './gameServer';

const PORT = 8000;
const app = new GameServer(PORT).app;

export { app };
