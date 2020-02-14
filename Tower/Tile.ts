namespace MyGame {
  import ƒ = FudgeCore;

  export abstract class Tile extends ƒ.Node {
    protected static sprite: Sprite;

    public constructor(_sprite: Sprite) {
      super("Tile");
      this.addComponent(new ƒ.ComponentTransform());

      let nodeSprite: NodeSprite = new NodeSprite(_sprite.name, _sprite);
      this.appendChild(nodeSprite);

      let hitBox: HitBox = new HitBox("HitBox");
      this.appendChild(hitBox);
    }

    public get hitBox(): HitBox {
      return <HitBox>this.getChildrenByName("HitBox")[0];
    }
  }

  export class Platform extends Tile {
    public constructor() {
      super(Platform.sprite);
      this.hitBox.cmpTransform.local.scaleY(0.5);
      this.hitBox.cmpTransform.local.scaleX(1.5);
    }

    public static generateSprite(_txtImage: ƒ.TextureImage): void {
      this.sprite = new Sprite(TYPE.PLATFORM);
      this.sprite.generateByGrid(_txtImage, ƒ.Rectangle.GET(64, 192, 48, 16), 1, ƒ.Vector2.ZERO(), 32, ƒ.ORIGIN2D.CENTER);
    }
  }

}