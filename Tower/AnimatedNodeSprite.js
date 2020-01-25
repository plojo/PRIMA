"use strict";
var MyGame;
(function (MyGame) {
    var ƒ = FudgeCore;
    class AnimatedNodeSprite extends ƒ.Node {
        // private spriteFrameInterval: number = 8;
        constructor(_name) {
            super(_name);
            this.action = MyGame.ACTION.IDLE;
            this.gameFrameCounter = 0;
            this.update = (_event) => {
                this.gameFrameCounter++;
                let actionNode = this.actionNode;
                if (this.gameFrameCounter >= actionNode.spriteFrameInterval) {
                    this.gameFrameCounter = 0;
                    console.log(this.action + " " + this.actionNode.frameCurrent);
                    if (actionNode.frameCurrent == actionNode.sprite.frames.length - 1) {
                        this.dispatchEvent(new CustomEvent("animationFinished"));
                    }
                    actionNode.showFrameNext();
                }
            };
            ƒ.Loop.addEventListener("loopFrame" /* LOOP_FRAME */, this.update);
        }
        start(_action = this.action) {
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
        get actionNode() {
            return this.getNodeSprite(this.action);
        }
    }
    MyGame.AnimatedNodeSprite = AnimatedNodeSprite;
})(MyGame || (MyGame = {}));
