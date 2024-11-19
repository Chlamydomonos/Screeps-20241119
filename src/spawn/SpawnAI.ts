import { CreepRoleName, CreepRoles } from '../creep/CreepRole';
import { GlobalNamePool } from '../global/GlobalNamePool';
import { MemoryContainer } from '../global/MemoryContainer';
import { RoomAI } from '../room/RoomAI';
import { RoomSpawnManager, SpawnManager } from './SpawnManager';

export enum SpawnTaskStatus {
    IN_QUEUE,
    SPAWNING,
    CANCELED,
    FINISHED,
}

export class SpawnTask {
    readonly name: string;

    constructor(readonly role: CreepRoleName, readonly manager: RoomSpawnManager) {
        this.name = GlobalNamePool.INSTANCE.genName(role);
    }
    status: SpawnTaskStatus = SpawnTaskStatus.IN_QUEUE;

    destroy() {
        delete this.manager.tasks[this.role][this.name];
    }
}

export interface SpawnHeap {
    taskSpawning: SpawnTask | undefined;
    taskQueue: SpawnTask[];
}

export interface CustomSpawnMemory {}

export class SpawnAI {
    readonly name: string;
    readonly memoryContainer: MemoryContainer<SpawnHeap, CustomSpawnMemory>;
    readonly manager: RoomSpawnManager;

    private constructor(spawn: StructureSpawn) {
        this.name = spawn.name;

        this.memoryContainer = new MemoryContainer(
            `spawn#${this.name}`,
            () => ({
                taskSpawning: undefined,
                taskQueue: [],
            }),
            () => ({}),
            () => Game.spawns[this.name].memory,
            () => {
                delete Memory.spawns[this.name];
            }
        );

        this.manager = SpawnManager.INSTANCE.registerSpawn(this);
    }

    static of(spawn: StructureSpawn) {
        const existing = SpawnManager.INSTANCE.spawns[spawn.name];
        return existing ?? new SpawnAI(spawn);
    }

    get spawn(): StructureSpawn | undefined {
        return Game.spawns[this.name];
    }

    get alive() {
        return !!this.spawn;
    }

    get tasksInQueue() {
        return this.memoryContainer.heap.taskQueue.length;
    }

    tick() {
        if (!this.memoryContainer.heap.taskSpawning) {
            let firstTask: SpawnTask;
            while (true) {
                if (this.memoryContainer.heap.taskQueue.length == 0) {
                    return;
                }

                const task = this.memoryContainer.heap.taskQueue[0];
                if (task.status == SpawnTaskStatus.CANCELED) {
                    this.memoryContainer.heap.taskQueue.shift();
                } else {
                    firstTask = task;
                    break;
                }
            }
            const role = firstTask.role;
            const name = firstTask.name;

            const statusCode = this.spawn?.spawnCreep(CreepRoles[role].bodyParts(RoomAI.of(this.spawn.room)), name, {
                memory: { role },
            });

            if (statusCode == OK) {
                this.memoryContainer.heap.taskQueue.shift();
                this.memoryContainer.heap.taskSpawning = firstTask;
                firstTask.status = SpawnTaskStatus.SPAWNING;
            }
        } else if (!this.spawn?.spawning) {
            this.memoryContainer.heap.taskSpawning.status = SpawnTaskStatus.FINISHED;
            this.memoryContainer.heap.taskSpawning = undefined;
        }
    }

    onDeath() {
        this.memoryContainer.destroy();
    }

    get room() {
        return this.spawn ? RoomAI.of(this.spawn.room) : undefined;
    }
}
