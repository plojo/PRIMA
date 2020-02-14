declare namespace MyGame {
    import ƒ = FudgeCore;
    class AnimatedNodeSprite extends ƒ.Node {
        action: ACTION;
        private gameFrameCounter;
        private get actionNode();
        play(_action: ACTION): void;
        getNodeSprite(_action: ACTION): NodeSprite;
        registerUpdate(): void;
        private update;
    }
}
