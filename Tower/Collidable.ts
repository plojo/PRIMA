namespace MyGame {
    import ƒ = FudgeCore;

    export class Collidable extends ƒ.Node {
        // protected static readonly pivot: ƒ.Matrix4x4 = ƒ.Matrix4x4.TRANSLATION(ƒ.Vector3.Y(-0.5));

        public constructor(_name: string) {
            super(_name);
            this.addComponent(new ƒ.ComponentTransform());
            this.addComponent(new ƒ.ComponentMaterial(new ƒ.Material("Tile", ƒ.ShaderUniColor, new ƒ.CoatColored(ƒ.Color.CSS("blue", 0.5)))));
            let cmpMesh: ƒ.ComponentMesh = new ƒ.ComponentMesh(new ƒ.MeshSprite());
            // cmpMesh.pivot = Collidable.pivot;
            this.addComponent(cmpMesh);
        }

        public getRectWorld(): ƒ.Rectangle {
            let rect: ƒ.Rectangle = ƒ.Rectangle.GET(0, 0, 100, 100);
            let topleft: ƒ.Vector3 = new ƒ.Vector3(-0.5, 0.5, 0);
            let bottomright: ƒ.Vector3 = new ƒ.Vector3(0.5, -0.5, 0);

            let mtxResult: ƒ.Matrix4x4 = this.mtxWorld;//ƒ.Matrix4x4.MULTIPLICATION(this.mtxWorld, Collidable.pivot);
            topleft.transform(mtxResult, true);
            bottomright.transform(mtxResult, true);

            let size: ƒ.Vector2 = new ƒ.Vector2(bottomright.x - topleft.x, bottomright.y - topleft.y);
            rect.position = topleft.toVector2();
            rect.size = size;

            return rect;
        }
    }
}