declare namespace MyGame {
    import ƒ = FudgeCore;
    enum ACTION {
        IDLE = "Idle",
        WALK = "Walk",
        JUMP = "Jump",
        JUMPSQUAT = "JumpSquat",
        FALL = "Fall",
        DASH = "Dash"
    }
    enum DIRECTION {
        LEFT = 0,
        RIGHT = 1
    }
    class Character extends ƒ.Node {
        private static sprites;
        private static readonly speedMax;
        private static readonly distanceMax;
        private static gravity;
        private static friction;
        private static accelerationGround;
        private static accelerationMidAir;
        acceleration: ƒ.Vector3;
        speed: ƒ.Vector3;
        private posLast;
        private direction;
        private grounded;
        constructor(_name: string);
        static generateSprites(_txtImage: ƒ.TextureImage): void;
        private get animatedNodeSprite();
        private get hitBoxes();
        private get hitBoxVertical();
        private get hitBoxHorizontal();
        act(_action: ACTION, _direction?: DIRECTION): void;
        private update;
        private updateSpeed;
        private checkCollision;
        private resolveCollisionVertical;
        private resolveCollisionHorizontal;
        private absMinSigned;
    }
}
