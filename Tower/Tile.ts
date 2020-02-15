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

  export class Tile extends NodeSprite {
    protected static sprites: Map<TYPE, Sprite>;
    public static hitBoxes: ƒ.Rectangle[] = [];

    public constructor(_type: TYPE) {
      super(_type, Tile.sprites.get(_type));
      this.addComponent(new ƒ.ComponentTransform());

      let hitBox: HitBox = new HitBox("HitBox");
      switch (_type) {
        case TYPE.PLATFORM:
          hitBox.cmpTransform.local.scaleX(1.5);
          hitBox.cmpTransform.local.scaleY(0.5);
          hitBox.cmpTransform.local.translateY(0.25);
          break;
        case TYPE.FLOOR:
          hitBox.cmpTransform.local.scaleX(11);
          hitBox.cmpTransform.local.scaleY(0.5);
          hitBox.cmpTransform.local.translateY(0.25);
          break;
        case TYPE.WALL:
          hitBox.cmpTransform.local.scaleX(1.5);
          hitBox.cmpTransform.local.scaleY(9.5);
          hitBox.cmpTransform.local.translateY(4.75);
          break;
      }
      this.appendChild(hitBox);

      this.addEventListener("registerHitBox", (_event: Event) => {
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

    public get hitBox(): HitBox {
      return <HitBox>this.getChildrenByName("HitBox")[0];
    }

    public static generateSprites(_txtImage: ƒ.TextureImage): void {
      this.sprites = new Map<TYPE, Sprite>();

      let sprite: Sprite = new Sprite(TYPE.PLATFORM);
      sprite.generateByGrid(_txtImage, ƒ.Rectangle.GET(64, 192, 48, 16), 1, ƒ.Vector2.ZERO(), 32, ƒ.ORIGIN2D.BOTTOMCENTER);
      this.sprites.set(TYPE.PLATFORM, sprite);

      sprite = new Sprite(TYPE.FLOOR);
      sprite.generateByGrid(_txtImage, ƒ.Rectangle.GET(0, 224, 352, 16), 3, ƒ.Vector2.ZERO(), 32, ƒ.ORIGIN2D.BOTTOMCENTER);
      this.sprites.set(TYPE.FLOOR, sprite);

      // sprite = new Sprite(TYPE.CEILING);
      // sprite.generateByGrid(_txtImage, ƒ.Rectangle.GET(32, 64, 16, 16), 3, ƒ.Vector2.ZERO(), 32, ƒ.ORIGIN2D.CENTER);
      // this.sprites.set(TYPE.CEILING, sprite);

      sprite = new Sprite(TYPE.WALL);
      sprite.generateByGrid(_txtImage, ƒ.Rectangle.GET(352, 0, 48, 302), 1, ƒ.Vector2.ZERO(), 32, ƒ.ORIGIN2D.BOTTOMCENTER);
      this.sprites.set(TYPE.WALL, sprite);

      // sprite = new Sprite(TYPE.WALLRIGHT);
      // sprite.generateByGrid(_txtImage, ƒ.Rectangle.GET(80, 48, 16, 16), 3, ƒ.Vector2.ZERO(), 32, ƒ.ORIGIN2D.CENTER, true);
      // this.sprites.set(TYPE.WALLLEFT, sprite);
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

  export class Platform extends NodeSprite {
    private static sprite: Sprite;

    constructor() {
      super(TYPE.PLATFORM, Platform.sprite);
      this.addComponent(new ƒ.ComponentTransform());
      let hitBox: HitBox = new HitBox("HitBox");
      hitBox.cmpTransform.local.scaleX(1.5);
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

    public static generateSprites(_txtImage: ƒ.TextureImage): void {
      this.sprite = new Sprite(TYPE.PLATFORM);
      this.sprite.generateByGrid(_txtImage, ƒ.Rectangle.GET(64, 192, 48, 16), 1, ƒ.Vector2.ZERO(), 32, ƒ.ORIGIN2D.CENTER);
    }
  }
}