"use strict";
var L05_PongReflection;
(function (L05_PongReflection) {
    // interface KeyPressed {
    //     [code: string]: boolean;
    // }
    var f = FudgeCore;
    window.addEventListener("load", hndLoad);
    let pong;
    let ball;
    let paddleLeft;
    let paddleRight;
    const keysPressed = new Map();
    const randomNumber = () => (Math.random() * 2 - 1) / 2;
    let ballSpeed = new f.Vector3(randomNumber(), randomNumber(), 0);
    function hndLoad(_event) {
        const canvas = document.querySelector("canvas");
        f.RenderManager.initialize();
        console.log(canvas);
        pong = createPong();
        const zPos = 40;
        const cmpCamera = new f.ComponentCamera();
        cmpCamera.pivot.translateZ(zPos);
        L05_PongReflection.viewport = new f.Viewport();
        L05_PongReflection.viewport.initialize("Viewport", pong, cmpCamera, canvas);
        f.Debug.log(L05_PongReflection.viewport);
        window.addEventListener("keyup", hndKeyup);
        window.addEventListener("keydown", hndKeydown);
        L05_PongReflection.viewport.draw();
        f.Loop.addEventListener("loopFrame" /* LOOP_FRAME */, update);
        f.Loop.start();
    }
    function update(_event) {
        handleControls();
        handleCollision();
        moveBall();
        f.RenderManager.update();
        L05_PongReflection.viewport.draw();
    }
    function handleControls() {
        let moveSpeed = 0.5;
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
    function hndKeyup(_event) {
        keysPressed.set(_event.code, false);
    }
    function hndKeydown(_event) {
        keysPressed.set(_event.code, true);
    }
    function moveBall() {
        ball.cmpTransform.local.translate(ballSpeed);
    }
    function handleCollision() {
        for (let node of pong.getChildren()) {
            if (node.name == "Ball")
                continue;
            if (detectHit(ball.cmpTransform.local.translation, node)) {
                processHit(node);
                break;
            }
        }
    }
    function detectHit(_position, _node) {
        let posBox = _node.cmpTransform.local.translation;
        let sclBox = _node.getComponent(f.ComponentMesh).pivot.scaling;
        const topLeft = new f.Vector3(posBox.x - sclBox.x / 2, posBox.y + sclBox.y / 2, 0);
        const bottomRight = new f.Vector3(posBox.x + sclBox.x / 2, posBox.y - sclBox.y / 2, 0);
        return _position.x > topLeft.x && _position.y < topLeft.y && _position.x < bottomRight.x && _position.y > bottomRight.y;
    }
    function processHit(_node) {
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
    function createPong() {
        const xBoundary = 21;
        const yBoundary = 14;
        let pong = new f.Node("Pong");
        let meshQuad = new f.MeshQuad();
        let mtrSolidRandom = new f.Material("SolidRandom", f.ShaderUniColor, randomColoredCoat());
        let mtrSolidBlack = new f.Material("SolidBlack", f.ShaderUniColor, new f.CoatColored(f.Color.WHITE));
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
    function createNode(_name, _mesh, _material, _translation, _scaling) {
        let node = new f.Node(_name);
        node.addComponent(new f.ComponentMesh(_mesh));
        node.addComponent(new f.ComponentMaterial(_material));
        node.addComponent(new f.ComponentTransform());
        node.cmpTransform.local.translate(_translation);
        node.getComponent(f.ComponentMesh).pivot.scale(_scaling);
        return node;
    }
    function randomizeColor(_node) {
        _node.getComponent(f.ComponentMaterial).material.setCoat(randomColoredCoat());
        f.RenderManager.updateNode(_node);
    }
    function randomColoredCoat() {
        return new f.CoatColored(new f.Color(Math.random(), Math.random(), Math.random(), 1));
    }
})(L05_PongReflection || (L05_PongReflection = {}));
//# sourceMappingURL=Main.js.map