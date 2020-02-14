"use strict";
var MyGame;
(function (MyGame) {
    var ƒ = FudgeCore;
    class Tile extends MyGame.Collidable {
        constructor(_cssColor) {
            super("Tile");
            // this.addComponent(new ƒ.ComponentMaterial(new ƒ.Material("Tile", ƒ.ShaderUniColor, new ƒ.CoatColored(ƒ.Color.CSS(_cssColor, 0.5)))));
            // let cmpMesh: ƒ.ComponentMesh = new ƒ.ComponentMesh(Tile.mesh);
            // cmpMesh.pivot = Collidable.pivot;
            // this.addComponent(cmpMesh);
            for (let sprite of Tile.sprites) {
                let nodeSprite = new MyGame.NodeSprite(sprite.name, sprite);
                // nodeSprite.showFrame(1);
                // nodeSprite.activate(false);
                this.appendChild(nodeSprite);
            }
        }
        static generateSprite(_txtImage) {
            let sprite = new MyGame.Sprite("Tile");
            console.log(_txtImage);
            sprite.generateByGrid(_txtImage, ƒ.Rectangle.GET(32, 0, 48, 16), 1, ƒ.Vector2.ZERO(), 16, ƒ.ORIGIN2D.CENTER);
            this.sprites.push(sprite);
        }
    }
    // private static mesh: ƒ.MeshSprite = new ƒ.MeshSprite();
    Tile.sprites = [];
    MyGame.Tile = Tile;
})(MyGame || (MyGame = {}));
