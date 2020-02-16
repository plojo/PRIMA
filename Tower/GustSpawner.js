"use strict";
var MyGame;
(function (MyGame) {
    var ƒ = FudgeCore;
    class Gust extends MyGame.Actor {
        constructor(_speed, _lifespan) {
            super(MyGame.TYPE.GUST, Gust.sprites);
            this.lastFrameCollision = false;
            this.update = (_event) => {
                let timeFrame = ƒ.Loop.timeFrameGame / 1000; // seconds
                let distance = ƒ.Vector3.SCALE(this.speed, timeFrame);
                this.cmpTransform.local.translate(distance);
                this.checkCollision(distance);
            };
            this.speed = _speed;
            let hitBox = new MyGame.Collidable("HitBox");
            this.appendChild(hitBox);
            this.registerUpdate();
            ƒ.Time.game.setTimer(_lifespan, 1, () => {
                ƒ.Loop.removeEventListener("loopFrame" /* LOOP_FRAME */, this.update);
                this.getParent().removeChild(this);
            });
        }
        static generateSprites(_txtImage) {
            this.sprites = [];
            let sprite = new MyGame.Sprite(MyGame.TYPE.GUST);
            sprite.generateByGrid(_txtImage, ƒ.Rectangle.GET(0, 0, 60, 80), 4, ƒ.Vector2.ZERO(), 64, ƒ.ORIGIN2D.BOTTOMCENTER);
            this.sprites.push(sprite);
        }
        get hitBox() {
            return this.getChildrenByName("HitBox")[0];
        }
        checkCollision(_distance) {
            if (this.hitBox.getRectWorld().collides(MyGame.player.hitBoxHorizontal.getRectWorld())) {
                this.lastFrameCollision = true;
                MyGame.player.cmpTransform.local.translate(ƒ.Vector3.SCALE(ƒ.Vector3.TRANSFORMATION(_distance, this.mtxWorld, false), 0.3));
            }
            else if (this.lastFrameCollision) {
                this.lastFrameCollision = false;
                MyGame.player.speed = ƒ.Vector3.SUM(MyGame.player.speed, ƒ.Vector3.SCALE(ƒ.Vector3.TRANSFORMATION(this.speed, this.mtxWorld, false), 0.3));
            }
        }
    }
    MyGame.Gust = Gust;
    class GustSpawner extends MyGame.Actor {
        /**
         *
         * @param _name name
         * @param _offset time in seconds after which the the blower should start blowing
         * @param _interval time in seconds that elapses between the gusts are spwaned
         * @param _gustLifespan lifespan of the gusts in seconds
         * @param _gustSpeed speed of the gusts in units per second
         */
        constructor(_offset = 0, _interval, _gustLifespan, _gustSpeed) {
            super(MyGame.TYPE.GUSTSPAWNER, []);
            this.elapsedTime = 0;
            this.update = (_event) => {
                let timeFrame = ƒ.Loop.timeFrameGame;
                this.elapsedTime += timeFrame;
                if (this.elapsedTime >= this.interval) {
                    let gust = new Gust(ƒ.Vector3.Y(this.gustSpeed), this.gustLifespan);
                    this.appendChild(gust);
                    this.elapsedTime = 0;
                }
            };
            this.interval = _interval * 1000;
            this.gustLifespan = _gustLifespan * 1000;
            this.gustSpeed = _gustSpeed;
            ƒ.Time.game.setTimer(_offset, 1, () => {
                this.registerUpdate();
            });
        }
    }
    MyGame.GustSpawner = GustSpawner;
})(MyGame || (MyGame = {}));
