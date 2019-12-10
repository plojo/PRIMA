"use strict";
var L09_FudgeCraft_Camera;
(function (L09_FudgeCraft_Camera) {
    var f = FudgeCore;
    class CameraControl extends f.Node {
        constructor(_minDistance, _maxAngle) {
            super("CameraControl");
            this.minDistance = _minDistance;
            this.maxAngle = _maxAngle;
            this.addComponent(new f.ComponentTransform());
            this.innerContainer = new f.Node("innerContainer");
            this.innerContainer.addComponent(new f.ComponentTransform());
            let cmpCamera = new f.ComponentCamera();
            cmpCamera.backgroundColor = f.Color.WHITE;
            this.innerContainer.addComponent(cmpCamera);
            this.appendChild(this.innerContainer);
            this.setDistance(20);
        }
        rotateX(_delta) {
            this.setRotationX(this.innerContainer.cmpTransform.local.rotation.x + _delta);
            // let mtxInnerContainer: f.Matrix4x4 = this.innerContainer.cmpTransform.local;
            // if ((_delta > 0 && mtxInnerContainer.rotation.x <= this.maxAngle) || (_delta < 0 && mtxInnerContainer.rotation.x >= -this.maxAngle)) {
            //     mtxInnerContainer.rotateX(_delta);
            // }
        }
        rotateY(_delta) {
            this.cmpTransform.local.rotateY(_delta);
        }
        translate(_delta) {
            this.setDistance(this.cmpCamera.pivot.translation.z + _delta);
            // let mtxCamera: f.Matrix4x4 = this.cmpCamera.pivot;
            // if (_delta < 0 && mtxCamera.translation.z > this.minDistance || _delta >= 0) {
            //     mtxCamera.translate(f.Vector3.Z(_delta));
            // }
        }
        setRotationX(_angle) {
            _angle = Math.min(Math.max(_angle, -this.maxAngle), this.maxAngle);
            this.innerContainer.cmpTransform.local.rotation = f.Vector3.X(_angle);
        }
        setRotationY(_angle) {
            this.cmpTransform.local.rotation = f.Vector3.Y(_angle);
        }
        setDistance(_distance) {
            _distance = Math.max(this.minDistance, _distance);
            this.cmpCamera.pivot.translation = f.Vector3.Z(_distance);
        }
        get cmpCamera() {
            return this.innerContainer.getComponent(f.ComponentCamera);
        }
    }
    L09_FudgeCraft_Camera.CameraControl = CameraControl;
})(L09_FudgeCraft_Camera || (L09_FudgeCraft_Camera = {}));
//# sourceMappingURL=Camera.js.map