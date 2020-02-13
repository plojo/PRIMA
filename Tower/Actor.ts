namespace MyGame {
    import ƒ = FudgeCore;

    export abstract class Actor extends ƒ.Node {
        protected static sprites: Sprite[] = [];
        protected static readonly distanceMax: ƒ.Vector2 = new ƒ.Vector2(0.1, 0.1);

        protected abstract update: (_event: ƒ.Eventƒ) => void;

        constructor(_name: string) {
            super(_name);
            this.addComponent(new ƒ.ComponentTransform());

            let animatedNodeSprite: AnimatedNodeSprite = new AnimatedNodeSprite("AnimatedNodeSprite");
            animatedNodeSprite.addComponent(new ƒ.ComponentTransform());
            this.appendChild(animatedNodeSprite);

            let hitBoxes: ƒ.Node = new ƒ.Node("HitBoxes");
            hitBoxes.addComponent(new ƒ.ComponentTransform());
            this.appendChild(hitBoxes);

            for (let sprite of Actor.sprites) {
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

        protected registerUpdate(): void {
            ƒ.Loop.addEventListener(ƒ.EVENT.LOOP_FRAME, this.update);
        }

        protected get animatedNodeSprite(): AnimatedNodeSprite {
            return <AnimatedNodeSprite>this.getChildrenByName("AnimatedNodeSprite")[0];
        }

        protected get hitBoxes(): ƒ.Node {
            return this.getChildrenByName("HitBoxes")[0];
        }

        protected absMinSigned(x: number, y: number): number {
            return Math.sign(x) * Math.min(Math.abs(x), Math.abs(y));
        }
    }
}