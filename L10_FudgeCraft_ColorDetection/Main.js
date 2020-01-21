"use strict";
// namespace L09_FudgeCraft_ColorDetection {
//     export import f = FudgeCore;
//     window.addEventListener("load", hndLoad);
//     export let game: f.Node = new f.Node("FudgeCraft");
//     export let grid: Grid = new Grid();
//     let fragmentControl: Control = new Control();
//     let cameraControl: CameraControl = new CameraControl(10, 40);
//     let viewport: f.Viewport;
//     function hndLoad(_event: Event): void {
//         const canvas: HTMLCanvasElement = document.querySelector("canvas");
//         f.RenderManager.initialize(true);
//         f.Debug.log("Canvas", canvas);
//         let cmpLight: f.ComponentLight = new f.ComponentLight(new f.LightDirectional(f.Color.CSS("WHITE", 1)));
//         cmpLight.pivot.lookAt(new f.Vector3(0.5, 1, 0.8));
//         game.addComponent(cmpLight);
//         let cmpLightAmbient: f.ComponentLight = new f.ComponentLight(new f.LightAmbient(new ƒ.Color(0.25, 0.25, 0.25, 1)));
//         game.addComponent(cmpLightAmbient);
//         viewport = new f.Viewport();
//         viewport.initialize("Viewport", game, cameraControl.cmpCamera, canvas);
//         f.Debug.log("Viewport", viewport);
//         viewport.draw();
//         startRandomFragment();
//         game.appendChild(fragmentControl);
//         game.appendChild(cameraControl);
//         viewport.draw();
//         f.Debug.log("Game", game);
//         window.addEventListener("keydown", hndKeyDown);
//         window.addEventListener("mousemove", hndMouseMove);
//         window.addEventListener("wheel", hndMousewheel);
//         //test();
//     }
//     function hndMousewheel(_event: MouseWheelEvent): void {
//         cameraControl.translate(_event.deltaY * 0.1);
//         f.RenderManager.update();
//         viewport.draw();
//     }
//     function hndMouseMove(_event: MouseEvent): void {
//         cameraControl.rotateX(_event.movementY);
//         cameraControl.rotateY(_event.movementX);
//         f.RenderManager.update();
//         viewport.draw();
//     }
//     function hndKeyDown(_event: KeyboardEvent): void {
//         if (_event.code == f.KEYBOARD_CODE.SPACE) {
//             fragmentControl.freeze();
//             let array: Array<GridElement> = [];
//             fragmentControl.fragment.getChildren().forEach(element => {
//                 array.push(grid.pull(element.mtxWorld.translation));
//             });
//             console.log(new Combos(array).found);
//             startRandomFragment();
//         }
//         let transformation: Transformation = Control.transformations[_event.code];
//         if (transformation)
//             moveFragment(transformation);
//         // ƒ.RenderManager.update();
//         viewport.draw();
//     }
//     function moveFragment(_transformation: Transformation): void {
//         let animationSteps: number = 10;
//         let fullRotation: number = 90;
//         let fullTranslation: number = 1;
//         let move: Transformation = {
//             rotation: _transformation.rotation ? f.Vector3.SCALE(_transformation.rotation, fullRotation) : new f.Vector3(),
//             translation: _transformation.translation ? f.Vector3.SCALE(_transformation.translation, fullTranslation) : new f.Vector3()
//         };
//         let timers: f.Timers = f.Time.game.getTimers();
//         if (Object.keys(timers).length > 0)
//             return;
//         let collisions: GridElement[] = fragmentControl.checkCollisions(move);
//         if (collisions.length > 0)
//             return;
//         move.translation.scale(1 / animationSteps);
//         move.rotation.scale(1 / animationSteps);
//         f.Time.game.setTimer(10, animationSteps, function (): void {
//             fragmentControl.move(move);
//             // ƒ.RenderManager.update();
//             viewport.draw();
//         });
//     }
//     export function startRandomFragment(): void {
//         let fragment: Fragment = Fragment.getRandom();
//         fragmentControl.cmpTransform.local = f.Matrix4x4.IDENTITY;
//         fragmentControl.setFragment(fragment);
//     }
// }
var L10_FudgeCraft_DetectCombos;
// namespace L09_FudgeCraft_ColorDetection {
//     export import f = FudgeCore;
//     window.addEventListener("load", hndLoad);
//     export let game: f.Node = new f.Node("FudgeCraft");
//     export let grid: Grid = new Grid();
//     let fragmentControl: Control = new Control();
//     let cameraControl: CameraControl = new CameraControl(10, 40);
//     let viewport: f.Viewport;
//     function hndLoad(_event: Event): void {
//         const canvas: HTMLCanvasElement = document.querySelector("canvas");
//         f.RenderManager.initialize(true);
//         f.Debug.log("Canvas", canvas);
//         let cmpLight: f.ComponentLight = new f.ComponentLight(new f.LightDirectional(f.Color.CSS("WHITE", 1)));
//         cmpLight.pivot.lookAt(new f.Vector3(0.5, 1, 0.8));
//         game.addComponent(cmpLight);
//         let cmpLightAmbient: f.ComponentLight = new f.ComponentLight(new f.LightAmbient(new ƒ.Color(0.25, 0.25, 0.25, 1)));
//         game.addComponent(cmpLightAmbient);
//         viewport = new f.Viewport();
//         viewport.initialize("Viewport", game, cameraControl.cmpCamera, canvas);
//         f.Debug.log("Viewport", viewport);
//         viewport.draw();
//         startRandomFragment();
//         game.appendChild(fragmentControl);
//         game.appendChild(cameraControl);
//         viewport.draw();
//         f.Debug.log("Game", game);
//         window.addEventListener("keydown", hndKeyDown);
//         window.addEventListener("mousemove", hndMouseMove);
//         window.addEventListener("wheel", hndMousewheel);
//         //test();
//     }
//     function hndMousewheel(_event: MouseWheelEvent): void {
//         cameraControl.translate(_event.deltaY * 0.1);
//         f.RenderManager.update();
//         viewport.draw();
//     }
//     function hndMouseMove(_event: MouseEvent): void {
//         cameraControl.rotateX(_event.movementY);
//         cameraControl.rotateY(_event.movementX);
//         f.RenderManager.update();
//         viewport.draw();
//     }
//     function hndKeyDown(_event: KeyboardEvent): void {
//         if (_event.code == f.KEYBOARD_CODE.SPACE) {
//             fragmentControl.freeze();
//             let array: Array<GridElement> = [];
//             fragmentControl.fragment.getChildren().forEach(element => {
//                 array.push(grid.pull(element.mtxWorld.translation));
//             });
//             console.log(new Combos(array).found);
//             startRandomFragment();
//         }
//         let transformation: Transformation = Control.transformations[_event.code];
//         if (transformation)
//             moveFragment(transformation);
//         // ƒ.RenderManager.update();
//         viewport.draw();
//     }
//     function moveFragment(_transformation: Transformation): void {
//         let animationSteps: number = 10;
//         let fullRotation: number = 90;
//         let fullTranslation: number = 1;
//         let move: Transformation = {
//             rotation: _transformation.rotation ? f.Vector3.SCALE(_transformation.rotation, fullRotation) : new f.Vector3(),
//             translation: _transformation.translation ? f.Vector3.SCALE(_transformation.translation, fullTranslation) : new f.Vector3()
//         };
//         let timers: f.Timers = f.Time.game.getTimers();
//         if (Object.keys(timers).length > 0)
//             return;
//         let collisions: GridElement[] = fragmentControl.checkCollisions(move);
//         if (collisions.length > 0)
//             return;
//         move.translation.scale(1 / animationSteps);
//         move.rotation.scale(1 / animationSteps);
//         f.Time.game.setTimer(10, animationSteps, function (): void {
//             fragmentControl.move(move);
//             // ƒ.RenderManager.update();
//             viewport.draw();
//         });
//     }
//     export function startRandomFragment(): void {
//         let fragment: Fragment = Fragment.getRandom();
//         fragmentControl.cmpTransform.local = f.Matrix4x4.IDENTITY;
//         fragmentControl.setFragment(fragment);
//     }
// }
(function (L10_FudgeCraft_DetectCombos) {
    L10_FudgeCraft_DetectCombos.f = FudgeCore;
    window.addEventListener("load", hndLoad);
    L10_FudgeCraft_DetectCombos.game = new L10_FudgeCraft_DetectCombos.f.Node("FudgeCraft");
    L10_FudgeCraft_DetectCombos.grid = new L10_FudgeCraft_DetectCombos.Grid();
    let control = new L10_FudgeCraft_DetectCombos.Control();
    let viewport;
    let camera;
    let speedCameraRotation = 0.2;
    let speedCameraTranslation = 0.02;
    function hndLoad(_event) {
        const canvas = document.querySelector("canvas");
        L10_FudgeCraft_DetectCombos.f.RenderManager.initialize(true);
        L10_FudgeCraft_DetectCombos.f.Debug.log("Canvas", canvas);
        // enable unlimited mouse-movement (user needs to click on canvas first)
        canvas.addEventListener("click", canvas.requestPointerLock);
        // set lights
        let cmpLight = new L10_FudgeCraft_DetectCombos.f.ComponentLight(new L10_FudgeCraft_DetectCombos.f.LightDirectional(L10_FudgeCraft_DetectCombos.f.Color.CSS("WHITE", 1)));
        cmpLight.pivot.lookAt(new L10_FudgeCraft_DetectCombos.f.Vector3(0.5, 1, 0.8));
        // game.addComponent(cmpLight);
        let cmpLightAmbient = new L10_FudgeCraft_DetectCombos.f.ComponentLight(new L10_FudgeCraft_DetectCombos.f.LightAmbient(new L10_FudgeCraft_DetectCombos.f.Color(0.25, 0.25, 0.25, 1)));
        L10_FudgeCraft_DetectCombos.game.addComponent(cmpLightAmbient);
        // setup orbiting camera
        camera = new L10_FudgeCraft_DetectCombos.CameraOrbit(75);
        L10_FudgeCraft_DetectCombos.game.appendChild(camera);
        camera.setRotationX(-20);
        camera.setRotationY(20);
        camera.cmpCamera.getContainer().addComponent(cmpLight);
        // setup viewport
        viewport = new L10_FudgeCraft_DetectCombos.f.Viewport();
        viewport.initialize("Viewport", L10_FudgeCraft_DetectCombos.game, camera.cmpCamera, canvas);
        L10_FudgeCraft_DetectCombos.f.Debug.log("Viewport", viewport);
        // setup event handling
        viewport.activatePointerEvent("\u0192pointermove" /* MOVE */, true);
        viewport.activateWheelEvent("\u0192wheel" /* WHEEL */, true);
        viewport.addEventListener("\u0192pointermove" /* MOVE */, hndPointerMove);
        viewport.addEventListener("\u0192wheel" /* WHEEL */, hndWheelMove);
        window.addEventListener("keydown", hndKeyDown);
        L10_FudgeCraft_DetectCombos.game.appendChild(control);
        startGame();
        // startTests();
        updateDisplay();
        L10_FudgeCraft_DetectCombos.f.Debug.log("Game", L10_FudgeCraft_DetectCombos.game);
    }
    function startGame() {
        L10_FudgeCraft_DetectCombos.grid.push(L10_FudgeCraft_DetectCombos.f.Vector3.ZERO(), new L10_FudgeCraft_DetectCombos.GridElement(new L10_FudgeCraft_DetectCombos.Cube(L10_FudgeCraft_DetectCombos.CUBE_TYPE.GRAY, L10_FudgeCraft_DetectCombos.f.Vector3.ZERO())));
        startRandomFragment();
    }
    function updateDisplay() {
        viewport.draw();
    }
    L10_FudgeCraft_DetectCombos.updateDisplay = updateDisplay;
    function hndPointerMove(_event) {
        // console.log(_event.movementX, _event.movementY);
        camera.rotateY(_event.movementX * speedCameraRotation);
        camera.rotateX(_event.movementY * speedCameraRotation);
        updateDisplay();
    }
    function hndWheelMove(_event) {
        camera.translate(_event.deltaY * speedCameraTranslation);
        updateDisplay();
    }
    function hndKeyDown(_event) {
        if (_event.code == L10_FudgeCraft_DetectCombos.f.KEYBOARD_CODE.SPACE) {
            let frozen = control.freeze();
            let combos = new L10_FudgeCraft_DetectCombos.Combos(frozen);
            handleCombos(combos);
            startRandomFragment();
        }
        let transformation = L10_FudgeCraft_DetectCombos.Control.transformations[_event.code];
        if (transformation)
            move(transformation);
        updateDisplay();
    }
    function handleCombos(_combos) {
        for (let combo of _combos.found)
            if (combo.length > 2)
                for (let element of combo) {
                    let mtxLocal = element.cube.cmpTransform.local;
                    console.log(element.cube.name, mtxLocal.translation.getMutator());
                    // mtxLocal.rotateX(45);
                    // mtxLocal.rotateY(45);
                    // mtxLocal.rotateY(45, true);
                    mtxLocal.scale(L10_FudgeCraft_DetectCombos.f.Vector3.ONE(0.5));
                }
    }
    function move(_transformation) {
        let animationSteps = 10;
        let fullRotation = 90;
        let fullTranslation = 1;
        let move = {
            rotation: _transformation.rotation ? L10_FudgeCraft_DetectCombos.f.Vector3.SCALE(_transformation.rotation, fullRotation) : new L10_FudgeCraft_DetectCombos.f.Vector3(),
            translation: _transformation.translation ? L10_FudgeCraft_DetectCombos.f.Vector3.SCALE(_transformation.translation, fullTranslation) : new L10_FudgeCraft_DetectCombos.f.Vector3()
        };
        let timers = L10_FudgeCraft_DetectCombos.f.Time.game.getTimers();
        if (Object.keys(timers).length > 0)
            return;
        let collisions = control.checkCollisions(move);
        if (collisions.length > 0)
            return;
        move.translation.scale(1 / animationSteps);
        move.rotation.scale(1 / animationSteps);
        L10_FudgeCraft_DetectCombos.f.Time.game.setTimer(10, animationSteps, function () {
            control.move(move);
            updateDisplay();
        });
    }
    function startRandomFragment() {
        let fragment = L10_FudgeCraft_DetectCombos.Fragment.getRandom();
        control.cmpTransform.local = L10_FudgeCraft_DetectCombos.f.Matrix4x4.IDENTITY;
        control.setFragment(fragment);
    }
    L10_FudgeCraft_DetectCombos.startRandomFragment = startRandomFragment;
})(L10_FudgeCraft_DetectCombos || (L10_FudgeCraft_DetectCombos = {}));
