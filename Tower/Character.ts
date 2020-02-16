namespace MyGame {
  import ƒ = FudgeCore;

  export enum ACTION {
    IDLE = "Idle",
    WALK = "Walk",
    JUMP = "Jump",
    JUMPSQUAT = "JumpSquat",
    JUMPSTART = "JumpStart",
    FALL = "Fall"
  }

  export enum DIRECTION {
    LEFT, RIGHT
  }

  export class Character extends Actor {
    // one unit = one meter
    private static readonly speedMax: ƒ.Vector2 = new ƒ.Vector2(6, 30); // units per second
    private static readonly distanceMax: ƒ.Vector2 = new ƒ.Vector2(0.2, 0.2);
    private static gravity: number = 20; //units per square second
    private static friction: number = 5 * Character.speedMax.x; // = 15 //units per square second
    private static accelerationGround: number = 10 * Character.speedMax.x; // = 30 //units per square second, used to calculate ground movement
    private static accelerationMidAir: number = 1.5 * Character.speedMax.x; // 4.5 //units per square second, used to calculate mid air movement
    private static jumpSpeed: number = 8;

    public acceleration: ƒ.Vector3 = new ƒ.Vector3(0, -Character.gravity, 0);
    public speed: ƒ.Vector3 = ƒ.Vector3.ZERO();

    private grounded: boolean;
    private jumpStart: boolean = false;

    constructor(_name: string) {
      super(_name, Character.sprites);

      let hitBox: Collidable = new Collidable("HitBoxVertical");
      // hitBox.cmpTransform.local = ƒ.Matrix4x4.MULTIPLICATION(hitBox.cmpTransform.local,  this.animatedNodeSprite.getNodeSprite(ACTION.IDLE).cmpMesh.pivot);
      hitBox.cmpTransform.local.scaleY(1.8);
      hitBox.cmpTransform.local.scaleX(0.39);
      hitBox.cmpTransform.local.translateY(0.9);
      this.hitBoxes.appendChild(hitBox);

      hitBox = new Collidable("HitBoxHorizontal");
      // hitBox.cmpTransform.local = ƒ.Matrix4x4.MULTIPLICATION(hitBox.cmpTransform.local,  this.animatedNodeSprite.getNodeSprite(ACTION.IDLE).cmpMesh.pivot);
      hitBox.cmpTransform.local.scaleY(1.4);
      hitBox.cmpTransform.local.scaleX(0.80);
      hitBox.cmpTransform.local.translateY(0.9);
      this.hitBoxes.appendChild(hitBox);

      this.animatedNodeSprite.getNodeSprite(ACTION.JUMPSQUAT).spriteFrameInterval = 3; // jumpsquat animation should last for 5 frames only
      this.animatedNodeSprite.getNodeSprite(ACTION.JUMP).spriteFrameInterval = 7;
      this.animatedNodeSprite.getNodeSprite(ACTION.IDLE).activate(true);
      this.animatedNodeSprite.registerUpdate();

      this.addEventListener(
        "animationFinished",
        (_event: Event) => {
          // console.log("animationFinished");
          if (this.animatedNodeSprite.action == ACTION.JUMPSQUAT) {
            this.act(ACTION.JUMPSTART);
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
      this.registerUpdate();
    }

    public static generateSprites(_txtImage: ƒ.TextureImage): void {
      this.sprites = [];
      let resolutionQuad: number = 16;
      let sprite: Sprite = new Sprite(ACTION.IDLE);
      sprite.generateByGrid(_txtImage, ƒ.Rectangle.GET(10, 0, 30, 36), 4, ƒ.Vector2.X(20), resolutionQuad, ƒ.ORIGIN2D.BOTTOMCENTER);
      this.sprites.push(sprite);

      sprite = new Sprite(ACTION.WALK);
      sprite.generateByGrid(_txtImage, ƒ.Rectangle.GET(60, 37, 30, 36), 6, ƒ.Vector2.X(20), resolutionQuad, ƒ.ORIGIN2D.BOTTOMCENTER);
      this.sprites.push(sprite);

      sprite = new Sprite(ACTION.JUMPSQUAT);
      sprite.generateByGrid(_txtImage, ƒ.Rectangle.GET(10, 74, 30, 36), 2, ƒ.Vector2.X(20), resolutionQuad, ƒ.ORIGIN2D.BOTTOMCENTER);
      this.sprites.push(sprite);

      sprite = new Sprite(ACTION.JUMP);
      sprite.generateByGrid(_txtImage, ƒ.Rectangle.GET(110, 74, 30, 36), 6, ƒ.Vector2.X(20), resolutionQuad, ƒ.ORIGIN2D.BOTTOMCENTER);
      this.sprites.push(sprite);

      sprite = new Sprite(ACTION.FALL);
      sprite.generateByGrid(_txtImage, ƒ.Rectangle.GET(410, 74, 30, 36), 2, ƒ.Vector2.X(20), resolutionQuad, ƒ.ORIGIN2D.BOTTOMCENTER);
      this.sprites.push(sprite);
    }

    public get hitBoxVertical(): Collidable {
      return <Collidable>this.hitBoxes.getChildrenByName("HitBoxVertical")[0];
    }

    public get hitBoxHorizontal(): Collidable {
      return <Collidable>this.hitBoxes.getChildrenByName("HitBoxHorizontal")[0];
    }

    public act(_action: ACTION, _direction?: DIRECTION): void {
      // console.log(_action);
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
          let direction: DIRECTION = (_direction == DIRECTION.RIGHT ? 1 : -1);
          this.animatedNodeSprite.cmpTransform.local.rotation = ƒ.Vector3.Y(90 - 90 * direction);
          this.acceleration.x = (this.grounded ? Character.accelerationGround : Character.accelerationMidAir) * direction;
          break;

        case ACTION.JUMP:
          if (!this.jumpStart) {
            this.act(ACTION.JUMPSQUAT);
          } else {
            this.speed.y = Character.jumpSpeed;
            this.animatedNodeSprite.play(_action);
          }
          return;

        case ACTION.JUMPSQUAT:
          // the jump will be started after this animation finished, see event listener "animationFinished"
          break;

        case ACTION.JUMPSTART:
          this.jumpStart = true;
          ƒ.Time.game.setTimer(250, 1, () => {
            this.jumpStart = false;
          });
          this.act(ACTION.JUMP);
          return;
      }

      switch (this.animatedNodeSprite.action) {
        // these animations can not be interrupted
        case ACTION.JUMP:
        case ACTION.JUMPSQUAT:
          break;
        // all other animations can be interrrupted
        default:
          if (this.grounded)
            this.animatedNodeSprite.play(_action);
          else this.animatedNodeSprite.play(ACTION.FALL);
          break;
      }
    }

    protected update = (_event: ƒ.Eventƒ): void => {
      let timeFrame: number = ƒ.Loop.timeFrameGame / 1000; // seconds
      // console.log("acc: " + this.acceleration.x);

      this.speed = ƒ.Vector3.SUM(this.speed, ƒ.Vector3.SCALE(this.acceleration, timeFrame));
      this.speed.x = this.absMinSigned(this.speed.x, Character.speedMax.x);
      this.speed.y = this.absMinSigned(this.speed.y, Character.speedMax.y);
      // console.log("speed: " + this.speed.x);

      // this.posLast = this.cmpTransform.local.translation;
      let distance: ƒ.Vector3 = ƒ.Vector3.SCALE(this.speed, timeFrame);

      distance.x = this.absMinSigned(distance.x, Character.distanceMax.x);
      distance.y = this.absMinSigned(distance.y, Character.distanceMax.y);
      this.grounded = false;
      this.checkCollision(distance);
      this.cmpTransform.local.translate(distance);


      // console.log("y: " + this.cmpTransform.local.translation.y);
    }

    private absMinSigned(x: number, y: number): number {
      return Math.sign(x) * Math.min(Math.abs(x), Math.abs(y));
    }

    private checkCollision(_distance: ƒ.Vector3): void {
      // narrowing down possible collisions
      // not anymore 0.0

      // checking possible collisions
      let playerHitBoxVertical: ƒ.Rectangle = this.hitBoxVertical.getRectWorld();
      let playerHitBoxHorizontal: ƒ.Rectangle = this.hitBoxHorizontal.getRectWorld();
      // console.log("ver: " + playerHitBoxVertical.position.toString() + " | hori: " + playerHitBoxHorizontal.position.toString());
      playerHitBoxVertical.position.add(_distance.toVector2());
      playerHitBoxHorizontal.position.add(_distance.toVector2());
      // console.log("             ver: " + playerHitBoxVertical.position.toString() + " | hori: " + playerHitBoxHorizontal.position.toString());

      for (let rect of Tile.hitBoxes) {
        let tileHitBox: ƒ.Rectangle = rect;
        let translation: ƒ.Vector3 = this.cmpTransform.local.translation;
        if (playerHitBoxVertical.collides(tileHitBox)) {
          // console.log("ver");
          this.resolveCollisionVertical(translation, playerHitBoxVertical, tileHitBox);
          _distance.y = 0;
        } else {
          if (playerHitBoxHorizontal.collides(tileHitBox)) {
            // console.log("hor");
            this.resolveCollisionHorizontal(translation, playerHitBoxHorizontal, tileHitBox);
            _distance.x = 0;
          }
        }
        this.cmpTransform.local.translation = translation;
      }
    }

    private resolveCollisionVertical(_translation: ƒ.Vector3, _hitBox: ƒ.Rectangle, _tile: ƒ.Rectangle): void {
      if (_translation.y >= _tile.top) {
        _translation.y = _tile.bottom;
        this.grounded = true;
      } else {
        _translation.y = _tile.top + _hitBox.height;
        this.animatedNodeSprite.play(ACTION.FALL);
      }
      this.speed.y = 0;
    }

    private resolveCollisionHorizontal(_translation: ƒ.Vector3, _hitBox: ƒ.Rectangle, _tile: ƒ.Rectangle): void {
      if (_translation.x <= _tile.left) {
        _translation.x = _tile.left - _hitBox.width / 2;
      } else {
        _translation.x = _tile.right + _hitBox.width / 2;
      }
      this.speed.x = 0;
    }
  }
}