namespace MyGame {
    import ƒ = FudgeCore;

    export class Gust extends Actor {
        private speed: ƒ.Vector3;
        private lastFrameCollision: boolean = false;

        constructor(_speed: ƒ.Vector3, _lifespan: number) {
            super(TYPE.GUST, Gust.sprites);
            this.speed = _speed;

            let hitBox: Collidable = new Collidable("HitBox");
            hitBox.cmpTransform.local.scaleY(1.5);
            hitBox.cmpTransform.local.scaleX(1.5);
            this.appendChild(hitBox);

            this.registerUpdate();
            
            this.animatedNodeSprite.getNodeSprite(ACTION.IDLE).activate(true);
            this.animatedNodeSprite.play(ACTION.IDLE);

            this.animatedNodeSprite.registerUpdate();

            ƒ.Time.game.setTimer(_lifespan, 1, () => {
                this.removeUpdate();
                this.getParent().removeChild(this);
            });

        }

        public static generateSprites(_txtImage: ƒ.TextureImage): void {
            this.sprites = [];
            let sprite: Sprite = new Sprite(ACTION.IDLE);
            sprite.generateByGrid(_txtImage, ƒ.Rectangle.GET(0, 0, 42, 40), 4, ƒ.Vector2.ZERO(), 16, ƒ.ORIGIN2D.CENTER);
            this.sprites.push(sprite);
        }

        private get hitBox(): Collidable {
            return <Collidable>this.getChildrenByName("HitBox")[0];
        }

        protected update = (_event: ƒ.Eventƒ): void => {
            let timeFrame: number = ƒ.Loop.timeFrameGame / 1000; // seconds
            let distance: ƒ.Vector3 = ƒ.Vector3.SCALE(this.speed, timeFrame);
            this.cmpTransform.local.translate(distance);
            this.checkCollision(distance);
        }

        private checkCollision(_distance: ƒ.Vector3): void {
            if (this.hitBox.getRectWorld().collides(player.hitBoxHorizontal.getRectWorld())) {
                this.lastFrameCollision = true;
                player.cmpTransform.local.translate(ƒ.Vector3.SCALE(ƒ.Vector3.TRANSFORMATION(_distance, this.mtxWorld, false), 0.3));
            } else if (this.lastFrameCollision) {
                this.lastFrameCollision = false;
                player.speed = ƒ.Vector3.SUM(player.speed, ƒ.Vector3.SCALE(ƒ.Vector3.TRANSFORMATION(this.speed, this.mtxWorld, false), 0.3));
            }
        }
    }

    export class GustSpawner extends Actor {
        private elapsedTime: number = 0;
        private interval: number;
        private gustLifespan: number;
        private gustSpeed: number;

        /**
         * 
         * @param _name name
         * @param _offset time in seconds after which the the blower should start blowing
         * @param _interval time in seconds that elapses between the gusts are spwaned
         * @param _gustLifespan lifespan of the gusts in seconds
         * @param _gustSpeed speed of the gusts in units per second
         */
        constructor(_offset: number = 0, _interval: number, _gustLifespan: number, _gustSpeed: number) {
            super(TYPE.GUSTSPAWNER, []);
            this.interval = _interval * 1000;
            this.gustLifespan = _gustLifespan * 1000;
            this.gustSpeed = _gustSpeed;
            ƒ.Time.game.setTimer(_offset, 1, () => {
                this.registerUpdate();
            });
        }

        protected update = (_event: ƒ.Eventƒ): void => {
            let timeFrame: number = ƒ.Loop.timeFrameGame;
            this.elapsedTime += timeFrame;
            if (this.elapsedTime >= this.interval) {
                let gust: Gust = new Gust(ƒ.Vector3.X(this.gustSpeed), this.gustLifespan);
                this.appendChild(gust);
                this.elapsedTime = 0;
            }
        }
    }
}