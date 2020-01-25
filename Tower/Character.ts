namespace MyGame {
  import ƒ = FudgeCore;

  export enum ACTION {
    IDLE = "Idle",
    WALK = "Walk",
    JUMP = "Jump",
    JUMPSQUAT = "JumpSquat",
    FALL = "Fall"
  }

  export enum DIRECTION {
    LEFT, RIGHT
  }

  export class Character extends ƒ.Node {
    private static sprites: Sprite[];
    private static speedMax: ƒ.Vector2 = new ƒ.Vector2(3, 15); // units per second
    private static gravity: ƒ.Vector2 = ƒ.Vector2.Y(-10); //units per square second
    private static friction: ƒ.Vector2 = ƒ.Vector2.X(15); //units per square second
    private static acceleration: ƒ.Vector2 = ƒ.Vector2.X(4.5); //units per square second, used to calculate mid air movement

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
      hitBox.cmpTransform.local.scaleX(0.3);
      hitBoxes.appendChild(hitBox);

      // hitBox = new Collidable("HitBoxHorizontal");
      hitBox = new Tile("pink");
      hitBox.name = "HitBoxHorizontal";
      hitBox.cmpTransform.local.scaleY(-0.8);
      hitBox.cmpTransform.local.scaleX(0.5);
      hitBox.cmpTransform.local.translateY(0.1);
      hitBoxes.appendChild(hitBox);

      for (let sprite of Character.sprites) {
        let nodeSprite: NodeSprite = new NodeSprite(sprite.name, sprite);
        nodeSprite.activate(false);
        this.animatedNodeSprite.appendChild(nodeSprite);
      }

      this.animatedNodeSprite.getNodeSprite(ACTION.JUMPSQUAT).spriteFrameInterval = 5; // jumpsquat animation should last for 5 frames only
      this.animatedNodeSprite.getNodeSprite(ACTION.IDLE).activate(true);

      this.addEventListener(
        "animationFinished",
        (_event: Event) => {
          console.log("animationFinished");
          if (this.animatedNodeSprite.action == ACTION.JUMPSQUAT) {
            this.speed.y = 6;
            this.animatedNodeSprite.start(ACTION.JUMP);
          } else
            if (this.grounded) {
              if (this.animatedNodeSprite.action != ACTION.IDLE)
                this.animatedNodeSprite.start(ACTION.IDLE);
            } else {
              if (this.animatedNodeSprite.action != ACTION.FALL)
                this.animatedNodeSprite.start(ACTION.FALL);
            }
        },
        true
      );

      this.animatedNodeSprite.start(ACTION.IDLE);
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
    }

    public act(_action: ACTION, _direction?: DIRECTION): void {
      switch (_action) {
        case ACTION.IDLE:
          this.direction = 0;
          break;
        case ACTION.WALK:
          this.direction = (_direction == DIRECTION.RIGHT ? 1 : -1);
          this.animatedNodeSprite.cmpTransform.local.rotation = ƒ.Vector3.Y(90 - 90 * this.direction);
          break;
      }
      if (this.grounded && this.animatedNodeSprite.action != ACTION.JUMPSQUAT)
        this.animatedNodeSprite.start(_action);
    }

    private update = (_event: ƒ.Eventƒ): void => {
      let timeFrame: number = Math.min(0.02, ƒ.Loop.timeFrameGame / 1000); // seconds
      this.updateSpeed(timeFrame);
      this.posLast = this.cmpTransform.local.translation;
      let distance: ƒ.Vector3 = ƒ.Vector3.SCALE(this.speed, timeFrame);
      this.cmpTransform.local.translate(distance);
      this.grounded = false;
      this.checkCollision();
    }

    private updateSpeed(_timeFrame: number): void {
      if (this.grounded) {
        if (this.direction == 0) {
          this.speed.x -= this.speed.x * Character.friction.x * _timeFrame;
          if (Math.abs(this.speed.x) < 0.001)
            this.speed.x = 0;
        } else {
          this.speed.x = Character.speedMax.x * this.direction;
          // this.speed.x += Hare.acceleration.x * this.direction * timeFrame;
        }
      } else {
        this.speed.x += Character.acceleration.x * this.direction * _timeFrame;
      }
      this.speed.y += Character.gravity.y * _timeFrame;

      this.speed.x = absMinSigned(this.speed.x, Character.speedMax.x);
      this.speed.y = absMinSigned(this.speed.y, Character.speedMax.y);

      function absMinSigned(x: number, y: number): number {
        return Math.sign(x) * Math.min(Math.abs(x), Math.abs(y));
      }
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
        this.animatedNodeSprite.start(ACTION.FALL);
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
  }
}