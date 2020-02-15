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
    export class Tile extends ƒ.Node {
        protected static sprites: Map<TYPE, Sprite>;
        constructor(_type: TYPE, _length: number, _orientation: ORIENTATION, cornerBlocks?: boolean);
        static generateSprites(_txtImage: ƒ.TextureImage): void;
        protected createBlock(_name: string, _sprite: Sprite, _frame: number, _offset: number, _orientation: ORIENTATION): void;
    }
    export {};
}
