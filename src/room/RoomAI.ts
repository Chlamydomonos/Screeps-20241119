import { CreepManager, RoomCreepManager } from '../creep/CreepManager';
import { MemoryContainer } from '../global/MemoryContainer';
import { RoomSpawnManager, SpawnManager } from '../spawn/SpawnManager';
import { RoomManager } from './RoomManager';

export interface RoomHeap {}

export interface RoomMemory {}

export class RoomAI {
    readonly name: string;
    readonly memoryContainer: MemoryContainer<RoomHeap, RoomMemory>;
    readonly manager: RoomManager;

    private constructor(room: Room) {
        this.name = room.name;

        this.memoryContainer = new MemoryContainer(
            `room#${this.name}`,
            () => ({}),
            () => ({}),
            () => Game.rooms[this.name].memory,
            () => {
                delete Memory.rooms[this.name];
            }
        );

        this.manager = RoomManager.INSTANCE.registerRoom(this);
    }

    static of(room: Room) {
        const existing = RoomManager.INSTANCE.rooms[room.name];
        return existing ?? new RoomAI(room);
    }

    get room(): Room | undefined {
        return Game.rooms[this.name];
    }

    get alive() {
        return !!this.room;
    }

    get creepManager(): RoomCreepManager | undefined {
        return CreepManager.INSTANCE.rooms[this.name];
    }

    get spawnManager(): RoomSpawnManager | undefined {
        return SpawnManager.INSTANCE.rooms[this.name];
    }

    tick() {}

    onDeath() {
        this.memoryContainer.destroy();
    }
}
