"use strict";
var FudgeCraft;
(function (FudgeCraft) {
    var f = FudgeCore;
    window.addEventListener("load", hndLoad);
    let game;
    const keysPressed = new Map();
    function hndLoad(_event) {
        const canvas = document.querySelector("canvas");
        f.RenderManager.initialize();
        console.log(canvas);
        game = createGame();
        const zPos = 40;
        const cmpCamera = new f.ComponentCamera();
        cmpCamera.pivot.translateZ(zPos);
        FudgeCraft.viewport = new f.Viewport();
        FudgeCraft.viewport.initialize("Viewport", game, cmpCamera, canvas);
        f.Debug.log(FudgeCraft.viewport);
        window.addEventListener("keyup", hndKeyup);
        window.addEventListener("keydown", hndKeydown);
        FudgeCraft.viewport.draw();
        f.Loop.addEventListener("loopFrame" /* LOOP_FRAME */, update);
        f.Loop.start();
        new LinePiece().print();
    }
    function update(_event) {
        handleControls();
        f.RenderManager.update();
        FudgeCraft.viewport.draw();
    }
    function handleControls() {
    }
    function createGame() {
        const xBoundary = 21;
        const yBoundary = 14;
        let game = new f.Node("Game");
        let meshQuad = new f.MeshQuad();
        let mtrSolidBlack = new f.Material("SolidWhite", f.ShaderUniColor, new f.CoatColored(f.Color.WHITE));
        game.appendChild(createNode("BoundaryTop", meshQuad, mtrSolidBlack, new f.Vector3(0, yBoundary, 0), new f.Vector3(xBoundary * 2, 1, 1)));
        return game;
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
    // function randomizeColor(_node: f.Node): void {
    //     _node.getComponent(f.ComponentMaterial).material.setCoat(randomColoredCoat());
    //     f.RenderManager.updateNode(_node);
    // }
    // function randomColoredCoat(): f.CoatColored {
    //     return new f.CoatColored(new f.Color(Math.random(), Math.random(), Math.random(), 1));
    // }
    function hndKeyup(_event) {
        keysPressed.set(_event.code, false);
    }
    function hndKeydown(_event) {
        keysPressed.set(_event.code, true);
    }
    class Tetromino {
        constructor() {
            this.size = 4;
            this.form = [];
            // this.core = new f.Node();
            for (let x = 0; x < this.size; x++) {
                this.form[x] = [];
                for (let y = 0; y < this.size; y++) {
                    this.form[x][y] = [];
                    for (let z = 0; z < this.size; z++) {
                        this.form[x][y][z] = false;
                    }
                }
            }
        }
        print() {
            for (let x = 0; x < this.size; x++) {
                for (let y = 0; y < this.size; y++) {
                    for (let z = 0; z < this.size; z++) {
                        console.log("x: ", x, "; y: ", y, "; z: ", z, " = ", this.form[x][y][z]);
                    }
                }
            }
        }
    }
    class LinePiece extends Tetromino {
        constructor() {
            super();
            this.form[1][0][1] = true;
            this.form[1][1][1] = true;
            this.form[1][2][1] = true;
            this.form[1][3][1] = true;
        }
    }
})(FudgeCraft || (FudgeCraft = {}));
//# sourceMappingURL=Main.js.map