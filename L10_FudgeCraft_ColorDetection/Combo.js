"use strict";
var L10_FudgeCraft_DetectCombos;
(function (L10_FudgeCraft_DetectCombos) {
    class Combos {
        constructor(_elements) {
            this.found = [];
            this.detect(_elements);
        }
        detect(_elements) {
            for (let element of _elements) {
                if (this.contains(element))
                    continue;
                let combo = [];
                combo.push(element);
                this.recurse(element, combo);
                this.found.push(combo);
            }
        }
        contains(_element) {
            for (let combo of this.found) {
                if (combo.includes(_element))
                    return true;
            }
            return false;
        }
        recurse(_element, _combo) {
            let position = _element.cube.mtxWorld.translation;
            let name = L10_FudgeCraft_DetectCombos.grid.pull(position).cube.name;
            L10_FudgeCraft_DetectCombos.grid.findNeighbors(position)
                .filter((_element) => {
                return !_combo.includes(_element);
            })
                .filter((_element) => {
                return _element.cube.name == name;
            })
                .forEach((_element) => {
                _combo.push(_element);
                this.recurse(_element, _combo);
            });
        }
    }
    L10_FudgeCraft_DetectCombos.Combos = Combos;
})(L10_FudgeCraft_DetectCombos || (L10_FudgeCraft_DetectCombos = {}));
