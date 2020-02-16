namespace PerformanceLeak {

    export import ƒ = FudgeCore;

    window.addEventListener("load", test);

    let game: ƒ.Node;
    let viewport: ƒ.Viewport;
    let elapsedTime: number = 0;

    function test(): void {
        let canvas: HTMLCanvasElement = document.querySelector("canvas");
        ƒ.RenderManager.initialize(true, false);

        game = new ƒ.Node("Game");
        let cmpCamera: ƒ.ComponentCamera = new ƒ.ComponentCamera();
        cmpCamera.pivot.translateZ(28);
        cmpCamera.pivot.lookAt(ƒ.Vector3.ZERO());
        cmpCamera.backgroundColor = ƒ.Color.CSS("aliceblue");

        viewport = new ƒ.Viewport();
        viewport.initialize("Viewport", game, cmpCamera, canvas);
        viewport.draw();

        ƒ.RenderManager.update();
        game.broadcastEvent(new CustomEvent("registerHitBox"));

        ƒ.Loop.addEventListener(ƒ.EVENT.LOOP_FRAME, update);
        ƒ.Loop.start(ƒ.LOOP_MODE.TIME_GAME, 60);

        function update(_event: ƒ.Eventƒ): void {
            elapsedTime += ƒ.Loop.timeFrameGame;
           
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

        function createNode(_name: string): ƒ.Node {
            let node: ƒ.Node = new ƒ.Node(_name);
            node.addComponent(new ƒ.ComponentTransform());
            node.addComponent(new ƒ.ComponentMaterial(new ƒ.Material(_name, ƒ.ShaderUniColor, new ƒ.CoatColored(ƒ.Color.CSS("blue", 0.2)))));
            let cmpMesh: ƒ.ComponentMesh = new ƒ.ComponentMesh(new ƒ.MeshSprite());
            node.addComponent(cmpMesh);
            game.appendChild(node);
            return node;
        }
    }
}

