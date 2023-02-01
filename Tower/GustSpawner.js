"use strict";
var MyGame;
(function (MyGame) {
    var ƒ = FudgeCore;
    class Gust extends MyGame.Actor {
        speed;
        lastFrameCollision = false;
        constructor(_speed, _lifespan) {
            super(MyGame.TYPE.GUST, Gust.sprites);
            this.speed = _speed;
            let hitBox = new MyGame.Collidable("HitBox");
            hitBox.cmpTransform.local.scaleY(1.5);
            hitBox.cmpTransform.local.scaleX(1.5);
            this.appendChild(hitBox);
            this.registerUpdate();
            this.animatedNodeSprite.getNodeSprite(MyGame.ACTION.IDLE).activate(true);
            this.animatedNodeSprite.play(MyGame.ACTION.IDLE);
            this.animatedNodeSprite.registerUpdate();
            ƒ.Time.game.setTimer(_lifespan, 1, () => {
                this.removeUpdate();
                this.getParent().removeChild(this);
            });
        }
        static generateSprites(_txtImage) {
            this.sprites = [];
            let sprite = new MyGame.Sprite(MyGame.ACTION.IDLE);
            sprite.generateByGrid(_txtImage, ƒ.Rectangle.GET(0, 0, 42, 40), 4, ƒ.Vector2.ZERO(), 16, ƒ.ORIGIN2D.CENTER);
            this.sprites.push(sprite);
        }
        get hitBox() {
            return this.getChildrenByName("HitBox")[0];
        }
        update = (_event) => {
            let timeFrame = ƒ.Loop.timeFrameGame / 1000; // seconds
            let distance = ƒ.Vector3.SCALE(this.speed, timeFrame);
            this.cmpTransform.local.translate(distance);
            this.checkCollision(distance);
        };
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
        elapsedTime = 0;
        interval;
        gustLifespan;
        gustSpeed;
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
            this.interval = _interval * 1000;
            this.gustLifespan = _gustLifespan * 1000;
            this.gustSpeed = _gustSpeed;
            ƒ.Time.game.setTimer(_offset, 1, () => {
                this.registerUpdate();
            });
        }
        update = (_event) => {
            let timeFrame = ƒ.Loop.timeFrameGame;
            this.elapsedTime += timeFrame;
            if (this.elapsedTime >= this.interval) {
                let gust = new Gust(ƒ.Vector3.X(this.gustSpeed), this.gustLifespan);
                this.appendChild(gust);
                this.elapsedTime = 0;
            }
        };
    }
    MyGame.GustSpawner = GustSpawner;
})(MyGame || (MyGame = {}));
