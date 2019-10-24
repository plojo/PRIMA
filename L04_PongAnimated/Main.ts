namespace L03_PongAnimated {

    interface KeyPressed {
        [code: string]: boolean;
    }

    import f = FudgeCore;
    window.addEventListener("load", hndLoad);
    export let viewport: f.Viewport;

    let ball: f.Node = new f.Node("Ball");
    let paddleLeft: f.Node = new f.Node("PaddleLeft");
    let paddleRight: f.Node = new f.Node("PaddleRight");
    let keysPressed: KeyPressed = {};

    function hndLoad(_event: Event): void {
        const canvas: HTMLCanvasElement = document.querySelector("canvas");
        f.RenderManager.initialize();
        console.log(canvas);

        let pong: f.Node = createPong();

        let zPos: number = 42;
        let cmpCamera: f.ComponentCamera = new f.ComponentCamera();
        cmpCamera.pivot.translateZ(zPos);

        paddleLeft.cmpTransform.local.translateX(-20);
        (<f.ComponentMesh>paddleLeft.getComponent(f.ComponentMesh)).pivot.scaleY(4);

        paddleRight.cmpTransform.local.translateX(20);
        (<f.ComponentMesh>paddleRight.getComponent(f.ComponentMesh)).pivot.scaleY(4);

        viewport = new f.Viewport();
        viewport.initialize("Viewport", pong, cmpCamera, canvas);
        f.Debug.log(viewport);

        window.addEventListener("keyup", hndKeyup);
        window.addEventListener("keydown", hndKeydown);

        viewport.draw();

        f.Loop.addEventListener(f.EVENT.LOOP_FRAME, update);
        f.Loop.start();

    }

    function update(_event: Event): void {
        let moveSpeed: number = 0.5;
        if (keysPressed[f.KEYBOARD_CODE.ARROW_UP]) {
            paddleRight.cmpTransform.local.translate(new f.Vector3(0, moveSpeed, 0));
        }
        if (keysPressed[f.KEYBOARD_CODE.ARROW_LEFT]) {
            paddleRight.cmpTransform.local.translate(new f.Vector3(-moveSpeed, 0, 0));
        }
        if (keysPressed[f.KEYBOARD_CODE.ARROW_RIGHT]) {
            paddleRight.cmpTransform.local.translate(new f.Vector3(moveSpeed, 0, 0));
        }
        if (keysPressed[f.KEYBOARD_CODE.ARROW_DOWN]) {
            paddleRight.cmpTransform.local.translate(new f.Vector3(0, -moveSpeed, 0));
        }
        if (keysPressed[f.KEYBOARD_CODE.W]) {
            paddleLeft.cmpTransform.local.translate(new f.Vector3(0, moveSpeed, 0));
        }
        if (keysPressed[f.KEYBOARD_CODE.S]) {
            paddleLeft.cmpTransform.local.translate(new f.Vector3(0, -moveSpeed, 0));
        }
            

        // f.Debug.log("update", keysPressed);
        f.RenderManager.update();
        viewport.draw();
    }

    function hndKeyup(_event: KeyboardEvent): void {
        keysPressed[_event.code] = false;
    }

    function hndKeydown(_event: KeyboardEvent): void {
        keysPressed[_event.code] = true;
    }

    function createPong(): f.Node {
        let pong: f.Node = new f.Node("Pong");

        let meshQuad: f.Mesh = new f.MeshQuad();
        let mtrSolidRandom: f.Material = new f.Material("SolidRandom", f.ShaderUniColor, new f.CoatColored(new f.Color(Math.random(), Math.random(), Math.random(), 1)));

        ball.addComponent(new f.ComponentMesh(meshQuad));
        ball.addComponent(new f.ComponentMaterial(mtrSolidRandom));
        ball.addComponent(new f.ComponentTransform());

        paddleLeft.addComponent(new f.ComponentMesh(meshQuad));
        paddleLeft.addComponent(new f.ComponentMaterial(mtrSolidRandom));
        paddleLeft.addComponent(new f.ComponentTransform());

        paddleRight.addComponent(new f.ComponentMesh(meshQuad));
        paddleRight.addComponent(new f.ComponentMaterial(mtrSolidRandom));
        paddleRight.addComponent(new f.ComponentTransform());

        pong.appendChild(ball);
        pong.appendChild(paddleLeft);
        pong.appendChild(paddleRight);

        return pong;
    }
}