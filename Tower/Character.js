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
        ACTION["JUMPSTART"] = "JumpStart";
        ACTION["FALL"] = "Fall";
    })(ACTION = MyGame.ACTION || (MyGame.ACTION = {}));
    let DIRECTION;
    (function (DIRECTION) {
        DIRECTION[DIRECTION["LEFT"] = 0] = "LEFT";
        DIRECTION[DIRECTION["RIGHT"] = 1] = "RIGHT";
    })(DIRECTION = MyGame.DIRECTION || (MyGame.DIRECTION = {}));
    class Character extends MyGame.Actor {
        constructor(_name) {
            super(_name);
            this.acceleration = new ƒ.Vector3(0, -Character.gravity, 0);
            this.speed = ƒ.Vector3.ZERO();
            this.jumpStart = false;
            this.update = (_event) => {
                let timeFrame = ƒ.Loop.timeFrameGame / 1000; // seconds
                // console.log("acc: " + this.acceleration.x);
                // console.log("speed: " + this.speed.x);
                // if (Math.abs(this.speed.x) > Character.speedMax.x)
                //  this.acceleration.x = 0;
                this.acceleration.y = -Character.gravity;
                this.speed = ƒ.Vector3.SUM(this.speed, ƒ.Vector3.SCALE(this.acceleration, timeFrame));
                this.speed.x = this.absMinSigned(this.speed.x, Character.speedMax.x);
                this.speed.y = this.absMinSigned(this.speed.y, Character.speedMax.y);
                this.posLast = this.cmpTransform.local.translation;
                let distance = ƒ.Vector3.SCALE(this.speed, timeFrame);
                distance.x = this.absMinSigned(distance.x, Character.distanceMax.x);
                distance.y = this.absMinSigned(distance.y, Character.distanceMax.y);
                this.cmpTransform.local.translate(distance);
                this.grounded = false;
                this.checkCollision();
            };
            // let hitBox: Collidable = new Collidable("HitBoxVertical");
            let hitBox = new MyGame.Tile("lime");
            hitBox.name = "HitBoxVertical";
            hitBox.cmpTransform.local.scaleY(-1);
            hitBox.cmpTransform.local.scaleX(0.29);
            this.hitBoxes.appendChild(hitBox);
            // hitBox = new Collidable("HitBoxHorizontal");
            hitBox = new MyGame.Tile("pink");
            hitBox.name = "HitBoxHorizontal";
            hitBox.cmpTransform.local.scaleY(-0.8);
            hitBox.cmpTransform.local.scaleX(0.50);
            hitBox.cmpTransform.local.translateY(0.1);
            this.hitBoxes.appendChild(hitBox);
            this.animatedNodeSprite.getNodeSprite(ACTION.JUMPSQUAT).spriteFrameInterval = 5; // jumpsquat animation should last for 5 frames only
            this.animatedNodeSprite.getNodeSprite(ACTION.IDLE).activate(true);
            this.addEventListener("animationFinished", (_event) => {
                // console.log("animationFinished");
                if (this.animatedNodeSprite.action == ACTION.JUMPSQUAT) {
                    this.act(ACTION.JUMPSTART);
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
            this.registerUpdate();
        }
        static generateSprites(_txtImage) {
            let sprite = new MyGame.Sprite(ACTION.IDLE);
            sprite.generateByGrid(_txtImage, ƒ.Rectangle.GET(0, 0, 60, 80), 4, ƒ.Vector2.ZERO(), 64, ƒ.ORIGIN2D.BOTTOMCENTER);
            this.sprites.push(sprite);
            sprite = new MyGame.Sprite(ACTION.WALK);
            sprite.generateByGrid(_txtImage, ƒ.Rectangle.GET(0, 90, 60, 80), 6, ƒ.Vector2.ZERO(), 64, ƒ.ORIGIN2D.BOTTOMCENTER);
            this.sprites.push(sprite);
            sprite = new MyGame.Sprite(ACTION.JUMPSQUAT);
            sprite.generateByGrid(_txtImage, ƒ.Rectangle.GET(60, 180, 60, 80), 1, ƒ.Vector2.ZERO(), 64, ƒ.ORIGIN2D.BOTTOMCENTER);
            this.sprites.push(sprite);
            sprite = new MyGame.Sprite(ACTION.JUMP);
            sprite.generateByGrid(_txtImage, ƒ.Rectangle.GET(180, 180, 60, 80), 3, ƒ.Vector2.ZERO(), 64, ƒ.ORIGIN2D.BOTTOMCENTER);
            this.sprites.push(sprite);
            sprite = new MyGame.Sprite(ACTION.FALL);
            sprite.generateByGrid(_txtImage, ƒ.Rectangle.GET(360, 180, 60, 80), 1, ƒ.Vector2.ZERO(), 64, ƒ.ORIGIN2D.BOTTOMCENTER);
            this.sprites.push(sprite);
        }
        get hitBoxVertical() {
            return this.hitBoxes.getChildrenByName("HitBoxVertical")[0];
        }
        get hitBoxHorizontal() {
            return this.hitBoxes.getChildrenByName("HitBoxHorizontal")[0];
        }
        act(_action, _direction) {
            // console.log(_action);
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
                    let direction = (_direction == DIRECTION.RIGHT ? 1 : -1);
                    this.animatedNodeSprite.cmpTransform.local.rotation = ƒ.Vector3.Y(90 - 90 * direction);
                    this.acceleration.x = (this.grounded ? Character.accelerationGround : Character.accelerationMidAir) * direction;
                    break;
                case ACTION.JUMP:
                    if (!this.jumpStart) {
                        this.act(ACTION.JUMPSQUAT);
                    }
                    else {
                        this.speed.y = 4;
                        this.animatedNodeSprite.play(_action);
                    }
                    return;
                case ACTION.JUMPSQUAT:
                    // the jump will be started after this animation finished, see event listener "animationFinished"
                    break;
                case ACTION.JUMPSTART:
                    this.jumpStart = true;
                    ƒ.Time.game.setTimer(250, 1, () => {
                        this.jumpStart = false;
                    });
                    this.act(ACTION.JUMP);
                    return;
            }
            switch (this.animatedNodeSprite.action) {
                // these animations can not be interrupted
                case ACTION.JUMP:
                case ACTION.JUMPSQUAT:
                    break;
                // all other animations can be interrrupted
                default:
                    if (this.grounded)
                        this.animatedNodeSprite.play(_action);
                    else
                        this.animatedNodeSprite.play(ACTION.FALL);
                    break;
            }
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
    }
    Character.speedMax = new ƒ.Vector2(3, 15); // units per second
    Character.gravity = 10; //units per square second
    Character.friction = 5 * Character.speedMax.x; // = 15 //units per square second
    Character.accelerationGround = 10 * Character.speedMax.x; // = 30 //units per square second, used to calculate ground movement
    Character.accelerationMidAir = 1.5 * Character.speedMax.x; // 4.5 //units per square second, used to calculate mid air movement
    MyGame.Character = Character;
})(MyGame || (MyGame = {}));
