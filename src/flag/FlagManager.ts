import { FlagAI } from './FlagAI';

export class FlagManager {
    static readonly INSTANCE = new FlagManager();
    private constructor() {}

    readonly flags: Record<string, FlagAI> = {};

    registerFlag(flag: FlagAI) {
        this.flags[flag.name] = flag;
        return this;
    }

    tick() {
        for (const flagName in this.flags) {
            const flag = this.flags[flagName];
            if (!flag.alive) {
                flag.onDeath();
                delete this.flags[flagName];
            } else {
                flag.tick();
            }
        }
    }
}
