"use strict";
var MyGame;
(function (MyGame) {
    var ƒ = FudgeCore;
    class Tile extends MyGame.Collidable {
        constructor(_cssColor) {
            super("Tile");
            this.addComponent(new ƒ.ComponentMaterial(new ƒ.Material("Tile", ƒ.ShaderUniColor, new ƒ.CoatColored(ƒ.Color.CSS(_cssColor, 0.5)))));
            let cmpMesh = new ƒ.ComponentMesh(Tile.mesh);
            cmpMesh.pivot = MyGame.Collidable.pivot;
            this.addComponent(cmpMesh);
        }
    }
    Tile.mesh = new ƒ.MeshSprite();
    MyGame.Tile = Tile;
})(MyGame || (MyGame = {}));
