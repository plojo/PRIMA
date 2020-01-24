namespace MyGame {
  import ƒ = FudgeCore;

  export class Tile extends Collidable {
    private static mesh: ƒ.MeshSprite = new ƒ.MeshSprite();
    // private static material: ƒ.Material = new ƒ.Material("Floor", ƒ.ShaderUniColor, new ƒ.CoatColored(ƒ.Color.CSS("red", 0.5)));

    public constructor(_cssColor: string) {
      super("Tile");
      this.addComponent(new ƒ.ComponentMaterial(new ƒ.Material("Tile", ƒ.ShaderUniColor, new ƒ.CoatColored(ƒ.Color.CSS(_cssColor, 0.5)))));
      let cmpMesh: ƒ.ComponentMesh = new ƒ.ComponentMesh(Tile.mesh);
      cmpMesh.pivot = Collidable.pivot;
      this.addComponent(cmpMesh);
    }
  }
}