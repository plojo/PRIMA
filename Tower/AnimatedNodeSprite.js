"use strict";
var MyGame;
(function (MyGame) {
    var ƒ = FudgeCore;
    class AnimatedNodeSprite extends ƒ.Node {
        action = MyGame.ACTION.IDLE;
        gameFrameCounter = 0;
        // private spriteFrameInterval: number = 8;
        get actionNode() {
            return this.getNodeSprite(this.action);
        }
        play(_action) {
            if (_action != this.action) {
                this.gameFrameCounter = 0;
                this.actionNode.activate(false);
                this.action = _action;
                this.actionNode.showFrame(0);
                this.actionNode.activate(true);
            }
        }
        getNodeSprite(_action) {
            return this.getChildrenByName(_action)[0];
        }
        registerUpdate() {
            ƒ.Loop.addEventListener("loopFrame" /* LOOP_FRAME */, this.update);
        }
        removeUpdate() {
            ƒ.Loop.removeEventListener("loopFrame" /* LOOP_FRAME */, this.update);
        }
        update = (_event) => {
            this.gameFrameCounter++;
            let actionNode = this.actionNode;
            if (this.gameFrameCounter >= actionNode.spriteFrameInterval) {
                this.gameFrameCounter = 0;
                // this.dispatchEvent(new CustomEvent("changedFrame"));
                // console.log(this.action + " " + this.actionNode.frameCurrent);
                if (actionNode.frameCurrent == actionNode.sprite.frames.length - 1) {
                    this.dispatchEvent(new CustomEvent("animationFinished"));
                }
                this.dispatchEvent(new CustomEvent("frameChanged"));
                actionNode.showFrameNext();
            }
        };
    }
    MyGame.AnimatedNodeSprite = AnimatedNodeSprite;
})(MyGame || (MyGame = {}));
