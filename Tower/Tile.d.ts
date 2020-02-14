declare namespace MyGame {
    import ƒ = FudgeCore;
    class Tile extends Collidable {
        private static sprites;
        constructor(_cssColor: string);
        static generateSprite(_txtImage: ƒ.TextureImage): void;
    }
}
