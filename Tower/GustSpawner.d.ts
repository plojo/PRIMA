declare namespace MyGame {
    import ƒ = FudgeCore;
    class Gust extends Actor {
        private speed;
        private lastFrameCollision;
        constructor(_speed: ƒ.Vector3, _lifespan: number);
        static generateSprites(_txtImage: ƒ.TextureImage): void;
        private get hitBox();
        protected update: (_event: ƒ.Eventƒ) => void;
        private checkCollision;
    }
    class GustSpawner extends Actor {
        private elapsedTime;
        private interval;
        private gustLifespan;
        private gustSpeed;
        /**
         *
         * @param _name name
         * @param _offset time in seconds after which the the blower should start blowing
         * @param _interval time in seconds that elapses between the gusts are spwaned
         * @param _gustLifespan lifespan of the gusts in seconds
         * @param _gustSpeed speed of the gusts in units per second
         */
        constructor(_offset: number, _interval: number, _gustLifespan: number, _gustSpeed: number);
        protected update: (_event: ƒ.Eventƒ) => void;
    }
}
