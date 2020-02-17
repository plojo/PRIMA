namespace MyGame {
    import ƒ = FudgeCore;

    export abstract class Actor extends ƒ.Node {
        public static sprites: Sprite[]; // this should be abstract...

        protected abstract update: (_event: ƒ.Eventƒ) => void;

        constructor(_name: string, _sprites: Sprite[]) {
            super(_name);
            this.addComponent(new ƒ.ComponentTransform());

            let animatedNodeSprite: AnimatedNodeSprite = new AnimatedNodeSprite("AnimatedNodeSprite");
            animatedNodeSprite.addComponent(new ƒ.ComponentTransform());
            this.appendChild(animatedNodeSprite);

            let hitBoxes: ƒ.Node = new ƒ.Node("HitBoxes");
            hitBoxes.addComponent(new ƒ.ComponentTransform());
            this.appendChild(hitBoxes);

            for (let sprite of _sprites) {
                let nodeSprite: NodeSprite = new NodeSprite(sprite.name, sprite);
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
        
        protected get animatedNodeSprite(): AnimatedNodeSprite {
            return <AnimatedNodeSprite>this.getChildrenByName("AnimatedNodeSprite")[0];
        }

        protected get hitBoxes(): ƒ.Node {
            return this.getChildrenByName("HitBoxes")[0];
        }

        protected registerUpdate(): void {
            ƒ.Loop.addEventListener(ƒ.EVENT.LOOP_FRAME, this.update);
        }

        protected removeUpdate(): void {
            ƒ.Loop.removeEventListener(ƒ.EVENT.LOOP_FRAME, this.update);
            this.animatedNodeSprite.removeUpdate();
        }
    }
}