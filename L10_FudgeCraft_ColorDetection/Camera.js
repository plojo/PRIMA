"use strict";
// namespace L10_FudgeCraft_DetectCombos {
//     import f = FudgeCore;
//     export class CameraControl extends f.Node {
//         private maxAngle: number;
//         private minDistance: number;
//         private innerContainer: f.Node;
//         constructor(_minDistance: number, _maxAngle: number) {
//             super("CameraControl");
//             this.minDistance = _minDistance;
//             this.maxAngle = _maxAngle;
//             this.addComponent(new f.ComponentTransform());
//             this.innerContainer = new f.Node("innerContainer");
//             this.innerContainer.addComponent(new f.ComponentTransform());
//             let cmpCamera: f.ComponentCamera = new f.ComponentCamera();
//             cmpCamera.backgroundColor = f.Color.CSS("WHITE", 1);
//             this.innerContainer.addComponent(cmpCamera);
//             this.appendChild(this.innerContainer);
//             this.setDistance(20);
//         }
//         public rotateX(_delta: number): void {
//             this.setRotationX(this.innerContainer.cmpTransform.local.rotation.x + _delta);
//             // let mtxInnerContainer: f.Matrix4x4 = this.innerContainer.cmpTransform.local;
//             // if ((_delta > 0 && mtxInnerContainer.rotation.x <= this.maxAngle) || (_delta < 0 && mtxInnerContainer.rotation.x >= -this.maxAngle)) {
//             //     mtxInnerContainer.rotateX(_delta);
//             // }
//         }
//         public rotateY(_delta: number): void {
//             this.cmpTransform.local.rotateY(_delta);
//         }
//         public translate(_delta: number): void {
//             this.setDistance(this.cmpCamera.pivot.translation.z + _delta);
//             // let mtxCamera: f.Matrix4x4 = this.cmpCamera.pivot;
//             // if (_delta < 0 && mtxCamera.translation.z > this.minDistance || _delta >= 0) {
//             //     mtxCamera.translate(f.Vector3.Z(_delta));
//             // }
//         }
//         setRotationX(_angle: number): void {
//             _angle = Math.min(Math.max(_angle, -this.maxAngle), this.maxAngle);
//             this.innerContainer.cmpTransform.local.rotation = f.Vector3.X(_angle);
//         }
//         setRotationY(_angle: number): void {
//             this.cmpTransform.local.rotation = f.Vector3.Y(_angle);
//         }
//         setDistance(_distance: number): void {
//             _distance = Math.max(this.minDistance, _distance);
//             this.cmpCamera.pivot.translation = f.Vector3.Z(_distance);
//         }
//         get cmpCamera(): f.ComponentCamera {
//             return this.innerContainer.getComponent(f.ComponentCamera);
//         }
//     }
// }
var L10_FudgeCraft_DetectCombos;
// namespace L10_FudgeCraft_DetectCombos {
//     import f = FudgeCore;
//     export class CameraControl extends f.Node {
//         private maxAngle: number;
//         private minDistance: number;
//         private innerContainer: f.Node;
//         constructor(_minDistance: number, _maxAngle: number) {
//             super("CameraControl");
//             this.minDistance = _minDistance;
//             this.maxAngle = _maxAngle;
//             this.addComponent(new f.ComponentTransform());
//             this.innerContainer = new f.Node("innerContainer");
//             this.innerContainer.addComponent(new f.ComponentTransform());
//             let cmpCamera: f.ComponentCamera = new f.ComponentCamera();
//             cmpCamera.backgroundColor = f.Color.CSS("WHITE", 1);
//             this.innerContainer.addComponent(cmpCamera);
//             this.appendChild(this.innerContainer);
//             this.setDistance(20);
//         }
//         public rotateX(_delta: number): void {
//             this.setRotationX(this.innerContainer.cmpTransform.local.rotation.x + _delta);
//             // let mtxInnerContainer: f.Matrix4x4 = this.innerContainer.cmpTransform.local;
//             // if ((_delta > 0 && mtxInnerContainer.rotation.x <= this.maxAngle) || (_delta < 0 && mtxInnerContainer.rotation.x >= -this.maxAngle)) {
//             //     mtxInnerContainer.rotateX(_delta);
//             // }
//         }
//         public rotateY(_delta: number): void {
//             this.cmpTransform.local.rotateY(_delta);
//         }
//         public translate(_delta: number): void {
//             this.setDistance(this.cmpCamera.pivot.translation.z + _delta);
//             // let mtxCamera: f.Matrix4x4 = this.cmpCamera.pivot;
//             // if (_delta < 0 && mtxCamera.translation.z > this.minDistance || _delta >= 0) {
//             //     mtxCamera.translate(f.Vector3.Z(_delta));
//             // }
//         }
//         setRotationX(_angle: number): void {
//             _angle = Math.min(Math.max(_angle, -this.maxAngle), this.maxAngle);
//             this.innerContainer.cmpTransform.local.rotation = f.Vector3.X(_angle);
//         }
//         setRotationY(_angle: number): void {
//             this.cmpTransform.local.rotation = f.Vector3.Y(_angle);
//         }
//         setDistance(_distance: number): void {
//             _distance = Math.max(this.minDistance, _distance);
//             this.cmpCamera.pivot.translation = f.Vector3.Z(_distance);
//         }
//         get cmpCamera(): f.ComponentCamera {
//             return this.innerContainer.getComponent(f.ComponentCamera);
//         }
//     }
// }
(function (L10_FudgeCraft_DetectCombos) {
    var ƒ = FudgeCore;
    class CameraOrbit extends ƒ.Node {
        constructor(_maxRotX) {
            super("CameraOrbit");
            //rotatorX: ƒ.Node;
            this.maxRotX = 75;
            this.minDistance = 10;
            this.maxRotX = Math.min(_maxRotX, 89);
            let cmpTransform = new ƒ.ComponentTransform();
            this.addComponent(cmpTransform);
            let rotatorX = new ƒ.Node("CameraRotX");
            rotatorX.addComponent(new ƒ.ComponentTransform());
            this.appendChild(rotatorX);
            let cmpCamera = new ƒ.ComponentCamera();
            cmpCamera.backgroundColor = ƒ.Color.CSS("WHITE", 1);
            rotatorX.addComponent(cmpCamera);
            this.setDistance(20);
        }
        get cmpCamera() {
            return this.rotatorX.getComponent(ƒ.ComponentCamera);
        }
        get rotatorX() {
            return this.getChildrenByName("CameraRotX")[0];
        }
        setDistance(_distance) {
            let newDistance = Math.max(this.minDistance, _distance);
            this.cmpCamera.pivot.translation = ƒ.Vector3.Z(newDistance);
        }
        moveDistance(_delta) {
            this.setDistance(this.cmpCamera.pivot.translation.z + _delta);
        }
        setRotationY(_angle) {
            this.cmpTransform.local.rotation = ƒ.Vector3.Y(_angle);
        }
        setRotationX(_angle) {
            _angle = Math.min(Math.max(-this.maxRotX, _angle), this.maxRotX);
            this.rotatorX.cmpTransform.local.rotation = ƒ.Vector3.X(_angle);
        }
        rotateY(_delta) {
            this.cmpTransform.local.rotateY(_delta);
        }
        rotateX(_delta) {
            let angle = this.rotatorX.cmpTransform.local.rotation.x + _delta;
            this.setRotationX(angle);
        }
        translate(_delta) {
            let distance = this.cmpCamera.pivot.translation.z + _delta;
            this.setDistance(distance);
        }
    }
    L10_FudgeCraft_DetectCombos.CameraOrbit = CameraOrbit;
})(L10_FudgeCraft_DetectCombos || (L10_FudgeCraft_DetectCombos = {}));
