namespace MyGame {
    import ƒ = FudgeCore;

    export class GustSpawner extends Actor {
        private elapsedTime: number = 0;
        private interval: number;
        
        private gustLifespan: number;
        private gustSpeed: number;

        /**
         * 
         * @param _name name
         * @param _offset time in seconds after which the the blower should start blowing
         * @param _interval time in seconds that elapses bewtween the gusts are spwaned
         * @param _rotation in degres around the z-axis
         * @param _gustLifespan lifespan of the gusts in seconds
         * @param _gustSpeed speed of the gusts in units per second
         */
        constructor(_name: string, _offset: number = 0, _interval: number, _rotation: number = 0, _gustLifespan: number, _gustSpeed: number) {
            super(_name);
            this.interval = _interval * 1000;
            this.gustLifespan = _gustLifespan * 1000;
            this.gustSpeed = _gustSpeed;
            this.cmpTransform.local.rotateZ(_rotation);
            ƒ.Time.game.setTimer(_offset, 1, () => {
                this.registerUpdate();
              });
        }

        protected update = (_event: ƒ.Eventƒ): void => {
            let timeFrame: number = ƒ.Loop.timeFrameGame;
            this.elapsedTime += timeFrame;
            if (this.elapsedTime >= this.interval) {
                let gust: Gust = new Gust("Gust", ƒ.Vector3.Y(this.gustSpeed), this.gustLifespan);
                this.appendChild(gust);
                this.elapsedTime = 0;
            }
        }
    }
}