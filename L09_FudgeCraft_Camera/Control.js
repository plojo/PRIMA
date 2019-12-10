"use strict";
var L09_FudgeCraft_Camera;
(function (L09_FudgeCraft_Camera) {
    var f = FudgeCore;
    class Control extends f.Node {
        constructor() {
            super("Control");
            this.addComponent(new f.ComponentTransform());
        }
        static defineControls() {
            let controls = {};
            controls[f.KEYBOARD_CODE.ARROW_UP] = { rotation: f.Vector3.X(-1) };
            controls[f.KEYBOARD_CODE.ARROW_DOWN] = { rotation: f.Vector3.X(1) };
            controls[f.KEYBOARD_CODE.ARROW_LEFT] = { rotation: f.Vector3.Y(-1) };
            controls[f.KEYBOARD_CODE.ARROW_RIGHT] = { rotation: f.Vector3.Y(1) };
            controls[f.KEYBOARD_CODE.W] = { translation: f.Vector3.Z(-1) };
            controls[f.KEYBOARD_CODE.S] = { translation: f.Vector3.Z(1) };
            controls[f.KEYBOARD_CODE.A] = { translation: f.Vector3.X(-1) };
            controls[f.KEYBOARD_CODE.D] = { translation: f.Vector3.X(1) };
            controls[f.KEYBOARD_CODE.SHIFT_LEFT] = controls[f.KEYBOARD_CODE.SHIFT_RIGHT] = { translation: f.Vector3.Y(1) };
            controls[f.KEYBOARD_CODE.CTRL_LEFT] = controls[f.KEYBOARD_CODE.CTRL_RIGHT] = { translation: f.Vector3.Y(-1) };
            controls["mouseMoveUp"] = { translation: f.Vector3.Y(1) };
            controls["mouseMoveDown"] = { translation: f.Vector3.Y(-1) };
            controls["mouseMoveLeft"] = { translation: f.Vector3.X(-1) };
            controls["mouseMoveRight"] = { translation: f.Vector3.X(1) };
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
            f.RenderManager.update();
            let collisions = [];
            for (let cube of this.fragment.getChildren()) {
                let element = L09_FudgeCraft_Camera.grid.pull(cube.mtxWorld.translation);
                if (element)
                    collisions.push({ element, cube });
            }
            mtxContainer.mutate(save[0]);
            mtxFragment.mutate(save[1]);
            return collisions;
        }
        freeze() {
            for (let cube of this.fragment.getChildren()) {
                let position = cube.mtxWorld.translation;
                cube.cmpTransform.local.translation = position;
                L09_FudgeCraft_Camera.grid.push(position, new L09_FudgeCraft_Camera.GridElement(cube));
            }
        }
    }
    Control.transformations = Control.defineControls();
    L09_FudgeCraft_Camera.Control = Control;
})(L09_FudgeCraft_Camera || (L09_FudgeCraft_Camera = {}));
//# sourceMappingURL=Control.js.map