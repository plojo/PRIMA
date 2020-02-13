declare namespace MyGame {
    import ƒ = FudgeCore;
    class Gust extends Actor {
        speed: ƒ.Vector3;
        constructor(_name: string, _speed: ƒ.Vector3, _lifespan: number);
        private readonly hitBox;
        static generateSprites(_txtImage: ƒ.TextureImage): void;
        protected update: (_event: ƒ.Eventƒ) => void;
        private checkCollision;
    }
}
