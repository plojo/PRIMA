namespace MyGame {
  import ƒ = FudgeCore;

  export class Tile extends NodeSprite {
    public static hitBoxes: ƒ.Rectangle[] = [];
    protected static sprites: Map<TYPE, Sprite>;

    public constructor(_type: TYPE) {
      super(_type, Tile.sprites.get(_type));
      this.addComponent(new ƒ.ComponentTransform());

      let hitBox: Collidable = new Collidable("HitBox");
      hitBox.cmpTransform.local = ƒ.Matrix4x4.MULTIPLICATION(hitBox.cmpTransform.local, this.cmpMesh.pivot);
      this.appendChild(hitBox);

      this.addEventListener("registerUpdate", (_event: Event) => {
        Tile.hitBoxes.push(this.hitBox.getRectWorld());
      }, true);
    }

    public get hitBox(): Collidable {
      return <Collidable>this.getChildrenByName("HitBox")[0];
    }

    public static generateSprites(_txtImage: ƒ.TextureImage): void {
      this.sprites = new Map<TYPE, Sprite>();
      let resolutionQuad: number = 16;

      let sprite: Sprite = new Sprite(TYPE.PLATFORM);
      sprite.generateByGrid(_txtImage, ƒ.Rectangle.GET(64, 192, 48, 16), 1, ƒ.Vector2.ZERO(), resolutionQuad, ƒ.ORIGIN2D.BOTTOMLEFT);
      this.sprites.set(TYPE.PLATFORM, sprite);

      sprite = new Sprite(TYPE.FLOOR);
      sprite.generateByGrid(_txtImage, ƒ.Rectangle.GET(0, 224, 352, 16), 3, ƒ.Vector2.ZERO(), resolutionQuad, ƒ.ORIGIN2D.BOTTOMLEFT);
      this.sprites.set(TYPE.FLOOR, sprite);

      // sprite = new Sprite(TYPE.CEILING);
      // sprite.generateByGrid(_txtImage, ƒ.Rectangle.GET(32, 64, 16, 16), 3, ƒ.Vector2.ZERO(), 32, ƒ.ORIGIN2D.CENTER);
      // this.sprites.set(TYPE.CEILING, sprite);

      sprite = new Sprite(TYPE.WALL);
      sprite.generateByGrid(_txtImage, ƒ.Rectangle.GET(352, 0, 48, 302), 1, ƒ.Vector2.ZERO(), resolutionQuad, ƒ.ORIGIN2D.BOTTOMLEFT);
      this.sprites.set(TYPE.WALL, sprite);

      // sprite = new Sprite(TYPE.WALLRIGHT);
      // sprite.generateByGrid(_txtImage, ƒ.Rectangle.GET(80, 48, 16, 16), 3, ƒ.Vector2.ZERO(), resolutionQuad, ƒ.ORIGIN2D.CENTER, true);
      // this.sprites.set(TYPE.WALLLEFT, sprite);
    }
  }
}