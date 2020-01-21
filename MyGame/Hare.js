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
                this.cmpTransform.local.translate(distance);
                this.checkCollision();
            };
            this.addComponent(new ƒ.ComponentTransform());
            let sprites = new ƒ.Node("Sprites");
            sprites.addComponent(new ƒ.ComponentTransform());
            this.appendChild(sprites);
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
        checkCollision() {
            for (let floor of MyGame.level.getChildren()) {
                let rect = floor.getRectWorld();
                let hit = rect.isInside(this.cmpTransform.local.translation.toVector2());
                if (hit) {
                    let translation = this.cmpTransform.local.translation;
                    translation.y = rect.y;
                    this.cmpTransform.local.translation = translation;
                    this.speed.y = 0;
                }
            }
        }
        grounded() {
            return this.speed.y == 0;
        }
        get sprites() {
            return this.getChildrenByName("Sprites")[0];
        }
    }
    Hare.speedMax = new ƒ.Vector2(3, 5); // units per second
    Hare.gravity = ƒ.Vector2.Y(-10); //units per square second
    MyGame.Hare = Hare;
})(MyGame || (MyGame = {}));
