namespace MyGame {

   export class Font {
        public static sprites: Sprite[] = [];

        public static generateSprites(_txtImage: ƒ.TextureImage): void {
            let sprite: Sprite = new Sprite("abc");
            sprite.generateByGrid(_txtImage, ƒ.Rectangle.GET(0, 0, 7, 7), 8, ƒ.Vector2.X(1), 16, ƒ.ORIGIN2D.BOTTOMCENTER);
            this.sprites.push(sprite);
          }
      
    }
}