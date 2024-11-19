import { CreepAI } from './CreepAI';
import { CreepRoleName } from './CreepRole';

export class RoleCreepManager {
    readonly creeps: Record<string, CreepAI> = {};

    constructor(readonly parent: RoomCreepManager) {}

    registerCreep(creep: CreepAI) {
        this.creeps[creep.name] = creep;
        return this;
    }

    tick() {
        for (const creepName in this.creeps) {
            const creep = this.creeps[creepName];
            if (!creep.alive) {
                creep.onDeath();
                delete this.creeps[creepName];
                delete this.parent.creeps[creepName];
                delete this.parent.parent.creeps[creepName];
            } else {
                creep.tick();
            }
        }
    }

    get empty() {
        return Object.keys(this.creeps).length == 0;
    }
}

export class RoomCreepManager {
    readonly roles: Record<string, RoleCreepManager> = {};
    readonly creeps: Record<string, CreepAI> = {};

    constructor(readonly parent: CreepManager) {}

    registerCreep(creep: CreepAI) {
        const creepRole = creep.memoryContainer.memory.role;

        if (!this.roles[creepRole]) {
            this.roles[creepRole] = new RoleCreepManager(this);
        }
        return this.roles[creepRole].registerCreep(creep);
    }

    tick() {
        for (const roleName in this.roles) {
            const role = this.roles[roleName];
            role.tick();
            if (role.empty) {
                delete this.roles[roleName];
            }
        }
    }

    get empty() {
        return Object.keys(this.roles).length == 0;
    }
}

export class CreepManager {
    static readonly INSTANCE = new CreepManager();
    private constructor() {}

    readonly rooms: Record<string, RoomCreepManager> = {};
    readonly creeps: Record<string, CreepAI> = {};

    registerCreep(creep: CreepAI) {
        const creepRoom = creep.creep!.room.name;
        if (!this.rooms[creepRoom]) {
            this.rooms[creepRoom] = new RoomCreepManager(this);
        }
        return this.rooms[creepRoom].registerCreep(creep);
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
