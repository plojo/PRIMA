"use strict";
var MyGame;
(function (MyGame) {
    var ƒ = FudgeCore;
    class Gust extends MyGame.Actor {
        constructor(_speed, _lifespan) {
            super("Gust");
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
            hitBox.name = "HitBox";
            this.appendChild(hitBox);
            this.registerUpdate();
            ƒ.Time.game.setTimer(_lifespan, 1, () => {
                ƒ.Loop.removeEventListener("loopFrame" /* LOOP_FRAME */, this.update);
                this.getParent().removeChild(this);
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
                // player.cmpTransform.local.translate(ƒ.Vector3.SCALE(ƒ.Vector3.TRANSFORMATION(_distance, this.mtxWorld, false), 0.5));
                // player.acceleration = ƒ.Vector3.SUM(player.acceleration, ƒ.Vector3.TRANSFORMATION(this.speed, this.mtxWorld, false));
                MyGame.player.speed = ƒ.Vector3.SUM(MyGame.player.speed, ƒ.Vector3.SCALE(ƒ.Vector3.TRANSFORMATION(this.speed, this.mtxWorld, false), 0.06));
            }
        }
    }
    MyGame.Gust = Gust;
})(MyGame || (MyGame = {}));
