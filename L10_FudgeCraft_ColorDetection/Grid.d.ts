declare namespace L09_FudgeCraft_ColorDetection {
    class GridElement {
        cube: Cube;
        constructor(_cube?: Cube);
    }
    class Grid extends Map<string, GridElement> {
        constructor();
        push(_position: f.Vector3, _element?: GridElement): void;
        pull(_position: f.Vector3): GridElement;
        pop(_position: f.Vector3): GridElement;
        toKey(_position: f.Vector3): string;
        detectCombos(_gridElements: Array<GridElement>): Array<Array<GridElement>>;
        getCombo(_position: f.Vector3): Array<GridElement>;
        private inCombos;
        private collectComboElements;
        private getSameColoredNeighbours;
        private collectComboElementsV2;
    }
}
