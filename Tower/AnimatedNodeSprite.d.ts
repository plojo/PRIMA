declare namespace MyGame {
    import ƒ = FudgeCore;
    class AnimatedNodeSprite extends ƒ.Node {
        action: ACTION;
        private gameFrameCounter;
        constructor(_name: string);
        play(_action?: ACTION): void;
        getNodeSprite(_action: ACTION): NodeSprite;
        private get actionNode();
        private update;
    }
}
