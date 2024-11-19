import { FlagAI } from '../../flag/FlagAI';
import { CreepAI } from '../CreepAI';
import { CreepRole } from '../CreepRole';

export interface UpgraderBase<H = {}, M = {}> extends CreepRole<H, M> {
    setUpgradingPoint(creep: CreepAI, upgradingPoint: FlagAI): void;
}
