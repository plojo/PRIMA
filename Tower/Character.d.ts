declare namespace MyGame {
    import ƒ = FudgeCore;
    enum ACTION {
        IDLE = "Idle",
        WALK = "Walk",
        JUMP = "Jump",
        JUMPSQUAT = "JumpSquat",
        JUMPSTART = "JumpStart",
        FALL = "Fall"
    }
    enum DIRECTION {
        LEFT = 0,
        RIGHT = 1
    }
    class Character extends Actor {
        private static readonly speedMax;
        private static readonly distanceMax;
        private static gravity;
        private static friction;
        private static accelerationGround;
        private static accelerationMidAir;
        private static jumpSpeed;
        acceleration: ƒ.Vector3;
        speed: ƒ.Vector3;
        private grounded;
        private jumpStart;
        constructor(_name: string);
        static generateSprites(_txtImage: ƒ.TextureImage): void;
        get hitBoxVertical(): Collidable;
        get hitBoxHorizontal(): Collidable;
        act(_action: ACTION, _direction?: DIRECTION): void;
        protected update: (_event: ƒ.Eventƒ) => void;
        private absMinSigned;
        private checkCollision;
        private resolveCollisionVertical;
        private resolveCollisionHorizontal;
    }
}
