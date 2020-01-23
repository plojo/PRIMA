declare namespace MyGame {
    import ƒ = FudgeCore;
    class Collidable extends ƒ.Node {
        private static mesh;
        private static readonly pivot;
        constructor(_name: string, _cssColor: string);
        getRectWorld(): ƒ.Rectangle;
    }
}
