import { CreepTask, CreepTaskStatus } from '../CreepTask';

export class IdleTask extends CreepTask {
    override tick() {
        return { status: CreepTaskStatus.IN_PROGRESS };
    }
}
