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

namespace L08_FudgeCraft_Collision {
    import f = FudgeCore;
    
    export class Fragment extends f.Node {
        private static shapes: number[][][] = Fragment.getShapeArray();
        private static shapeToCubeType: Map<Number, CUBE_TYPE> = Fragment.getShapeToCubeType();

        constructor(_shape: number) {
            super("Fragment-Type" + _shape);
            let shape: number [][] = Fragment.shapes[_shape];
            let type: CUBE_TYPE =  Fragment.shapeToCubeType.get(_shape); // Fragment.getRandomEnum(CUBE_TYPE);
            this.addComponent(new f.ComponentTransform());
            for (let position of shape) {
                let vctPosition: f.Vector3 = f.Vector3.ZERO();
                vctPosition.set(position[0], position[1], position[2]);
                let cube: Cube = new Cube(type, vctPosition);
                this.appendChild(cube);
            }
        }

        public static getRandom(): Fragment {
            let shape: number = Math.floor(Math.random() * Fragment.shapes.length);
            let fragment: Fragment = new Fragment(shape);
            return fragment;
        }

        private static getShapeArray(): number[][][] {
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
                [[0, 0, 0], [1, 0, 0], [0, 1, 0], [1, 0, 1]]
            ];
        }

        // private static getRandomEnum<T>(_enum: {[key: string]: T}): T {
        //     let randomKey: string = Object.keys(_enum)[Math.floor(Math.random() * Object.keys(_enum).length)];
        //     return _enum[randomKey];
        // }

        private static getShapeToCubeType(): Map<Number, CUBE_TYPE> {
            return new Map<Number, CUBE_TYPE>([
                // [0, CUBE_TYPE.GRAY],
                [0, CUBE_TYPE.CYAN],
                [1, CUBE_TYPE.YELLOW],
                [2, CUBE_TYPE.MAGENTA],
                [3, CUBE_TYPE.RED],
                [4, CUBE_TYPE.BLUE],
                [5, CUBE_TYPE.ORANGE],
                [6, CUBE_TYPE.GREEN]
            ]);
        }
    }
}