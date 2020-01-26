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
        ACTION["DASH"] = "Dash";
    })(ACTION = MyGame.ACTION || (MyGame.ACTION = {}));
    let DIRECTION;
    (function (DIRECTION) {
        DIRECTION[DIRECTION["LEFT"] = 0] = "LEFT";
        DIRECTION[DIRECTION["RIGHT"] = 1] = "RIGHT";
    })(DIRECTION = MyGame.DIRECTION || (MyGame.DIRECTION = {}));
    class Character extends ƒ.Node {
        constructor(_name) {
            super(_name);
            this.acceleration = new ƒ.Vector3(0, -Character.gravity, 0);
            this.speed = ƒ.Vector3.ZERO();
            this.direction = 0;
            this.update = (_event) => {
                let timeFrame = ƒ.Loop.timeFrameGame / 1000; // seconds
                this.updateSpeed(timeFrame);
                this.posLast = this.cmpTransform.local.translation;
                let distance = ƒ.Vector3.SCALE(this.speed, timeFrame);
                // if (this.animatedNodeSprite.action == ACTION.DASH) {
                //   distance.x = 2 * this.direction;
                //   distance.y = 0;
                // }
                distance.x = this.absMinSigned(distance.x, Character.distanceMax.x);
                distance.y = this.absMinSigned(distance.y, Character.distanceMax.y);
                // console.log(distance.toString());
                this.cmpTransform.local.translate(distance);
                this.grounded = false;
                this.checkCollision();
            };
            this.addComponent(new ƒ.ComponentTransform());
            let animatedNodeSprite = new MyGame.AnimatedNodeSprite("AnimatedNodeSprite");
            animatedNodeSprite.addComponent(new ƒ.ComponentTransform());
            this.appendChild(animatedNodeSprite);
            let hitBoxes = new ƒ.Node("HitBoxes");
            hitBoxes.addComponent(new ƒ.ComponentTransform());
            this.appendChild(hitBoxes);
            // let hitBox: Collidable = new Collidable("HitBoxVertical");
            let hitBox = new MyGame.Tile("lime");
            hitBox.name = "HitBoxVertical";
            hitBox.cmpTransform.local.scaleY(-1);
            hitBox.cmpTransform.local.scaleX(0.29);
            hitBoxes.appendChild(hitBox);
            // hitBox = new Collidable("HitBoxHorizontal");
            hitBox = new MyGame.Tile("pink");
            hitBox.name = "HitBoxHorizontal";
            hitBox.cmpTransform.local.scaleY(-0.8);
            hitBox.cmpTransform.local.scaleX(0.50);
            hitBox.cmpTransform.local.translateY(0.1);
            hitBoxes.appendChild(hitBox);
            for (let sprite of Character.sprites) {
                let nodeSprite = new MyGame.NodeSprite(sprite.name, sprite);
                nodeSprite.activate(false);
                this.animatedNodeSprite.appendChild(nodeSprite);
            }
            this.animatedNodeSprite.getNodeSprite(ACTION.JUMPSQUAT).spriteFrameInterval = 5; // jumpsquat animation should last for 5 frames only
            // this.animatedNodeSprite.getNodeSprite(ACTION.DASH).spriteFrameInterval = 20;
            this.animatedNodeSprite.getNodeSprite(ACTION.IDLE).activate(true);
            this.addEventListener("animationFinished", (_event) => {
                // console.log("animationFinished");
                if (this.animatedNodeSprite.action == ACTION.JUMPSQUAT) {
                    this.speed.y = 6;
                    this.animatedNodeSprite.play(ACTION.JUMP);
                }
                else if (this.grounded) {
                    if (this.animatedNodeSprite.action != ACTION.IDLE)
                        this.animatedNodeSprite.play(ACTION.IDLE);
                }
                else {
                    if (this.animatedNodeSprite.action != ACTION.FALL)
                        this.animatedNodeSprite.play(ACTION.FALL);
                }
            }, true);
            this.animatedNodeSprite.play(ACTION.IDLE);
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
            // sprite = new Sprite(ACTION.DASH);
            // sprite.generateByGrid(_txtImage, ƒ.Rectangle.GET(360, 180, 60, 80), 1, ƒ.Vector2.ZERO(), 64, ƒ.ORIGIN2D.BOTTOMCENTER);
            // Character.sprites.push(sprite);
        }
        act(_action, _direction) {
            switch (_action) {
                case ACTION.IDLE:
                    if (this.grounded) {
                        if (Math.abs(this.speed.x) < 0.1) {
                            this.speed.x = 0;
                            this.acceleration.x = 0;
                        }
                        else
                            this.acceleration.x = -this.speed.x * Character.friction;
                    }
                    else
                        this.acceleration.x = 0;
                    break;
                case ACTION.WALK:
                    this.direction = (_direction == DIRECTION.RIGHT ? 1 : -1);
                    this.animatedNodeSprite.cmpTransform.local.rotation = ƒ.Vector3.Y(90 - 90 * this.direction);
                    if (this.grounded)
                        this.acceleration.x = Character.accelerationGround * this.direction;
                    else
                        this.acceleration.x = Character.accelerationMidAir * this.direction;
                    break;
                case ACTION.JUMPSQUAT:
                    // the jump will be started after this animation finished, see event listener "animationFinished"
                    break;
                // case ACTION.DASH:
                //   this.acceleration.x = 0;
                //   this.speed.x = 3 * this.direction;
                //   this.animatedNodeSprite.play(_action);
                //   break;
            }
            if (this.grounded && this.animatedNodeSprite.action != ACTION.JUMPSQUAT /*&& this.animatedNodeSprite.action != ACTION.DASH*/)
                this.animatedNodeSprite.play(_action);
        }
        updateSpeed(_timeFrame) {
            // console.log(this.speed.toString());
            // console.log(this.acceleration.toString());
            this.speed = ƒ.Vector3.SUM(this.speed, ƒ.Vector3.SCALE(this.acceleration, _timeFrame));
            this.speed.x = this.absMinSigned(this.speed.x, Character.speedMax.x);
            this.speed.y = this.absMinSigned(this.speed.y, Character.speedMax.y);
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
                }
                else {
                    playerHitBox = this.hitBoxHorizontal.getRectWorld();
                    if (playerHitBox.collides(tileHitBox)) {
                        // console.log("hor");
                        this.resolveCollisionHorizontal(translation, playerHitBox, tileHitBox);
                    }
                }
                this.cmpTransform.local.translation = translation;
            }
        }
        resolveCollisionVertical(_translation, _hitBox, _tile) {
            if (this.posLast.y >= _tile.top) {
                _translation.y = _tile.bottom;
                this.grounded = true;
            }
            else {
                _translation.y = _tile.top - _hitBox.height;
                this.animatedNodeSprite.play(ACTION.FALL);
            }
            this.speed.y = 0;
        }
        resolveCollisionHorizontal(_translation, _hitBox, _tile) {
            if (this.posLast.x <= _tile.left) {
                _translation.x = _tile.left - _hitBox.width / 2;
            }
            else {
                _translation.x = _tile.right + _hitBox.width / 2;
            }
            this.speed.x = 0;
        }
        get animatedNodeSprite() {
            return this.getChildrenByName("AnimatedNodeSprite")[0];
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
        absMinSigned(x, y) {
            return Math.sign(x) * Math.min(Math.abs(x), Math.abs(y));
        }
    }
    Character.speedMax = new ƒ.Vector2(3, 15); // units per second
    Character.distanceMax = new ƒ.Vector2(0.1, 0.1);
    Character.gravity = 10; //units per square second
    Character.friction = 15; //units per square second
    Character.accelerationGround = 30; //units per square second, used to calculate ground movement
    Character.accelerationMidAir = 4.5; //units per square second, used to calculate mid air movement
    MyGame.Character = Character;
})(MyGame || (MyGame = {}));
