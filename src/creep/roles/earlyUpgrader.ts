import { FlagManager } from '../../flag/FlagManager';
import { SpawnAI } from '../../spawn/SpawnAI';
import { CreepTaskStatus } from '../CreepTask';
import { MoveByPathTask } from '../tasks/MoveByPathTask';
import { UpgraderBase } from './UpgraderBase';

enum Status {
    NEW_BORN,
    MOVING_TO_CONTROLLER,
    UPGRADING,
    MOVING_TO_SPAWN,
    RESTING_AT_SPAWN,
}

interface EarlyUpgraderHeap {
    status: Status;
    pathSpawnToController?: PathStep[];
    pathControllerToSpawn?: PathStep[];
}

interface EarlyUpgraderMemory {
    upgradingPointName?: string;
    spawnName?: string;
}

export const earlyUpgrader: UpgraderBase<EarlyUpgraderHeap, EarlyUpgraderMemory> = {
    bodyParts() {
        return [MOVE, MOVE, WORK, CARRY];
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
        if (!memory.upgradingPointName) {
            return;
        }

        const flag = FlagManager.INSTANCE.flags[memory.upgradingPointName];
        const spawn = Game.spawns[memory.spawnName!];

        switch (heap.status) {
            case Status.NEW_BORN: {
                if (heap.pathControllerToSpawn) {
                    delete heap.pathControllerToSpawn;
                }
                if (heap.pathSpawnToController) {
                    delete heap.pathSpawnToController;
                }

                if (creep.creep!.store.energy == 0) {
                    const path = creep.creep!.pos.findPathTo(spawn);
                    creep.currentTask = new MoveByPathTask(creep, path);
                    heap.status = Status.MOVING_TO_SPAWN;
                } else {
                    const path = creep.creep!.pos.findPathTo(flag.flag!);
                    creep.currentTask = new MoveByPathTask(creep, path);
                    heap.status = Status.MOVING_TO_CONTROLLER;
                }
                break;
            }
            case Status.MOVING_TO_CONTROLLER: {
                if (taskResult.status == CreepTaskStatus.SUCCESS) {
                    heap.status = Status.UPGRADING;
                    creep.clearTask();
                } else if (taskResult.status == CreepTaskStatus.FAIL) {
                    heap.status = Status.NEW_BORN;
                    creep.clearTask();
                }
                break;
            }
            case Status.UPGRADING: {
                if (creep.creep!.store.energy > 0) {
                    const controller = creep.creep!.room.controller!;
                    creep.creep!.upgradeController(controller);
                } else {
                    if (!heap.pathControllerToSpawn) {
                        heap.pathControllerToSpawn = creep.creep!.pos.findPathTo(spawn);
                    }
                    creep.currentTask = new MoveByPathTask(creep, heap.pathControllerToSpawn);
                    heap.status = Status.MOVING_TO_SPAWN;
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
                const spawnHasTask = SpawnAI.of(spawn).tasksInQueue > 0;
                if (!spawnHasTask) {
                    const spawnEnergy = spawn.store.energy;
                    const capacity = creep.creep!.store.getFreeCapacity('energy');
                    if (spawnEnergy >= capacity) {
                        creep.creep!.withdraw(spawn, 'energy', capacity);
                        if (!heap.pathSpawnToController) {
                            heap.pathSpawnToController = creep.creep!.pos.findPathTo(flag.flag!);
                        }
                        creep.currentTask = new MoveByPathTask(creep, heap.pathSpawnToController);
                        heap.status = Status.MOVING_TO_CONTROLLER;
                        break;
                    }
                }
                break;
            }
        }
    },

    setUpgradingPoint(creep, upgradingPoint) {
        (creep.memoryContainer.memory.data as EarlyUpgraderMemory).upgradingPointName = upgradingPoint.name;
    },
};
