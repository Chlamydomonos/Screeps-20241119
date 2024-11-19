import { MemoryContainer } from '../global/MemoryContainer';
import { RoomAI } from '../room/RoomAI';
import { FlagManager } from './FlagManager';
import { FlagRoleManager, FlagRoleName, FlagRoles } from './FlagRole';

export interface FlagHeap {
    data: Record<string, any>;
}
export interface CustomFlagMemory {
    role: FlagRoleName | undefined;
    data: Record<string, any>;
}

export class FlagAI {
    readonly name: string;
    readonly memoryContainer: MemoryContainer<FlagHeap, CustomFlagMemory>;
    readonly manager: FlagManager;

    private constructor(flag: Flag) {
        this.name = flag.name;

        let role: FlagRoleName | undefined;
        const existingMemory = MemoryContainer.getFromMemoryObj<CustomFlagMemory>(flag.memory);
        if (existingMemory && existingMemory.role) {
            role = existingMemory.role;
        } else {
            role = FlagRoleManager.INSTANCE.getRole(this.name);
        }

        const flagRole = role ? FlagRoles[role] : undefined;

        this.memoryContainer = new MemoryContainer(
            `flag#${this.name}`,
            () => (flagRole ? { data: flagRole.initHeap(this) } : ({} as any as FlagHeap)),
            () => (flagRole ? { role, data: flagRole.initMemory(this) } : ({} as any as CustomFlagMemory)),
            () => Game.flags[this.name].memory,
            () => {
                delete Memory.flags[this.name];
            }
        );

        this.manager = FlagManager.INSTANCE.registerFlag(this);

        flagRole?.init(this, this.memoryContainer.heap.data, this.memoryContainer.memory.data);
    }

    static of(flag: Flag) {
        const existing = FlagManager.INSTANCE.flags[flag.name];
        return existing ?? new FlagAI(flag);
    }

    get flag(): Flag | undefined {
        return Game.flags[this.name];
    }

    get alive() {
        return !!this.flag;
    }

    onDeath() {
        this.memoryContainer.destroy();
    }

    tick() {
        const role = this.memoryContainer.memory.role;
        if (!role) {
            return;
        }
        FlagRoles[role].tick(this, this.memoryContainer.heap.data, this.memoryContainer.memory.data);
    }

    get room() {
        return this.flag ? (this.flag.room ? RoomAI.of(this.flag.room) : undefined) : undefined;
    }
}
