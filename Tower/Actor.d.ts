declare namespace MyGame {
    import ƒ = FudgeCore;
    abstract class Actor extends ƒ.Node {
        static sprites: Sprite[];
        protected abstract update: (_event: ƒ.Eventƒ) => void;
        constructor(_name: string, _sprites: Sprite[]);
        protected readonly animatedNodeSprite: AnimatedNodeSprite;
        protected registerUpdate(): void;
        protected removeUpdate(): void;
    }
}
