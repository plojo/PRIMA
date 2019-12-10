"use strict";
var L09_FudgeCraft_Camera;
(function (L09_FudgeCraft_Camera) {
    L09_FudgeCraft_Camera.f = FudgeCore;
    window.addEventListener("load", hndLoad);
    L09_FudgeCraft_Camera.game = new L09_FudgeCraft_Camera.f.Node("FudgeCraft");
    L09_FudgeCraft_Camera.grid = new L09_FudgeCraft_Camera.Grid();
    let fragmentControl = new L09_FudgeCraft_Camera.Control();
    let cameraControl = new L09_FudgeCraft_Camera.CameraControl(10, 40);
    let viewport;
    function hndLoad(_event) {
        const canvas = document.querySelector("canvas");
        L09_FudgeCraft_Camera.f.RenderManager.initialize(true);
        L09_FudgeCraft_Camera.f.Debug.log("Canvas", canvas);
        let cmpLight = new L09_FudgeCraft_Camera.f.ComponentLight(new L09_FudgeCraft_Camera.f.LightDirectional(L09_FudgeCraft_Camera.f.Color.WHITE));
        cmpLight.pivot.lookAt(new L09_FudgeCraft_Camera.f.Vector3(0.5, 1, 0.8));
        L09_FudgeCraft_Camera.game.addComponent(cmpLight);
        let cmpLightAmbient = new L09_FudgeCraft_Camera.f.ComponentLight(new L09_FudgeCraft_Camera.f.LightAmbient(L09_FudgeCraft_Camera.f.Color.DARK_GREY));
        L09_FudgeCraft_Camera.game.addComponent(cmpLightAmbient);
        viewport = new L09_FudgeCraft_Camera.f.Viewport();
        viewport.initialize("Viewport", L09_FudgeCraft_Camera.game, cameraControl.cmpCamera, canvas);
        L09_FudgeCraft_Camera.f.Debug.log("Viewport", viewport);
        viewport.draw();
        startRandomFragment();
        L09_FudgeCraft_Camera.game.appendChild(fragmentControl);
        L09_FudgeCraft_Camera.game.appendChild(cameraControl);
        viewport.draw();
        L09_FudgeCraft_Camera.f.Debug.log("Game", L09_FudgeCraft_Camera.game);
        window.addEventListener("keydown", hndKeyDown);
        window.addEventListener("mousemove", hndMouseMove);
        window.addEventListener("wheel", hndMousewheel);
        //test();
    }
    function hndMousewheel(_event) {
        cameraControl.translate(_event.deltaY * 0.1);
        L09_FudgeCraft_Camera.f.RenderManager.update();
        viewport.draw();
    }
    function hndMouseMove(_event) {
        cameraControl.rotateX(_event.movementY);
        cameraControl.rotateY(_event.movementX);
        L09_FudgeCraft_Camera.f.RenderManager.update();
        viewport.draw();
    }
    function hndKeyDown(_event) {
        if (_event.code == L09_FudgeCraft_Camera.f.KEYBOARD_CODE.SPACE) {
            fragmentControl.freeze();
            startRandomFragment();
        }
        let transformation = L09_FudgeCraft_Camera.Control.transformations[_event.code];
        if (transformation)
            moveFragment(transformation);
        // ƒ.RenderManager.update();
        viewport.draw();
    }
    function moveFragment(_transformation) {
        let animationSteps = 10;
        let fullRotation = 90;
        let fullTranslation = 1;
        let move = {
            rotation: _transformation.rotation ? L09_FudgeCraft_Camera.f.Vector3.SCALE(_transformation.rotation, fullRotation) : new L09_FudgeCraft_Camera.f.Vector3(),
            translation: _transformation.translation ? L09_FudgeCraft_Camera.f.Vector3.SCALE(_transformation.translation, fullTranslation) : new L09_FudgeCraft_Camera.f.Vector3()
        };
        let timers = L09_FudgeCraft_Camera.f.Time.game.getTimers();
        if (Object.keys(timers).length > 0)
            return;
        let collisions = fragmentControl.checkCollisions(move);
        if (collisions.length > 0)
            return;
        move.translation.scale(1 / animationSteps);
        move.rotation.scale(1 / animationSteps);
        L09_FudgeCraft_Camera.f.Time.game.setTimer(10, animationSteps, function () {
            fragmentControl.move(move);
            // ƒ.RenderManager.update();
            viewport.draw();
        });
    }
    function startRandomFragment() {
        let fragment = L09_FudgeCraft_Camera.Fragment.getRandom();
        fragmentControl.cmpTransform.local = L09_FudgeCraft_Camera.f.Matrix4x4.IDENTITY;
        fragmentControl.setFragment(fragment);
    }
    L09_FudgeCraft_Camera.startRandomFragment = startRandomFragment;
})(L09_FudgeCraft_Camera || (L09_FudgeCraft_Camera = {}));
//# sourceMappingURL=Main.js.map