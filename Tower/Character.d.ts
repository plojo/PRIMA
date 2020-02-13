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
        private static gravity;
        private static friction;
        private static accelerationGround;
        private static accelerationMidAir;
        acceleration: ƒ.Vector3;
        speed: ƒ.Vector3;
        private posLast;
        private grounded;
        private jumpStart;
        constructor(_name: string);
        static generateSprites(_txtImage: ƒ.TextureImage): void;
        private readonly hitBoxVertical;
        readonly hitBoxHorizontal: Collidable;
        act(_action: ACTION, _direction?: DIRECTION): void;
        protected update: (_event: ƒ.Eventƒ) => void;
        private checkCollision;
        private resolveCollisionVertical;
        private resolveCollisionHorizontal;
    }
}
