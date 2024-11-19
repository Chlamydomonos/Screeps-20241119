import { RoomAI } from '../room/RoomAI';
import { CreepAI } from './CreepAI';
import { CreepTaskResult } from './CreepTask';
import { earlyHarvester } from './roles/earlyHarvester';
import { earlyUpgrader } from './roles/earlyUpgrader';

export interface CreepRole<HeapType = {}, MemoryType = {}> {
    bodyParts(room: RoomAI): BodyPartConstant[];
    initHeap(creep: CreepAI): HeapType;
    initMemory(creep: CreepAI): MemoryType;
    init(creep: CreepAI, heap: HeapType, memory: MemoryType): void;
    tick(creep: CreepAI, heap: HeapType, memory: MemoryType, taskResult: CreepTaskResult): void;
}

export const CreepRoles = {
    earlyHarvester,
    earlyUpgrader,
};

export type CreepRoleName = keyof typeof CreepRoles;
