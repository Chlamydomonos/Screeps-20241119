declare const global: Record<string, any>;

interface Memory {
    custom: Record<string, any>;
}

interface CreepMemory {
    role?: import('./creep/CreepRole').CreepRoleName;
}

interface RoomPosition {
    offset(direction: DirectionConstant): RoomPosition;
}
