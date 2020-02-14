declare namespace MyGame {
    import ƒ = FudgeCore;
    class Collidable extends ƒ.Node {
        constructor(_name: string);
        getRectWorld(): ƒ.Rectangle;
    }
}
