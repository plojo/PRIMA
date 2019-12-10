namespace L09_FudgeCraft_ColorDetection {

    export class GridElement {
        public cube: Cube;

        constructor(_cube: Cube = null) {
            this.cube = _cube;
        }
    }

    export class Grid extends Map<string, GridElement> {
        // private grid: Map<string, Cube> = new Map();
        constructor() {
            super();
            this.push(f.Vector3.ZERO(), new GridElement(new Cube(CUBE_TYPE.GRAY, f.Vector3.ZERO())));
        }

        push(_position: f.Vector3, _element: GridElement = null): void {
            let key: string = this.toKey(_position);
            this.set(key, _element);
            if (_element)
                game.appendChild(_element.cube);
        }

        pull(_position: f.Vector3): GridElement {
            let key: string = this.toKey(_position);
            let element: GridElement = this.get(key);
            return element;
        }

        pop(_position: f.Vector3): GridElement {
            let key: string = this.toKey(_position);
            let element: GridElement = this.get(key);
            this.delete(key);
            if (element)
                game.removeChild(element.cube);
            return element;
        }

        toKey(_position: f.Vector3): string {
            let position: f.Vector3 = _position.map(Math.round);
            let key: string = position.toString();
            return key;
        }

        detectCombos(_gridElements: Array<GridElement>): Array<Array<GridElement>> {
            let combos: Array<Array<GridElement>> = new Array<Array<GridElement>>();
            for (let element of _gridElements) {
                if (this.inCombos(element, combos))
                    continue;
                let combo: Array<GridElement> = this.getCombo(element.cube.mtxWorld.translation);
                if (combo.length > 1) {
                    combos.push(this.getCombo(element.cube.mtxWorld.translation));
                }
            }
            return combos;
        }

        getCombo(_position: f.Vector3): Array<GridElement> {
            let combo: Array<GridElement> = new Array<GridElement>();
            combo.push(this.pull(_position));
            this.collectComboElements(_position, combo);
            return combo;
        }

        private inCombos(_element: GridElement, _combos: Array<Array<GridElement>>): boolean {
            for (let combo of _combos) {
                if (combo.includes(_element))
                    return true;
            }
            return false;
        }

        private collectComboElements(_position: f.Vector3, _combo: Array<GridElement>): void {
            let name: string = this.pull(_position).cube.name;
            [-1, 1]
                .flatMap((_element: number) => {
                    return [
                        this.pull(f.Vector3.SUM(_position, f.Vector3.X(_element))),
                        this.pull(f.Vector3.SUM(_position, f.Vector3.Y(_element))),
                        this.pull(f.Vector3.SUM(_position, f.Vector3.Z(_element)))
                    ];
                })
                .filter((_element: GridElement) => {
                    return _element != null;
                })
                .filter((_element: GridElement) => {
                    return !_combo.includes(_element);
                })
                .filter((_element: GridElement) => {
                    return _element.cube.name == name;
                })
                .forEach((_element: GridElement) => {
                    _combo.push(_element);
                    this.collectComboElements(_element.cube.mtxWorld.translation, _combo);
                });
        }
    }
}