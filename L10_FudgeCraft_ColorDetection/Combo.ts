namespace L10_FudgeCraft_DetectCombos {
    export class Combos {
        found: Array<Array<GridElement>> = [];

        constructor(_elements: GridElement[]) {
            this.detect(_elements);
        }

        private detect(_elements: GridElement[]): void {
            for (let element of _elements) {
                if (this.contains(element))
                    continue;
                let combo: GridElement[] = [];
                combo.push(element);
                this.recurse(element, combo);
                this.found.push(combo);
            }
        }

        private contains(_element: GridElement): boolean {
            for (let combo of this.found) {
                if (combo.includes(_element))
                    return true;
            }
            return false;
        }

        private recurse(_element: GridElement, _combo: GridElement[]): void {
            let position: f.Vector3 = _element.cube.mtxWorld.translation;
            let name: string = grid.pull(position).cube.name;
            grid.findNeighbors(position)
                .filter((_element: GridElement) => {
                    return !_combo.includes(_element);
                })
                .filter((_element: GridElement) => {
                    return _element.cube.name == name;
                })
                .forEach((_element: GridElement) => {
                    _combo.push(_element);
                    this.recurse(_element, _combo);
                });
        }
    }
}