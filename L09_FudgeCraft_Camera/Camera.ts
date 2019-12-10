namespace L09_FudgeCraft_Camera {
    import f = FudgeCore;

    export class CameraControl extends f.Node {
        private maxAngle: number;
        private minDistance: number;
        private innerContainer: f.Node;

        constructor(_minDistance: number, _maxAngle: number) {
            super("CameraControl");
            this.minDistance = _minDistance;
            this.maxAngle = _maxAngle;

            this.addComponent(new f.ComponentTransform());

            this.innerContainer = new f.Node("innerContainer");
            this.innerContainer.addComponent(new f.ComponentTransform());

            let cmpCamera: f.ComponentCamera = new f.ComponentCamera();
            cmpCamera.backgroundColor = f.Color.WHITE;
            this.innerContainer.addComponent(cmpCamera);
            this.appendChild(this.innerContainer);
            this.setDistance(20);
        }

        public rotateX(_delta: number): void {
            this.setRotationX(this.innerContainer.cmpTransform.local.rotation.x + _delta);
            // let mtxInnerContainer: f.Matrix4x4 = this.innerContainer.cmpTransform.local;
            // if ((_delta > 0 && mtxInnerContainer.rotation.x <= this.maxAngle) || (_delta < 0 && mtxInnerContainer.rotation.x >= -this.maxAngle)) {
            //     mtxInnerContainer.rotateX(_delta);
            // }
        }

        public rotateY(_delta: number): void {
            this.cmpTransform.local.rotateY(_delta);
        }

        public translate(_delta: number): void {
            this.setDistance(this.cmpCamera.pivot.translation.z + _delta);
            // let mtxCamera: f.Matrix4x4 = this.cmpCamera.pivot;
            // if (_delta < 0 && mtxCamera.translation.z > this.minDistance || _delta >= 0) {
            //     mtxCamera.translate(f.Vector3.Z(_delta));
            // }
        }

        setRotationX(_angle: number): void {
            _angle = Math.min(Math.max(_angle, -this.maxAngle), this.maxAngle);
            this.innerContainer.cmpTransform.local.rotation = f.Vector3.X(_angle);
        }

        setRotationY(_angle: number): void {
            this.cmpTransform.local.rotation = f.Vector3.Y(_angle);
        }

        setDistance(_distance: number): void {
            _distance = Math.max(this.minDistance, _distance);
            this.cmpCamera.pivot.translation = f.Vector3.Z(_distance);
        }

        get cmpCamera(): f.ComponentCamera {
            return this.innerContainer.getComponent(f.ComponentCamera);
        }
    }
}