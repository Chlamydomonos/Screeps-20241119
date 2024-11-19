export class MemoryContainer<HeapType, MemoryType> {
    constructor(
        public name: string,
        initHeap: () => HeapType,
        initMemory: () => MemoryType,
        private memoryObj?: () => any,
        private destroyMemory?: () => void
    ) {
        if (!global.containers[name]) {
            global.containers[name] = initHeap();
        }

        if (memoryObj && !memoryObj().isContainer) {
            memoryObj().isContainer = true;
            memoryObj().content = initMemory();
        }

        if (!memoryObj && !Memory.custom.containers[name]) {
            Memory.custom.containers[name] = initMemory();
        }
    }

    get heap(): HeapType {
        return global.containers[this.name];
    }

    get memory(): MemoryType {
        return this.memoryObj ? this.memoryObj().content : Memory.custom.containers[this.name];
    }

    destroy() {
        delete global.containers[this.name];
        if (this.destroyMemory) {
            this.destroyMemory();
        } else {
            delete Memory.custom.containers[this.name];
        }
    }

    static getFromMemoryObj<T>(memoryObj: any): T | undefined {
        return memoryObj ? memoryObj.content : undefined;
    }
}
