namespace L08_FudgeCraft_Movement {

    export class Grid {
        private grid: Map<string, Cube> = new Map();

        public setFragment(_fragment: Fragment): void {
            for (let cube of _fragment.getChildren()) {
                this.setCube(<Cube>cube);
            }
        }

        public setCube(_cube: Cube): void {
            // let key: string = this.toKey(_cube.mtxWorld.translation.map(Math.round));
            let key: string = this.toKey(_cube.position().map(Math.round));
            console.log(key);
            this.grid.set(key, _cube);
        }
    
        public getCube(_position: f.Vector3): Cube {
            return this.grid.get(this.toKey(_position));
        }
    
        public hasCube(_position: f.Vector3): Boolean {
            console.log(_position);
            return this.grid.has(this.toKey(_position));
        }

        deleteCube(_position: f.Vector3): Cube {
            let key: string = this.toKey(_position);
            let cube: Cube = this.grid.get(key);
            this.grid.delete(key);
            return cube;
        }

        toKey(_position: f.Vector3): string {
            return _position.map(Math.round).toString();
        }
    }  
}