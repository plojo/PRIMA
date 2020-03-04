"use strict";
var PerformanceLeak;
(function (PerformanceLeak) {
    PerformanceLeak.ƒ = FudgeCore;
    window.addEventListener("load", test);
    let game;
    let viewport;
    let elapsedTime = 0;
    let cmpMesh = new PerformanceLeak.ƒ.ComponentMesh(new PerformanceLeak.ƒ.MeshSprite());
    let cmpMaterial = new PerformanceLeak.ƒ.ComponentMaterial(new PerformanceLeak.ƒ.Material("Node", PerformanceLeak.ƒ.ShaderUniColor, new PerformanceLeak.ƒ.CoatColored(PerformanceLeak.ƒ.Color.CSS("blue", 0.2))));
    function test() {
        let canvas = document.querySelector("canvas");
        PerformanceLeak.ƒ.RenderManager.initialize(true, false);
        game = new PerformanceLeak.ƒ.Node("Game");
        let cmpCamera = new PerformanceLeak.ƒ.ComponentCamera();
        cmpCamera.pivot.translateZ(28);
        cmpCamera.pivot.lookAt(PerformanceLeak.ƒ.Vector3.ZERO());
        cmpCamera.backgroundColor = PerformanceLeak.ƒ.Color.CSS("aliceblue");
        viewport = new PerformanceLeak.ƒ.Viewport();
        viewport.initialize("Viewport", game, cmpCamera, canvas);
        viewport.draw();
        PerformanceLeak.ƒ.RenderManager.update();
        game.broadcastEvent(new CustomEvent("registerHitBox"));
        PerformanceLeak.ƒ.Loop.addEventListener("loopFrame" /* LOOP_FRAME */, update);
        PerformanceLeak.ƒ.Loop.start(PerformanceLeak.ƒ.LOOP_MODE.TIME_GAME, 60);
        function update(_event) {
            elapsedTime += PerformanceLeak.ƒ.Loop.timeFrameGame;
            // move nodes
            for (const node of game.getChildren()) {
                node.cmpTransform.local.translateX(0.1);
            }
            if (elapsedTime > 100) {
                // console.log(game.getChildren());
                // remove Node
                if (game.getChildren().length > 0) {
                    game.removeChild(game.getChildren().pop());
                }
                // create Node
                createNode("Node");
                elapsedTime = 0;
            }
            viewport.draw();
        }
        function createNode(_name) {
            let node = new PerformanceLeak.ƒ.Node(_name);
            node.addComponent(new PerformanceLeak.ƒ.ComponentTransform());
            node.addComponent(cmpMaterial);
            node.addComponent(cmpMesh);
            game.appendChild(node);
            return node;
        }
    }
})(PerformanceLeak || (PerformanceLeak = {}));
