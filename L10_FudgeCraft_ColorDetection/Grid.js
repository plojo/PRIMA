"use strict";
var L09_FudgeCraft_ColorDetection;
(function (L09_FudgeCraft_ColorDetection) {
    class GridElement {
        constructor(_cube = null) {
            this.cube = _cube;
        }
    }
    L09_FudgeCraft_ColorDetection.GridElement = GridElement;
    class Grid extends Map {
        // private grid: Map<string, Cube> = new Map();
        constructor() {
            super();
            this.push(L09_FudgeCraft_ColorDetection.f.Vector3.ZERO(), new GridElement(new L09_FudgeCraft_ColorDetection.Cube(L09_FudgeCraft_ColorDetection.CUBE_TYPE.GRAY, L09_FudgeCraft_ColorDetection.f.Vector3.ZERO())));
        }
        push(_position, _element = null) {
            let key = this.toKey(_position);
            this.set(key, _element);
            if (_element)
                L09_FudgeCraft_ColorDetection.game.appendChild(_element.cube);
        }
        pull(_position) {
            let key = this.toKey(_position);
            let element = this.get(key);
            return element;
        }
        pop(_position) {
            let key = this.toKey(_position);
            let element = this.get(key);
            this.delete(key);
            if (element)
                L09_FudgeCraft_ColorDetection.game.removeChild(element.cube);
            return element;
        }
        toKey(_position) {
            let position = _position.map(Math.round);
            let key = position.toString();
            return key;
        }
        detectCombos(_gridElements) {
            let combos = new Array();
            for (let element of _gridElements) {
                if (this.inCombos(element, combos))
                    continue;
                let combo = this.getCombo(element.cube.mtxWorld.translation);
                if (combo.length > 1) {
                    combos.push(this.getCombo(element.cube.mtxWorld.translation));
                }
            }
            return combos;
        }
        getCombo(_position) {
            let combo = new Array();
            combo.push(this.pull(_position));
            this.collectComboElementsV2(combo);
            return combo;
        }
        inCombos(_element, _combos) {
            for (let combo of _combos) {
                if (combo.includes(_element))
                    return true;
            }
            return false;
        }
        collectComboElements(_position, _combo) {
            let name = this.pull(_position).cube.name;
            [-1, 1]
                .flatMap((_element) => {
                return [
                    this.pull(L09_FudgeCraft_ColorDetection.f.Vector3.SUM(_position, L09_FudgeCraft_ColorDetection.f.Vector3.X(_element))),
                    this.pull(L09_FudgeCraft_ColorDetection.f.Vector3.SUM(_position, L09_FudgeCraft_ColorDetection.f.Vector3.Y(_element))),
                    this.pull(L09_FudgeCraft_ColorDetection.f.Vector3.SUM(_position, L09_FudgeCraft_ColorDetection.f.Vector3.Z(_element)))
                ];
            })
                .filter((_element) => {
                return _element != null;
            })
                .filter((_element) => {
                return !_combo.includes(_element);
            })
                .filter((_element) => {
                return _element.cube.name == name;
            })
                .forEach((_element) => {
                _combo.push(_element);
                this.collectComboElements(_element.cube.mtxWorld.translation, _combo);
            });
        }
        getSameColoredNeighbours(_element) {
            let position = _element.cube.mtxWorld.translation;
            let name = this.pull(position).cube.name;
            return [-1, 1]
                .flatMap((_number) => {
                return [
                    _element,
                    this.pull(L09_FudgeCraft_ColorDetection.f.Vector3.SUM(position, L09_FudgeCraft_ColorDetection.f.Vector3.X(_number))),
                    this.pull(L09_FudgeCraft_ColorDetection.f.Vector3.SUM(position, L09_FudgeCraft_ColorDetection.f.Vector3.Y(_number))),
                    this.pull(L09_FudgeCraft_ColorDetection.f.Vector3.SUM(position, L09_FudgeCraft_ColorDetection.f.Vector3.Z(_number)))
                ];
            })
                .filter((_element) => {
                return _element != null;
            })
                .filter((_element) => {
                return _element.cube.name == name;
            });
        }
        collectComboElementsV2(_combo) {
            let tmp = _combo.length;
            console.log(tmp);
            _combo.flatMap((_element) => {
                let position = _element.cube.mtxWorld.translation;
                let name = this.pull(position).cube.name;
                return [-1, 1]
                    .flatMap((_number) => {
                    return [
                        _element,
                        this.pull(L09_FudgeCraft_ColorDetection.f.Vector3.SUM(position, L09_FudgeCraft_ColorDetection.f.Vector3.X(_number))),
                        this.pull(L09_FudgeCraft_ColorDetection.f.Vector3.SUM(position, L09_FudgeCraft_ColorDetection.f.Vector3.Y(_number))),
                        this.pull(L09_FudgeCraft_ColorDetection.f.Vector3.SUM(position, L09_FudgeCraft_ColorDetection.f.Vector3.Z(_number)))
                    ];
                })
                    .filter((_element) => {
                    return _element != null;
                })
                    .filter((_element) => {
                    return _element.cube.name == name;
                })
                    .filter((_element) => {
                    return !_combo.includes(_element);
                });
            });
            if (tmp == _combo.length)
                return;
            else
                this.collectComboElementsV2(_combo);
        }
    }
    L09_FudgeCraft_ColorDetection.Grid = Grid;
})(L09_FudgeCraft_ColorDetection || (L09_FudgeCraft_ColorDetection = {}));
//# sourceMappingURL=Grid.js.map