"use strict";
var L03_PongAnimated;
(function (L03_PongAnimated) {
    var f = FudgeCore;
    window.addEventListener("load", hndLoad);
    let ball = new f.Node("Ball");
    let paddleLeft = new f.Node("PaddleLeft");
    let paddleRight = new f.Node("PaddleRight");
    let keysPressed = {};
    function hndLoad(_event) {
        const canvas = document.querySelector("canvas");
        f.RenderManager.initialize();
        console.log(canvas);
        let pong = createPong();
        let zPos = 42;
        let cmpCamera = new f.ComponentCamera();
        cmpCamera.pivot.translateZ(zPos);
        paddleLeft.cmpTransform.local.translateX(-20);
        paddleLeft.getComponent(f.ComponentMesh).pivot.scaleY(4);
        paddleRight.cmpTransform.local.translateX(20);
        paddleRight.getComponent(f.ComponentMesh).pivot.scaleY(4);
        L03_PongAnimated.viewport = new f.Viewport();
        L03_PongAnimated.viewport.initialize("Viewport", pong, cmpCamera, canvas);
        f.Debug.log(L03_PongAnimated.viewport);
        window.addEventListener("keyup", hndKeyup);
        window.addEventListener("keydown", hndKeydown);
        L03_PongAnimated.viewport.draw();
        f.Loop.addEventListener("loopFrame" /* LOOP_FRAME */, update);
        f.Loop.start();
    }
    function update(_event) {
        let moveSpeed = 0.5;
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
        L03_PongAnimated.viewport.draw();
    }
    function hndKeyup(_event) {
        keysPressed[_event.code] = false;
    }
    function hndKeydown(_event) {
        keysPressed[_event.code] = true;
    }
    function createPong() {
        let pong = new f.Node("Pong");
        let meshQuad = new f.MeshQuad();
        let mtrSolidRandom = new f.Material("SolidRandom", f.ShaderUniColor, new f.CoatColored(new f.Color(Math.random(), Math.random(), Math.random(), 1)));
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
})(L03_PongAnimated || (L03_PongAnimated = {}));
//# sourceMappingURL=Main.js.map