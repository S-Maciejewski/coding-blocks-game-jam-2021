import { GameServer } from './gameServer';

const PORT = 3000;
const app = new GameServer(PORT).app;

export { app };
