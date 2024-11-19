import { RoomAI } from './RoomAI';

export class RoomManager {
    static readonly INSTANCE = new RoomManager();

    readonly rooms: Record<string, RoomAI> = {};

    private constructor() {}

    registerRoom(room: RoomAI) {
        this.rooms[room.name] = room;
        return this;
    }

    tick() {
        for (const roomName in this.rooms) {
            const room = this.rooms[roomName];
            if (!room.alive) {
                room.onDeath();
                delete this.rooms[roomName];
            } else {
                room.tick();
            }
        }
    }
}
