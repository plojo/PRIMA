"use strict";
var L09_FudgeCraft_Camera;
(function (L09_FudgeCraft_Camera) {
    var f = FudgeCore;
    let CUBE_TYPE;
    (function (CUBE_TYPE) {
        CUBE_TYPE["GREEN"] = "Green";
        CUBE_TYPE["RED"] = "Red";
        CUBE_TYPE["BLUE"] = "Blue";
        CUBE_TYPE["YELLOW"] = "Yellow";
        CUBE_TYPE["MAGENTA"] = "Magenta";
        CUBE_TYPE["CYAN"] = "Cyan";
        CUBE_TYPE["ORANGE"] = "Orange";
        CUBE_TYPE["GRAY"] = "Gray";
        CUBE_TYPE["TRANSPARENT"] = "Transparent";
    })(CUBE_TYPE = L09_FudgeCraft_Camera.CUBE_TYPE || (L09_FudgeCraft_Camera.CUBE_TYPE = {}));
    class Cube extends f.Node {
        constructor(_type, _position) {
            super("Cube." + _type);
            let cmpMesh = new f.ComponentMesh(Cube.mesh);
            this.addComponent(cmpMesh);
            let cmpMaterial = new f.ComponentMaterial(Cube.materials.get(_type));
            this.addComponent(cmpMaterial);
            let cmpTransform = new f.ComponentTransform(f.Matrix4x4.TRANSLATION(_position));
            cmpTransform.local.scale(f.Vector3.ONE(0.9));
            this.addComponent(cmpTransform);
        }
        static createMaterials() {
            return new Map([
                [CUBE_TYPE.RED, new f.Material(CUBE_TYPE.RED, f.ShaderFlat, new f.CoatColored(f.Color.RED))],
                [CUBE_TYPE.GREEN, new f.Material(CUBE_TYPE.GREEN, f.ShaderFlat, new f.CoatColored(f.Color.GREEN))],
                [CUBE_TYPE.BLUE, new f.Material(CUBE_TYPE.BLUE, f.ShaderFlat, new f.CoatColored(f.Color.BLUE))],
                [CUBE_TYPE.MAGENTA, new f.Material(CUBE_TYPE.MAGENTA, f.ShaderFlat, new f.CoatColored(f.Color.MAGENTA))],
                [CUBE_TYPE.YELLOW, new f.Material(CUBE_TYPE.YELLOW, f.ShaderFlat, new f.CoatColored(f.Color.YELLOW))],
                [CUBE_TYPE.CYAN, new f.Material(CUBE_TYPE.CYAN, f.ShaderFlat, new f.CoatColored(f.Color.CYAN))],
                [CUBE_TYPE.ORANGE, new f.Material(CUBE_TYPE.ORANGE, f.ShaderFlat, new f.CoatColored(new f.Color(1, 0.65, 0)))],
                [CUBE_TYPE.GRAY, new f.Material(CUBE_TYPE.GRAY, f.ShaderFlat, new f.CoatColored(new f.Color(0.5, 0.5, 0.5)))],
                [CUBE_TYPE.TRANSPARENT, new f.Material(CUBE_TYPE.TRANSPARENT, f.ShaderFlat, new f.CoatColored(new f.Color(0, 0, 0, 0)))]
            ]);
        }
    }
    Cube.mesh = new f.MeshCube();
    Cube.materials = Cube.createMaterials();
    L09_FudgeCraft_Camera.Cube = Cube;
})(L09_FudgeCraft_Camera || (L09_FudgeCraft_Camera = {}));
//# sourceMappingURL=Cube.js.map