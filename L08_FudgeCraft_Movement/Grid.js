"use strict";
var L08_FudgeCraft_Movement;
(function (L08_FudgeCraft_Movement) {
    class Grid {
        constructor() {
            this.grid = new Map();
        }
        setFragment(_fragment) {
            for (let cube of _fragment.getChildren()) {
                this.setCube(cube);
            }
        }
        setCube(_cube) {
            // let key: string = this.toKey(_cube.mtxWorld.translation.map(Math.round));
            let key = this.toKey(_cube.position().map(Math.round));
            console.log(key);
            this.grid.set(key, _cube);
        }
        getCube(_position) {
            return this.grid.get(this.toKey(_position));
        }
        hasCube(_position) {
            console.log(_position);
            return this.grid.has(this.toKey(_position));
        }
        deleteCube(_position) {
            let key = this.toKey(_position);
            let cube = this.grid.get(key);
            this.grid.delete(key);
            return cube;
        }
        toKey(_position) {
            return _position.map(Math.round).toString();
        }
    }
    L08_FudgeCraft_Movement.Grid = Grid;
})(L08_FudgeCraft_Movement || (L08_FudgeCraft_Movement = {}));
