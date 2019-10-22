"use strict";
var L03_PongPaddle;
(function (L03_PongPaddle) {
    var f = FudgeCore;
    window.addEventListener("load", hndLoad);
    let ball = new f.Node("Ball");
    let paddleLeft = new f.Node("PaddleLeft");
    let paddleRight = new f.Node("PaddleRight");
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
        L03_PongPaddle.viewport = new f.Viewport();
        L03_PongPaddle.viewport.initialize("Viewport", pong, cmpCamera, canvas);
        f.Debug.log(L03_PongPaddle.viewport);
        L03_PongPaddle.viewport.draw();
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
    }
})(L03_PongPaddle || (L03_PongPaddle = {}));
//# sourceMappingURL=Main.js.map