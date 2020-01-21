declare namespace L10_FudgeCraft_DetectCombos {
    import ƒ = FudgeCore;
    interface Transformation {
        translation?: ƒ.Vector3;
        rotation?: ƒ.Vector3;
    }
    interface Transformations {
        [keycode: string]: Transformation;
    }
    interface Collision {
        element: GridElement;
        cube: Cube;
    }
    class Control extends ƒ.Node {
        static transformations: Transformations;
        private fragment;
        constructor();
        static defineControls(): Transformations;
        setFragment(_fragment: Fragment): void;
        move(_transformation: Transformation): void;
        checkCollisions(_transformation: Transformation): Collision[];
        freeze(): GridElement[];
    }
}
