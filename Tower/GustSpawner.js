"use strict";
var MyGame;
(function (MyGame) {
    var ƒ = FudgeCore;
    class GustSpawner extends MyGame.Actor {
        /**
         *
         * @param _name name
         * @param _offset time in seconds after which the the blower should start blowing
         * @param _interval time in seconds that elapses between the gusts are spwaned
         * @param _rotation in degrees around the z-axis
         * @param _gustLifespan lifespan of the gusts in seconds
         * @param _gustSpeed speed of the gusts in units per second
         */
        constructor(_offset = 0, _interval, _rotation = 0, _gustLifespan, _gustSpeed) {
            super("GustSpawner");
            this.elapsedTime = 0;
            this.update = (_event) => {
                let timeFrame = ƒ.Loop.timeFrameGame;
                this.elapsedTime += timeFrame;
                if (this.elapsedTime >= this.interval) {
                    let gust = new MyGame.Gust(ƒ.Vector3.Y(this.gustSpeed), this.gustLifespan);
                    this.appendChild(gust);
                    this.elapsedTime = 0;
                }
            };
            this.interval = _interval * 1000;
            this.gustLifespan = _gustLifespan * 1000;
            this.gustSpeed = _gustSpeed;
            this.cmpTransform.local.rotateZ(_rotation);
            ƒ.Time.game.setTimer(_offset, 1, () => {
                this.registerUpdate();
            });
        }
    }
    MyGame.GustSpawner = GustSpawner;
})(MyGame || (MyGame = {}));
