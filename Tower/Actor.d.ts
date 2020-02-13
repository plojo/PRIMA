declare namespace MyGame {
    import ƒ = FudgeCore;
    abstract class Actor extends ƒ.Node {
        protected static sprites: Sprite[];
        protected abstract update: (_event: ƒ.Eventƒ) => void;
        constructor(_name: string);
        protected registerUpdate(): void;
        protected readonly animatedNodeSprite: AnimatedNodeSprite;
        protected readonly hitBoxes: ƒ.Node;
    }
}
