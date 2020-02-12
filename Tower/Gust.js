"use strict";
var MyGame;
(function (MyGame) {
    var ƒ = FudgeCore;
    class Gust extends MyGame.Actor {
        constructor(_name, _speed) {
            super(_name);
            this.update = (_event) => {
                let timeFrame = ƒ.Loop.timeFrameGame / 1000; // seconds
                let distance = ƒ.Vector3.SCALE(this.speed, timeFrame);
                distance.x = this.absMinSigned(distance.x, Gust.distanceMax.x);
                distance.y = this.absMinSigned(distance.y, Gust.distanceMax.y);
                this.cmpTransform.local.translate(distance);
                this.checkCollision(distance);
            };
            this.speed = _speed;
            let hitBox = new MyGame.Tile("purple");
            hitBox.cmpTransform.local.scaleX(1);
            hitBox.cmpTransform.local.scaleY(2);
            hitBox.cmpTransform.local.translateY(1);
            hitBox.name = "HitBox";
            this.appendChild(hitBox);
            ƒ.Loop.addEventListener("loopFrame" /* LOOP_FRAME */, this.update);
            ƒ.Time.game.setTimer(4000, 1, () => {
                ƒ.Loop.removeEventListener("loopFrame" /* LOOP_FRAME */, this.update);
                this.activate(false);
            });
        }
        get hitBox() {
            return this.getChildrenByName("HitBox")[0];
        }
        static generateSprites(_txtImage) {
            let sprite = new MyGame.Sprite("Wind");
            sprite.generateByGrid(_txtImage, ƒ.Rectangle.GET(0, 0, 60, 80), 4, ƒ.Vector2.ZERO(), 64, ƒ.ORIGIN2D.BOTTOMCENTER);
            this.sprites.push(sprite);
        }
        checkCollision(_distance) {
            if (this.hitBox.getRectWorld().collides(MyGame.player.hitBoxHorizontal.getRectWorld())) {
                MyGame.player.speed = ƒ.Vector3.SUM(MyGame.player.speed, this.speed);
            }
        }
    }
    MyGame.Gust = Gust;
})(MyGame || (MyGame = {}));
