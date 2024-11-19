import { initRoomPosition } from './prototypes/initRoomPosition';

const initPrototypes = () => {
    initRoomPosition();
};

const initHeap = () => {
    global.containers = {};
};

const initMemory = () => {
    if (!Memory.custom) {
        Memory.custom = { containers: {} };
    }
};

export const init = () => {
    initPrototypes();
    initHeap();
    initMemory();
};
