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
        LEFTCOLUMN = "LeftColumn",
        RIGHTCOLUMN = "RightColumn",
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
        private leftColumnOptionAmount;
        private selection;
        private soundOptions;
        private speedOptions;
        private actionStart;
        constructor();
        navigate(_direction: number): void;
        triggerAction(): void;
        show(_on: boolean): void;
        private getSpeed;
    }
}
