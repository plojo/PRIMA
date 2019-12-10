declare namespace L09_FudgeCraft_Camera {
    import f = FudgeCore;
    interface Transformation {
        translation?: f.Vector3;
        rotation?: f.Vector3;
    }
    interface Transformations {
        [keycode: string]: Transformation;
    }
    interface Collision {
        element: GridElement;
        cube: Cube;
    }
    class Control extends f.Node {
        static transformations: Transformations;
        protected fragment: Fragment;
        constructor();
        static defineControls(): Transformations;
        setFragment(_fragment: Fragment): void;
        move(_transformation: Transformation): void;
        checkCollisions(_transformation: Transformation): Collision[];
        freeze(): void;
    }
}
