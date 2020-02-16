namespace MyGame {
    import ƒ = FudgeCore;

    export class Collidable extends ƒ.Node {
        
        public constructor(_name: string = "Collidable") {
            super(_name);
            this.addComponent(new ƒ.ComponentTransform());

            this.addComponent(new ƒ.ComponentMaterial(new ƒ.Material(_name, ƒ.ShaderUniColor, new ƒ.CoatColored(ƒ.Color.CSS("blue", 0.2)))));
            let cmpMesh: ƒ.ComponentMesh = new ƒ.ComponentMesh(new ƒ.MeshSprite());
            this.addComponent(cmpMesh);
        }

        public getRectWorld(): ƒ.Rectangle {
            let rect: ƒ.Rectangle = ƒ.Rectangle.GET(0, 0, 100, 100);
            let topleft: ƒ.Vector3 = new ƒ.Vector3(-0.5, 0.5, 0);
            let bottomright: ƒ.Vector3 = new ƒ.Vector3(0.5, -0.5, 0);

            let mtxResult: ƒ.Matrix4x4 = this.mtxWorld;
            topleft.transform(mtxResult, true);
            bottomright.transform(mtxResult, true);

            let size: ƒ.Vector2 = new ƒ.Vector2(bottomright.x - topleft.x, bottomright.y - topleft.y);
            rect.position = topleft.toVector2();
            rect.size = size;

            return rect;
        }
    }
}