declare namespace L10_FudgeCraft_DetectCombos {
    class GridElement {
        cube: Cube;
        constructor(_cube?: Cube);
    }
    class Grid extends Map<string, GridElement> {
        constructor();
        push(_position: f.Vector3, _element?: GridElement): void;
        pull(_position: f.Vector3): GridElement;
        pop(_position: f.Vector3): GridElement;
        findNeighbors(_of: f.Vector3): GridElement[];
        private toKey;
    }
}
