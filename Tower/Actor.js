"use strict";
var MyGame;
(function (MyGame) {
    var ƒ = FudgeCore;
    class Actor extends ƒ.Node {
        constructor(_name, _sprites) {
            super(_name);
            this.addComponent(new ƒ.ComponentTransform());
            let animatedNodeSprite = new MyGame.AnimatedNodeSprite("AnimatedNodeSprite");
            animatedNodeSprite.addComponent(new ƒ.ComponentTransform());
            this.appendChild(animatedNodeSprite);
            let hitBoxes = new ƒ.Node("HitBoxes");
            hitBoxes.addComponent(new ƒ.ComponentTransform());
            this.appendChild(hitBoxes);
            for (let sprite of _sprites) {
                let nodeSprite = new MyGame.NodeSprite(sprite.name, sprite);
                nodeSprite.activate(false);
                this.animatedNodeSprite.appendChild(nodeSprite);
            }
            // this.addEventListener(
            //     "registerUpdate",
            //     (_event: Event) => {
            //         this.registerUpdate();
            //     },
            //     true
            // );
        }
        // protected abstract static generateSprites(_txtImage: ƒ.TextureImage): void; // No static abstract methods in typescript <.<
        get animatedNodeSprite() {
            return this.getChildrenByName("AnimatedNodeSprite")[0];
        }
        get hitBoxes() {
            return this.getChildrenByName("HitBoxes")[0];
        }
        registerUpdate() {
            ƒ.Loop.addEventListener("loopFrame" /* LOOP_FRAME */, this.update);
        }
    }
    MyGame.Actor = Actor;
})(MyGame || (MyGame = {}));
