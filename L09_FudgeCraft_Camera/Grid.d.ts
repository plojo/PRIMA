declare namespace L09_FudgeCraft_Camera {
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
    }
}
