declare namespace MyGame {
    import ƒ = FudgeCore;
    export enum ORIENTATION {
        UP = "Up",
        RIGHT = "Right"
    }
    interface HitBoxes {
        [code: string]: ƒ.Rectangle[];
    }
    export class Block extends NodeSprite {
        static hit: HitBoxes;
        constructor(_name: string, _sprite: Sprite);
        readonly hitBox: HitBox;
    }
    export class Tile extends NodeSprite {
        protected static sprites: Map<TYPE, Sprite>;
        static hitBoxes: ƒ.Rectangle[];
        constructor(_type: TYPE);
        readonly hitBox: HitBox;
        static generateSprites(_txtImage: ƒ.TextureImage): void;
        protected createBlock(_name: string, _sprite: Sprite, _frame: number, _offset: number, _orientation: ORIENTATION): void;
    }
    export class Platform extends NodeSprite {
        private static sprite;
        constructor();
        readonly hitBox: HitBox;
        static generateSprites(_txtImage: ƒ.TextureImage): void;
    }
    export {};
}
