namespace MyGame {
  import ƒ = FudgeCore;

  export enum ORIENTATION {
    UP = "Up",
    RIGHT = "Right"
  }

  interface HitBoxes {
    [code: string]: ƒ.Rectangle[];
  }

  export class Block extends NodeSprite {
    public static hit: HitBoxes = {};

    public constructor(_name: string, _sprite: Sprite) {
      super(_name, _sprite);
      this.addComponent(new ƒ.ComponentTransform());

      let hitBox: HitBox = new HitBox("HitBox");
      hitBox.cmpTransform.local.scaleX(0.5);
      hitBox.cmpTransform.local.scaleY(0.5);
      this.appendChild(hitBox);

      this.addEventListener("registerHitBox", (_event: Event) => {
        let position: ƒ.Vector3 = this.mtxWorld.translation;
        position = position.map((_value: number) => { return Math.floor(_value); });
        if (Block.hit[position.toString()] == null)
          Block.hit[position.toString()] = [];
        Block.hit[position.toString()].push(this.hitBox.getRectWorld());
      }, true);
    }

    public get hitBox(): HitBox {
      return <HitBox>this.getChildrenByName("HitBox")[0];
    }
  }

  export class Tile extends ƒ.Node {
    protected static sprites: Map<TYPE, Sprite>;

    public constructor(_type: TYPE, _length: number, _orientation: ORIENTATION, cornerBlocks: boolean = true) {
      super(_type);
      this.addComponent(new ƒ.ComponentTransform());

      let sprite: Sprite = Tile.sprites.get(_type);

      let index: number = 0;
      this.createBlock("Left", sprite, cornerBlocks ? 0 : 1, index, _orientation);
      index++;
      if (_length > 2)
        for (index; index < _length - 1; index++) {
          this.createBlock("Middle", sprite, 1, index, _orientation);
        }
      else index++;
      this.createBlock("Right", sprite, cornerBlocks ? 2 : 1, index, _orientation);
    }

    public static generateSprites(_txtImage: ƒ.TextureImage): void {
      this.sprites = new Map<TYPE, Sprite>();

      let sprite: Sprite = new Sprite(TYPE.PLATFORM);
      sprite.generateByGrid(_txtImage, ƒ.Rectangle.GET(64, 192, 16, 16), 3, ƒ.Vector2.ZERO(), 32, ƒ.ORIGIN2D.CENTER);
      this.sprites.set(TYPE.PLATFORM, sprite);

      sprite = new Sprite(TYPE.FLOOR);
      sprite.generateByGrid(_txtImage, ƒ.Rectangle.GET(32, 0, 16, 16), 3, ƒ.Vector2.ZERO(), 32, ƒ.ORIGIN2D.CENTER);
      this.sprites.set(TYPE.FLOOR, sprite);

      sprite = new Sprite(TYPE.CEILING);
      sprite.generateByGrid(_txtImage, ƒ.Rectangle.GET(32, 64, 16, 16), 3, ƒ.Vector2.ZERO(), 32, ƒ.ORIGIN2D.CENTER);
      this.sprites.set(TYPE.CEILING, sprite);

      sprite = new Sprite(TYPE.WALLLEFT);
      sprite.generateByGrid(_txtImage, ƒ.Rectangle.GET(16, 48, 16, 16), 1, ƒ.Vector2.ZERO(), 32, ƒ.ORIGIN2D.CENTER, true);
      this.sprites.set(TYPE.WALLLEFT, sprite);

      sprite = new Sprite(TYPE.WALLRIGHT);
      sprite.generateByGrid(_txtImage, ƒ.Rectangle.GET(80, 48, 16, 16), 3, ƒ.Vector2.ZERO(), 32, ƒ.ORIGIN2D.CENTER, true);
      this.sprites.set(TYPE.WALLLEFT, sprite);
    }

    protected createBlock(_name: string, _sprite: Sprite, _frame: number, _offset: number, _orientation: ORIENTATION): void {
      let block: Block = new Block(_name, _sprite);
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
}