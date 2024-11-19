import { FlagAI, FlagHeap } from './FlagAI';
import { miningPoint } from './roles/miningPoint';
import { upgradingPoint } from './roles/upgradingPoint';

export interface FlagRole<HeapType = {}, MemoryType = {}> {
    initHeap(flag: FlagAI): HeapType;
    initMemory(flag: FlagAI): MemoryType;
    init(flag: FlagAI, heap: HeapType, memory: MemoryType): void;
    tick(flag: FlagAI, heap: HeapType, memory: MemoryType): void;
}

export class FlagRoleManager {
    private constructor() {}
    static readonly INSTANCE = new FlagRoleManager();

    getRole(name: string): FlagRoleName | undefined {
        for (const role in FlagRoles) {
            if (name.startsWith(role)) {
                return role as FlagRoleName;
            }
        }
        return undefined;
    }
}

export const FlagRoles = {
    miningPoint,
    upgradingPoint,
};

export type FlagRoleName = keyof typeof FlagRoles;
