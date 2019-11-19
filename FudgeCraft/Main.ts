namespace FudgeCraft {

    import f = FudgeCore;
    window.addEventListener("load", hndLoad);
    export let viewport: f.Viewport;

    let game: f.Node;
    const keysPressed: Map<string, boolean> = new Map();

    function hndLoad(_event: Event): void {
        const canvas: HTMLCanvasElement = document.querySelector("canvas");
        f.RenderManager.initialize();
        console.log(canvas);

        game = createGame();

        const zPos: number = 40;
        const cmpCamera: f.ComponentCamera = new f.ComponentCamera();
        cmpCamera.pivot.translateZ(zPos);

        viewport = new f.Viewport();
        viewport.initialize("Viewport", game, cmpCamera, canvas);
        f.Debug.log(viewport);

        window.addEventListener("keyup", hndKeyup);
        window.addEventListener("keydown", hndKeydown);

        viewport.draw();

        f.Loop.addEventListener(f.EVENT.LOOP_FRAME, update);
        f.Loop.start();

        new LinePiece().print();
    }

    function update(_event: Event): void {
        handleControls();
        f.RenderManager.update();
        viewport.draw();
    }

    function handleControls(): void {

    }

    function createGame(): f.Node {
        const xBoundary: number = 21;
        const yBoundary: number = 14;

        let game: f.Node = new f.Node("Game");
        let meshQuad: f.Mesh = new f.MeshQuad();
        let mtrSolidBlack: f.Material = new f.Material("SolidWhite", f.ShaderUniColor, new f.CoatColored(f.Color.WHITE));

        game.appendChild(createNode("BoundaryTop", meshQuad, mtrSolidBlack, new f.Vector3(0, yBoundary, 0), new f.Vector3(xBoundary * 2, 1, 1)));

        return game;
    }

    function createNode(_name: string, _mesh: f.Mesh, _material: f.Material, _translation: f.Vector3, _scaling: f.Vector3): f.Node {
        let node: f.Node = new f.Node(_name);
        node.addComponent(new f.ComponentMesh(_mesh));
        node.addComponent(new f.ComponentMaterial(_material));
        node.addComponent(new f.ComponentTransform());
        node.cmpTransform.local.translate(_translation);
        node.getComponent(f.ComponentMesh).pivot.scale(_scaling);
        return node;
    }

    // function randomizeColor(_node: f.Node): void {
    //     _node.getComponent(f.ComponentMaterial).material.setCoat(randomColoredCoat());
    //     f.RenderManager.updateNode(_node);
    // }

    // function randomColoredCoat(): f.CoatColored {
    //     return new f.CoatColored(new f.Color(Math.random(), Math.random(), Math.random(), 1));
    // }

    function hndKeyup(_event: KeyboardEvent): void {
        keysPressed.set(_event.code, false);
    }

    function hndKeydown(_event: KeyboardEvent): void {
        keysPressed.set(_event.code, true);
    }

    class Tetromino {
        public form: Boolean[][][];
        public core: f.Node;
        private size: number = 4;
        constructor() {
            this.form = [];
            // this.core = new f.Node();
            for (let x: number = 0; x < this.size; x++) {
                this.form[x] = [];
                for (let y: number = 0; y < this.size; y++) {
                    this.form[x][y] = [];
                    for (let z: number = 0; z < this.size; z++) {
                        this.form[x][y][z] = false;
                    }
                }
            }
        }

        public print() {
            for (let x: number = 0; x < this.size; x++) {
                for (let y: number = 0; y < this.size; y++) {
                    for (let z: number = 0; z < this.size; z++) {
                        console.log("x: ", x, "; y: ", y, "; z: ", z, " = ", this.form[x][y][z]);
                    }
                }
            }
        }
    }

    class LinePiece extends Tetromino {
        constructor() {
            super();
            this.form[1][0][1] = true;
            this.form[1][1][1] = true;
            this.form[1][2][1] = true;
            this.form[1][3][1] = true;
        }
    }

}