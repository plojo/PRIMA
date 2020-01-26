namespace MyGame {
  import ƒ = FudgeCore;

  export enum ACTION {
    IDLE = "Idle",
    WALK = "Walk",
    JUMP = "Jump",
    JUMPSQUAT = "JumpSquat",
    FALL = "Fall",
    DASH = "Dash"
  }

  export enum DIRECTION {
    LEFT, RIGHT
  }

  export class Character extends ƒ.Node {
    private static sprites: Sprite[];
    private static readonly speedMax: ƒ.Vector2 = new ƒ.Vector2(3, 15); // units per second
    private static readonly distanceMax: ƒ.Vector2 = new ƒ.Vector2(0.1, 0.1);
    private static readonly gravity: number = 10; //units per square second
    private static friction: number = 15; //units per square second
    private static accelerationGround: number = 30; //units per square second, used to calculate ground movement
    private static accelerationMidAir: number = 4.5; //units per square second, used to calculate mid air movement

    public acceleration: ƒ.Vector3 = new ƒ.Vector3(0, -Character.gravity, 0);
    public speed: ƒ.Vector3 = ƒ.Vector3.ZERO();

    private posLast: ƒ.Vector3;
    private direction: number = 0;
    private grounded: boolean;

    constructor(_name: string) {
      super(_name);
      this.addComponent(new ƒ.ComponentTransform());

      let animatedNodeSprite: AnimatedNodeSprite = new AnimatedNodeSprite("AnimatedNodeSprite");
      animatedNodeSprite.addComponent(new ƒ.ComponentTransform());
      this.appendChild(animatedNodeSprite);

      let hitBoxes: ƒ.Node = new ƒ.Node("HitBoxes");
      hitBoxes.addComponent(new ƒ.ComponentTransform());
      this.appendChild(hitBoxes);

      // let hitBox: Collidable = new Collidable("HitBoxVertical");
      let hitBox: Collidable = new Tile("lime");
      hitBox.name = "HitBoxVertical";
      hitBox.cmpTransform.local.scaleY(-1);
      hitBox.cmpTransform.local.scaleX(0.29);
      hitBoxes.appendChild(hitBox);

      // hitBox = new Collidable("HitBoxHorizontal");
      hitBox = new Tile("pink");
      hitBox.name = "HitBoxHorizontal";
      hitBox.cmpTransform.local.scaleY(-0.8);
      hitBox.cmpTransform.local.scaleX(0.50);
      hitBox.cmpTransform.local.translateY(0.1);
      hitBoxes.appendChild(hitBox);

      for (let sprite of Character.sprites) {
        let nodeSprite: NodeSprite = new NodeSprite(sprite.name, sprite);
        nodeSprite.activate(false);
        this.animatedNodeSprite.appendChild(nodeSprite);
      }

      this.animatedNodeSprite.getNodeSprite(ACTION.JUMPSQUAT).spriteFrameInterval = 5; // jumpsquat animation should last for 5 frames only
      // this.animatedNodeSprite.getNodeSprite(ACTION.DASH).spriteFrameInterval = 20;
      this.animatedNodeSprite.getNodeSprite(ACTION.IDLE).activate(true);

      this.addEventListener(
        "animationFinished",
        (_event: Event) => {
          // console.log("animationFinished");
          if (this.animatedNodeSprite.action == ACTION.JUMPSQUAT) {
            this.speed.y = 6;
            this.animatedNodeSprite.play(ACTION.JUMP);
          } else
            if (this.grounded) {
              if (this.animatedNodeSprite.action != ACTION.IDLE)
                this.animatedNodeSprite.play(ACTION.IDLE);
            } else {
              if (this.animatedNodeSprite.action != ACTION.FALL)
                this.animatedNodeSprite.play(ACTION.FALL);
            }
        },
        true
      );

      this.animatedNodeSprite.play(ACTION.IDLE);
      ƒ.Loop.addEventListener(ƒ.EVENT.LOOP_FRAME, this.update);
    }

    public static generateSprites(_txtImage: ƒ.TextureImage): void {
      Character.sprites = [];

      let sprite: Sprite = new Sprite(ACTION.IDLE);
      sprite.generateByGrid(_txtImage, ƒ.Rectangle.GET(0, 0, 60, 80), 4, ƒ.Vector2.ZERO(), 64, ƒ.ORIGIN2D.BOTTOMCENTER);
      Character.sprites.push(sprite);

      sprite = new Sprite(ACTION.WALK);
      sprite.generateByGrid(_txtImage, ƒ.Rectangle.GET(0, 90, 60, 80), 6, ƒ.Vector2.ZERO(), 64, ƒ.ORIGIN2D.BOTTOMCENTER);
      Character.sprites.push(sprite);

      sprite = new Sprite(ACTION.JUMPSQUAT);
      sprite.generateByGrid(_txtImage, ƒ.Rectangle.GET(60, 180, 60, 80), 1, ƒ.Vector2.ZERO(), 64, ƒ.ORIGIN2D.BOTTOMCENTER);
      Character.sprites.push(sprite);

      sprite = new Sprite(ACTION.JUMP);
      sprite.generateByGrid(_txtImage, ƒ.Rectangle.GET(120, 180, 60, 80), 4, ƒ.Vector2.ZERO(), 64, ƒ.ORIGIN2D.BOTTOMCENTER);
      Character.sprites.push(sprite);

      sprite = new Sprite(ACTION.FALL);
      sprite.generateByGrid(_txtImage, ƒ.Rectangle.GET(360, 180, 60, 80), 1, ƒ.Vector2.ZERO(), 64, ƒ.ORIGIN2D.BOTTOMCENTER);
      Character.sprites.push(sprite);

      // sprite = new Sprite(ACTION.DASH);
      // sprite.generateByGrid(_txtImage, ƒ.Rectangle.GET(360, 180, 60, 80), 1, ƒ.Vector2.ZERO(), 64, ƒ.ORIGIN2D.BOTTOMCENTER);
      // Character.sprites.push(sprite);
    }

    public act(_action: ACTION, _direction?: DIRECTION): void {
      switch (_action) {
        case ACTION.IDLE:
          if (this.grounded) {
            if (Math.abs(this.speed.x) < 0.1) {
              this.speed.x = 0;
              this.acceleration.x = 0;
            } else
              this.acceleration.x = -this.speed.x * Character.friction;
          }
          else
            this.acceleration.x = 0;
          break;
        case ACTION.WALK:
          this.direction = (_direction == DIRECTION.RIGHT ? 1 : -1);
          this.animatedNodeSprite.cmpTransform.local.rotation = ƒ.Vector3.Y(90 - 90 * this.direction);
          if (this.grounded)
            this.acceleration.x = Character.accelerationGround * this.direction;
          else
            this.acceleration.x = Character.accelerationMidAir * this.direction;
          break;
        case ACTION.JUMPSQUAT:
          // the jump will be started after this animation finished, see event listener "animationFinished"
          break;
        // case ACTION.DASH:
        //   this.acceleration.x = 0;
        //   this.speed.x = 3 * this.direction;
        //   this.animatedNodeSprite.play(_action);
        //   break;
      }
      if (this.grounded && this.animatedNodeSprite.action != ACTION.JUMPSQUAT /*&& this.animatedNodeSprite.action != ACTION.DASH*/)
        this.animatedNodeSprite.play(_action);
    }

    private update = (_event: ƒ.Eventƒ): void => {
      let timeFrame: number = ƒ.Loop.timeFrameGame / 1000; // seconds
      this.updateSpeed(timeFrame);
      this.posLast = this.cmpTransform.local.translation;
      let distance: ƒ.Vector3 = ƒ.Vector3.SCALE(this.speed, timeFrame);
      // if (this.animatedNodeSprite.action == ACTION.DASH) {
      //   distance.x = 2 * this.direction;
      //   distance.y = 0;
      // }
      distance.x = this.absMinSigned(distance.x, Character.distanceMax.x);
      distance.y = this.absMinSigned(distance.y, Character.distanceMax.y);
      // console.log(distance.toString());
      this.cmpTransform.local.translate(distance);
      this.grounded = false;
      this.checkCollision();
    }

    private updateSpeed(_timeFrame: number): void {
      // console.log(this.speed.toString());
      // console.log(this.acceleration.toString());
      this.speed = ƒ.Vector3.SUM(this.speed, ƒ.Vector3.SCALE(this.acceleration, _timeFrame));
      this.speed.x = this.absMinSigned(this.speed.x, Character.speedMax.x);
      this.speed.y = this.absMinSigned(this.speed.y, Character.speedMax.y);

    }

    private checkCollision(): void {
      for (let tile of level.getChildren()) {
        ƒ.RenderManager.update();
        let tileHitBox: ƒ.Rectangle = (<Tile>tile).getRectWorld();
        let playerHitBox: ƒ.Rectangle = this.hitBoxVertical.getRectWorld();
        let translation: ƒ.Vector3 = this.cmpTransform.local.translation;

        if (playerHitBox.collides(tileHitBox)) {
          // console.log("ver");
          this.resolveCollisionVertical(translation, playerHitBox, tileHitBox);
        } else {
          playerHitBox = this.hitBoxHorizontal.getRectWorld();
          if (playerHitBox.collides(tileHitBox)) {
            // console.log("hor");
            this.resolveCollisionHorizontal(translation, playerHitBox, tileHitBox);
          }
        }
        this.cmpTransform.local.translation = translation;
      }
    }

    private resolveCollisionVertical(_translation: ƒ.Vector3, _hitBox: ƒ.Rectangle, _tile: ƒ.Rectangle): void {
      if (this.posLast.y >= _tile.top) {
        _translation.y = _tile.bottom;
        this.grounded = true;
      } else {
        _translation.y = _tile.top - _hitBox.height;
        this.animatedNodeSprite.play(ACTION.FALL);
      }
      this.speed.y = 0;
    }

    private resolveCollisionHorizontal(_translation: ƒ.Vector3, _hitBox: ƒ.Rectangle, _tile: ƒ.Rectangle): void {
      if (this.posLast.x <= _tile.left) {
        _translation.x = _tile.left - _hitBox.width / 2;
      } else {
        _translation.x = _tile.right + _hitBox.width / 2;
      }
      this.speed.x = 0;
    }

    private get animatedNodeSprite(): AnimatedNodeSprite {
      return <AnimatedNodeSprite>this.getChildrenByName("AnimatedNodeSprite")[0];
    }

    private get hitBoxes(): ƒ.Node {
      return this.getChildrenByName("HitBoxes")[0];
    }

    private get hitBoxVertical(): Collidable {
      return <Collidable>this.hitBoxes.getChildrenByName("HitBoxVertical")[0];
    }

    private get hitBoxHorizontal(): Collidable {
      return <Collidable>this.hitBoxes.getChildrenByName("HitBoxHorizontal")[0];
    }

    private absMinSigned(x: number, y: number): number {
      return Math.sign(x) * Math.min(Math.abs(x), Math.abs(y));
    }

    // private absoluteMinVector(x: ƒ.Vector3, y: ƒ.Vector3) {
    //   return x.copy. map((value: number): number => {return Math.sign(value) * Math.min(Math.abs(x), Math.abs(y)})
    // }
  }
}