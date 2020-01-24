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
    public speed: ƒ.Vector3 = ƒ.Vector3.ZERO();
    private spriteFrameInterval: number = 0.1; // seconds
    private cyclicAnimationTimer: number = 0;
    private singleAnimationPlaying: boolean = false;
    private posLast: ƒ.Vector3;

    constructor(_name: string = "Hare") {
      super(_name);
      this.addComponent(new ƒ.ComponentTransform());

      let sprites: ƒ.Node = new ƒ.Node("Sprites");
      sprites.addComponent(new ƒ.ComponentTransform());
      this.appendChild(sprites);

      let hitBoxes: ƒ.Node = new ƒ.Node("HitBoxes");
      hitBoxes.addComponent(new ƒ.ComponentTransform());
      this.appendChild(hitBoxes);

      let hitBox: Collidable = new Collidable("HitBoxLeftRight", "pink");
      hitBox.cmpTransform.local.scaleY(-0.8);
      hitBox.cmpTransform.local.scaleX(0.5);
      hitBox.cmpTransform.local.translateY(0.1);
      hitBoxes.appendChild(hitBox);

      hitBox = new Collidable("HitBoxTopBottom", "lime");
      hitBox.cmpTransform.local.scaleY(-1);
      hitBox.cmpTransform.local.scaleX(0.3);
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
          this.speed.x = 0;
          break;
        case ACTION.WALK:
          let direction: number = (_direction == DIRECTION.RIGHT ? 1 : -1);
          this.speed.x = Hare.speedMax.x * direction;
          this.sprites.cmpTransform.local.rotation = ƒ.Vector3.Y(90 - 90 * direction);
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
      let timeFrame: number = Math.min(0.02 , ƒ.Loop.timeFrameGame / 1000); // seconds
      console.log(timeFrame);
      this.cyclicAnimationTimer += timeFrame;
      if (this.cyclicAnimationTimer >= this.spriteFrameInterval) {
        this.broadcastEvent(new CustomEvent("showNext"));
        this.cyclicAnimationTimer = 0;
      }

      this.speed.y += Math.min(Hare.gravity.y, Hare.speedMax.y) * timeFrame;
      let distance: ƒ.Vector3 = ƒ.Vector3.SCALE(this.speed, timeFrame);

      this.posLast = this.cmpTransform.local.translation.copy;
      this.cmpTransform.local.translate(distance);
      console.log("last " + this.posLast);
      console.log("target " + this.cmpTransform.local.translation);


      // this.checkCollision();
      // this.checkCollisionBody(save);
      this.checkCollisionTopBottom();
      this.checkCollisionLeftRight();
    }

    // private checkCollision(): void {
    //   for (let floor of level.getChildren()) {
    //     let rect: ƒ.Rectangle = (<Floor>floor).getRectWorld();
    //     let hit: boolean = rect.isInside(this.cmpTransform.local.translation.toVector2());
    //     if (hit) {
    //       let translation: ƒ.Vector3 = this.cmpTransform.local.translation;
    //       translation.y = rect.y;
    //       this.cmpTransform.local.translation = translation;
    //       this.speed.y = 0;
    //     }
    //   }
    // }

    private checkCollisionTopBottom(): void {
      for (let tile of level.getChildren()) {
        ƒ.RenderManager.update();
        let tileHitBox: ƒ.Rectangle = (<Floor>tile).getRectWorld();
        let playerHitBox: ƒ.Rectangle = this.hitBoxTopBottom.getRectWorld();
        let hit: boolean = playerHitBox.collides(tileHitBox);
        if (hit) {
          console.log("Vertical");
          let translation: ƒ.Vector3 = this.cmpTransform.local.translation;
          if (this.posLast.y >= tileHitBox.bottom) {
            console.log("move up");
            translation.y = tileHitBox.bottom;
          } else {
            console.log("move down");
            translation.y = tileHitBox.top - playerHitBox.height;
          }
          this.cmpTransform.local.translation = translation;
          this.speed.y = 0;
        }
      }
    }

    private checkCollisionLeftRight(): void {
      for (let tile of level.getChildren()) {
        ƒ.RenderManager.update();
        let tileHitBox: ƒ.Rectangle = (<Floor>tile).getRectWorld();
        let playerHitBox: ƒ.Rectangle = this.hitBoxLeftRight.getRectWorld();
        let hit: boolean = playerHitBox.collides(tileHitBox);
        if (hit) {
          console.log("Horizontal");
          let translation: ƒ.Vector3 = this.cmpTransform.local.translation;
          if (this.posLast.x <= tileHitBox.left) {
            console.log("move left");
            translation.x = tileHitBox.left - playerHitBox.width / 2;
          } else {
            console.log("move right");
            translation.x = tileHitBox.right + playerHitBox.width / 2;
          }
          console.log(translation.toString());
          this.cmpTransform.local.translation = translation;
          this.speed.x = 0;
        }
      }
    }

    // private checkCollisionBody(_lastMutator: ƒ.Mutator): void { // TODO: replace this.cmpTransform.local.translation. with hitBox position
    //   ƒ.RenderManager.update();
    //   let save: ƒ.Mutator = this.cmpTransform.local.getMutator();
    //   console.log("last:" + this.posLast.toString());
    //   // console.log(this.hitBoxBody.getRectWorld().position.toString());
    //   for (let floor of level.getChildren()) {
    //     let rect: ƒ.Rectangle = (<Floor>floor).getRectWorld();
    //     let hit: boolean = this.hitBoxBody.getRectWorld().collides(rect);
    //     if (hit) {
    //       let outerBound: ƒ.Vector3 = this.posLast;
    //       let innerBound: ƒ.Vector3 = this.cmpTransform.local.translation.copy;
    //       let delta: number = 1;
    //       while (delta > 0.01) {
    //         delta = ƒ.Vector3.DIFFERENCE(outerBound, innerBound).magnitude;
    //         this.cmpTransform.local.translation = ƒ.Vector3.SCALE(ƒ.Vector3.SUM(innerBound, outerBound), 0.5);
    //         if (this.hitBoxBody.getRectWorld().collides(rect)) {
    //           innerBound = this.cmpTransform.local.translation.copy;
    //         } else {
    //           outerBound = this.cmpTransform.local.translation.copy;
    //         }
    //       }
    //       console.log("middle: " + this.cmpTransform.local.translation.toString());


    //       this.cmpTransform.local.mutate(save);
    //       console.log("target: " + this.cmpTransform.local.translation.toString());
    //       let translation: ƒ.Vector3 = this.cmpTransform.local.translation;
    //       console.log("outerbound: " + outerBound.toString());
    //       if (outerBound.x <= rect.left || outerBound.x >= rect.right) {
    //         console.log(1);
    //         translation.x = outerBound.x;
    //         this.speed.x = 0;
    //       } else {
    //         console.log(3);
    //         if (outerBound.y >= rect.bottom) {
    //           translation.y = outerBound.y;
    //         }
    //         if (outerBound.y <= rect.top) {
    //           translation.y = outerBound.y;
    //         }
    //         this.speed.y = 0;
    //       }
    //       this.cmpTransform.local.translation = translation;



    //       // if (outerBound.x >= rect.right) {
    //       //   console.log(2);
    //       //   this.speed.x = 0;
    //       //   translation.x = outerBound.x;
    //       // }



    //       // if (outerBound.y >= rect.bottom) {
    //       //   console.log(4);
    //       //   this.speed.y = 0;
    //       //   translation.y = outerBound.y;
    //       // }


    //       // if (outerBound.x == rect.)
    //       // let translation: ƒ.Vector3 = this.cmpTransform.local.translation;
    //       // translation.y = outerBound.y;

    //       // this.speed.y = 0;
    //       // this.speed.set(0, 0, 0);
    //     }
    //   }
    // }

    // private checkCollisionBody(): void { // TODO: replace this.cmpTransform.local.translation. with hitBox position
    //   ƒ.RenderManager.update();
    //   for (let floor of level.getChildren()) {
    //     let rect: ƒ.Rectangle = (<Floor>floor).getRectWorld();
    //     let hit: boolean = this.hitBoxBody.getRectWorld().collides(rect);
    //     if (hit) {
    //       let outerBound: ƒ.Vector3 = this.posLast;
    //       let innerBound: ƒ.Vector3 = this.cmpTransform.local.translation.copy;
    //       let delta: number = 1;
    //       while (delta > 0.01) {
    //         delta = ƒ.Vector3.DIFFERENCE(outerBound, innerBound).magnitude;
    //         this.cmpTransform.local.translation = ƒ.Vector3.SCALE(ƒ.Vector3.SUM(innerBound, outerBound), 0.5);
    //         ƒ.RenderManager.update();
    //         if (this.hitBoxBody.getRectWorld().collides(rect)) {
    //           innerBound = this.cmpTransform.local.translation.copy;
    //         } else {
    //           outerBound = this.cmpTransform.local.translation.copy;
    //         }
    //       }
    //       this.cmpTransform.local.translation = outerBound;
    //       // let translation: ƒ.Vector3 = this.cmpTransform.local.translation;
    //       // translation.y = outerBound.y;
    //       // this.cmpTransform.local.translation = translation;
    //       this.speed.y = 0;
    //     }
    //   }
    // }

    private grounded(): boolean {
      return this.speed.y == 0;
    }

    private get sprites(): ƒ.Node {
      return this.getChildrenByName("Sprites")[0];
    }

    private get hitBoxes(): ƒ.Node {
      return this.getChildrenByName("HitBoxes")[0];
    }

    private get hitBoxLeftRight(): Collidable {
      return <Collidable>this.hitBoxes.getChildrenByName("HitBoxLeftRight")[0];
    }

    private get hitBoxTopBottom(): Collidable {
      return <Collidable>this.hitBoxes.getChildrenByName("HitBoxTopBottom")[0];
    }
  }
}