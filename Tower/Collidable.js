"use strict";
var MyGame;
(function (MyGame) {
    var ƒ = FudgeCore;
    class Collidable extends ƒ.Node {
        constructor(_name, _cssColor) {
            super(_name);
            this.addComponent(new ƒ.ComponentTransform());
            this.addComponent(new ƒ.ComponentMaterial(new ƒ.Material("Material", ƒ.ShaderUniColor, new ƒ.CoatColored(ƒ.Color.CSS(_cssColor, 0.5)))));
            // let rotator: ƒ.Node = new ƒ.Node("Rotator");
            // rotator.addComponent(new ƒ.ComponentTransform());
            // this.appendChild(rotator); 
            let cmpMesh = new ƒ.ComponentMesh(Collidable.mesh);
            cmpMesh.pivot = Collidable.pivot;
            this.addComponent(cmpMesh);
        }
        getRectWorld() {
            let rect = ƒ.Rectangle.GET(0, 0, 100, 100);
            let topleft = new ƒ.Vector3(-0.5, 0.5, 0);
            let bottomright = new ƒ.Vector3(0.5, -0.5, 0);
            let mtxResult = ƒ.Matrix4x4.MULTIPLICATION(this.mtxWorld, Collidable.pivot);
            topleft.transform(mtxResult, true);
            bottomright.transform(mtxResult, true);
            let size = new ƒ.Vector2(bottomright.x - topleft.x, bottomright.y - topleft.y);
            rect.position = topleft.toVector2();
            rect.size = size;
            return rect;
        }
    }
    Collidable.mesh = new ƒ.MeshSprite();
    // private static material: ƒ.Material = new ƒ.Material("Floor", ƒ.ShaderUniColor, new ƒ.CoatColored(ƒ.Color.CSS("red", 0.5)));
    Collidable.pivot = ƒ.Matrix4x4.TRANSLATION(ƒ.Vector3.Y(-0.5));
    MyGame.Collidable = Collidable;
})(MyGame || (MyGame = {}));
