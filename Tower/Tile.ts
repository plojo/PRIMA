namespace MyGame {
  import ƒ = FudgeCore;

  export class Tile extends Collidable {
    private static mesh: ƒ.MeshSprite = new ƒ.MeshSprite();
    private static sprites: Sprite[] = [];

    public constructor(_cssColor: string) {
      super("Tile");
      this.addComponent(new ƒ.ComponentMaterial(new ƒ.Material("Tile", ƒ.ShaderUniColor, new ƒ.CoatColored(ƒ.Color.CSS(_cssColor, 0.5)))));
      let cmpMesh: ƒ.ComponentMesh = new ƒ.ComponentMesh(Tile.mesh);
      // cmpMesh.pivot = Collidable.pivot;
      this.addComponent(cmpMesh);

      for (let sprite of Tile.sprites) {
        let nodeSprite: NodeSprite = new NodeSprite(sprite.name, sprite);
        // nodeSprite.showFrame(1);
        // nodeSprite.activate(false);
        this.appendChild(nodeSprite);
      }
    }
    public static generateSprite(_txtImage: ƒ.TextureImage): void {
      let sprite: Sprite = new Sprite("Tile")
      console.log(_txtImage);
      sprite.generateByGrid(_txtImage, ƒ.Rectangle.GET(32, 0, 48, 16), 1, ƒ.Vector2.ZERO(), 16, ƒ.ORIGIN2D.CENTER);
      this.sprites.push(sprite);

    }
  }
}