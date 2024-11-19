import { CreepRoleName } from '../creep/CreepRole';
import { SpawnAI, SpawnTask, SpawnTaskStatus } from './SpawnAI';

export class RoomSpawnManager {
    readonly spawns: Record<string, SpawnAI> = {};
    readonly tasks: Record<string, Record<string, SpawnTask>> = {};
    constructor(readonly parent: SpawnManager) {}

    registerSpawn(spawn: SpawnAI) {
        this.spawns[spawn.name] = spawn;
        return this;
    }

    tick() {
        for (const spawnName in this.spawns) {
            const spawn = this.spawns[spawnName];
            if (!spawn.alive) {
                spawn.onDeath();
                delete this.spawns[spawnName];
                delete this.parent.spawns[spawnName];
            } else {
                spawn.tick();
            }
        }
    }

    get empty() {
        return Object.keys(this.spawns).length == 0;
    }

    createTask(role: CreepRoleName, spawnName?: string) {
        const task = new SpawnTask(role, this);
        if (!this.tasks[role]) {
            this.tasks[role] = {};
        }
        this.tasks[role][task.name] = task;

        if (spawnName) {
            this.spawns[spawnName].memoryContainer.heap.taskQueue.push(task);
            return task;
        }

        let minTaskCount = 0xffff_ffff;
        let minSpawn: SpawnAI | undefined = undefined;
        for (const spawnName in this.spawns) {
            const spawn = this.spawns[spawnName];
            if (spawn.tasksInQueue < minTaskCount) {
                minTaskCount = spawn.tasksInQueue;
                minSpawn = spawn;
            }
        }
        minSpawn!.memoryContainer.heap.taskQueue.push(task);
        return task;
    }

    taskCount(role: CreepRoleName) {
        if (!this.tasks[role]) {
            this.tasks[role] = {};
        }
        return Object.keys(this.tasks[role]).length;
    }

    cancelTask(task: SpawnTask) {
        task.status = SpawnTaskStatus.CANCELED;
        delete this.tasks[task.name];
    }
}

export class SpawnManager {
    static readonly INSTANCE = new SpawnManager();
    private constructor() {}

    readonly rooms: Record<string, RoomSpawnManager> = {};
    readonly spawns: Record<string, SpawnAI> = {};

    registerSpawn(spawn: SpawnAI) {
        const spawnRoom = spawn.spawn!.room.name;
        if (!this.rooms[spawnRoom]) {
            this.rooms[spawnRoom] = new RoomSpawnManager(this);
        }
        return this.rooms[spawnRoom].registerSpawn(spawn);
    }

    tick() {
        for (const roomName in this.rooms) {
            const room = this.rooms[roomName];
            room.tick();
            if (room.empty) {
                delete this.rooms[roomName];
            }
        }
    }
}
