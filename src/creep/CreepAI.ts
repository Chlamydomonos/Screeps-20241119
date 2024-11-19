import { MemoryContainer } from '../global/MemoryContainer';
import { RoomAI } from '../room/RoomAI';
import { CreepManager, RoleCreepManager } from './CreepManager';
import { CreepRoleName, CreepRoles } from './CreepRole';
import { CreepTask } from './CreepTask';
import { IdleTask } from './tasks/IdleTask';

export interface CreepHeap {
    data: Record<string, any>;
    currentTask: CreepTask;
}

export interface CustomCreepMemory {
    role: CreepRoleName;
    data: Record<string, any>;
}

export class CreepAI {
    readonly name: string;
    readonly memoryContainer: MemoryContainer<CreepHeap, CustomCreepMemory>;
    readonly manager: RoleCreepManager;

    private constructor(creep: Creep, role: CreepRoleName) {
        this.name = creep.name;
        const creepRole = CreepRoles[role];

        this.memoryContainer = new MemoryContainer(
            `creep#${this.name}`,
            () => ({ data: creepRole.initHeap(this), currentTask: new IdleTask(this) }),
            () => ({ role, data: {} }),
            () => Game.creeps[this.name].memory,
            () => {
                delete Memory.creeps[this.name];
            }
        );

        creepRole.init(this, this.memoryContainer.heap.data as any, this.memoryContainer.memory.data as any);
        this.manager = CreepManager.INSTANCE.registerCreep(this);
    }

    static of(creep: Creep) {
        if (!creep.memory.role) {
            return undefined;
        }

        const existing = CreepManager.INSTANCE.creeps[creep.name];
        return existing ?? new CreepAI(creep, creep.memory.role);
    }

    get creep(): Creep | undefined {
        return Game.creeps[this.name];
    }

    get alive() {
        return !!this.creep;
    }

    onDeath() {
        this.memoryContainer.destroy();
    }

    tick() {
        const taskResult = this.currentTask.tick();

        CreepRoles[this.memoryContainer.memory.role].tick(
            this,
            this.memoryContainer.heap.data as any,
            this.memoryContainer.memory.data as any,
            taskResult
        );
    }

    get room() {
        return this.creep ? RoomAI.of(this.creep.room) : undefined;
    }

    get role() {
        const roleName = this.memoryContainer.memory.role;
        return { name: roleName, value: CreepRoles[roleName] };
    }

    get currentTask() {
        return this.memoryContainer.heap.currentTask;
    }

    set currentTask(task: CreepTask) {
        this.memoryContainer.heap.currentTask = task;
    }

    clearTask() {
        this.currentTask = new IdleTask(this);
    }
}
