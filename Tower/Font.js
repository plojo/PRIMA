"use strict";
var MyGame;
(function (MyGame) {
    class Font {
        static generateSprites(_txtImage) {
            let sprite = new MyGame.Sprite("abc");
            sprite.generateByGrid(_txtImage, MyGame.ƒ.Rectangle.GET(0, 0, 7, 7), 8, MyGame.ƒ.Vector2.X(1), 16, MyGame.ƒ.ORIGIN2D.BOTTOMCENTER);
            this.sprites.push(sprite);
        }
    }
    Font.sprites = [];
    MyGame.Font = Font;
})(MyGame || (MyGame = {}));
