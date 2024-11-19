import { CreepAI } from '../../creep/CreepAI';
import { HarvesterBase } from '../../creep/roles/HarvesterBase';
import { SpawnTask, SpawnTaskStatus } from '../../spawn/SpawnAI';
import { FlagRole } from '../FlagRole';

interface MiningPointHeap {
    spawnTask?: SpawnTask;
}

interface MiningPointMemory {
    creepName?: string;
    miningDirection?: DirectionConstant;
}

/**
 * # 采矿点位
 *
 * 能量的采集点位。会自动向spawn申请一个harvester来采矿。
 */
export const miningPoint: FlagRole<MiningPointHeap, MiningPointMemory> = {
    initHeap() {
        return {};
    },
    initMemory() {
        return {};
    },
    init(flag, _heap, memory) {
        if (!memory.miningDirection) {
            const flagPos = flag.flag!.pos;
            const source = flagPos.findInRange(FIND_SOURCES, 1)[0];
            memory.miningDirection = flagPos.getDirectionTo(source.pos);
        }
    },

    tick(flag, heap, memory) {
        if (heap.spawnTask) {
            if (heap.spawnTask.status == SpawnTaskStatus.CANCELED) {
                heap.spawnTask = undefined;
            } else if (heap.spawnTask.status == SpawnTaskStatus.FINISHED) {
                memory.creepName = heap.spawnTask.name;
                const creep = CreepAI.of(Game.creeps[memory.creepName]);
                if (creep) {
                    const role = creep.role.value as HarvesterBase;
                    role.setMiningPoint(creep, flag);
                    role.setMiningDirection(creep, memory.miningDirection!);
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
                heap.spawnTask = flag.room!.spawnManager!.createTask('earlyHarvester');
            }
        }
    },
};
