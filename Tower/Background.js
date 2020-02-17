"use strict";
var MyGame;
(function (MyGame) {
    var ƒ = FudgeCore;
    class Background extends ƒ.Node {
        constructor(image, dist) {
            super("Background" + dist.toString());
            this.addComponent(new ƒ.ComponentTransform());
            let coat = new ƒ.CoatTextured();
            let pivot = new ƒ.Matrix4x4();
            coat.texture = image;
            pivot.translateZ(-dist);
            pivot.translateY(0.17);
            pivot.translateX(0.1);
            let material = new ƒ.Material("Background", ƒ.ShaderTexture, coat);
            this.addComponent(new ƒ.ComponentMaterial(material));
            let cmpMesh = new ƒ.ComponentMesh(Background.mesh);
            cmpMesh.pivot = pivot;
            this.addComponent(cmpMesh);
        }
    }
    Background.mesh = new ƒ.MeshSprite();
    MyGame.Background = Background;
})(MyGame || (MyGame = {}));
