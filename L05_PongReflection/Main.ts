namespace L05_PongReflection {

    // interface KeyPressed {
    //     [code: string]: boolean;
    // }

    import f = FudgeCore;
    window.addEventListener("load", hndLoad);
    export let viewport: f.Viewport;

    let pong: f.Node;
    let ball: f.Node;
    let paddleLeft: f.Node;
    let paddleRight: f.Node;

    const keysPressed: Map<string, boolean> = new Map();
    const randomNumber: () => number = () => (Math.random() * 2 - 1) / 2;
    let ballSpeed: f.Vector3 = new f.Vector3(randomNumber(), randomNumber(), 0);

    function hndLoad(_event: Event): void {
        const canvas: HTMLCanvasElement = document.querySelector("canvas");
        f.RenderManager.initialize();
        console.log(canvas);

        pong = createPong();

        const zPos: number = 40;
        const cmpCamera: f.ComponentCamera = new f.ComponentCamera();
        cmpCamera.pivot.translateZ(zPos);

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
        handleControls();
        handleCollision();
        moveBall();
        f.RenderManager.update();
        viewport.draw();
    }

    function handleControls(): void {
        let moveSpeed: number = 0.5;
        if (keysPressed.get(f.KEYBOARD_CODE.ARROW_UP)) {
            paddleRight.cmpTransform.local.translate(new f.Vector3(0, moveSpeed, 0));
        }
        if (keysPressed.get(f.KEYBOARD_CODE.ARROW_LEFT)) {
            paddleRight.cmpTransform.local.translate(new f.Vector3(-moveSpeed, 0, 0));
        }
        if (keysPressed.get(f.KEYBOARD_CODE.ARROW_RIGHT)) {
            paddleRight.cmpTransform.local.translate(new f.Vector3(moveSpeed, 0, 0));
        }
        if (keysPressed.get(f.KEYBOARD_CODE.ARROW_DOWN)) {
            paddleRight.cmpTransform.local.translate(new f.Vector3(0, -moveSpeed, 0));
        }
        if (keysPressed.get(f.KEYBOARD_CODE.W)) {
            paddleLeft.cmpTransform.local.translate(new f.Vector3(0, moveSpeed, 0));
        }
        if (keysPressed.get(f.KEYBOARD_CODE.S)) {
            paddleLeft.cmpTransform.local.translate(new f.Vector3(0, -moveSpeed, 0));
        }
    }

    function hndKeyup(_event: KeyboardEvent): void {
        keysPressed.set(_event.code, false);
    }

    function hndKeydown(_event: KeyboardEvent): void {
        keysPressed.set(_event.code, true);
    }

    function moveBall(): void {
        ball.cmpTransform.local.translate(ballSpeed);
    }


    function handleCollision(): void {
        for (let node of pong.getChildren()) {
            if (node.name == "Ball")
                continue;
            if (detectHit(ball.cmpTransform.local.translation, node)) {
                processHit(node);
                break;
            }
        }
    }

    function detectHit(_position: f.Vector3, _node: f.Node): boolean {
        let posBox: f.Vector3 = _node.cmpTransform.local.translation;
        let sclBox: f.Vector3 = _node.getComponent(f.ComponentMesh).pivot.scaling;
        const topLeft: f.Vector3 = new f.Vector3(posBox.x - sclBox.x / 2, posBox.y + sclBox.y / 2, 0);
        const bottomRight: f.Vector3 = new f.Vector3(posBox.x + sclBox.x / 2, posBox.y - sclBox.y / 2, 0);
        return _position.x > topLeft.x && _position.y < topLeft.y && _position.x < bottomRight.x && _position.y > bottomRight.y;
    }

    function processHit(_node: f.Node): void {
        console.log("Reflect at: ", _node.name);
        switch (_node.name) {
            case "BoundaryTop":
            case "BoundaryBottom":
                ballSpeed.y *= -1;
                randomizeColor(ball);
                break;
            case "BoundaryLeft":
            case "BoundaryRight":
                ballSpeed.x *= -1;
                break;
            case "PaddleLeft":
                ballSpeed.x *= -1;
                randomizeColor(paddleLeft);
                break;
            case "PaddleRight":
                ballSpeed.x *= -1;
                randomizeColor(paddleRight);
                break;
            default:
                console.warn("Oh, nooooo", _node.name);
                break;
        }
    }

    function createPong(): f.Node {
        const xBoundary: number = 21;
        const yBoundary: number = 14;

        let pong: f.Node = new f.Node("Pong");
        let meshQuad: f.Mesh = new f.MeshQuad();
        let mtrSolidRandom: f.Material = new f.Material("SolidRandom", f.ShaderUniColor, randomColoredCoat());
        let mtrSolidBlack: f.Material = new f.Material("SolidBlack", f.ShaderUniColor, new f.CoatColored(f.Color.CSS("WHITE", 1)));

        pong.appendChild(createNode("BoundaryTop", meshQuad, mtrSolidBlack, new f.Vector3(0, yBoundary, 0), new f.Vector3(xBoundary * 2, 1, 1)));
        pong.appendChild(createNode("BoundaryBottom", meshQuad, mtrSolidBlack, new f.Vector3(0, -yBoundary, 0), new f.Vector3(xBoundary * 2, 1, 1)));
        pong.appendChild(createNode("BoundaryLeft", meshQuad, mtrSolidBlack, new f.Vector3(-xBoundary, 0, 0), new f.Vector3(1, yBoundary * 2, 1)));
        pong.appendChild(createNode("BoundaryRight", meshQuad, mtrSolidBlack, new f.Vector3(xBoundary, 0, 0), new f.Vector3(1, yBoundary * 2, 1)));

        ball = createNode("Ball", meshQuad, mtrSolidRandom, f.Vector3.ZERO(), f.Vector3.ONE());
        paddleLeft = createNode("PaddleLeft", meshQuad, mtrSolidRandom, new f.Vector3(-19, 0, 0), new f.Vector3(1, 4, 1));
        paddleRight = createNode("PaddleRight", meshQuad, mtrSolidRandom, new f.Vector3(19, 0, 0), new f.Vector3(1, 4, 1));

        pong.appendChild(ball);
        pong.appendChild(paddleLeft);
        pong.appendChild(paddleRight);

        return pong;
    }

    function createNode(_name: string, _mesh: f.Mesh, _material: f.Material, _translation: f.Vector3, _scaling: f.Vector3): f.Node {
        let node: f.Node = new f.Node(_name);
        node.addComponent(new f.ComponentMesh(_mesh));
        node.addComponent(new f.ComponentMaterial(_material));
        node.addComponent(new f.ComponentTransform());
        node.cmpTransform.local.translate(_translation);
        node.getComponent(f.ComponentMesh).pivot.scale(_scaling);
        return node;
    }

    function randomizeColor(_node: f.Node): void {
        _node.getComponent(f.ComponentMaterial).material.setCoat(randomColoredCoat());
        f.RenderManager.updateNode(_node);
    }
    function randomColoredCoat(): f.CoatColored {
        return new f.CoatColored(new f.Color(Math.random(), Math.random(), Math.random(), 1));
    }

}