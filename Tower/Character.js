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
        // one unit = one meter
        static speedMax = new ƒ.Vector2(6, 30); // units per second
        static distanceMax = new ƒ.Vector2(0.2, 0.2);
        static gravity = 20; //units per square second
        static friction = 5 * Character.speedMax.x; // = 15 //units per square second
        static accelerationGround = 10 * Character.speedMax.x; // = 30 //units per square second, used to calculate ground movement
        static accelerationMidAir = 1.5 * Character.speedMax.x; // 4.5 //units per square second, used to calculate mid air movement
        static jumpSpeed = 8;
        acceleration = new ƒ.Vector3(0, -Character.gravity, 0);
        speed = ƒ.Vector3.ZERO();
        grounded;
        jumpStart = false;
        constructor(_name) {
            super(_name, Character.sprites);
            let hitBox = new MyGame.Collidable("HitBoxVertical");
            // hitBox.cmpTransform.local = ƒ.Matrix4x4.MULTIPLICATION(hitBox.cmpTransform.local,  this.animatedNodeSprite.getNodeSprite(ACTION.IDLE).cmpMesh.pivot);
            hitBox.cmpTransform.local.scaleY(1.8);
            hitBox.cmpTransform.local.scaleX(0.39);
            hitBox.cmpTransform.local.translateY(0.9);
            this.appendChild(hitBox);
            hitBox = new MyGame.Collidable("HitBoxHorizontal");
            // hitBox.cmpTransform.local = ƒ.Matrix4x4.MULTIPLICATION(hitBox.cmpTransform.local,  this.animatedNodeSprite.getNodeSprite(ACTION.IDLE).cmpMesh.pivot);
            hitBox.cmpTransform.local.scaleY(1.4);
            hitBox.cmpTransform.local.scaleX(0.80);
            hitBox.cmpTransform.local.translateY(0.9);
            this.appendChild(hitBox);
            this.animatedNodeSprite.getNodeSprite(ACTION.JUMPSQUAT).spriteFrameInterval = 3; // jumpsquat animation should last for 5 frames only
            this.animatedNodeSprite.getNodeSprite(ACTION.JUMP).spriteFrameInterval = 7;
            this.animatedNodeSprite.getNodeSprite(ACTION.IDLE).activate(true);
            this.animatedNodeSprite.registerUpdate();
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
            this.addEventListener("frameChanged", (_event) => {
                // console.log("framChanged");
                if (this.animatedNodeSprite.action == ACTION.WALK) {
                    let currentAnimationFrame = this.animatedNodeSprite.actionNode.frameCurrent;
                    if (currentAnimationFrame == 1 || currentAnimationFrame == 4)
                        MyGame.Audio.play(MyGame.AUDIO.MOVE);
                }
            }, true);
            this.animatedNodeSprite.play(ACTION.IDLE);
            this.registerUpdate();
        }
        static generateSprites(_txtImage) {
            this.sprites = [];
            let resolutionQuad = 16;
            let sprite = new MyGame.Sprite(ACTION.IDLE);
            sprite.generateByGrid(_txtImage, ƒ.Rectangle.GET(10, 0, 30, 36), 4, ƒ.Vector2.X(20), resolutionQuad, ƒ.ORIGIN2D.BOTTOMCENTER);
            this.sprites.push(sprite);
            sprite = new MyGame.Sprite(ACTION.WALK);
            sprite.generateByGrid(_txtImage, ƒ.Rectangle.GET(60, 37, 30, 36), 6, ƒ.Vector2.X(20), resolutionQuad, ƒ.ORIGIN2D.BOTTOMCENTER);
            this.sprites.push(sprite);
            sprite = new MyGame.Sprite(ACTION.JUMPSQUAT);
            sprite.generateByGrid(_txtImage, ƒ.Rectangle.GET(10, 74, 30, 36), 2, ƒ.Vector2.X(20), resolutionQuad, ƒ.ORIGIN2D.BOTTOMCENTER);
            this.sprites.push(sprite);
            sprite = new MyGame.Sprite(ACTION.JUMP);
            sprite.generateByGrid(_txtImage, ƒ.Rectangle.GET(110, 74, 30, 36), 6, ƒ.Vector2.X(20), resolutionQuad, ƒ.ORIGIN2D.BOTTOMCENTER);
            this.sprites.push(sprite);
            sprite = new MyGame.Sprite(ACTION.FALL);
            sprite.generateByGrid(_txtImage, ƒ.Rectangle.GET(410, 74, 30, 36), 2, ƒ.Vector2.X(20), resolutionQuad, ƒ.ORIGIN2D.BOTTOMCENTER);
            this.sprites.push(sprite);
        }
        get hitBoxVertical() {
            return this.getChildrenByName("HitBoxVertical")[0];
        }
        get hitBoxHorizontal() {
            return this.getChildrenByName("HitBoxHorizontal")[0];
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
                        this.speed.y = Character.jumpSpeed;
                        this.animatedNodeSprite.play(_action);
                    }
                    return;
                case ACTION.JUMPSQUAT:
                    // the jump will be started after this animation finished, see event listener "animationFinished"
                    break;
                case ACTION.JUMPSTART:
                    this.jumpStart = true;
                    MyGame.Audio.play(MyGame.AUDIO.JUMP);
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
        update = (_event) => {
            let timeFrame = ƒ.Loop.timeFrameGame / 1000; // seconds
            // console.log("acc: " + this.acceleration.x);
            this.speed = ƒ.Vector3.SUM(this.speed, ƒ.Vector3.SCALE(this.acceleration, timeFrame));
            this.speed.x = this.absMinSigned(this.speed.x, Character.speedMax.x);
            this.speed.y = this.absMinSigned(this.speed.y, Character.speedMax.y);
            // console.log("speed: " + this.speed.x);
            // this.posLast = this.cmpTransform.local.translation;
            let distance = ƒ.Vector3.SCALE(this.speed, timeFrame);
            distance.x = this.absMinSigned(distance.x, Character.distanceMax.x);
            distance.y = this.absMinSigned(distance.y, Character.distanceMax.y);
            this.grounded = false;
            this.checkCollision(distance);
            this.cmpTransform.local.translate(distance);
            // console.log("y: " + this.cmpTransform.local.translation.y);
        };
        absMinSigned(x, y) {
            return Math.sign(x) * Math.min(Math.abs(x), Math.abs(y));
        }
        checkCollision(_distance) {
            // narrowing down possible collisions
            // not anymore 0.0
            // checking possible collisions
            let playerHitBoxVertical = this.hitBoxVertical.getRectWorld();
            let playerHitBoxHorizontal = this.hitBoxHorizontal.getRectWorld();
            // console.log("ver: " + playerHitBoxVertical.position.toString() + " | hori: " + playerHitBoxHorizontal.position.toString());
            playerHitBoxVertical.position.add(_distance.toVector2());
            playerHitBoxHorizontal.position.add(_distance.toVector2());
            // console.log("             ver: " + playerHitBoxVertical.position.toString() + " | hori: " + playerHitBoxHorizontal.position.toString());
            for (let rect of MyGame.Tile.hitBoxes) {
                let tileHitBox = rect;
                let translation = this.cmpTransform.local.translation;
                if (playerHitBoxVertical.collides(tileHitBox)) {
                    // console.log("ver");
                    this.resolveCollisionVertical(translation, playerHitBoxVertical, tileHitBox);
                    _distance.y = 0;
                }
                else {
                    if (playerHitBoxHorizontal.collides(tileHitBox)) {
                        // console.log("hor");
                        this.resolveCollisionHorizontal(translation, playerHitBoxHorizontal, tileHitBox);
                        _distance.x = 0;
                    }
                }
                this.cmpTransform.local.translation = translation;
            }
        }
        resolveCollisionVertical(_translation, _hitBox, _tile) {
            if (_translation.y >= _tile.top) {
                _translation.y = _tile.bottom;
                this.grounded = true;
            }
            else {
                _translation.y = _tile.top + _hitBox.height;
                this.jumpStart = false;
                this.animatedNodeSprite.play(ACTION.FALL);
            }
            this.speed.y = 0;
        }
        resolveCollisionHorizontal(_translation, _hitBox, _tile) {
            if (_translation.x <= _tile.left) {
                _translation.x = _tile.left - _hitBox.width / 2;
            }
            else {
                _translation.x = _tile.right + _hitBox.width / 2;
            }
            this.speed.x = 0;
        }
    }
    MyGame.Character = Character;
})(MyGame || (MyGame = {}));
