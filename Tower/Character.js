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
            super(_name, Character.sprites);
            this.acceleration = new ƒ.Vector3(0, -Character.gravity, 0);
            this.speed = ƒ.Vector3.ZERO();
            this.jumpStart = false;
            this.update = (_event) => {
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
            let hitBox = new MyGame.HitBox("HitBoxVertical");
            //let hitBox: Collidable = new Tile("lime");
            // hitBox.name = "HitBoxVertical";
            hitBox.cmpTransform.local.scaleY(0.9);
            hitBox.cmpTransform.local.scaleX(0.19);
            hitBox.cmpTransform.local.translateY(0.45);
            this.hitBoxes.appendChild(hitBox);
            hitBox = new MyGame.HitBox("HitBoxHorizontal");
            //hitBox = new Tile("pink");
            // hitBox.name = "HitBoxHorizontal";
            hitBox.cmpTransform.local.scaleY(0.7);
            hitBox.cmpTransform.local.scaleX(0.40);
            hitBox.cmpTransform.local.translateY(0.45);
            this.hitBoxes.appendChild(hitBox);
            this.animatedNodeSprite.getNodeSprite(ACTION.JUMPSQUAT).spriteFrameInterval = 3; // jumpsquat animation should last for 5 frames only
            this.animatedNodeSprite.getNodeSprite(ACTION.JUMP).spriteFrameInterval = 8;
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
            this.animatedNodeSprite.play(ACTION.IDLE);
            this.registerUpdate();
        }
        static generateSprites(_txtImage) {
            this.sprites = [];
            let resolutionQuad = 32;
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
        absMinSigned(x, y) {
            return Math.sign(x) * Math.min(Math.abs(x), Math.abs(y));
        }
        checkCollision(_distance) {
            // narrowing down possible collisions
            // let position: ƒ.Vector3 = this.mtxWorld.translation;
            // position = position.map((_value: number) => { return Math.floor(_value); });
            // let possibleCollisions: ƒ.Rectangle[] = [];
            // for (let x: number = -1; x <= 1; x++) {
            //   for (let y: number = -1; y <= 1; y++) {
            //     possibleCollisions = 
            //       possibleCollisions
            //         .concat(Block.hit[new ƒ.Vector3(position.x + x, position.y + y, 0).toString()])
            //         .filter((_value: ƒ.Rectangle) => _value != null);
            //   }
            // }
            // checking possible collisions
            let playerHitBoxVertical = this.hitBoxVertical.getRectWorld();
            // console.log(" " + playerHitBoxVertical.position.toString());
            playerHitBoxVertical.position.add(_distance.toVector2());
            // console.log("a " + playerHitBoxVertical.position.toString());
            let playerHitBoxHorizontal = this.hitBoxHorizontal.getRectWorld();
            playerHitBoxHorizontal.position.add(_distance.toVector2());
            for (let rect of MyGame.Tile.hitBoxes) {
                let tileHitBox = rect;
                let translation = this.cmpTransform.local.translation;
                if (playerHitBoxVertical.collides(tileHitBox)) {
                    console.log("ver");
                    this.resolveCollisionVertical(translation, playerHitBoxVertical, tileHitBox);
                    playerHitBoxHorizontal.position = playerHitBoxVertical.position;
                    _distance.y = 0;
                }
                else {
                    if (playerHitBoxHorizontal.collides(tileHitBox)) {
                        console.log("hor");
                        this.resolveCollisionHorizontal(translation, playerHitBoxHorizontal, tileHitBox);
                        playerHitBoxVertical.position = playerHitBoxHorizontal.position;
                        _distance.x = 0;
                    }
                }
                this.cmpTransform.local.translation = translation;
            }
        }
        resolveCollisionVertical(_translation, _hitBox, _tile) {
            if (_translation.y >= _tile.top) {
                _hitBox.position.y = _tile.bottom + _hitBox.height / 2;
                _translation.y = _tile.bottom;
                this.grounded = true;
            }
            else {
                _hitBox.position.y = _tile.top + _hitBox.height / 2;
                _translation.y = _tile.top + _hitBox.height;
                this.animatedNodeSprite.play(ACTION.FALL);
            }
            this.speed.y = 0;
        }
        resolveCollisionHorizontal(_translation, _hitBox, _tile) {
            if (_translation.x <= _tile.left) {
                _hitBox.position.x = _tile.left - _hitBox.width / 2;
                _translation.x = _tile.left - _hitBox.width / 2;
            }
            else {
                _hitBox.position.x = _tile.right + _hitBox.width / 2;
                _translation.x = _tile.right + _hitBox.width / 2;
            }
            this.speed.x = 0;
        }
    }
    Character.speedMax = new ƒ.Vector2(3, 15); // units per second
    Character.distanceMax = new ƒ.Vector2(0.1, 0.1);
    Character.gravity = 10; //units per square second
    Character.friction = 5 * Character.speedMax.x; // = 15 //units per square second
    Character.accelerationGround = 10 * Character.speedMax.x; // = 30 //units per square second, used to calculate ground movement
    Character.accelerationMidAir = 1.5 * Character.speedMax.x; // 4.5 //units per square second, used to calculate mid air movement
    MyGame.Character = Character;
})(MyGame || (MyGame = {}));
