export const initRoomPosition = () => {
    RoomPosition.prototype.offset = function (this: RoomPosition, direction: DirectionConstant) {
        switch (direction) {
            case TOP:
                return new RoomPosition(this.x, this.y - 1, this.roomName);
            case TOP_LEFT:
                return new RoomPosition(this.x - 1, this.y - 1, this.roomName);
            case LEFT:
                return new RoomPosition(this.x - 1, this.y, this.roomName);
            case BOTTOM_LEFT:
                return new RoomPosition(this.x - 1, this.y + 1, this.roomName);
            case BOTTOM:
                return new RoomPosition(this.x, this.y + 1, this.roomName);
            case BOTTOM_RIGHT:
                return new RoomPosition(this.x + 1, this.y + 1, this.roomName);
            case RIGHT:
                return new RoomPosition(this.x + 1, this.y, this.roomName);
            case TOP_RIGHT:
                return new RoomPosition(this.x + 1, this.y - 1, this.roomName);
        }
    };
};
