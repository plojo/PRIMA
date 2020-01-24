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

  export class Hare extends ƒ.Node {
    private static sprites: Sprite[];
    private static speedMax: ƒ.Vector2 = new ƒ.Vector2(3, 5); // units per second
    private static gravity: ƒ.Vector2 = ƒ.Vector2.Y(-10); //units per square second
    private static acceleration: ƒ.Vector2 = ƒ.Vector2.X(15); //units per square second
    public speed: ƒ.Vector3 = ƒ.Vector3.ZERO();
    private spriteFrameInterval: number = 0.1; // seconds
    private cyclicAnimationTimer: number = 0;
    private singleAnimationPlaying: boolean = false;
    private posLast: ƒ.Vector3;
    private direction: number = 0;

    constructor(_name: string = "Hare") {
      super(_name);
      this.addComponent(new ƒ.ComponentTransform());

      let sprites: ƒ.Node = new ƒ.Node("Sprites");
      sprites.addComponent(new ƒ.ComponentTransform());
      this.appendChild(sprites);

      let hitBoxes: ƒ.Node = new ƒ.Node("HitBoxes");
      hitBoxes.addComponent(new ƒ.ComponentTransform());
      this.appendChild(hitBoxes);

      let hitBox: Collidable = new Collidable("HitBoxVertical", "lime");
      hitBox.cmpTransform.local.scaleY(-1);
      hitBox.cmpTransform.local.scaleX(0.3);
      hitBoxes.appendChild(hitBox);

      hitBox = new Collidable("HitBoxHorizontal", "pink");
      hitBox.cmpTransform.local.scaleY(-0.8);
      hitBox.cmpTransform.local.scaleX(0.5);
      hitBox.cmpTransform.local.translateY(0.1);
      hitBoxes.appendChild(hitBox);

      for (let sprite of Hare.sprites) {
        let nodeSprite: NodeSprite = new NodeSprite(sprite.name, sprite);
        nodeSprite.activate(false);

        nodeSprite.addEventListener(
          "showNext",
          (_event: Event) => {
            if ((<ƒ.Node>_event.currentTarget).isActive)
              (<NodeSprite>_event.currentTarget).showFrameNext();
          },
          true
        );

        nodeSprite.addEventListener(
          "resetFrame",
          (_event: Event) => {
            if ((<ƒ.Node>_event.currentTarget).isActive)
              (<NodeSprite>_event.currentTarget).showFrame(0);
          },
          true
        );

        this.sprites.appendChild(nodeSprite);
      }

      this.show(ACTION.IDLE);
      ƒ.Loop.addEventListener(ƒ.EVENT.LOOP_FRAME, this.update);
    }

    public static generateSprites(_txtImage: ƒ.TextureImage): void {
      Hare.sprites = [];

      let sprite: Sprite = new Sprite(ACTION.IDLE);
      sprite.generateByGrid(_txtImage, ƒ.Rectangle.GET(0, 0, 60, 80), 4, ƒ.Vector2.ZERO(), 64, ƒ.ORIGIN2D.BOTTOMCENTER);
      Hare.sprites.push(sprite);

      sprite = new Sprite(ACTION.WALK);
      sprite.generateByGrid(_txtImage, ƒ.Rectangle.GET(0, 90, 60, 80), 6, ƒ.Vector2.ZERO(), 64, ƒ.ORIGIN2D.BOTTOMCENTER);
      Hare.sprites.push(sprite);

      sprite = new Sprite(ACTION.JUMPSQUAT);
      sprite.generateByGrid(_txtImage, ƒ.Rectangle.GET(60, 180, 60, 80), 1, ƒ.Vector2.ZERO(), 64, ƒ.ORIGIN2D.BOTTOMCENTER);
      Hare.sprites.push(sprite);

      sprite = new Sprite(ACTION.JUMP);
      sprite.generateByGrid(_txtImage, ƒ.Rectangle.GET(120, 180, 60, 80), 4, ƒ.Vector2.ZERO(), 64, ƒ.ORIGIN2D.BOTTOMCENTER);
      Hare.sprites.push(sprite);

      sprite = new Sprite(ACTION.FALL);
      sprite.generateByGrid(_txtImage, ƒ.Rectangle.GET(360, 180, 60, 80), 1, ƒ.Vector2.ZERO(), 64, ƒ.ORIGIN2D.BOTTOMCENTER);
      Hare.sprites.push(sprite);
    }

    public show(_action: ACTION): void {
      for (let child of this.sprites.getChildren())
        child.activate(child.name == _action);
    }

    public act(_action: ACTION, _direction?: DIRECTION): void {
      switch (_action) {
        case ACTION.IDLE:
          // this.speed.x = 0;
          this.direction = 0;
          break;
        case ACTION.WALK:
          this.direction = (_direction == DIRECTION.RIGHT ? 1 : -1);
          this.sprites.cmpTransform.local.rotation = ƒ.Vector3.Y(90 - 90 * this.direction);
          // let direction: number = (_direction == DIRECTION.RIGHT ? 1 : -1);
          // this.speed.x = Hare.speedMax.x * direction;
          // this.sprites.cmpTransform.local.rotation = ƒ.Vector3.Y(90 - 90 * direction);
          break;
        case ACTION.JUMP:
          if (this.grounded()) {
            this.singleAnimationPlaying = true;
            this.show(ACTION.JUMPSQUAT);
            ƒ.Time.game.setTimer(50, 1, () => {
              this.speed.y = 6;
              this.show(ACTION.JUMP);
              this.broadcastEvent(new CustomEvent("resetFrame"));
              ƒ.Time.game.setTimer(400, 1, () => {
                this.show(ACTION.FALL);
                this.singleAnimationPlaying = false;
              });
            });
          }
          break;
      }
      if (!this.singleAnimationPlaying) {
        if (this.grounded()) {
          this.show(_action);
        } else {
          this.show(ACTION.FALL);
        }
      }
    }

    private update = (_event: ƒ.Eventƒ): void => {
      let timeFrame: number = Math.min(0.02, ƒ.Loop.timeFrameGame / 1000); // seconds
      this.cyclicAnimationTimer += timeFrame;
      if (this.cyclicAnimationTimer >= this.spriteFrameInterval) {
        this.broadcastEvent(new CustomEvent("showNext"));
        this.cyclicAnimationTimer = 0;
      }

      this.speed.x += Hare.acceleration.x * this.direction * timeFrame;
      this.speed.x = Math.sign(this.speed.x) * Math.min(Math.abs(this.speed.x), Math.abs(Hare.speedMax.x));
      // console.log(this.speed.x);
      this.speed.y += Hare.gravity.y * timeFrame;
      this.speed.y = Math.min(this.speed.y, Hare.speedMax.y);


      let distance: ƒ.Vector3 = ƒ.Vector3.SCALE(this.speed, timeFrame);

      this.posLast = this.cmpTransform.local.translation.copy;
      this.cmpTransform.local.translate(distance);
      // console.log("last " + this.posLast);
      // console.log("target " + this.cmpTransform.local.translation);


      this.checkCollision();
      // this.checkCollisionTopBottom();
      // this.checkCollisionLeftRight();
    }

    private checkCollision(): void {
      for (let tile of level.getChildren()) {
        ƒ.RenderManager.update();
        let tileHitBox: ƒ.Rectangle = (<Floor>tile).getRectWorld();
        let playerHitBox: ƒ.Rectangle = this.hitBoxVertical.getRectWorld();
        let translation: ƒ.Vector3 = this.cmpTransform.local.translation;
        
        if (playerHitBox.collides(tileHitBox)) {
          this.resolveCollisionVertical(translation, playerHitBox, tileHitBox);
          this.speed.y = 0;
        }
        playerHitBox = this.hitBoxHorizontal.getRectWorld();
        if (playerHitBox.collides(tileHitBox)) {
          this.resolveCollisionHorizontal(translation, playerHitBox, tileHitBox);
          this.speed.x = 0;
        }
        this.cmpTransform.local.translation = translation;
      }
    }

    private resolveCollisionVertical(_translation: ƒ.Vector3, _hitBox: ƒ.Rectangle, _tile: ƒ.Rectangle): void {
      if (this.posLast.y >= _tile.top) {
        // console.log("move up");
        _translation.y = _tile.bottom;
      } else {
        // console.log("move down");
        _translation.y = _tile.top - _hitBox.height;
      }
    }

    private resolveCollisionHorizontal(_translation: ƒ.Vector3, _hitBox: ƒ.Rectangle, _tile: ƒ.Rectangle): void {
      if (this.posLast.x <= _tile.left) {
        // console.log("move left");
        _translation.x = _tile.left - _hitBox.width / 2;
      } else {
        // console.log("move right");
        _translation.x = _tile.right + _hitBox.width / 2;
      }
    }

    private grounded(): boolean {
      return this.speed.y == 0;
    }

    private get sprites(): ƒ.Node {
      return this.getChildrenByName("Sprites")[0];
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