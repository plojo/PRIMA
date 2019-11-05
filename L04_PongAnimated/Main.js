"use strict";
var L04_PongAnimated;
(function (L04_PongAnimated) {
    // interface KeyPressed {
    //     [code: string]: boolean;
    // }
    var f = FudgeCore;
    window.addEventListener("load", hndLoad);
    const ball = new f.Node("Ball");
    const paddleLeft = new f.Node("PaddleLeft");
    const paddleRight = new f.Node("PaddleRight");
    const keysPressed = new Map();
    const randomNumber = () => (Math.random() * 2 - 1) / 2;
    let ballDirection = new f.Vector3(randomNumber(), randomNumber(), 0);
    const xBoundary = 21;
    const yBoundary = 13.5;
    function hndLoad(_event) {
        const canvas = document.querySelector("canvas");
        f.RenderManager.initialize();
        console.log(canvas);
        const pong = createPong();
        const zPos = 42;
        const cmpCamera = new f.ComponentCamera();
        cmpCamera.pivot.translateZ(zPos);
        paddleLeft.cmpTransform.local.translateX(-20);
        paddleLeft.getComponent(f.ComponentMesh).pivot.scaleY(4);
        paddleRight.cmpTransform.local.translateX(20);
        paddleRight.getComponent(f.ComponentMesh).pivot.scaleY(4);
        L04_PongAnimated.viewport = new f.Viewport();
        L04_PongAnimated.viewport.initialize("Viewport", pong, cmpCamera, canvas);
        f.Debug.log(L04_PongAnimated.viewport);
        window.addEventListener("keyup", hndKeyup);
        window.addEventListener("keydown", hndKeydown);
        L04_PongAnimated.viewport.draw();
        f.Loop.addEventListener("loopFrame" /* LOOP_FRAME */, update);
        f.Loop.start();
    }
    function update(_event) {
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
        moveBall();
        // f.Debug.log(ball.cmpTransform.local.translation);
        // f.Debug.log("update", keysPressed);
        f.RenderManager.update();
        L04_PongAnimated.viewport.draw();
    }
    function hndKeyup(_event) {
        keysPressed.set(_event.code, false);
    }
    function hndKeydown(_event) {
        keysPressed.set(_event.code, true);
    }
    function moveBall() {
        const ballPos = ball.cmpTransform.local.translation;
        if (ballPos.x >= xBoundary || ballPos.x <= -xBoundary) {
            ballDirection.x = -ballDirection.x;
            ballDirection.scale(1.05);
            randomizeColor(ball);
        }
        if (ballPos.y >= yBoundary || ballPos.y <= -yBoundary) {
            ballDirection.y = -ballDirection.y;
            ballDirection.scale(1.1);
            randomizeColor(ball);
        }
        if (ballPos.x >= xBoundary)
            randomizeColor(paddleRight);
        if (ballPos.x <= -xBoundary)
            randomizeColor(paddleLeft);
        ball.cmpTransform.local.translate(ballDirection);
    }
    function createPong() {
        let pong = new f.Node("Pong");
        let meshQuad = new f.MeshQuad();
        let mtrSolidRandom = new f.Material("SolidRandom", f.ShaderUniColor, randomColoredCoat());
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
    function randomizeColor(_node) {
        _node.getComponent(f.ComponentMaterial).material.setCoat(randomColoredCoat());
        f.RenderManager.updateNode(_node);
    }
    function randomColoredCoat() {
        return new f.CoatColored(new f.Color(Math.random(), Math.random(), Math.random(), 1));
    }
})(L04_PongAnimated || (L04_PongAnimated = {}));
//# sourceMappingURL=Main.js.map