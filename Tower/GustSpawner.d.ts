declare namespace MyGame {
    import ƒ = FudgeCore;
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
         * @param _rotation in degrees around the z-axis
         * @param _gustLifespan lifespan of the gusts in seconds
         * @param _gustSpeed speed of the gusts in units per second
         */
        constructor(_offset: number, _interval: number, _rotation: number, _gustLifespan: number, _gustSpeed: number);
        protected update: (_event: ƒ.Eventƒ) => void;
    }
}
