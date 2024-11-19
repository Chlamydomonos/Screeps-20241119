import { CreepAI } from '../../creep/CreepAI';
import { UpgraderBase } from '../../creep/roles/UpgraderBase';
import { SpawnTask, SpawnTaskStatus } from '../../spawn/SpawnAI';
import { FlagRole } from '../FlagRole';

interface UpgradePointHeap {
    spawnTask?: SpawnTask;
}

interface UpgradePointMemory {
    creepName?: string;
}

export const upgradingPoint: FlagRole<UpgradePointHeap, UpgradePointMemory> = {
    initHeap() {
        return {};
    },
    initMemory() {
        return {};
    },
    init() {},
    tick(flag, heap, memory) {
        if (heap.spawnTask) {
            if (heap.spawnTask.status == SpawnTaskStatus.CANCELED) {
                heap.spawnTask = undefined;
            } else if (heap.spawnTask.status == SpawnTaskStatus.FINISHED) {
                memory.creepName = heap.spawnTask.name;
                const creep = CreepAI.of(Game.creeps[memory.creepName]);
                if (creep) {
                    const role = creep.role.value as UpgraderBase;
                    role.setUpgradingPoint(creep, flag);
                } else {
                    memory.creepName = undefined;
                }

                heap.spawnTask = undefined;
            }
        } else {
            if (memory.creepName && !Game.creeps[memory.creepName]) {
                memory.creepName = undefined;
            }

            if (!memory.creepName) {
                heap.spawnTask = flag.room!.spawnManager!.createTask('earlyUpgrader');
            }
        }
    },
};
