enum EventType {
    CONNECT = 'connect',
    DISCONNECT = 'disconnect',
    CREATE_ROOM = 'createRoom',
    JOIN_ROOM = 'joinRoom',
    START_GAME = 'startGame',
    UPDATE_GAME_STATE = 'updateGameState',
    UPDATE_PLAYER = 'updatePlayer',
    NO_GAME_FOUND = 'noGameFound'
}

export default EventType;
