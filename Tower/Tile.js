"use strict";
var MyGame;
(function (MyGame) {
    var ƒ = FudgeCore;
    class Tile extends ƒ.Node {
        constructor(_sprite) {
            super("Tile");
            this.addComponent(new ƒ.ComponentTransform());
            let nodeSprite = new MyGame.NodeSprite(_sprite.name, _sprite);
            this.appendChild(nodeSprite);
            let hitBox = new MyGame.HitBox("HitBox");
            this.appendChild(hitBox);
        }
        get hitBox() {
            return this.getChildrenByName("HitBox")[0];
        }
    }
    MyGame.Tile = Tile;
    class Platform extends Tile {
        constructor() {
            super(Platform.sprite);
            this.hitBox.cmpTransform.local.scaleY(0.5);
            this.hitBox.cmpTransform.local.scaleX(1.5);
        }
        static generateSprite(_txtImage) {
            this.sprite = new MyGame.Sprite(MyGame.TYPE.PLATFORM);
            this.sprite.generateByGrid(_txtImage, ƒ.Rectangle.GET(64, 192, 48, 16), 1, ƒ.Vector2.ZERO(), 32, ƒ.ORIGIN2D.CENTER);
        }
    }
    MyGame.Platform = Platform;
})(MyGame || (MyGame = {}));
