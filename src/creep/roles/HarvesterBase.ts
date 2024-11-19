import { FlagAI } from '../../flag/FlagAI';
import { CreepAI } from '../CreepAI';
import { CreepRole } from '../CreepRole';

export interface HarvesterBase<H = {}, M = {}> extends CreepRole<H, M> {
    setMiningPoint(creep: CreepAI, miningPoint: FlagAI): void;
    setMiningDirection(creep: CreepAI, miningDirection: DirectionConstant): void;
}
