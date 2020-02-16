"use strict";
var MyGame;
(function (MyGame) {
    var ƒ = FudgeCore;
    let MENUCOMPONENT;
    (function (MENUCOMPONENT) {
        MENUCOMPONENT["PLAY"] = "Play";
        MENUCOMPONENT["SOUND"] = "Sound";
        MENUCOMPONENT["ON"] = "On";
        MENUCOMPONENT["OFF"] = "Off";
        MENUCOMPONENT["SPEED"] = "Speed";
        MENUCOMPONENT["SPEEDSLOW"] = "SPEEDSLOW";
        MENUCOMPONENT["SPEEDNORMAL"] = "SPEEDNORMAL";
        MENUCOMPONENT["SPEEDFAST"] = "SPEEDFAST";
        MENUCOMPONENT["CURSOR"] = "Cursor";
        MENUCOMPONENT["PAUSED"] = "Paused";
        MENUCOMPONENT["RESUME"] = "Resume";
        MENUCOMPONENT["BACKGROUND"] = "Background";
        MENUCOMPONENT["MENU"] = "Menu";
        MENUCOMPONENT["LEFTROW"] = "LeftRow";
        MENUCOMPONENT["RIGHTROW"] = "RightRow";
        MENUCOMPONENT["TITLE"] = "Title";
    })(MENUCOMPONENT = MyGame.MENUCOMPONENT || (MyGame.MENUCOMPONENT = {}));
    class MenuComponent extends MyGame.NodeSprite {
        constructor(_menuComponent) {
            super(_menuComponent, MenuComponent.sprites.get(_menuComponent));
            this.addComponent(new ƒ.ComponentTransform());
        }
        static generateSprites(_txtImage) {
            this.sprites = new Map();
            let resolutionQuad = 16;
            let buttonType = MENUCOMPONENT.PAUSED;
            let sprite = new MyGame.Sprite(buttonType);
            sprite.generateByGrid(_txtImage, ƒ.Rectangle.GET(0, 79, 48, 9), 1, ƒ.Vector2.ZERO(), resolutionQuad, ƒ.ORIGIN2D.CENTER);
            this.sprites.set(buttonType, sprite);
            buttonType = MENUCOMPONENT.PLAY;
            sprite = new MyGame.Sprite(buttonType);
            sprite.generateByGrid(_txtImage, ƒ.Rectangle.GET(0, 0, 32, 9), 1, ƒ.Vector2.ZERO(), resolutionQuad, ƒ.ORIGIN2D.CENTERLEFT);
            this.sprites.set(buttonType, sprite);
            buttonType = MENUCOMPONENT.SOUND;
            sprite = new MyGame.Sprite(buttonType);
            sprite.generateByGrid(_txtImage, ƒ.Rectangle.GET(0, 9, 40, 9), 1, ƒ.Vector2.ZERO(), resolutionQuad, ƒ.ORIGIN2D.CENTERLEFT);
            this.sprites.set(buttonType, sprite);
            buttonType = MENUCOMPONENT.ON;
            sprite = new MyGame.Sprite(buttonType);
            sprite.generateByGrid(_txtImage, ƒ.Rectangle.GET(0, 18, 16, 9), 1, ƒ.Vector2.ZERO(), resolutionQuad, ƒ.ORIGIN2D.CENTERLEFT);
            this.sprites.set(buttonType, sprite);
            buttonType = MENUCOMPONENT.OFF;
            sprite = new MyGame.Sprite(buttonType);
            sprite.generateByGrid(_txtImage, ƒ.Rectangle.GET(0, 27, 24, 9), 1, ƒ.Vector2.ZERO(), resolutionQuad, ƒ.ORIGIN2D.CENTERLEFT);
            this.sprites.set(buttonType, sprite);
            buttonType = MENUCOMPONENT.SPEED;
            sprite = new MyGame.Sprite(buttonType);
            sprite.generateByGrid(_txtImage, ƒ.Rectangle.GET(0, 36, 40, 9), 1, ƒ.Vector2.ZERO(), resolutionQuad, ƒ.ORIGIN2D.CENTERLEFT);
            this.sprites.set(buttonType, sprite);
            buttonType = MENUCOMPONENT.SPEEDNORMAL;
            sprite = new MyGame.Sprite(buttonType);
            sprite.generateByGrid(_txtImage, ƒ.Rectangle.GET(0, 45, 16, 9), 1, ƒ.Vector2.ZERO(), resolutionQuad, ƒ.ORIGIN2D.CENTERLEFT);
            this.sprites.set(buttonType, sprite);
            buttonType = MENUCOMPONENT.SPEEDFAST;
            sprite = new MyGame.Sprite(buttonType);
            sprite.generateByGrid(_txtImage, ƒ.Rectangle.GET(0, 54, 16, 9), 1, ƒ.Vector2.ZERO(), resolutionQuad, ƒ.ORIGIN2D.CENTERLEFT);
            this.sprites.set(buttonType, sprite);
            buttonType = MENUCOMPONENT.SPEEDSLOW;
            sprite = new MyGame.Sprite(buttonType);
            sprite.generateByGrid(_txtImage, ƒ.Rectangle.GET(0, 63, 28, 9), 1, ƒ.Vector2.ZERO(), resolutionQuad, ƒ.ORIGIN2D.CENTERLEFT);
            this.sprites.set(buttonType, sprite);
            buttonType = MENUCOMPONENT.RESUME;
            sprite = new MyGame.Sprite(buttonType);
            sprite.generateByGrid(_txtImage, ƒ.Rectangle.GET(0, 88, 49, 9), 1, ƒ.Vector2.ZERO(), resolutionQuad, ƒ.ORIGIN2D.CENTERLEFT);
            this.sprites.set(buttonType, sprite);
            buttonType = MENUCOMPONENT.TITLE;
            sprite = new MyGame.Sprite(buttonType);
            sprite.generateByGrid(_txtImage, ƒ.Rectangle.GET(0, 97, 39, 9), 1, ƒ.Vector2.ZERO(), resolutionQuad, ƒ.ORIGIN2D.CENTER);
            this.sprites.set(buttonType, sprite);
            buttonType = MENUCOMPONENT.CURSOR;
            sprite = new MyGame.Sprite(buttonType);
            sprite.generateByGrid(_txtImage, ƒ.Rectangle.GET(0, 72, 8, 8), 2, ƒ.Vector2.ZERO(), resolutionQuad, ƒ.ORIGIN2D.CENTERLEFT);
            this.sprites.set(buttonType, sprite);
            // buttonType = MENUCOMPONENT.BACKGROUND;
            // sprite = new Sprite(buttonType);
            // sprite.generateByGrid(_txtImage, ƒ.Rectangle.GET(40, 0, 27, 27), 1, ƒ.Vector2.ZERO(), resolutionQuad, ƒ.ORIGIN2D.CENTER);
            // this.sprites.set(buttonType, sprite);
        }
    }
    MyGame.MenuComponent = MenuComponent;
    class Menu extends ƒ.Node {
        constructor() {
            super(MENUCOMPONENT.MENU);
            this.rowOffsetY = 1.5;
            this.selection = 0;
            this.soundOptions = [];
            this.speedOptions = [];
            this.addComponent(new ƒ.ComponentTransform());
            this.cmpTransform.local.translateZ(10);
            // let background: ƒ.Node = new ƒ.Node(BUTTON.BACKGROUND);
            // background.addComponent(new ƒ.ComponentTransform());
            // background.cmpTransform.local.translation = new ƒ.Vector3(0, 0, -1);
            // background.cmpTransform.local.scale(new ƒ.Vector3(15, 15, 0));
            // background.addComponent(new ƒ.ComponentMaterial(new ƒ.Material("Transparent", ƒ.ShaderUniColor, new ƒ.CoatColored(ƒ.Color.CSS("black", 0.5)))));
            // let cmpMesh: ƒ.ComponentMesh = new ƒ.ComponentMesh(new ƒ.MeshQuad());
            // background.addComponent(cmpMesh);
            // this.appendChild(background);
            let component = new MenuComponent(MENUCOMPONENT.TITLE);
            component.cmpTransform.local.translation = new ƒ.Vector3(0, 4, 0);
            this.appendChild(component);
            component = new MenuComponent(MENUCOMPONENT.PAUSED);
            component.cmpTransform.local.translation = new ƒ.Vector3(0, 4, 0);
            component.activate(false);
            this.appendChild(component);
            let currentOffsetY = 0;
            let leftRow = new ƒ.Node(MENUCOMPONENT.LEFTROW);
            leftRow.addComponent(new ƒ.ComponentTransform());
            leftRow.cmpTransform.local.translation = new ƒ.Vector3(-3, 2.5, 0);
            this.appendChild(leftRow);
            component = new MenuComponent(MENUCOMPONENT.CURSOR);
            component.cmpTransform.local.translation = new ƒ.Vector3(-0.7, currentOffsetY, 0);
            leftRow.appendChild(component);
            component = new MenuComponent(MENUCOMPONENT.PLAY);
            component.cmpTransform.local.translation = new ƒ.Vector3(0, currentOffsetY, 0);
            leftRow.appendChild(component);
            component = new MenuComponent(MENUCOMPONENT.RESUME);
            component.cmpTransform.local.translation = new ƒ.Vector3(0, currentOffsetY, 0);
            component.activate(false);
            leftRow.appendChild(component);
            component = new MenuComponent(MENUCOMPONENT.SOUND);
            component.cmpTransform.local.translation = new ƒ.Vector3(0, currentOffsetY -= this.rowOffsetY, 0);
            leftRow.appendChild(component);
            component = new MenuComponent(MENUCOMPONENT.SPEED);
            component.cmpTransform.local.translation = new ƒ.Vector3(0, currentOffsetY -= this.rowOffsetY, 0);
            leftRow.appendChild(component);
            this.leftRowOptions = leftRow.getChildren().length - 2;
            let rightRow = new ƒ.Node(MENUCOMPONENT.RIGHTROW);
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
            this.actionStart = () => {
                this.getChildrenByName(MENUCOMPONENT.PAUSED)[0].activate(true);
                leftRow.getChildrenByName(MENUCOMPONENT.RESUME)[0].activate(true);
                this.removeChild(this.getChildrenByName(MENUCOMPONENT.TITLE)[0]);
                leftRow.removeChild(leftRow.getChildrenByName(MENUCOMPONENT.PLAY)[0]);
                this.actionStart = () => {
                    this.activate(false);
                    ƒ.Time.game.setScale(this.gameSpeed);
                };
                this.actionStart();
            };
        }
        navigate(_direction) {
            this.selection -= _direction;
            if (this.selection < 0)
                this.selection += this.leftRowOptions;
            this.selection = this.selection % this.leftRowOptions;
            let cursor = this.getChildrenByName(MENUCOMPONENT.LEFTROW)[0].getChildrenByName(MENUCOMPONENT.CURSOR)[0];
            let translation = cursor.cmpTransform.local.translation;
            translation.y = -this.selection * this.rowOffsetY;
            cursor.cmpTransform.local.translation = translation;
        }
        triggerAction() {
            switch (this.selection) {
                case 0:
                    console.log("go");
                    this.actionStart();
                    break;
                case 1:
                    for (const menuComponent of this.soundOptions) {
                        menuComponent.activate(!menuComponent.isActive);
                    }
                    // TODO: Add Adio disable
                    break;
                case 2:
                    let selectionIndex = this.speedOptions.findIndex((value) => value.isActive);
                    selectionIndex += 1;
                    selectionIndex %= this.speedOptions.length;
                    this.speedOptions.forEach((element, index) => {
                        element.activate(index == selectionIndex);
                    });
                    this.gameSpeed = this.getSpeed(selectionIndex);
            }
        }
        getSpeed(_option) {
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
    MyGame.Menu = Menu;
})(MyGame || (MyGame = {}));
