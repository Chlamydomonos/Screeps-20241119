import { FlagManager } from '../../flag/FlagManager';
import { CreepTaskStatus } from '../CreepTask';
import { MoveByPathTask } from '../tasks/MoveByPathTask';
import { HarvesterBase } from './HarvesterBase';

enum Status {
    NEW_BORN,
    MOVING_TO_MINE,
    MINING,
    RESTING_AT_MINE,
    MOVING_TO_SPAWN,
    RESTING_AT_SPAWN,
}

interface EarlyHarvesterHeap {
    status: Status;
    pathSpawnToMine?: PathStep[];
    pathMineToSpawn?: PathStep[];
}
interface EarlyHarvesterMemory {
    miningPointName?: string;
    miningDirection?: DirectionConstant;
    spawnName?: string;
}

export const earlyHarvester: HarvesterBase<EarlyHarvesterHeap, EarlyHarvesterMemory> = {
    bodyParts() {
        return [MOVE, WORK, WORK, CARRY];
    },

    initHeap() {
        return { status: Status.NEW_BORN };
    },

    initMemory() {
        return {};
    },

    init(creep, _heap, memory) {
        if (!memory.spawnName) {
            const spawn = creep.creep!.pos.findInRange(FIND_MY_SPAWNS, 1)[0];
            memory.spawnName = spawn.name;
        }
    },

    tick(creep, heap, memory, taskResult) {
        if (!memory.miningPointName) {
            return;
        }

        const flag = FlagManager.INSTANCE.flags[memory.miningPointName];
        const spawn = Game.spawns[memory.spawnName!];

        switch (heap.status) {
            case Status.NEW_BORN: {
                if (heap.pathMineToSpawn) {
                    delete heap.pathMineToSpawn;
                }
                if (heap.pathSpawnToMine) {
                    delete heap.pathSpawnToMine;
                }

                if (creep.creep!.store.energy == 0) {
                    const path = creep.creep!.pos.findPathTo(flag.flag!);
                    creep.currentTask = new MoveByPathTask(creep, path);
                    heap.status = Status.MOVING_TO_MINE;
                } else {
                    const path = creep.creep!.pos.findPathTo(spawn);
                    creep.currentTask = new MoveByPathTask(creep, path);
                    heap.status = Status.MOVING_TO_SPAWN;
                }
                break;
            }
            case Status.MOVING_TO_MINE: {
                if (taskResult.status == CreepTaskStatus.SUCCESS) {
                    heap.status = Status.MINING;
                    creep.clearTask();
                } else if (taskResult.status == CreepTaskStatus.FAIL) {
                    heap.status = Status.NEW_BORN;
                    creep.clearTask();
                }
                break;
            }
            case Status.MINING: {
                if (creep.creep!.store.getFreeCapacity('energy') == 0) {
                    heap.status = Status.RESTING_AT_MINE;
                } else {
                    const sourcePos = creep.creep!.pos.offset(memory.miningDirection!);
                    const source = sourcePos.lookFor(LOOK_SOURCES)[0];
                    creep.creep!.harvest(source);
                }
                break;
            }
            case Status.RESTING_AT_MINE: {
                if (spawn.store.getFreeCapacity('energy') > 0) {
                    heap.status = Status.MOVING_TO_SPAWN;
                    if (!heap.pathMineToSpawn) {
                        heap.pathMineToSpawn = creep.creep!.pos.findPathTo(spawn);
                    }
                    creep.currentTask = new MoveByPathTask(creep, heap.pathMineToSpawn);
                }
                break;
            }
            case Status.MOVING_TO_SPAWN: {
                if (creep.creep!.pos.inRangeTo(spawn, 1)) {
                    heap.status = Status.RESTING_AT_SPAWN;
                    creep.clearTask();
                } else if (taskResult.status == CreepTaskStatus.FAIL) {
                    heap.status = Status.NEW_BORN;
                    creep.clearTask();
                }
                break;
            }
            case Status.RESTING_AT_SPAWN: {
                const energyLeft = creep.creep!.store.energy;
                if (energyLeft == 0) {
                    heap.status = Status.MOVING_TO_MINE;
                    if (!heap.pathSpawnToMine) {
                        heap.pathSpawnToMine = creep.creep!.pos.findPathTo(flag.flag!);
                    }
                    creep.currentTask = new MoveByPathTask(creep, heap.pathSpawnToMine);
                    break;
                }
                const energyToTransfer = Math.min(energyLeft, spawn.store.getFreeCapacity('energy'));
                if (energyToTransfer > 0) {
                    creep.creep!.transfer(spawn, 'energy', energyToTransfer);
                }
                break;
            }
        }
    },

    setMiningPoint(creep, miningPoint) {
        (creep.memoryContainer.memory.data as EarlyHarvesterMemory).miningPointName = miningPoint.name;
    },

    setMiningDirection(creep, miningDirection) {
        (creep.memoryContainer.memory.data as EarlyHarvesterMemory).miningDirection = miningDirection;
    },
};
