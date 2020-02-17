declare namespace MyGame {
    import ƒ = FudgeCore;
    class AnimatedNodeSprite extends ƒ.Node {
        action: ACTION;
        private gameFrameCounter;
        readonly actionNode: NodeSprite;
        play(_action: ACTION): void;
        getNodeSprite(_action: ACTION): NodeSprite;
        registerUpdate(): void;
        removeUpdate(): void;
        private update;
    }
}
