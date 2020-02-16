"use strict";
var MyGame;
(function (MyGame) {
    var ƒ = FudgeCore;
    class Collidable extends ƒ.Node {
        constructor(_name = "Collidable") {
            super(_name);
            this.addComponent(new ƒ.ComponentTransform());
            this.addComponent(new ƒ.ComponentMaterial(new ƒ.Material(_name, ƒ.ShaderUniColor, new ƒ.CoatColored(ƒ.Color.CSS("blue", 0.2)))));
            let cmpMesh = new ƒ.ComponentMesh(new ƒ.MeshSprite());
            this.addComponent(cmpMesh);
        }
        getRectWorld() {
            let rect = ƒ.Rectangle.GET(0, 0, 100, 100);
            let topleft = new ƒ.Vector3(-0.5, 0.5, 0);
            let bottomright = new ƒ.Vector3(0.5, -0.5, 0);
            let mtxResult = this.mtxWorld;
            topleft.transform(mtxResult, true);
            bottomright.transform(mtxResult, true);
            let size = new ƒ.Vector2(bottomright.x - topleft.x, bottomright.y - topleft.y);
            rect.position = topleft.toVector2();
            rect.size = size;
            return rect;
        }
    }
    MyGame.Collidable = Collidable;
})(MyGame || (MyGame = {}));
