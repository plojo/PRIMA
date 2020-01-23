"use strict";
var MyGame;
(function (MyGame) {
    var ƒ = FudgeCore;
    let ACTION;
    (function (ACTION) {
        ACTION["IDLE"] = "Idle";
        ACTION["WALK"] = "Walk";
        ACTION["JUMP"] = "Jump";
        ACTION["JUMPSQUAT"] = "JumpSquat";
        ACTION["FALL"] = "Fall";
    })(ACTION = MyGame.ACTION || (MyGame.ACTION = {}));
    let DIRECTION;
    (function (DIRECTION) {
        DIRECTION[DIRECTION["LEFT"] = 0] = "LEFT";
        DIRECTION[DIRECTION["RIGHT"] = 1] = "RIGHT";
    })(DIRECTION = MyGame.DIRECTION || (MyGame.DIRECTION = {}));
    class Hare extends ƒ.Node {
        constructor(_name = "Hare") {
            super(_name);
            this.speed = ƒ.Vector3.ZERO();
            this.spriteFrameInterval = 0.1; // seconds
            this.cyclicAnimationTimer = 0;
            this.singleAnimationPlaying = false;
            this.update = (_event) => {
                let timeFrame = ƒ.Loop.timeFrameGame / 1000; // seconds
                this.cyclicAnimationTimer += timeFrame;
                if (this.cyclicAnimationTimer >= this.spriteFrameInterval) {
                    this.broadcastEvent(new CustomEvent("showNext"));
                    this.cyclicAnimationTimer = 0;
                }
                this.speed.y += Hare.gravity.y * timeFrame;
                let distance = ƒ.Vector3.SCALE(this.speed, timeFrame);
                this.posLast = this.cmpTransform.local.translation.copy;
                this.cmpTransform.local.translate(distance);
                console.log("last " + this.posLast);
                console.log("target " + this.cmpTransform.local.translation);
                // this.checkCollision();
                // this.checkCollisionBody(save);
                this.checkCollisionTopBottom();
                this.checkCollisionLeftRight();
            };
            this.addComponent(new ƒ.ComponentTransform());
            let sprites = new ƒ.Node("Sprites");
            sprites.addComponent(new ƒ.ComponentTransform());
            this.appendChild(sprites);
            let hitBoxes = new ƒ.Node("HitBoxes");
            hitBoxes.addComponent(new ƒ.ComponentTransform());
            this.appendChild(hitBoxes);
            let hitBox = new MyGame.Collidable("HitBoxLeftRight", "pink");
            hitBox.cmpTransform.local.scaleY(-0.8);
            hitBox.cmpTransform.local.scaleX(0.5);
            hitBox.cmpTransform.local.translateY(0.1);
            hitBoxes.appendChild(hitBox);
            hitBox = new MyGame.Collidable("HitBoxTopBottom", "lime");
            hitBox.cmpTransform.local.scaleY(-1);
            hitBox.cmpTransform.local.scaleX(0.3);
            hitBoxes.appendChild(hitBox);
            for (let sprite of Hare.sprites) {
                let nodeSprite = new MyGame.NodeSprite(sprite.name, sprite);
                nodeSprite.activate(false);
                nodeSprite.addEventListener("showNext", (_event) => {
                    if (_event.currentTarget.isActive)
                        _event.currentTarget.showFrameNext();
                }, true);
                nodeSprite.addEventListener("resetFrame", (_event) => {
                    if (_event.currentTarget.isActive)
                        _event.currentTarget.showFrame(0);
                }, true);
                this.sprites.appendChild(nodeSprite);
            }
            this.show(ACTION.IDLE);
            ƒ.Loop.addEventListener("loopFrame" /* LOOP_FRAME */, this.update);
        }
        static generateSprites(_txtImage) {
            Hare.sprites = [];
            let sprite = new MyGame.Sprite(ACTION.IDLE);
            sprite.generateByGrid(_txtImage, ƒ.Rectangle.GET(0, 0, 60, 80), 4, ƒ.Vector2.ZERO(), 64, ƒ.ORIGIN2D.BOTTOMCENTER);
            Hare.sprites.push(sprite);
            sprite = new MyGame.Sprite(ACTION.WALK);
            sprite.generateByGrid(_txtImage, ƒ.Rectangle.GET(0, 90, 60, 80), 6, ƒ.Vector2.ZERO(), 64, ƒ.ORIGIN2D.BOTTOMCENTER);
            Hare.sprites.push(sprite);
            sprite = new MyGame.Sprite(ACTION.JUMPSQUAT);
            sprite.generateByGrid(_txtImage, ƒ.Rectangle.GET(60, 180, 60, 80), 1, ƒ.Vector2.ZERO(), 64, ƒ.ORIGIN2D.BOTTOMCENTER);
            Hare.sprites.push(sprite);
            sprite = new MyGame.Sprite(ACTION.JUMP);
            sprite.generateByGrid(_txtImage, ƒ.Rectangle.GET(120, 180, 60, 80), 4, ƒ.Vector2.ZERO(), 64, ƒ.ORIGIN2D.BOTTOMCENTER);
            Hare.sprites.push(sprite);
            sprite = new MyGame.Sprite(ACTION.FALL);
            sprite.generateByGrid(_txtImage, ƒ.Rectangle.GET(360, 180, 60, 80), 1, ƒ.Vector2.ZERO(), 64, ƒ.ORIGIN2D.BOTTOMCENTER);
            Hare.sprites.push(sprite);
        }
        show(_action) {
            for (let child of this.sprites.getChildren())
                child.activate(child.name == _action);
        }
        act(_action, _direction) {
            switch (_action) {
                case ACTION.IDLE:
                    this.speed.x = 0;
                    break;
                case ACTION.WALK:
                    let direction = (_direction == DIRECTION.RIGHT ? 1 : -1);
                    this.speed.x = Hare.speedMax.x * direction;
                    this.sprites.cmpTransform.local.rotation = ƒ.Vector3.Y(90 - 90 * direction);
                    break;
                case ACTION.JUMP:
                    if (this.grounded()) {
                        this.singleAnimationPlaying = true;
                        this.show(ACTION.JUMPSQUAT);
                        ƒ.Time.game.setTimer(50, 1, () => {
                            this.speed.y = 6;
                            this.show(ACTION.JUMP);
                            this.broadcastEvent(new CustomEvent("resetFrame"));
                            ƒ.Time.game.setTimer(400, 1, () => {
                                this.show(ACTION.FALL);
                                this.singleAnimationPlaying = false;
                            });
                        });
                    }
                    break;
            }
            if (!this.singleAnimationPlaying) {
                if (this.grounded()) {
                    this.show(_action);
                }
                else {
                    this.show(ACTION.FALL);
                }
            }
        }
        // private checkCollision(): void {
        //   for (let floor of level.getChildren()) {
        //     let rect: ƒ.Rectangle = (<Floor>floor).getRectWorld();
        //     let hit: boolean = rect.isInside(this.cmpTransform.local.translation.toVector2());
        //     if (hit) {
        //       let translation: ƒ.Vector3 = this.cmpTransform.local.translation;
        //       translation.y = rect.y;
        //       this.cmpTransform.local.translation = translation;
        //       this.speed.y = 0;
        //     }
        //   }
        // }
        checkCollisionTopBottom() {
            for (let tile of MyGame.level.getChildren()) {
                ƒ.RenderManager.update();
                let tileHitBox = tile.getRectWorld();
                let playerHitBox = this.hitBoxTopBottom.getRectWorld();
                let hit = playerHitBox.collides(tileHitBox);
                if (hit) {
                    let translation = this.cmpTransform.local.translation;
                    if (this.posLast.y >= tileHitBox.bottom) {
                        translation.y = tileHitBox.bottom;
                    }
                    else {
                        translation.y = tileHitBox.top - playerHitBox.height;
                    }
                    this.cmpTransform.local.translation = translation;
                    this.speed.y = 0;
                }
            }
        }
        checkCollisionLeftRight() {
            for (let tile of MyGame.level.getChildren()) {
                ƒ.RenderManager.update();
                let tileHitBox = tile.getRectWorld();
                let playerHitBox = this.hitBoxLeftRight.getRectWorld();
                let hit = playerHitBox.collides(tileHitBox);
                if (hit) {
                    let translation = this.cmpTransform.local.translation;
                    if (this.posLast.x <= tileHitBox.left) {
                        translation.x = tileHitBox.left - playerHitBox.width / 2;
                    }
                    else {
                        translation.x = tileHitBox.right + playerHitBox.width / 2;
                    }
                    console.log(translation.toString());
                    this.cmpTransform.local.translation = translation;
                    this.speed.x = 0;
                }
            }
        }
        // private checkCollisionBody(_lastMutator: ƒ.Mutator): void { // TODO: replace this.cmpTransform.local.translation. with hitBox position
        //   ƒ.RenderManager.update();
        //   let save: ƒ.Mutator = this.cmpTransform.local.getMutator();
        //   console.log("last:" + this.posLast.toString());
        //   // console.log(this.hitBoxBody.getRectWorld().position.toString());
        //   for (let floor of level.getChildren()) {
        //     let rect: ƒ.Rectangle = (<Floor>floor).getRectWorld();
        //     let hit: boolean = this.hitBoxBody.getRectWorld().collides(rect);
        //     if (hit) {
        //       let outerBound: ƒ.Vector3 = this.posLast;
        //       let innerBound: ƒ.Vector3 = this.cmpTransform.local.translation.copy;
        //       let delta: number = 1;
        //       while (delta > 0.01) {
        //         delta = ƒ.Vector3.DIFFERENCE(outerBound, innerBound).magnitude;
        //         this.cmpTransform.local.translation = ƒ.Vector3.SCALE(ƒ.Vector3.SUM(innerBound, outerBound), 0.5);
        //         if (this.hitBoxBody.getRectWorld().collides(rect)) {
        //           innerBound = this.cmpTransform.local.translation.copy;
        //         } else {
        //           outerBound = this.cmpTransform.local.translation.copy;
        //         }
        //       }
        //       console.log("middle: " + this.cmpTransform.local.translation.toString());
        //       this.cmpTransform.local.mutate(save);
        //       console.log("target: " + this.cmpTransform.local.translation.toString());
        //       let translation: ƒ.Vector3 = this.cmpTransform.local.translation;
        //       console.log("outerbound: " + outerBound.toString());
        //       if (outerBound.x <= rect.left || outerBound.x >= rect.right) {
        //         console.log(1);
        //         translation.x = outerBound.x;
        //         this.speed.x = 0;
        //       } else {
        //         console.log(3);
        //         if (outerBound.y >= rect.bottom) {
        //           translation.y = outerBound.y;
        //         }
        //         if (outerBound.y <= rect.top) {
        //           translation.y = outerBound.y;
        //         }
        //         this.speed.y = 0;
        //       }
        //       this.cmpTransform.local.translation = translation;
        //       // if (outerBound.x >= rect.right) {
        //       //   console.log(2);
        //       //   this.speed.x = 0;
        //       //   translation.x = outerBound.x;
        //       // }
        //       // if (outerBound.y >= rect.bottom) {
        //       //   console.log(4);
        //       //   this.speed.y = 0;
        //       //   translation.y = outerBound.y;
        //       // }
        //       // if (outerBound.x == rect.)
        //       // let translation: ƒ.Vector3 = this.cmpTransform.local.translation;
        //       // translation.y = outerBound.y;
        //       // this.speed.y = 0;
        //       // this.speed.set(0, 0, 0);
        //     }
        //   }
        // }
        // private checkCollisionBody(): void { // TODO: replace this.cmpTransform.local.translation. with hitBox position
        //   ƒ.RenderManager.update();
        //   for (let floor of level.getChildren()) {
        //     let rect: ƒ.Rectangle = (<Floor>floor).getRectWorld();
        //     let hit: boolean = this.hitBoxBody.getRectWorld().collides(rect);
        //     if (hit) {
        //       let outerBound: ƒ.Vector3 = this.posLast;
        //       let innerBound: ƒ.Vector3 = this.cmpTransform.local.translation.copy;
        //       let delta: number = 1;
        //       while (delta > 0.01) {
        //         delta = ƒ.Vector3.DIFFERENCE(outerBound, innerBound).magnitude;
        //         this.cmpTransform.local.translation = ƒ.Vector3.SCALE(ƒ.Vector3.SUM(innerBound, outerBound), 0.5);
        //         ƒ.RenderManager.update();
        //         if (this.hitBoxBody.getRectWorld().collides(rect)) {
        //           innerBound = this.cmpTransform.local.translation.copy;
        //         } else {
        //           outerBound = this.cmpTransform.local.translation.copy;
        //         }
        //       }
        //       this.cmpTransform.local.translation = outerBound;
        //       // let translation: ƒ.Vector3 = this.cmpTransform.local.translation;
        //       // translation.y = outerBound.y;
        //       // this.cmpTransform.local.translation = translation;
        //       this.speed.y = 0;
        //     }
        //   }
        // }
        grounded() {
            return this.speed.y == 0;
        }
        get sprites() {
            return this.getChildrenByName("Sprites")[0];
        }
        get hitBoxes() {
            return this.getChildrenByName("HitBoxes")[0];
        }
        get hitBoxLeftRight() {
            return this.hitBoxes.getChildrenByName("HitBoxLeftRight")[0];
        }
        get hitBoxTopBottom() {
            return this.hitBoxes.getChildrenByName("HitBoxTopBottom")[0];
        }
    }
    Hare.speedMax = new ƒ.Vector2(3, 5); // units per second
    Hare.gravity = ƒ.Vector2.Y(-10); //units per square second
    MyGame.Hare = Hare;
})(MyGame || (MyGame = {}));
