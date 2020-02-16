"use strict";
var MyGame;
(function (MyGame) {
    var ƒ = FudgeCore;
    class Tile extends MyGame.NodeSprite {
        constructor(_type) {
            super(_type, Tile.sprites.get(_type));
            this.addComponent(new ƒ.ComponentTransform());
            let hitBox = new MyGame.Collidable("HitBox");
            hitBox.cmpTransform.local = ƒ.Matrix4x4.MULTIPLICATION(hitBox.cmpTransform.local, this.cmpMesh.pivot);
            this.appendChild(hitBox);
            this.addEventListener("registerUpdate", (_event) => {
                Tile.hitBoxes.push(this.hitBox.getRectWorld());
            }, true);
        }
        get hitBox() {
            return this.getChildrenByName("HitBox")[0];
        }
        static generateSprites(_txtImage) {
            this.sprites = new Map();
            let resolutionQuad = 16;
            let sprite = new MyGame.Sprite(MyGame.TYPE.PLATFORM);
            sprite.generateByGrid(_txtImage, ƒ.Rectangle.GET(64, 192, 48, 16), 1, ƒ.Vector2.ZERO(), resolutionQuad, ƒ.ORIGIN2D.BOTTOMLEFT);
            this.sprites.set(MyGame.TYPE.PLATFORM, sprite);
            sprite = new MyGame.Sprite(MyGame.TYPE.FLOOR);
            sprite.generateByGrid(_txtImage, ƒ.Rectangle.GET(0, 224, 352, 16), 3, ƒ.Vector2.ZERO(), resolutionQuad, ƒ.ORIGIN2D.BOTTOMLEFT);
            this.sprites.set(MyGame.TYPE.FLOOR, sprite);
            // sprite = new Sprite(TYPE.CEILING);
            // sprite.generateByGrid(_txtImage, ƒ.Rectangle.GET(32, 64, 16, 16), 3, ƒ.Vector2.ZERO(), 32, ƒ.ORIGIN2D.CENTER);
            // this.sprites.set(TYPE.CEILING, sprite);
            sprite = new MyGame.Sprite(MyGame.TYPE.WALL);
            sprite.generateByGrid(_txtImage, ƒ.Rectangle.GET(352, 0, 48, 302), 1, ƒ.Vector2.ZERO(), resolutionQuad, ƒ.ORIGIN2D.BOTTOMLEFT);
            this.sprites.set(MyGame.TYPE.WALL, sprite);
            // sprite = new Sprite(TYPE.WALLRIGHT);
            // sprite.generateByGrid(_txtImage, ƒ.Rectangle.GET(80, 48, 16, 16), 3, ƒ.Vector2.ZERO(), resolutionQuad, ƒ.ORIGIN2D.CENTER, true);
            // this.sprites.set(TYPE.WALLLEFT, sprite);
        }
    }
    Tile.hitBoxes = [];
    MyGame.Tile = Tile;
})(MyGame || (MyGame = {}));
