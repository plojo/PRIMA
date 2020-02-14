namespace MyGame {
    import ƒ = FudgeCore;

    export class AnimatedNodeSprite extends ƒ.Node {
        public action: ACTION = ACTION.IDLE;
        private gameFrameCounter: number = 0;
        // private spriteFrameInterval: number = 8;

        private get actionNode(): NodeSprite {
            return this.getNodeSprite(this.action);
        }

        public play(_action: ACTION): void {
            if (_action != this.action) {
                this.gameFrameCounter = 0;
                this.actionNode.activate(false);
                this.action = _action;
                this.actionNode.showFrame(0);
                this.actionNode.activate(true);
            }
        }

        public getNodeSprite(_action: ACTION): NodeSprite {
            return <NodeSprite>this.getChildrenByName(_action)[0];
        }

        public registerUpdate(): void {
            ƒ.Loop.addEventListener(ƒ.EVENT.LOOP_FRAME, this.update);
        }

        private update = (_event: ƒ.Eventƒ): void => {
            this.gameFrameCounter++;
            let actionNode: NodeSprite = this.actionNode;
            if (this.gameFrameCounter >= actionNode.spriteFrameInterval) {
                this.gameFrameCounter = 0;
                // this.dispatchEvent(new CustomEvent("changedFrame"));
                // console.log(this.action + " " + this.actionNode.frameCurrent);
                if (actionNode.frameCurrent == actionNode.sprite.frames.length - 1) {
                    this.dispatchEvent(new CustomEvent("animationFinished"));
                }
                actionNode.showFrameNext();
            }
        }
    }
}