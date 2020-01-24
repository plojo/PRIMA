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
    class Character extends ƒ.Node {
        constructor(_name = "Hare") {
            super(_name);
            this.speed = ƒ.Vector3.ZERO();
            this.spriteFrameInterval = 0.1; // seconds
            this.cyclicAnimationTimer = 0;
            this.singleAnimationPlaying = false;
            this.direction = 0;
            this.update = (_event) => {
                let timeFrame = Math.min(0.02, ƒ.Loop.timeFrameGame / 1000); // seconds
                this.cyclicAnimationTimer += timeFrame;
                if (this.cyclicAnimationTimer >= this.spriteFrameInterval) {
                    this.broadcastEvent(new CustomEvent("showNext"));
                    this.cyclicAnimationTimer = 0;
                }
                this.updateSpeed(timeFrame);
                this.posLast = this.cmpTransform.local.translation;
                let distance = ƒ.Vector3.SCALE(this.speed, timeFrame);
                this.cmpTransform.local.translate(distance);
                // console.log("last " + this.posLast);
                // console.log("target " + this.cmpTransform.local.translation);
                this.checkCollision();
            };
            this.addComponent(new ƒ.ComponentTransform());
            let sprites = new ƒ.Node("Sprites");
            sprites.addComponent(new ƒ.ComponentTransform());
            this.appendChild(sprites);
            let hitBoxes = new ƒ.Node("HitBoxes");
            hitBoxes.addComponent(new ƒ.ComponentTransform());
            this.appendChild(hitBoxes);
            // let hitBox: Collidable = new Collidable("HitBoxVertical");
            let hitBox = new MyGame.Tile("lime");
            hitBox.name = "HitBoxVertical";
            hitBox.cmpTransform.local.scaleY(-1);
            hitBox.cmpTransform.local.scaleX(0.3);
            hitBoxes.appendChild(hitBox);
            // hitBox = new Collidable("HitBoxHorizontal");
            hitBox = new MyGame.Tile("pink");
            hitBox.name = "HitBoxHorizontal";
            hitBox.cmpTransform.local.scaleY(-0.8);
            hitBox.cmpTransform.local.scaleX(0.5);
            hitBox.cmpTransform.local.translateY(0.1);
            hitBoxes.appendChild(hitBox);
            for (let sprite of Character.sprites) {
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
            Character.sprites = [];
            let sprite = new MyGame.Sprite(ACTION.IDLE);
            sprite.generateByGrid(_txtImage, ƒ.Rectangle.GET(0, 0, 60, 80), 4, ƒ.Vector2.ZERO(), 64, ƒ.ORIGIN2D.BOTTOMCENTER);
            Character.sprites.push(sprite);
            sprite = new MyGame.Sprite(ACTION.WALK);
            sprite.generateByGrid(_txtImage, ƒ.Rectangle.GET(0, 90, 60, 80), 6, ƒ.Vector2.ZERO(), 64, ƒ.ORIGIN2D.BOTTOMCENTER);
            Character.sprites.push(sprite);
            sprite = new MyGame.Sprite(ACTION.JUMPSQUAT);
            sprite.generateByGrid(_txtImage, ƒ.Rectangle.GET(60, 180, 60, 80), 1, ƒ.Vector2.ZERO(), 64, ƒ.ORIGIN2D.BOTTOMCENTER);
            Character.sprites.push(sprite);
            sprite = new MyGame.Sprite(ACTION.JUMP);
            sprite.generateByGrid(_txtImage, ƒ.Rectangle.GET(120, 180, 60, 80), 4, ƒ.Vector2.ZERO(), 64, ƒ.ORIGIN2D.BOTTOMCENTER);
            Character.sprites.push(sprite);
            sprite = new MyGame.Sprite(ACTION.FALL);
            sprite.generateByGrid(_txtImage, ƒ.Rectangle.GET(360, 180, 60, 80), 1, ƒ.Vector2.ZERO(), 64, ƒ.ORIGIN2D.BOTTOMCENTER);
            Character.sprites.push(sprite);
        }
        show(_action) {
            for (let child of this.sprites.getChildren())
                child.activate(child.name == _action);
        }
        act(_action, _direction) {
            switch (_action) {
                case ACTION.IDLE:
                    this.direction = 0;
                    break;
                case ACTION.WALK:
                    this.direction = (_direction == DIRECTION.RIGHT ? 1 : -1);
                    this.sprites.cmpTransform.local.rotation = ƒ.Vector3.Y(90 - 90 * this.direction);
                    // let direction: number = (_direction == DIRECTION.RIGHT ? 1 : -1);
                    // this.speed.x = Hare.speedMax.x * direction;
                    // this.cmpTransform.local.rotation = ƒ.Vector3.Y(90 - 90 * direction);
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
        updateSpeed(_timeFrame) {
            if (this.grounded()) {
                if (this.direction == 0) {
                    this.speed.x -= this.speed.x * Character.friction.x * _timeFrame;
                    if (Math.abs(this.speed.x) < 0.001)
                        this.speed.x = 0;
                }
                else {
                    this.speed.x = Character.speedMax.x * this.direction;
                    // this.speed.x += Hare.acceleration.x * this.direction * timeFrame;
                }
            }
            else {
                this.speed.x += Character.acceleration.x * this.direction * _timeFrame;
            }
            this.speed.y += Character.gravity.y * _timeFrame;
            this.speed.x = absMinSigned(this.speed.x, Character.speedMax.x);
            this.speed.y = absMinSigned(this.speed.y, Character.speedMax.y);
            function absMinSigned(x, y) {
                return Math.sign(x) * Math.min(Math.abs(x), Math.abs(y));
            }
            // console.log(this.speed.toString());
        }
        checkCollision() {
            for (let tile of MyGame.level.getChildren()) {
                ƒ.RenderManager.update();
                let tileHitBox = tile.getRectWorld();
                let playerHitBox = this.hitBoxVertical.getRectWorld();
                let translation = this.cmpTransform.local.translation;
                if (playerHitBox.collides(tileHitBox)) {
                    // console.log("ver");
                    this.resolveCollisionVertical(translation, playerHitBox, tileHitBox);
                    this.speed.y = 0;
                }
                else {
                    playerHitBox = this.hitBoxHorizontal.getRectWorld();
                    if (playerHitBox.collides(tileHitBox)) {
                        // console.log("hor");
                        this.resolveCollisionHorizontal(translation, playerHitBox, tileHitBox);
                        this.speed.x = 0;
                    }
                }
                this.cmpTransform.local.translation = translation;
            }
        }
        resolveCollisionVertical(_translation, _hitBox, _tile) {
            if (this.posLast.y >= _tile.top) {
                // console.log("move up");
                _translation.y = _tile.bottom;
            }
            else {
                // console.log("move down");
                _translation.y = _tile.top - _hitBox.height;
            }
        }
        resolveCollisionHorizontal(_translation, _hitBox, _tile) {
            if (this.posLast.x <= _tile.left) {
                // console.log("move left");
                _translation.x = _tile.left - _hitBox.width / 2;
            }
            else {
                // console.log("move right");
                _translation.x = _tile.right + _hitBox.width / 2;
            }
        }
        grounded() {
            return this.speed.y == 0;
        }
        get sprites() {
            return this.getChildrenByName("Sprites")[0];
        }
        get hitBoxes() {
            return this.getChildrenByName("HitBoxes")[0];
        }
        get hitBoxVertical() {
            return this.hitBoxes.getChildrenByName("HitBoxVertical")[0];
        }
        get hitBoxHorizontal() {
            return this.hitBoxes.getChildrenByName("HitBoxHorizontal")[0];
        }
    }
    Character.speedMax = new ƒ.Vector2(3, 15); // units per second
    Character.gravity = ƒ.Vector2.Y(-10); //units per square second
    Character.friction = ƒ.Vector2.X(15); //units per square second
    Character.acceleration = ƒ.Vector2.X(4.5); //units per square second, used to calculate mid air movement
    MyGame.Character = Character;
})(MyGame || (MyGame = {}));
