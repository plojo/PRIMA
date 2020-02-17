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
    LEFTCOLUMN = "LeftColumn",
    RIGHTCOLUMN = "RightColumn",
    TITLE = "Title"
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
      sprite.generateByGrid(_txtImage, ƒ.Rectangle.GET(0, 9, 39, 9), 1, ƒ.Vector2.ZERO(), resolutionQuad, ƒ.ORIGIN2D.CENTERLEFT);
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

      buttonType = MENUCOMPONENT.TITLE;
      sprite = new Sprite(buttonType);
      sprite.generateByGrid(_txtImage, ƒ.Rectangle.GET(0, 97, 39, 9), 1, ƒ.Vector2.ZERO(), resolutionQuad, ƒ.ORIGIN2D.CENTER);
      this.sprites.set(buttonType, sprite);

      buttonType = MENUCOMPONENT.CURSOR;
      sprite = new Sprite(buttonType);
      sprite.generateByGrid(_txtImage, ƒ.Rectangle.GET(0, 72, 8, 7), 2, ƒ.Vector2.ZERO(), resolutionQuad, ƒ.ORIGIN2D.CENTERLEFT);
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

    private leftColumnOptionAmount: number;
    private selection: number = 0;
    private soundOptions: MenuComponent[] = [];
    private speedOptions: MenuComponent[] = [];

    private actionStart: () => void;

    constructor() {
      super(MENUCOMPONENT.MENU);
      this.addComponent(new ƒ.ComponentTransform());
      this.cmpTransform.local.translateZ(10);

      let component: MenuComponent = new MenuComponent(MENUCOMPONENT.TITLE);
      component.cmpTransform.local.translation = new ƒ.Vector3(0, 4, 0);
      this.appendChild(component);

      component = new MenuComponent(MENUCOMPONENT.PAUSED);
      component.cmpTransform.local.translation = new ƒ.Vector3(0, 4, 0);
      component.activate(false);
      this.appendChild(component);

      let currentOffsetY: number = 0;

      let leftColumn: ƒ.Node = new ƒ.Node(MENUCOMPONENT.LEFTCOLUMN);
      leftColumn.addComponent(new ƒ.ComponentTransform());
      leftColumn.cmpTransform.local.translation = new ƒ.Vector3(-3, 2.5, 0);
      this.appendChild(leftColumn);

      component = new MenuComponent(MENUCOMPONENT.CURSOR);
      component.cmpTransform.local.translation = new ƒ.Vector3(-0.7, currentOffsetY, 0);
      leftColumn.appendChild(component);

      component = new MenuComponent(MENUCOMPONENT.PLAY);
      component.cmpTransform.local.translation = new ƒ.Vector3(0, currentOffsetY, 0);
      leftColumn.appendChild(component);

      component = new MenuComponent(MENUCOMPONENT.RESUME);
      component.cmpTransform.local.translation = new ƒ.Vector3(0, currentOffsetY, 0);
      component.activate(false);
      leftColumn.appendChild(component);

      component = new MenuComponent(MENUCOMPONENT.SOUND);
      component.cmpTransform.local.translation = new ƒ.Vector3(0, currentOffsetY -= this.rowOffsetY, 0);
      leftColumn.appendChild(component);

      component = new MenuComponent(MENUCOMPONENT.SPEED);
      component.cmpTransform.local.translation = new ƒ.Vector3(0, currentOffsetY -= this.rowOffsetY, 0);
      leftColumn.appendChild(component);

      this.leftColumnOptionAmount = leftColumn.getChildren().filter((menuComponent: ƒ.Node) => {
        return menuComponent.isActive && menuComponent.name != MENUCOMPONENT.CURSOR;
      }).length;

      let rightColumn: ƒ.Node = new ƒ.Node(MENUCOMPONENT.RIGHTCOLUMN);
      rightColumn.addComponent(new ƒ.ComponentTransform());
      rightColumn.cmpTransform.local.translation = new ƒ.Vector3(1.5, 2.5, 0);
      this.appendChild(rightColumn);

      currentOffsetY = 0;

      component = new MenuComponent(MENUCOMPONENT.ON);
      component.cmpTransform.local.translation = new ƒ.Vector3(0, currentOffsetY -= this.rowOffsetY, 0);
      rightColumn.appendChild(component);
      this.soundOptions.push(component);

      component = new MenuComponent(MENUCOMPONENT.OFF);
      component.cmpTransform.local.translation = new ƒ.Vector3(0, currentOffsetY, 0);
      component.activate(false);
      rightColumn.appendChild(component);
      this.soundOptions.push(component);

      component = new MenuComponent(MENUCOMPONENT.SPEEDSLOW);
      component.cmpTransform.local.translation = new ƒ.Vector3(0, currentOffsetY -= this.rowOffsetY, 0);
      component.activate(false);
      rightColumn.appendChild(component);
      this.speedOptions.push(component);

      component = new MenuComponent(MENUCOMPONENT.SPEEDNORMAL);
      component.cmpTransform.local.translation = new ƒ.Vector3(0, currentOffsetY, 0);
      rightColumn.appendChild(component);
      this.speedOptions.push(component);

      component = new MenuComponent(MENUCOMPONENT.SPEEDFAST);
      component.cmpTransform.local.translation = new ƒ.Vector3(0, currentOffsetY, 0);
      component.activate(false);
      rightColumn.appendChild(component);
      this.speedOptions.push(component);

      this.actionStart = () => {
        this.getChildrenByName(MENUCOMPONENT.PAUSED)[0].activate(true);
        leftColumn.getChildrenByName(MENUCOMPONENT.RESUME)[0].activate(true);

        this.removeChild(this.getChildrenByName(MENUCOMPONENT.TITLE)[0]);
        leftColumn.removeChild(leftColumn.getChildrenByName(MENUCOMPONENT.PLAY)[0]);

        let isActive: boolean = Audio.getAudio(AUDIO.MUSIC).isActive;
        if (!isActive) {
          Audio.getAudio(AUDIO.MUSIC).activate(true);
          Audio.play(AUDIO.MUSIC, true, true);
          Audio.getAudio(AUDIO.MUSIC).activate(false);
        } else
          Audio.play(AUDIO.MUSIC);


        this.actionStart = () => {
          this.show(false);
          ƒ.Time.game.setScale(this.gameSpeed);
        };

        this.actionStart();
      };
    }

    public navigate(_direction: number): void {
      Audio.play(AUDIO.CURSOR);
      this.selection -= _direction;
      if (this.selection < 0)
        this.selection += this.leftColumnOptionAmount;
      this.selection = this.selection % this.leftColumnOptionAmount;
      let cursor: ƒ.Node = this.getChildrenByName(MENUCOMPONENT.LEFTCOLUMN)[0].getChildrenByName(MENUCOMPONENT.CURSOR)[0];
      let translation: ƒ.Vector3 = cursor.cmpTransform.local.translation;
      translation.y = -this.selection * this.rowOffsetY;
      cursor.cmpTransform.local.translation = translation;
    }

    public triggerAction(): void {
      switch (this.selection) {
        case 0:
          this.actionStart();
          break;
        case 1:
          for (const menuComponent of this.soundOptions) {
            menuComponent.activate(!menuComponent.isActive);
          }
          Audio.switch();
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
      Audio.play(AUDIO.CONFIRM);
    }

    public show(_on: boolean) {
      this.activate(_on);
      Audio.pause(_on);
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