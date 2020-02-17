declare namespace MyGame {
    import ƒ = FudgeCore;
    class AnimatedNodeSprite extends ƒ.Node {
        action: ACTION;
        private gameFrameCounter;
        private readonly actionNode;
        play(_action: ACTION): void;
        getNodeSprite(_action: ACTION): NodeSprite;
        registerUpdate(): void;
        removeUpdate(): void;
        private update;
    }
}
