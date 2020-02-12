declare namespace MyGame {
    import ƒ = FudgeCore;
    abstract class Actor extends ƒ.Node {
        protected static sprites: Sprite[];
        protected static readonly distanceMax: ƒ.Vector2;
        constructor(_name: string);
        protected readonly animatedNodeSprite: AnimatedNodeSprite;
        protected readonly hitBoxes: ƒ.Node;
        protected absMinSigned(x: number, y: number): number;
    }
}
