namespace MyGame {
  import ƒ = FudgeCore;

  export class Gust extends Actor {
    public speed: ƒ.Vector3;

    constructor(_name: string, _speed: ƒ.Vector3) {
      super(_name);
      this.speed = _speed;
      
      let hitBox: Collidable = new Tile("purple");
      hitBox.cmpTransform.local.scaleX(1);
      hitBox.cmpTransform.local.scaleY(2);
      hitBox.cmpTransform.local.translateY(1);
      hitBox.name = "HitBox";
      this.appendChild(hitBox);

      ƒ.Loop.addEventListener(ƒ.EVENT.LOOP_FRAME, this.update);
      ƒ.Time.game.setTimer(4000, 1, () => {
        ƒ.Loop.removeEventListener(ƒ.EVENT.LOOP_FRAME, this.update);
        this.activate(false);
      });

    }

    private get hitBox(): Collidable {
      return <Collidable>this.getChildrenByName("HitBox")[0];
    }

    public static generateSprites(_txtImage: ƒ.TextureImage): void {
      let sprite: Sprite = new Sprite("Wind");
      sprite.generateByGrid(_txtImage, ƒ.Rectangle.GET(0, 0, 60, 80), 4, ƒ.Vector2.ZERO(), 64, ƒ.ORIGIN2D.BOTTOMCENTER);
      this.sprites.push(sprite);
    }

    private update = (_event: ƒ.Eventƒ): void => {
      let timeFrame: number = ƒ.Loop.timeFrameGame / 1000; // seconds
      let distance: ƒ.Vector3 = ƒ.Vector3.SCALE(this.speed, timeFrame);
      distance.x = this.absMinSigned(distance.x, Gust.distanceMax.x);
      distance.y = this.absMinSigned(distance.y, Gust.distanceMax.y);
      this.cmpTransform.local.translate(distance);
      this.checkCollision(distance);
    }

    private checkCollision(_distance: ƒ.Vector3): void {
      if (this.hitBox.getRectWorld().collides(player.hitBoxHorizontal.getRectWorld())) {
        player.speed = ƒ.Vector3.SUM(player.speed, this.speed);
      }
    }
  }
}