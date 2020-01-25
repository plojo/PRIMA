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
        constructor(_name) {
            super(_name);
            this.speed = ƒ.Vector3.ZERO();
            this.direction = 0;
            this.update = (_event) => {
                let timeFrame = Math.min(0.02, ƒ.Loop.timeFrameGame / 1000); // seconds
                this.updateSpeed(timeFrame);
                this.posLast = this.cmpTransform.local.translation;
                let distance = ƒ.Vector3.SCALE(this.speed, timeFrame);
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
                this.animatedNodeSprite.appendChild(nodeSprite);
            }
            this.animatedNodeSprite.getNodeSprite(ACTION.JUMPSQUAT).spriteFrameInterval = 5; // jumpsquat animation should last for 5 frames only
            this.animatedNodeSprite.getNodeSprite(ACTION.IDLE).activate(true);
            this.addEventListener("animationFinished", (_event) => {
                console.log("animationFinished");
                if (this.animatedNodeSprite.action == ACTION.JUMPSQUAT) {
                    this.speed.y = 6;
                    this.animatedNodeSprite.start(ACTION.JUMP);
                }
                else if (this.grounded) {
                    if (this.animatedNodeSprite.action != ACTION.IDLE)
                        this.animatedNodeSprite.start(ACTION.IDLE);
                }
                else {
                    if (this.animatedNodeSprite.action != ACTION.FALL)
                        this.animatedNodeSprite.start(ACTION.FALL);
                }
            }, true);
            this.animatedNodeSprite.start(ACTION.IDLE);
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
        act(_action, _direction) {
            switch (_action) {
                case ACTION.IDLE:
                    this.direction = 0;
                    break;
                case ACTION.WALK:
                    this.direction = (_direction == DIRECTION.RIGHT ? 1 : -1);
                    this.animatedNodeSprite.cmpTransform.local.rotation = ƒ.Vector3.Y(90 - 90 * this.direction);
                    break;
            }
            if (this.grounded && this.animatedNodeSprite.action != ACTION.JUMPSQUAT)
                this.animatedNodeSprite.start(_action);
        }
        updateSpeed(_timeFrame) {
            if (this.grounded) {
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
                this.animatedNodeSprite.start(ACTION.FALL);
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
    }
    Character.speedMax = new ƒ.Vector2(3, 15); // units per second
    Character.gravity = ƒ.Vector2.Y(-10); //units per square second
    Character.friction = ƒ.Vector2.X(15); //units per square second
    Character.acceleration = ƒ.Vector2.X(4.5); //units per square second, used to calculate mid air movement
    MyGame.Character = Character;
})(MyGame || (MyGame = {}));
