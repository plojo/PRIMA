namespace MyGame {

  import ƒ = FudgeCore;
  export enum MENUCOMPONENT {
    PLAY = "Play",
    SOUND = "Sound",
    ON = "On",
    OFF = "Off",
    SPEED = "Speed",
    SPEEDSLOW = "SPEEDSLOW",
    SPEEDNORMAL = "SPEEDNORMAL",
    SPEEDFAST = "SPEEDFAST",
    CURSOR = "Cursor",
    PAUSED = "Paused",
    RESUME = "Resume",
    BACKGROUND = "Background",
    MENU = "Menu",
    LEFTROW = "LeftRow",
    RIGHTROW = "RightRow"
  }

  export class MenuComponent extends NodeSprite {
    protected static sprites: Map<MENUCOMPONENT, Sprite>;

    constructor(_menuComponent: MENUCOMPONENT) {
      super(_menuComponent, MenuComponent.sprites.get(_menuComponent));
      this.addComponent(new ƒ.ComponentTransform());
    }

    public static generateSprites(_txtImage: ƒ.TextureImage): void {
      this.sprites = new Map<MENUCOMPONENT, Sprite>();
      let resolutionQuad: number = 16;

      let buttonType: MENUCOMPONENT = MENUCOMPONENT.PAUSED;
      let sprite: Sprite = new Sprite(buttonType);
      sprite.generateByGrid(_txtImage, ƒ.Rectangle.GET(0, 79, 48, 9), 1, ƒ.Vector2.ZERO(), resolutionQuad, ƒ.ORIGIN2D.CENTER);
      this.sprites.set(buttonType, sprite);

      buttonType = MENUCOMPONENT.PLAY;
      sprite = new Sprite(buttonType);
      sprite.generateByGrid(_txtImage, ƒ.Rectangle.GET(0, 0, 32, 9), 1, ƒ.Vector2.ZERO(), resolutionQuad, ƒ.ORIGIN2D.CENTERLEFT);
      this.sprites.set(buttonType, sprite);

      buttonType = MENUCOMPONENT.SOUND;
      sprite = new Sprite(buttonType);
      sprite.generateByGrid(_txtImage, ƒ.Rectangle.GET(0, 9, 40, 9), 1, ƒ.Vector2.ZERO(), resolutionQuad, ƒ.ORIGIN2D.CENTERLEFT);
      this.sprites.set(buttonType, sprite);

      buttonType = MENUCOMPONENT.ON;
      sprite = new Sprite(buttonType);
      sprite.generateByGrid(_txtImage, ƒ.Rectangle.GET(0, 18, 16, 9), 1, ƒ.Vector2.ZERO(), resolutionQuad, ƒ.ORIGIN2D.CENTERLEFT);
      this.sprites.set(buttonType, sprite);

      buttonType = MENUCOMPONENT.OFF;
      sprite = new Sprite(buttonType);
      sprite.generateByGrid(_txtImage, ƒ.Rectangle.GET(0, 27, 24, 9), 1, ƒ.Vector2.ZERO(), resolutionQuad, ƒ.ORIGIN2D.CENTERLEFT);
      this.sprites.set(buttonType, sprite);

      buttonType = MENUCOMPONENT.SPEED;
      sprite = new Sprite(buttonType);
      sprite.generateByGrid(_txtImage, ƒ.Rectangle.GET(0, 36, 40, 9), 1, ƒ.Vector2.ZERO(), resolutionQuad, ƒ.ORIGIN2D.CENTERLEFT);
      this.sprites.set(buttonType, sprite);

      buttonType = MENUCOMPONENT.SPEEDNORMAL;
      sprite = new Sprite(buttonType);
      sprite.generateByGrid(_txtImage, ƒ.Rectangle.GET(0, 45, 16, 9), 1, ƒ.Vector2.ZERO(), resolutionQuad, ƒ.ORIGIN2D.CENTERLEFT);
      this.sprites.set(buttonType, sprite);

      buttonType = MENUCOMPONENT.SPEEDFAST;
      sprite = new Sprite(buttonType);
      sprite.generateByGrid(_txtImage, ƒ.Rectangle.GET(0, 54, 16, 9), 1, ƒ.Vector2.ZERO(), resolutionQuad, ƒ.ORIGIN2D.CENTERLEFT);
      this.sprites.set(buttonType, sprite);

      buttonType = MENUCOMPONENT.SPEEDSLOW;
      sprite = new Sprite(buttonType);
      sprite.generateByGrid(_txtImage, ƒ.Rectangle.GET(0, 63, 28, 9), 1, ƒ.Vector2.ZERO(), resolutionQuad, ƒ.ORIGIN2D.CENTERLEFT);
      this.sprites.set(buttonType, sprite);

      buttonType = MENUCOMPONENT.RESUME;
      sprite = new Sprite(buttonType);
      sprite.generateByGrid(_txtImage, ƒ.Rectangle.GET(0, 88, 49, 9), 1, ƒ.Vector2.ZERO(), resolutionQuad, ƒ.ORIGIN2D.CENTERLEFT);
      this.sprites.set(buttonType, sprite);

      buttonType = MENUCOMPONENT.CURSOR;
      sprite = new Sprite(buttonType);
      sprite.generateByGrid(_txtImage, ƒ.Rectangle.GET(0, 72, 8, 8), 2, ƒ.Vector2.ZERO(), resolutionQuad, ƒ.ORIGIN2D.CENTERLEFT);
      this.sprites.set(buttonType, sprite);

      // buttonType = MENUCOMPONENT.BACKGROUND;
      // sprite = new Sprite(buttonType);
      // sprite.generateByGrid(_txtImage, ƒ.Rectangle.GET(40, 0, 27, 27), 1, ƒ.Vector2.ZERO(), resolutionQuad, ƒ.ORIGIN2D.CENTER);
      // this.sprites.set(buttonType, sprite);
    }
  }

  export class Menu extends ƒ.Node {
    public rowOffsetY: number = 1.5;
    public gameSpeed: number;

    private leftRowOptions: number;
    private selection: number = 0;
    private soundOptions: MenuComponent[] = [];
    private speedOptions: MenuComponent[] = [];


    constructor() {
      super(MENUCOMPONENT.MENU);
      this.addComponent(new ƒ.ComponentTransform());
      this.cmpTransform.local.translateZ(10);
      // let leftRowOffsetX: number = -2;


      // let background: ƒ.Node = new ƒ.Node(BUTTON.BACKGROUND);
      // background.addComponent(new ƒ.ComponentTransform());
      // background.cmpTransform.local.translation = new ƒ.Vector3(0, 0, -1);
      // background.cmpTransform.local.scale(new ƒ.Vector3(15, 15, 0));
      // background.addComponent(new ƒ.ComponentMaterial(new ƒ.Material("Transparent", ƒ.ShaderUniColor, new ƒ.CoatColored(ƒ.Color.CSS("black", 0.5)))));
      // let cmpMesh: ƒ.ComponentMesh = new ƒ.ComponentMesh(new ƒ.MeshQuad());
      // background.addComponent(cmpMesh);
      // this.appendChild(background);

      let component: MenuComponent = new MenuComponent(MENUCOMPONENT.PAUSED);
      component.cmpTransform.local.translation = new ƒ.Vector3(0, 4, 0);
      this.appendChild(component);

      let currentOffsetY: number = 0;


      let leftRow: ƒ.Node = new ƒ.Node(MENUCOMPONENT.LEFTROW);
      leftRow.addComponent(new ƒ.ComponentTransform());
      leftRow.cmpTransform.local.translation = new ƒ.Vector3(-3, 2.5, 0);
      this.appendChild(leftRow);

      // component = new MenuComponent(MENUCOMPONENT.PLAY); 
      // component.cmpTransform.local.translation = new ƒ.Vector3(0, currentOffsetY -= this.rowOffsetY, 0);
      // leftRow.appendChild(component);

      component = new MenuComponent(MENUCOMPONENT.CURSOR);
      component.cmpTransform.local.translation = new ƒ.Vector3(-0.7, currentOffsetY, 0);
      leftRow.appendChild(component);

      component = new MenuComponent(MENUCOMPONENT.RESUME);
      component.cmpTransform.local.translation = new ƒ.Vector3(0, currentOffsetY, 0);
      leftRow.appendChild(component);

      component = new MenuComponent(MENUCOMPONENT.SOUND);
      component.cmpTransform.local.translation = new ƒ.Vector3(0, currentOffsetY -= this.rowOffsetY, 0);
      leftRow.appendChild(component);

      component = new MenuComponent(MENUCOMPONENT.SPEED);
      component.cmpTransform.local.translation = new ƒ.Vector3(0, currentOffsetY -= this.rowOffsetY, 0);
      leftRow.appendChild(component);

      this.leftRowOptions = leftRow.getChildren().length - 1;

      let rightRow: ƒ.Node = new ƒ.Node(MENUCOMPONENT.RIGHTROW);
      rightRow.addComponent(new ƒ.ComponentTransform());
      rightRow.cmpTransform.local.translation = new ƒ.Vector3(1.5, 2.5, 0);
      this.appendChild(rightRow);

      currentOffsetY = 0;

      component = new MenuComponent(MENUCOMPONENT.ON);
      component.cmpTransform.local.translation = new ƒ.Vector3(0, currentOffsetY -= this.rowOffsetY, 0);
      rightRow.appendChild(component);
      this.soundOptions.push(component);

      component = new MenuComponent(MENUCOMPONENT.OFF);
      component.cmpTransform.local.translation = new ƒ.Vector3(0, currentOffsetY, 0);
      component.activate(false);
      rightRow.appendChild(component);
      this.soundOptions.push(component);

      component = new MenuComponent(MENUCOMPONENT.SPEEDSLOW);
      component.cmpTransform.local.translation = new ƒ.Vector3(0, currentOffsetY -= this.rowOffsetY, 0);
      component.activate(false);
      rightRow.appendChild(component);
      this.speedOptions.push(component);

      component = new MenuComponent(MENUCOMPONENT.SPEEDNORMAL);
      component.cmpTransform.local.translation = new ƒ.Vector3(0, currentOffsetY, 0);
      rightRow.appendChild(component);
      this.speedOptions.push(component);

      component = new MenuComponent(MENUCOMPONENT.SPEEDFAST);
      component.cmpTransform.local.translation = new ƒ.Vector3(0, currentOffsetY, 0);
      component.activate(false);
      rightRow.appendChild(component);
      this.speedOptions.push(component);

      // button = new Button(BUTTON.BACKGROUND); 
      // button.cmpTransform.local.translation = new ƒ.Vector3(0, 0, -5);
      // button.cmpTransform.local.scale(new ƒ.Vector3(15, 15, 0));
      // game.appendChild(button);

      this.activate(false);
    }

    public navigate(_direction: number): void {
      this.selection -= _direction;
      if (this.selection < 0)
        this.selection += this.leftRowOptions;
      this.selection = this.selection % this.leftRowOptions;
      let cursor: ƒ.Node = this.getChildrenByName(MENUCOMPONENT.LEFTROW)[0].getChildrenByName(MENUCOMPONENT.CURSOR)[0];
      let translation: ƒ.Vector3 = cursor.cmpTransform.local.translation;
      translation.y = -this.selection * this.rowOffsetY;
      cursor.cmpTransform.local.translation = translation;
    }

    public triggerAction(): void {
      switch (this.selection) {
        case 0:
          this.activate(false);
          ƒ.Time.game.setScale(this.gameSpeed);
          break;
        case 1:
          for (const menuComponent of this.soundOptions) {
            menuComponent.activate(!menuComponent.isActive);
          }
          // TODO: Add Adio disable
          break;
        case 2:
          let selectionIndex: number = this.speedOptions.findIndex((value: MenuComponent) => value.isActive);
          selectionIndex += 1;
          selectionIndex %= this.speedOptions.length;
          this.speedOptions.forEach((element: MenuComponent, index: Number) => {
            element.activate(index == selectionIndex);
          });
          this.gameSpeed = this.getSpeed(selectionIndex);
      }
    }

    private getSpeed(_option: number): number {
      switch (_option) {
        case 0:
          return 0.5;
        case 1:
          return 1;
        case 2:
          return 2;
        default:
          return 1;
      }
    }
  }
}