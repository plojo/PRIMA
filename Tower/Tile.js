"use strict";
var MyGame;
(function (MyGame) {
    var ƒ = FudgeCore;
    let ORIENTATION;
    (function (ORIENTATION) {
        ORIENTATION["UP"] = "Up";
        ORIENTATION["RIGHT"] = "Right";
    })(ORIENTATION = MyGame.ORIENTATION || (MyGame.ORIENTATION = {}));
    class Block extends MyGame.NodeSprite {
        constructor(_name, _sprite) {
            super(_name, _sprite);
            this.addComponent(new ƒ.ComponentTransform());
            let hitBox = new MyGame.HitBox("HitBox");
            hitBox.cmpTransform.local.scaleX(0.5);
            hitBox.cmpTransform.local.scaleY(0.5);
            this.appendChild(hitBox);
            this.addEventListener("registerHitBox", (_event) => {
                let position = this.mtxWorld.translation;
                position = position.map((_value) => { return Math.floor(_value); });
                if (Block.hit[position.toString()] == null)
                    Block.hit[position.toString()] = [];
                Block.hit[position.toString()].push(this.hitBox.getRectWorld());
            }, true);
        }
        get hitBox() {
            return this.getChildrenByName("HitBox")[0];
        }
    }
    Block.hit = {};
    MyGame.Block = Block;
    class Tile extends MyGame.NodeSprite {
        constructor(_type) {
            super(_type, Tile.sprites.get(_type));
            this.addComponent(new ƒ.ComponentTransform());
            let hitBox = new MyGame.HitBox("HitBox");
            switch (_type) {
                case MyGame.TYPE.PLATFORM:
                    hitBox.cmpTransform.local.scaleX(1.5);
                    hitBox.cmpTransform.local.scaleY(0.5);
                    hitBox.cmpTransform.local.translateY(0.25);
                    break;
                case MyGame.TYPE.FLOOR:
                    hitBox.cmpTransform.local.scaleX(11);
                    hitBox.cmpTransform.local.scaleY(0.5);
                    hitBox.cmpTransform.local.translateY(0.25);
                    break;
                case MyGame.TYPE.WALL:
                    hitBox.cmpTransform.local.scaleX(1.5);
                    hitBox.cmpTransform.local.scaleY(9.5);
                    hitBox.cmpTransform.local.translateY(4.75);
                    break;
            }
            this.appendChild(hitBox);
            this.addEventListener("registerHitBox", (_event) => {
                Tile.hitBoxes.push(this.hitBox.getRectWorld());
                // if (_type == TYPE.PLATFORM) {
                //   let position: ƒ.Vector3 = this.mtxWorld.translation;
                //   position = position.map((_value: number) => { return Math.floor(_value); });
                //   if (Block.hit[position.toString()] == null)
                //     Block.hit[position.toString()] = [];
                //   Block.hit[position.toString()].push(this.hitBox.getRectWorld());
                // } else {
                // }
            }, true);
        }
        get hitBox() {
            return this.getChildrenByName("HitBox")[0];
        }
        static generateSprites(_txtImage) {
            this.sprites = new Map();
            let sprite = new MyGame.Sprite(MyGame.TYPE.PLATFORM);
            sprite.generateByGrid(_txtImage, ƒ.Rectangle.GET(64, 192, 48, 16), 1, ƒ.Vector2.ZERO(), 32, ƒ.ORIGIN2D.BOTTOMCENTER);
            this.sprites.set(MyGame.TYPE.PLATFORM, sprite);
            sprite = new MyGame.Sprite(MyGame.TYPE.FLOOR);
            sprite.generateByGrid(_txtImage, ƒ.Rectangle.GET(0, 224, 352, 16), 3, ƒ.Vector2.ZERO(), 32, ƒ.ORIGIN2D.BOTTOMCENTER);
            this.sprites.set(MyGame.TYPE.FLOOR, sprite);
            // sprite = new Sprite(TYPE.CEILING);
            // sprite.generateByGrid(_txtImage, ƒ.Rectangle.GET(32, 64, 16, 16), 3, ƒ.Vector2.ZERO(), 32, ƒ.ORIGIN2D.CENTER);
            // this.sprites.set(TYPE.CEILING, sprite);
            sprite = new MyGame.Sprite(MyGame.TYPE.WALL);
            sprite.generateByGrid(_txtImage, ƒ.Rectangle.GET(352, 0, 48, 302), 1, ƒ.Vector2.ZERO(), 32, ƒ.ORIGIN2D.BOTTOMCENTER);
            this.sprites.set(MyGame.TYPE.WALL, sprite);
            // sprite = new Sprite(TYPE.WALLRIGHT);
            // sprite.generateByGrid(_txtImage, ƒ.Rectangle.GET(80, 48, 16, 16), 3, ƒ.Vector2.ZERO(), 32, ƒ.ORIGIN2D.CENTER, true);
            // this.sprites.set(TYPE.WALLLEFT, sprite);
        }
        createBlock(_name, _sprite, _frame, _offset, _orientation) {
            let block = new Block(_name, _sprite);
            block.showFrame(_frame);
            switch (_orientation) {
                case ORIENTATION.UP:
                    block.cmpTransform.local.translateY(_offset * 0.5);
                    break;
                case ORIENTATION.RIGHT:
                    block.cmpTransform.local.translateX(_offset * 0.5);
                    break;
            }
            this.appendChild(block);
        }
    }
    Tile.hitBoxes = [];
    MyGame.Tile = Tile;
    class Platform extends MyGame.NodeSprite {
        constructor() {
            super(MyGame.TYPE.PLATFORM, Platform.sprite);
            this.addComponent(new ƒ.ComponentTransform());
            let hitBox = new MyGame.HitBox("HitBox");
            hitBox.cmpTransform.local.scaleX(1.5);
            hitBox.cmpTransform.local.scaleY(0.5);
            this.appendChild(hitBox);
            this.addEventListener("registerHitBox", (_event) => {
                let position = this.mtxWorld.translation;
                position = position.map((_value) => { return Math.floor(_value); });
                if (Block.hit[position.toString()] == null)
                    Block.hit[position.toString()] = [];
                Block.hit[position.toString()].push(this.hitBox.getRectWorld());
            }, true);
        }
        get hitBox() {
            return this.getChildrenByName("HitBox")[0];
        }
        static generateSprites(_txtImage) {
            this.sprite = new MyGame.Sprite(MyGame.TYPE.PLATFORM);
            this.sprite.generateByGrid(_txtImage, ƒ.Rectangle.GET(64, 192, 48, 16), 1, ƒ.Vector2.ZERO(), 32, ƒ.ORIGIN2D.CENTER);
        }
    }
    MyGame.Platform = Platform;
})(MyGame || (MyGame = {}));
