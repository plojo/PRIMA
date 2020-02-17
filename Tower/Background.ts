namespace MyGame {
    import ƒ = FudgeCore;
  
    export class Background extends ƒ.Node {
      private static mesh: ƒ.MeshSprite = new ƒ.MeshSprite();
  
      public constructor(image: ƒ.TextureImage, dist: number) {
        super("Background" + dist.toString());
        this.addComponent(new ƒ.ComponentTransform());
        let coat: ƒ.CoatTextured = new ƒ.CoatTextured();
        let pivot: ƒ.Matrix4x4 = new ƒ.Matrix4x4();
        coat.texture = image;
        pivot.translateZ(-dist);
        pivot.translateY(0.17);
        pivot.translateX(0.1);
        let material: ƒ.Material = new ƒ.Material(
          "Background",
          ƒ.ShaderTexture,
          coat
        );
        this.addComponent(new ƒ.ComponentMaterial(material));
        let cmpMesh: ƒ.ComponentMesh = new ƒ.ComponentMesh(Background.mesh);
        cmpMesh.pivot = pivot;
        this.addComponent(cmpMesh);
      }
    }
  }