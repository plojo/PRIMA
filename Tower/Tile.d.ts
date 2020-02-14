declare namespace MyGame {
    import ƒ = FudgeCore;
    abstract class Tile extends ƒ.Node {
        protected static sprite: Sprite;
        constructor(_sprite: Sprite);
        get hitBox(): HitBox;
    }
    class Platform extends Tile {
        constructor();
        static generateSprite(_txtImage: ƒ.TextureImage): void;
    }
}
