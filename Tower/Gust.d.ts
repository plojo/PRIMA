declare namespace MyGame {
    import ƒ = FudgeCore;
    class Gust extends Actor {
        speed: ƒ.Vector3;
        constructor(_name: string, _speed: ƒ.Vector3);
        private readonly hitBox;
        static generateSprites(_txtImage: ƒ.TextureImage): void;
        private update;
        private checkCollision;
    }
}
