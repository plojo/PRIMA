"use strict";
var MyGame;
(function (MyGame) {
    var ƒ = FudgeCore;
    class Actor extends ƒ.Node {
        constructor(_name) {
            super(_name);
            this.addComponent(new ƒ.ComponentTransform());
            let animatedNodeSprite = new MyGame.AnimatedNodeSprite("AnimatedNodeSprite");
            animatedNodeSprite.addComponent(new ƒ.ComponentTransform());
            this.appendChild(animatedNodeSprite);
            let hitBoxes = new ƒ.Node("HitBoxes");
            hitBoxes.addComponent(new ƒ.ComponentTransform());
            this.appendChild(hitBoxes);
            for (let sprite of Actor.sprites) {
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
        registerUpdate() {
            ƒ.Loop.addEventListener("loopFrame" /* LOOP_FRAME */, this.update);
        }
        get animatedNodeSprite() {
            return this.getChildrenByName("AnimatedNodeSprite")[0];
        }
        get hitBoxes() {
            return this.getChildrenByName("HitBoxes")[0];
        }
        absMinSigned(x, y) {
            return Math.sign(x) * Math.min(Math.abs(x), Math.abs(y));
        }
    }
    Actor.sprites = [];
    Actor.distanceMax = new ƒ.Vector2(0.1, 0.1);
    MyGame.Actor = Actor;
})(MyGame || (MyGame = {}));
