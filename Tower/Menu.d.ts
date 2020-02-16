declare namespace MyGame {
    import ƒ = FudgeCore;
    enum MENUCOMPONENT {
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
        RIGHTROW = "RightRow",
        TITLE = "Title"
    }
    class MenuComponent extends NodeSprite {
        protected static sprites: Map<MENUCOMPONENT, Sprite>;
        constructor(_menuComponent: MENUCOMPONENT);
        static generateSprites(_txtImage: ƒ.TextureImage): void;
    }
    class Menu extends ƒ.Node {
        rowOffsetY: number;
        gameSpeed: number;
        private leftRowOptions;
        private selection;
        private soundOptions;
        private speedOptions;
        private actionStart;
        constructor();
        navigate(_direction: number): void;
        triggerAction(): void;
        private getSpeed;
    }
}
