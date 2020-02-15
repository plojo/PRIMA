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
    class Tile extends ƒ.Node {
        constructor(_type, _length, _orientation, cornerBlocks = true) {
            super(_type);
            this.addComponent(new ƒ.ComponentTransform());
            let sprite = Tile.sprites.get(_type);
            let index = 0;
            this.createBlock("Left", sprite, cornerBlocks ? 0 : 1, index, _orientation);
            index++;
            if (_length > 2)
                for (index; index < _length - 1; index++) {
                    this.createBlock("Middle", sprite, 1, index, _orientation);
                }
            else
                index++;
            this.createBlock("Right", sprite, cornerBlocks ? 2 : 1, index, _orientation);
        }
        static generateSprites(_txtImage) {
            this.sprites = new Map();
            let sprite = new MyGame.Sprite(MyGame.TYPE.PLATFORM);
            sprite.generateByGrid(_txtImage, ƒ.Rectangle.GET(64, 192, 16, 16), 3, ƒ.Vector2.ZERO(), 32, ƒ.ORIGIN2D.CENTER);
            this.sprites.set(MyGame.TYPE.PLATFORM, sprite);
            sprite = new MyGame.Sprite(MyGame.TYPE.FLOOR);
            sprite.generateByGrid(_txtImage, ƒ.Rectangle.GET(32, 0, 16, 16), 3, ƒ.Vector2.ZERO(), 32, ƒ.ORIGIN2D.CENTER);
            this.sprites.set(MyGame.TYPE.FLOOR, sprite);
            sprite = new MyGame.Sprite(MyGame.TYPE.CEILING);
            sprite.generateByGrid(_txtImage, ƒ.Rectangle.GET(32, 64, 16, 16), 3, ƒ.Vector2.ZERO(), 32, ƒ.ORIGIN2D.CENTER);
            this.sprites.set(MyGame.TYPE.CEILING, sprite);
            sprite = new MyGame.Sprite(MyGame.TYPE.WALLLEFT);
            sprite.generateByGrid(_txtImage, ƒ.Rectangle.GET(16, 48, 16, 16), 1, ƒ.Vector2.ZERO(), 32, ƒ.ORIGIN2D.CENTER, true);
            this.sprites.set(MyGame.TYPE.WALLLEFT, sprite);
            sprite = new MyGame.Sprite(MyGame.TYPE.WALLRIGHT);
            sprite.generateByGrid(_txtImage, ƒ.Rectangle.GET(80, 48, 16, 16), 3, ƒ.Vector2.ZERO(), 32, ƒ.ORIGIN2D.CENTER, true);
            this.sprites.set(MyGame.TYPE.WALLLEFT, sprite);
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
    MyGame.Tile = Tile;
})(MyGame || (MyGame = {}));
