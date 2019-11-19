"use strict";
var L06_PongFinal;
(function (L06_PongFinal) {
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
    let ballMovement;
    let paddleSpeed = 0.5;
    let scoreLeft = 0;
    let scoreRight = 0;
    let ctx;
    function hndLoad(_event) {
        const canvas = document.querySelector("canvas");
        f.RenderManager.initialize();
        console.log(canvas);
        pong = createPong();
        const zPos = 40;
        const cmpCamera = new f.ComponentCamera();
        cmpCamera.pivot.translateZ(zPos);
        L06_PongFinal.viewport = new f.Viewport();
        L06_PongFinal.viewport.initialize("Viewport", pong, cmpCamera, canvas);
        f.Debug.log(L06_PongFinal.viewport);
        window.addEventListener("keyup", hndKeyup);
        window.addEventListener("keydown", hndKeydown);
        L06_PongFinal.viewport.draw();
        ctx = document.getElementById("gameCanvas").getContext("2d");
        console.log(ctx);
        ctx.font = "30px Comic Sans MS";
        ctx.fillStyle = "red";
        f.Loop.addEventListener("loopFrame" /* LOOP_FRAME */, update);
        f.Loop.start();
    }
    function update(_event) {
        ctx.fillText(scoreRight.toString(), 50, 50);
        ctx.stroke();
        handleControls();
        handleCollision();
        moveBall();
        f.RenderManager.update();
        L06_PongFinal.viewport.draw();
    }
    function handleControls() {
        if (keysPressed.get(f.KEYBOARD_CODE.ARROW_UP)) {
            paddleRight.cmpTransform.local.translate(new f.Vector3(0, paddleSpeed, 0));
        }
        // if (keysPressed.get(f.KEYBOARD_CODE.ARROW_LEFT)) {
        //     paddleRight.cmpTransform.local.translate(new f.Vector3(-paddleSpeed, 0, 0));
        // }
        // if (keysPressed.get(f.KEYBOARD_CODE.ARROW_RIGHT)) {
        //     paddleRight.cmpTransform.local.translate(new f.Vector3(paddleSpeed, 0, 0));
        // }
        if (keysPressed.get(f.KEYBOARD_CODE.ARROW_DOWN)) {
            paddleRight.cmpTransform.local.translate(new f.Vector3(0, -paddleSpeed, 0));
        }
        if (keysPressed.get(f.KEYBOARD_CODE.W)) {
            paddleLeft.cmpTransform.local.translate(new f.Vector3(0, paddleSpeed, 0));
        }
        if (keysPressed.get(f.KEYBOARD_CODE.S)) {
            paddleLeft.cmpTransform.local.translate(new f.Vector3(0, -paddleSpeed, 0));
        }
    }
    function hndKeyup(_event) {
        keysPressed.set(_event.code, false);
    }
    function hndKeydown(_event) {
        keysPressed.set(_event.code, true);
    }
    function moveBall() {
        ball.cmpTransform.local.translate(ballMovement);
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
        // console.log("Reflect at: ", _node.name);
        switch (_node.name) {
            case "BoundaryTop":
            case "BoundaryBottom":
                ballMovement.y *= -1;
                randomizeColor(ball);
                break;
            case "BoundaryLeft":
                scoreRight++;
                ctx.fillText(scoreRight.toString(), 50, 50);
                ctx.restore();
                console.log("Right score: ", scoreRight);
                resetBall();
                break;
            case "BoundaryRight":
                scoreLeft++;
                console.log("Left score: ", scoreLeft);
                resetBall();
                break;
            case "PaddleLeft":
                randomizeColor(paddleLeft);
                ballMovement.x *= -1;
                if (keysPressed.get(f.KEYBOARD_CODE.W)) {
                    ballMovement.y += paddleSpeed * 0.2;
                }
                if (keysPressed.get(f.KEYBOARD_CODE.S)) {
                    ballMovement.y -= paddleSpeed * 0.2;
                }
                break;
            case "PaddleRight":
                randomizeColor(paddleRight);
                ballMovement.x *= -1;
                if (keysPressed.get(f.KEYBOARD_CODE.ARROW_UP)) {
                    ballMovement.y += paddleSpeed * 0.2;
                }
                if (keysPressed.get(f.KEYBOARD_CODE.ARROW_DOWN)) {
                    ballMovement.y -= paddleSpeed * 0.2;
                }
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
        resetBall();
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
    function resetBall() {
        const randomNumber = () => (Math.random() * 2 - 1) / 2;
        ballMovement = new f.Vector3(randomNumber(), randomNumber(), 0);
        ball.cmpTransform.local.translation = f.Vector3.ZERO();
    }
    function randomizeColor(_node) {
        _node.getComponent(f.ComponentMaterial).material.setCoat(randomColoredCoat());
        f.RenderManager.updateNode(_node);
    }
    function randomColoredCoat() {
        return new f.CoatColored(new f.Color(Math.random(), Math.random(), Math.random(), 1));
    }
})(L06_PongFinal || (L06_PongFinal = {}));
//# sourceMappingURL=Main.js.map