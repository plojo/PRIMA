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
        BACKGROUND = "Background",
        MENU = "Menu",
        LEFTROW = "LeftRow",
        RIGHTROW = "RightRow"
    }
    class MenuComponent extends NodeSprite {
        protected static sprites: Map<MENUCOMPONENT, Sprite>;
        constructor(_menuComponent: MENUCOMPONENT);
        static generateSprites(_txtImage: ƒ.TextureImage): void;
    }
    class Menu extends ƒ.Node {
        private leftRowOptions;
        private selection;
        constructor();
        navigate(_direction: number): void;
    }
}
