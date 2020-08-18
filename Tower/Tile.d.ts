declare namespace MyGame {
    import ƒ = FudgeCore;
    class Tile extends NodeSprite {
        static hitBoxes: ƒ.Rectangle[];
        protected static sprites: Map<TYPE, Sprite>;
        constructor(_type: TYPE);
        get hitBox(): Collidable;
        static generateSprites(_txtImage: ƒ.TextureImage): void;
    }
}
