import { CreepAI } from '../CreepAI';
import { CreepTask, CreepTaskResult, CreepTaskStatus } from '../CreepTask';

export enum MoveFailure {
    STUCK,
    NOT_IN_PATH,
    UNKNOWN,
}

/**
 * # 根据路径移动
 *
 * 在此任务下，creep根据路径移动。如果creep被障碍物阻挡的时间超过`stuckTimeout`或者不在指定路径上，任务失败。
 */
export class MoveByPathTask extends CreepTask<MoveFailure> {
    private hasSucceeded = false;
    private hasFailed = false;

    constructor(readonly creep: CreepAI, readonly path: PathStep[], readonly stuckTimeout: number = 5) {
        super(creep);
    }

    get stuckTime(): number {
        return this.creep.memoryContainer.heap.data.stuckTime;
    }

    set stuckTime(stuckTime: number) {
        this.creep.memoryContainer.heap.data.stuckTime = stuckTime;
    }

    override tick(): CreepTaskResult<MoveFailure> {
        if (this.hasSucceeded) {
            return { status: CreepTaskStatus.SUCCESS };
        }
        if (this.hasFailed) {
            return { status: CreepTaskStatus.FAIL, reason: MoveFailure.UNKNOWN };
        }

        if (!this.path || this.path.length == 0) {
            return { status: CreepTaskStatus.SUCCESS };
        }

        const lastElem = this.path[this.path.length - 1];
        const targetX = lastElem.x;
        const targetY = lastElem.y;
        if (this.creep.creep!.pos.x == targetX && this.creep.creep!.pos.y == targetY) {
            this.hasSucceeded = true;
            return { status: CreepTaskStatus.SUCCESS };
        }
        const oldX = this.creep.creep!.pos.x;
        const oldY = this.creep.creep!.pos.y;
        const statusCode = this.creep.creep?.moveByPath(this.path);
        const newX = this.creep.creep!.pos.x;
        const newY = this.creep.creep!.pos.y;
        if (statusCode == OK) {
            if (this.creep.creep?.pos.x == targetX && this.creep.creep.pos.y == targetY) {
                this.hasSucceeded = true;
                return { status: CreepTaskStatus.SUCCESS };
            }

            if (newX == oldX && newY == oldY) {
                this.stuckTime++;
                if (this.stuckTime > this.stuckTimeout) {
                    this.hasFailed = true;
                    return { status: CreepTaskStatus.FAIL, reason: MoveFailure.STUCK };
                } else {
                    return { status: CreepTaskStatus.IN_PROGRESS };
                }
            } else {
                return { status: CreepTaskStatus.IN_PROGRESS };
            }
        } else if (statusCode == ERR_NOT_FOUND) {
            this.hasFailed = true;
            return { status: CreepTaskStatus.FAIL, reason: MoveFailure.NOT_IN_PATH };
        } else if (statusCode == ERR_TIRED) {
            return { status: CreepTaskStatus.IN_PROGRESS };
        } else {
            this.hasFailed = true;
            return { status: CreepTaskStatus.FAIL, reason: MoveFailure.UNKNOWN };
        }
    }
}
