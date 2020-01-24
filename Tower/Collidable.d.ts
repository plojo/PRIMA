declare namespace MyGame {
    import ƒ = FudgeCore;
    class Collidable extends ƒ.Node {
        protected static readonly pivot: ƒ.Matrix4x4;
        constructor(_name: string);
        getRectWorld(): ƒ.Rectangle;
    }
}
