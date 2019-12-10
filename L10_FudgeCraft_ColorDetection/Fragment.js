"use strict";
// namespace L08_FudgeCraft_Collision {
//     import ƒ = FudgeCore;
//     export class Fragment extends ƒ.Node {
//         private static shapes: number[][][] = Fragment.getShapeArray();
//         public position: ƒ.Vector3 = new ƒ.Vector3(0, 0, 0);
//         constructor(_shape: number, _position: ƒ.Vector3 = ƒ.Vector3.ZERO()) {
//             super("Fragment-Type" + _shape);
//             let shape: number[][] = Fragment.shapes[_shape];
//             for (let position of shape) {
//                 let type: CUBE_TYPE;
//                 do {
//                     type = Fragment.getRandomEnum(CUBE_TYPE);
//                 } while (type == CUBE_TYPE.GREY);
//                 let vctPosition: ƒ.Vector3 = ƒ.Vector3.ZERO();
//                 vctPosition.set(position[0], position[1], position[2]);
//                 let cube: Cube = new Cube(type, vctPosition);
//                 this.appendChild(cube);
//             }
//             this.addComponent(new ƒ.ComponentTransform(ƒ.Matrix4x4.TRANSLATION(_position)));
//         }
//         private static getShapeArray(): number[][][] {
//             return [
//                 // corner
//                 [[0, 0, 0], [1, 0, 0], [0, 1, 0], [0, 0, 1]],
//                 // quad
//                 [[0, 0, 0], [1, 0, 0], [0, 1, 0], [1, 1, 0]],
//                 // s
//                 [[0, 0, 0], [0, 1, 0], [1, 0, 0], [1, -1, 0]]
//             ];
//         }
//         private static getRandomEnum<T>(_enum: { [key: string]: T }): T {
//             let randomKey: string = Object.keys(_enum)[Math.floor(Math.random() * Object.keys(_enum).length)];
//             return _enum[randomKey];
//         }
//     }
// }
var L09_FudgeCraft_ColorDetection;
// namespace L08_FudgeCraft_Collision {
//     import ƒ = FudgeCore;
//     export class Fragment extends ƒ.Node {
//         private static shapes: number[][][] = Fragment.getShapeArray();
//         public position: ƒ.Vector3 = new ƒ.Vector3(0, 0, 0);
//         constructor(_shape: number, _position: ƒ.Vector3 = ƒ.Vector3.ZERO()) {
//             super("Fragment-Type" + _shape);
//             let shape: number[][] = Fragment.shapes[_shape];
//             for (let position of shape) {
//                 let type: CUBE_TYPE;
//                 do {
//                     type = Fragment.getRandomEnum(CUBE_TYPE);
//                 } while (type == CUBE_TYPE.GREY);
//                 let vctPosition: ƒ.Vector3 = ƒ.Vector3.ZERO();
//                 vctPosition.set(position[0], position[1], position[2]);
//                 let cube: Cube = new Cube(type, vctPosition);
//                 this.appendChild(cube);
//             }
//             this.addComponent(new ƒ.ComponentTransform(ƒ.Matrix4x4.TRANSLATION(_position)));
//         }
//         private static getShapeArray(): number[][][] {
//             return [
//                 // corner
//                 [[0, 0, 0], [1, 0, 0], [0, 1, 0], [0, 0, 1]],
//                 // quad
//                 [[0, 0, 0], [1, 0, 0], [0, 1, 0], [1, 1, 0]],
//                 // s
//                 [[0, 0, 0], [0, 1, 0], [1, 0, 0], [1, -1, 0]]
//             ];
//         }
//         private static getRandomEnum<T>(_enum: { [key: string]: T }): T {
//             let randomKey: string = Object.keys(_enum)[Math.floor(Math.random() * Object.keys(_enum).length)];
//             return _enum[randomKey];
//         }
//     }
// }
(function (L09_FudgeCraft_ColorDetection) {
    var f = FudgeCore;
    class Fragment extends f.Node {
        // private static shapeToCubeType: Map<Number, CUBE_TYPE> = Fragment.getShapeToCubeType();
        constructor(_shape) {
            super("Fragment-Type" + _shape);
            let shape = Fragment.shapes[_shape];
            this.addComponent(new f.ComponentTransform());
            for (let position of shape) {
                let type = Fragment.getRandomEnum(L09_FudgeCraft_ColorDetection.CUBE_TYPE); // Fragment.shapeToCubeType.get(_shape)
                let vctPosition = f.Vector3.ZERO();
                vctPosition.set(position[0], position[1], position[2]);
                let cube = new L09_FudgeCraft_ColorDetection.Cube(type, vctPosition);
                this.appendChild(cube);
            }
        }
        static getRandom() {
            let shape = Math.floor(Math.random() * Fragment.shapes.length);
            let fragment = new Fragment(shape);
            return fragment;
        }
        static getShapeArray() {
            return [
                // I
                [[0, -1, 0], [0, 0, 0], [0, 1, 0], [0, 2, 0]],
                // O
                [[0, 0, 0], [1, 0, 0], [0, 1, 0], [1, 1, 0]],
                // T
                [[0, 0, 0], [0, 1, 0], [-1, 0, 0], [1, 0, 0]],
                // S
                [[0, 0, 0], [0, 1, 0], [1, 0, 0], [1, -1, 0]],
                // L
                [[0, 0, 0], [0, 1, 0], [0, -1, 0], [1, -1, 0]],
                // corner
                [[0, 0, 0], [1, 0, 0], [0, 1, 0], [0, 0, 1]],
                // thingy
                [[0, 0, 0], [1, 0, 0], [0, 1, 0], [1, 0, 1]],
                // mirrored thingy???
                [[0, 0, 0], [1, 0, 0], [0, 1, 0], [1, 0, -1]]
            ];
        }
        static getRandomEnum(_enum) {
            let randomKey = Object.keys(_enum)[Math.floor(Math.random() * Object.keys(_enum).length)];
            return _enum[randomKey];
        }
    }
    Fragment.shapes = Fragment.getShapeArray();
    L09_FudgeCraft_ColorDetection.Fragment = Fragment;
})(L09_FudgeCraft_ColorDetection || (L09_FudgeCraft_ColorDetection = {}));
//# sourceMappingURL=Fragment.js.map