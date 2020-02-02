declare namespace L09_FudgeCraft_Camera {
    import f = FudgeCore;
    class CameraControl extends f.Node {
        private maxAngle;
        private minDistance;
        private innerContainer;
        constructor(_minDistance: number, _maxAngle: number);
        rotateX(_delta: number): void;
        rotateY(_delta: number): void;
        translate(_delta: number): void;
        setRotationX(_angle: number): void;
        setRotationY(_angle: number): void;
        setDistance(_distance: number): void;
        get cmpCamera(): f.ComponentCamera;
    }
}
