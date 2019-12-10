"use strict";
var L09_FudgeCraft_ColorDetection;
(function (L09_FudgeCraft_ColorDetection) {
    L09_FudgeCraft_ColorDetection.f = FudgeCore;
    window.addEventListener("load", hndLoad);
    L09_FudgeCraft_ColorDetection.game = new L09_FudgeCraft_ColorDetection.f.Node("FudgeCraft");
    L09_FudgeCraft_ColorDetection.grid = new L09_FudgeCraft_ColorDetection.Grid();
    let fragmentControl = new L09_FudgeCraft_ColorDetection.Control();
    let cameraControl = new L09_FudgeCraft_ColorDetection.CameraControl(10, 40);
    let viewport;
    function hndLoad(_event) {
        const canvas = document.querySelector("canvas");
        L09_FudgeCraft_ColorDetection.f.RenderManager.initialize(true);
        L09_FudgeCraft_ColorDetection.f.Debug.log("Canvas", canvas);
        let cmpLight = new L09_FudgeCraft_ColorDetection.f.ComponentLight(new L09_FudgeCraft_ColorDetection.f.LightDirectional(L09_FudgeCraft_ColorDetection.f.Color.WHITE));
        cmpLight.pivot.lookAt(new L09_FudgeCraft_ColorDetection.f.Vector3(0.5, 1, 0.8));
        L09_FudgeCraft_ColorDetection.game.addComponent(cmpLight);
        let cmpLightAmbient = new L09_FudgeCraft_ColorDetection.f.ComponentLight(new L09_FudgeCraft_ColorDetection.f.LightAmbient(L09_FudgeCraft_ColorDetection.f.Color.DARK_GREY));
        L09_FudgeCraft_ColorDetection.game.addComponent(cmpLightAmbient);
        viewport = new L09_FudgeCraft_ColorDetection.f.Viewport();
        viewport.initialize("Viewport", L09_FudgeCraft_ColorDetection.game, cameraControl.cmpCamera, canvas);
        L09_FudgeCraft_ColorDetection.f.Debug.log("Viewport", viewport);
        viewport.draw();
        startRandomFragment();
        L09_FudgeCraft_ColorDetection.game.appendChild(fragmentControl);
        L09_FudgeCraft_ColorDetection.game.appendChild(cameraControl);
        viewport.draw();
        L09_FudgeCraft_ColorDetection.f.Debug.log("Game", L09_FudgeCraft_ColorDetection.game);
        window.addEventListener("keydown", hndKeyDown);
        window.addEventListener("mousemove", hndMouseMove);
        window.addEventListener("wheel", hndMousewheel);
        //test();
    }
    function hndMousewheel(_event) {
        cameraControl.translate(_event.deltaY * 0.1);
        L09_FudgeCraft_ColorDetection.f.RenderManager.update();
        viewport.draw();
    }
    function hndMouseMove(_event) {
        cameraControl.rotateX(_event.movementY);
        cameraControl.rotateY(_event.movementX);
        L09_FudgeCraft_ColorDetection.f.RenderManager.update();
        viewport.draw();
    }
    function hndKeyDown(_event) {
        if (_event.code == L09_FudgeCraft_ColorDetection.f.KEYBOARD_CODE.SPACE) {
            fragmentControl.freeze();
            let array = [];
            fragmentControl.fragment.getChildren().forEach(element => {
                array.push(L09_FudgeCraft_ColorDetection.grid.pull(element.mtxWorld.translation));
            });
            console.log(L09_FudgeCraft_ColorDetection.grid.detectCombos(array));
            startRandomFragment();
        }
        let transformation = L09_FudgeCraft_ColorDetection.Control.transformations[_event.code];
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
            rotation: _transformation.rotation ? L09_FudgeCraft_ColorDetection.f.Vector3.SCALE(_transformation.rotation, fullRotation) : new L09_FudgeCraft_ColorDetection.f.Vector3(),
            translation: _transformation.translation ? L09_FudgeCraft_ColorDetection.f.Vector3.SCALE(_transformation.translation, fullTranslation) : new L09_FudgeCraft_ColorDetection.f.Vector3()
        };
        let timers = L09_FudgeCraft_ColorDetection.f.Time.game.getTimers();
        if (Object.keys(timers).length > 0)
            return;
        let collisions = fragmentControl.checkCollisions(move);
        if (collisions.length > 0)
            return;
        move.translation.scale(1 / animationSteps);
        move.rotation.scale(1 / animationSteps);
        L09_FudgeCraft_ColorDetection.f.Time.game.setTimer(10, animationSteps, function () {
            fragmentControl.move(move);
            // ƒ.RenderManager.update();
            viewport.draw();
        });
    }
    function startRandomFragment() {
        let fragment = L09_FudgeCraft_ColorDetection.Fragment.getRandom();
        fragmentControl.cmpTransform.local = L09_FudgeCraft_ColorDetection.f.Matrix4x4.IDENTITY;
        fragmentControl.setFragment(fragment);
    }
    L09_FudgeCraft_ColorDetection.startRandomFragment = startRandomFragment;
})(L09_FudgeCraft_ColorDetection || (L09_FudgeCraft_ColorDetection = {}));
//# sourceMappingURL=Main.js.map