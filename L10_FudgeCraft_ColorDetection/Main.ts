namespace L09_FudgeCraft_ColorDetection {
    export import f = FudgeCore;

    window.addEventListener("load", hndLoad);

    export let game: f.Node = new f.Node("FudgeCraft");
    export let grid: Grid = new Grid();
    let fragmentControl: Control = new Control();
    let cameraControl: CameraControl = new CameraControl(10, 40);
    let viewport: f.Viewport;

    function hndLoad(_event: Event): void {
        const canvas: HTMLCanvasElement = document.querySelector("canvas");
        f.RenderManager.initialize(true);
        f.Debug.log("Canvas", canvas);

        let cmpLight: f.ComponentLight = new f.ComponentLight(new f.LightDirectional(f.Color.WHITE));
        cmpLight.pivot.lookAt(new f.Vector3(0.5, 1, 0.8));
        game.addComponent(cmpLight);
        let cmpLightAmbient: f.ComponentLight = new f.ComponentLight(new f.LightAmbient(f.Color.DARK_GREY));
        game.addComponent(cmpLightAmbient);
        
        viewport = new f.Viewport();
        viewport.initialize("Viewport", game, cameraControl.cmpCamera, canvas);
        f.Debug.log("Viewport", viewport);
        viewport.draw();
        
        startRandomFragment();
        game.appendChild(fragmentControl);
        
        game.appendChild(cameraControl);

        viewport.draw();
        f.Debug.log("Game", game);
        
        window.addEventListener("keydown", hndKeyDown);
        window.addEventListener("mousemove", hndMouseMove);
        window.addEventListener("wheel", hndMousewheel);
        
        //test();
    }

    function hndMousewheel(_event: MouseWheelEvent): void {
        cameraControl.translate(_event.deltaY * 0.1);
        f.RenderManager.update();
        viewport.draw();
    }

    function hndMouseMove(_event: MouseEvent): void {
        cameraControl.rotateX(_event.movementY);
        cameraControl.rotateY(_event.movementX);
        f.RenderManager.update();
        viewport.draw();
    }

    function hndKeyDown(_event: KeyboardEvent): void {
        if (_event.code == f.KEYBOARD_CODE.SPACE) {
            fragmentControl.freeze();
            let array: Array<GridElement> = [];
            fragmentControl.fragment.getChildren().forEach(element => {
                array.push(grid.pull(element.mtxWorld.translation));
            });
            console.log(grid.detectCombos(array));
            startRandomFragment();
        }

        let transformation: Transformation = Control.transformations[_event.code];
        if (transformation)
            moveFragment(transformation);

        // ƒ.RenderManager.update();
        viewport.draw();
    }

    function moveFragment(_transformation: Transformation): void {
        let animationSteps: number = 10;
        let fullRotation: number = 90;
        let fullTranslation: number = 1;
        let move: Transformation = {
            rotation: _transformation.rotation ? f.Vector3.SCALE(_transformation.rotation, fullRotation) : new f.Vector3(),
            translation: _transformation.translation ? f.Vector3.SCALE(_transformation.translation, fullTranslation) : new f.Vector3()
        };

        let timers: f.Timers = f.Time.game.getTimers();
        if (Object.keys(timers).length > 0)
            return;

        let collisions: GridElement[] = fragmentControl.checkCollisions(move);
        if (collisions.length > 0)
            return;

        move.translation.scale(1 / animationSteps);
        move.rotation.scale(1 / animationSteps);

        f.Time.game.setTimer(10, animationSteps, function (): void {
            fragmentControl.move(move);
            // ƒ.RenderManager.update();
            viewport.draw();
        });
    }

    export function startRandomFragment(): void {
        let fragment: Fragment = Fragment.getRandom();
        fragmentControl.cmpTransform.local = f.Matrix4x4.IDENTITY;
        fragmentControl.setFragment(fragment);
    }
}