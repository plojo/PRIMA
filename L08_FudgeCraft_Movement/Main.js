"use strict";
var L08_FudgeCraft_Movement;
(function (L08_FudgeCraft_Movement) {
    L08_FudgeCraft_Movement.f = FudgeCore;
    window.addEventListener("load", hndLoad);
    let viewport;
    let game;
    let rotate;
    let translate;
    let cmpCamera;
    let fragment;
    let grid = new L08_FudgeCraft_Movement.Grid();
    function hndLoad(_event) {
        const canvas = document.querySelector("canvas");
        L08_FudgeCraft_Movement.f.RenderManager.initialize(true);
        L08_FudgeCraft_Movement.f.Debug.log("Canvas", canvas);
        cmpCamera = new L08_FudgeCraft_Movement.f.ComponentCamera();
        cmpCamera.pivot.translate(new L08_FudgeCraft_Movement.f.Vector3(5, 15, 20));
        cmpCamera.pivot.lookAt(L08_FudgeCraft_Movement.f.Vector3.ZERO());
        game = new L08_FudgeCraft_Movement.f.Node("FudgeCraft");
        let cmpLight = new L08_FudgeCraft_Movement.f.ComponentLight(new L08_FudgeCraft_Movement.f.LightDirectional(L08_FudgeCraft_Movement.f.Color.WHITE));
        cmpLight.pivot.lookAt(new L08_FudgeCraft_Movement.f.Vector3(0.5, 1, 0.8));
        game.addComponent(cmpLight);
        viewport = new L08_FudgeCraft_Movement.f.Viewport();
        viewport.initialize("Viewport", game, cmpCamera, canvas);
        L08_FudgeCraft_Movement.f.Debug.log("Viewport", viewport);
        let cube = new L08_FudgeCraft_Movement.Cube(L08_FudgeCraft_Movement.CUBE_TYPE.GRAY, new L08_FudgeCraft_Movement.f.Vector3(0, 0, 0));
        game.appendChild(cube);
        grid.setCube(cube);
        fragment = new L08_FudgeCraft_Movement.Fragment(0);
        fragment.cmpTransform.local.translateZ(-1);
        fragment.cmpTransform.local.rotateZ(90);
        game.appendChild(fragment);
        grid.setFragment(fragment);
        fragment = new L08_FudgeCraft_Movement.Fragment(4);
        fragment.cmpTransform.local.translateX(1);
        fragment.cmpTransform.local.rotateY(180);
        game.appendChild(fragment);
        grid.setFragment(fragment);
        fragment = new L08_FudgeCraft_Movement.Fragment(3);
        fragment.cmpTransform.local.translate(new L08_FudgeCraft_Movement.f.Vector3(0, 1, -1));
        fragment.cmpTransform.local.rotate(new L08_FudgeCraft_Movement.f.Vector3(90, 0, 0));
        game.appendChild(fragment);
        rotate = fragment.cmpTransform.local.rotation;
        translate = fragment.cmpTransform.local.translation;
        viewport.draw();
        L08_FudgeCraft_Movement.f.Debug.log("Game", game);
        window.addEventListener("keydown", hndKeyDown);
    }
    function hndKeyDown(_event) {
        let tmpRotation = rotate.copy;
        let tmpTranslation = translate.copy;
        switch (_event.code) {
            case L08_FudgeCraft_Movement.f.KEYBOARD_CODE.ARROW_UP:
                rotate.add(L08_FudgeCraft_Movement.f.Vector3.X(-90));
                break;
            case L08_FudgeCraft_Movement.f.KEYBOARD_CODE.ARROW_DOWN:
                rotate.add(L08_FudgeCraft_Movement.f.Vector3.X(90));
                break;
            case L08_FudgeCraft_Movement.f.KEYBOARD_CODE.ARROW_LEFT:
                rotate.add(L08_FudgeCraft_Movement.f.Vector3.Y(-90));
                break;
            case L08_FudgeCraft_Movement.f.KEYBOARD_CODE.ARROW_RIGHT:
                rotate.add(L08_FudgeCraft_Movement.f.Vector3.Y(90));
                break;
            case L08_FudgeCraft_Movement.f.KEYBOARD_CODE.A:
                cmpCamera.pivot.translation = new L08_FudgeCraft_Movement.f.Vector3(-5, 15, -20);
                cmpCamera.pivot.lookAt(L08_FudgeCraft_Movement.f.Vector3.ZERO());
                break;
            case L08_FudgeCraft_Movement.f.KEYBOARD_CODE.D:
                cmpCamera.pivot.translation = new L08_FudgeCraft_Movement.f.Vector3(5, 15, 20);
                cmpCamera.pivot.lookAt(L08_FudgeCraft_Movement.f.Vector3.ZERO());
                break;
            case L08_FudgeCraft_Movement.f.KEYBOARD_CODE.W:
                translate.add(L08_FudgeCraft_Movement.f.Vector3.Y(1));
                break;
            case L08_FudgeCraft_Movement.f.KEYBOARD_CODE.S:
                translate.add(L08_FudgeCraft_Movement.f.Vector3.Y(-1));
                break;
        }
        fragment.cmpTransform.local.rotation = rotate;
        fragment.cmpTransform.local.translation = translate;
        for (let cube of fragment.getChildren()) {
            if (grid.hasCube(cube.position())) {
                rotate = tmpRotation;
                translate = tmpTranslation;
                fragment.cmpTransform.local.rotation = tmpRotation;
                fragment.cmpTransform.local.translation = tmpTranslation;
                break;
            }
        }
        L08_FudgeCraft_Movement.f.RenderManager.update();
        viewport.draw();
    }
})(L08_FudgeCraft_Movement || (L08_FudgeCraft_Movement = {}));
//# sourceMappingURL=Main.js.map