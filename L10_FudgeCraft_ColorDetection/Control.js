"use strict";
// namespace L10_FudgeCraft_DetectCombos {
//     import f = FudgeCore;
//     export interface Transformation {
//         translation?: f.Vector3;
//         rotation?: f.Vector3;
//     }
//     export interface Transformations {
//         [keycode: string]: Transformation;
//     }
//     export interface Collision {
//         element: GridElement;
//         cube: Cube;
//     }
//     export class Control extends f.Node {
//         public static transformations: Transformations = Control.defineControls();
//         public fragment: Fragment;
//         constructor() {
//             super("Control");
//             this.addComponent(new f.ComponentTransform());
//         }
//         public static defineControls(): Transformations {
//             let controls: Transformations = {};
//             controls[f.KEYBOARD_CODE.ARROW_UP] = { rotation: f.Vector3.X(-1) };
//             controls[f.KEYBOARD_CODE.ARROW_DOWN] = { rotation: f.Vector3.X(1) };
//             controls[f.KEYBOARD_CODE.ARROW_LEFT] = { rotation: f.Vector3.Y(-1) };
//             controls[f.KEYBOARD_CODE.ARROW_RIGHT] = { rotation: f.Vector3.Y(1) };
//             controls[f.KEYBOARD_CODE.W] = { translation: f.Vector3.Z(-1) };
//             controls[f.KEYBOARD_CODE.S] = { translation: f.Vector3.Z(1) };
//             controls[f.KEYBOARD_CODE.A] = { translation: f.Vector3.X(-1) };
//             controls[f.KEYBOARD_CODE.D] = { translation: f.Vector3.X(1) };
//             controls[f.KEYBOARD_CODE.SHIFT_LEFT] = controls[f.KEYBOARD_CODE.SHIFT_RIGHT] = { translation: f.Vector3.Y(1) };
//             controls[f.KEYBOARD_CODE.CTRL_LEFT] = controls[f.KEYBOARD_CODE.CTRL_RIGHT] = { translation: f.Vector3.Y(-1) };
//             controls["mouseMoveUp"] = { translation: f.Vector3.Y(1)};
//             controls["mouseMoveDown"] = { translation: f.Vector3.Y(-1)};
//             controls["mouseMoveLeft"] = { translation: f.Vector3.X(-1)};
//             controls["mouseMoveRight"] = { translation: f.Vector3.X(1)};
//             return controls;
//         }
//         public setFragment(_fragment: Fragment): void {
//             for (let child of this.getChildren())
//                 this.removeChild(child);
//             this.appendChild(_fragment);
//             this.fragment = _fragment;
//         }
//         public move(_transformation: Transformation): void {
//             let mtxContainer: f.Matrix4x4 = this.cmpTransform.local;
//             let mtxFragment: f.Matrix4x4 = this.fragment.cmpTransform.local;
//             mtxFragment.rotate(_transformation.rotation, true);
//             mtxContainer.translate(_transformation.translation);
//         }
//         public checkCollisions(_transformation: Transformation): Collision[] {
//             let mtxContainer: f.Matrix4x4 = this.cmpTransform.local;
//             let mtxFragment: f.Matrix4x4 = this.fragment.cmpTransform.local;
//             let save: f.Mutator[] = [mtxContainer.getMutator(), mtxFragment.getMutator()];
//             mtxFragment.rotate(_transformation.rotation, true);
//             mtxContainer.translate(_transformation.translation);
//             f.RenderManager.update();
//             let collisions: Collision[] = [];
//             for (let cube of this.fragment.getChildren()) {
//                 let element: GridElement = grid.pull(cube.mtxWorld.translation);
//                 if (element)
//                     collisions.push({ element, cube });
//             }
//             mtxContainer.mutate(save[0]);
//             mtxFragment.mutate(save[1]);
//             return collisions;
//         }
//         public freeze(): void {
//             for (let cube of this.fragment.getChildren()) {
//                 let position: f.Vector3 = cube.mtxWorld.translation;
//                 cube.cmpTransform.local.translation = position;
//                 grid.push(position, new GridElement(cube));
//             }
//         }
//     }
// }
var L10_FudgeCraft_DetectCombos;
// namespace L10_FudgeCraft_DetectCombos {
//     import f = FudgeCore;
//     export interface Transformation {
//         translation?: f.Vector3;
//         rotation?: f.Vector3;
//     }
//     export interface Transformations {
//         [keycode: string]: Transformation;
//     }
//     export interface Collision {
//         element: GridElement;
//         cube: Cube;
//     }
//     export class Control extends f.Node {
//         public static transformations: Transformations = Control.defineControls();
//         public fragment: Fragment;
//         constructor() {
//             super("Control");
//             this.addComponent(new f.ComponentTransform());
//         }
//         public static defineControls(): Transformations {
//             let controls: Transformations = {};
//             controls[f.KEYBOARD_CODE.ARROW_UP] = { rotation: f.Vector3.X(-1) };
//             controls[f.KEYBOARD_CODE.ARROW_DOWN] = { rotation: f.Vector3.X(1) };
//             controls[f.KEYBOARD_CODE.ARROW_LEFT] = { rotation: f.Vector3.Y(-1) };
//             controls[f.KEYBOARD_CODE.ARROW_RIGHT] = { rotation: f.Vector3.Y(1) };
//             controls[f.KEYBOARD_CODE.W] = { translation: f.Vector3.Z(-1) };
//             controls[f.KEYBOARD_CODE.S] = { translation: f.Vector3.Z(1) };
//             controls[f.KEYBOARD_CODE.A] = { translation: f.Vector3.X(-1) };
//             controls[f.KEYBOARD_CODE.D] = { translation: f.Vector3.X(1) };
//             controls[f.KEYBOARD_CODE.SHIFT_LEFT] = controls[f.KEYBOARD_CODE.SHIFT_RIGHT] = { translation: f.Vector3.Y(1) };
//             controls[f.KEYBOARD_CODE.CTRL_LEFT] = controls[f.KEYBOARD_CODE.CTRL_RIGHT] = { translation: f.Vector3.Y(-1) };
//             controls["mouseMoveUp"] = { translation: f.Vector3.Y(1)};
//             controls["mouseMoveDown"] = { translation: f.Vector3.Y(-1)};
//             controls["mouseMoveLeft"] = { translation: f.Vector3.X(-1)};
//             controls["mouseMoveRight"] = { translation: f.Vector3.X(1)};
//             return controls;
//         }
//         public setFragment(_fragment: Fragment): void {
//             for (let child of this.getChildren())
//                 this.removeChild(child);
//             this.appendChild(_fragment);
//             this.fragment = _fragment;
//         }
//         public move(_transformation: Transformation): void {
//             let mtxContainer: f.Matrix4x4 = this.cmpTransform.local;
//             let mtxFragment: f.Matrix4x4 = this.fragment.cmpTransform.local;
//             mtxFragment.rotate(_transformation.rotation, true);
//             mtxContainer.translate(_transformation.translation);
//         }
//         public checkCollisions(_transformation: Transformation): Collision[] {
//             let mtxContainer: f.Matrix4x4 = this.cmpTransform.local;
//             let mtxFragment: f.Matrix4x4 = this.fragment.cmpTransform.local;
//             let save: f.Mutator[] = [mtxContainer.getMutator(), mtxFragment.getMutator()];
//             mtxFragment.rotate(_transformation.rotation, true);
//             mtxContainer.translate(_transformation.translation);
//             f.RenderManager.update();
//             let collisions: Collision[] = [];
//             for (let cube of this.fragment.getChildren()) {
//                 let element: GridElement = grid.pull(cube.mtxWorld.translation);
//                 if (element)
//                     collisions.push({ element, cube });
//             }
//             mtxContainer.mutate(save[0]);
//             mtxFragment.mutate(save[1]);
//             return collisions;
//         }
//         public freeze(): void {
//             for (let cube of this.fragment.getChildren()) {
//                 let position: f.Vector3 = cube.mtxWorld.translation;
//                 cube.cmpTransform.local.translation = position;
//                 grid.push(position, new GridElement(cube));
//             }
//         }
//     }
// }
(function (L10_FudgeCraft_DetectCombos) {
    var ƒ = FudgeCore;
    class Control extends ƒ.Node {
        constructor() {
            super("Control");
            this.addComponent(new ƒ.ComponentTransform());
        }
        static defineControls() {
            let controls = {};
            controls[ƒ.KEYBOARD_CODE.ARROW_UP] = { rotation: ƒ.Vector3.X(-1) };
            controls[ƒ.KEYBOARD_CODE.ARROW_DOWN] = { rotation: ƒ.Vector3.X(1) };
            controls[ƒ.KEYBOARD_CODE.ARROW_LEFT] = { rotation: ƒ.Vector3.Y(-1) };
            controls[ƒ.KEYBOARD_CODE.ARROW_RIGHT] = { rotation: ƒ.Vector3.Y(1) };
            controls[ƒ.KEYBOARD_CODE.W] = { translation: ƒ.Vector3.Z(-1) };
            controls[ƒ.KEYBOARD_CODE.S] = { translation: ƒ.Vector3.Z(1) };
            controls[ƒ.KEYBOARD_CODE.A] = { translation: ƒ.Vector3.X(-1) };
            controls[ƒ.KEYBOARD_CODE.D] = { translation: ƒ.Vector3.X(1) };
            controls[ƒ.KEYBOARD_CODE.SHIFT_LEFT] = controls[ƒ.KEYBOARD_CODE.SHIFT_RIGHT] = { translation: ƒ.Vector3.Y(1) };
            controls[ƒ.KEYBOARD_CODE.CTRL_LEFT] = controls[ƒ.KEYBOARD_CODE.CTRL_RIGHT] = { translation: ƒ.Vector3.Y(-1) };
            return controls;
        }
        setFragment(_fragment) {
            for (let child of this.getChildren())
                this.removeChild(child);
            this.appendChild(_fragment);
            this.fragment = _fragment;
        }
        move(_transformation) {
            let mtxContainer = this.cmpTransform.local;
            let mtxFragment = this.fragment.cmpTransform.local;
            mtxFragment.rotate(_transformation.rotation, true);
            mtxContainer.translate(_transformation.translation);
        }
        checkCollisions(_transformation) {
            let mtxContainer = this.cmpTransform.local;
            let mtxFragment = this.fragment.cmpTransform.local;
            let save = [mtxContainer.getMutator(), mtxFragment.getMutator()];
            mtxFragment.rotate(_transformation.rotation, true);
            mtxContainer.translate(_transformation.translation);
            ƒ.RenderManager.update();
            let collisions = [];
            for (let cube of this.fragment.getChildren()) {
                let element = L10_FudgeCraft_DetectCombos.grid.pull(cube.mtxWorld.translation);
                if (element)
                    collisions.push({ element, cube });
            }
            mtxContainer.mutate(save[0]);
            mtxFragment.mutate(save[1]);
            return collisions;
        }
        freeze() {
            let frozen = [];
            for (let cube of this.fragment.getChildren()) {
                let position = cube.mtxWorld.translation;
                cube.cmpTransform.local.translation = position;
                let element = new L10_FudgeCraft_DetectCombos.GridElement(cube);
                L10_FudgeCraft_DetectCombos.grid.push(position, element);
                frozen.push(element);
            }
            return frozen;
        }
    }
    Control.transformations = Control.defineControls();
    L10_FudgeCraft_DetectCombos.Control = Control;
})(L10_FudgeCraft_DetectCombos || (L10_FudgeCraft_DetectCombos = {}));
