declare namespace MyGame {
    import ƒ = FudgeCore;
    class Floor extends ƒ.Node {
        private static mesh;
        private static material;
        private static readonly pivot;
        constructor(_cssColor: string);
        getRectWorld(): ƒ.Rectangle;
    }
}
