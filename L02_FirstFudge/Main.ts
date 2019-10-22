namespace L02_FirstFudge {
    import f = FudgeCore;
    window.addEventListener("load", hndLoad);
    export let viewport: f.Viewport;
    
    function hndLoad(_event: Event): void {
        const canvas: HTMLCanvasElement = document.querySelector("canvas");
        f.RenderManager.initialize();
        console.log(canvas);
        
        let rootNode: f.Node = new f.Node("root");
        
        let node: f.Node = new f.Node("Quad");
        let mesh: f.Mesh = new f.MeshQuad();
        let cmpMesh: f.ComponentMesh = new f.ComponentMesh(mesh);
        node.addComponent(cmpMesh);

        let mtrSolidWhite: f.Material = new f.Material("SolidWhite", f.ShaderUniColor, new f.CoatColored(new f.Color(Math.random(), Math.random(), Math.random(), 1)));
        let cmpMaterial: f.ComponentMaterial = new f.ComponentMaterial(mtrSolidWhite);
        node.addComponent(cmpMaterial);
        
        let zPos: number = 4;
        let cmpCamera: f.ComponentCamera = new f.ComponentCamera();
        cmpCamera.pivot.translateZ(zPos);

        let node2: f.Node = new f.Node("Quad2");
        let cmpMesh2: f.ComponentMesh = new f.ComponentMesh(mesh);
        let cmpMaterial2: f.ComponentMaterial = new f.ComponentMaterial(mtrSolidWhite);
        node2.addComponent(cmpMesh2);
        node2.addComponent(cmpMaterial2);

        rootNode.appendChild(node);
        rootNode.appendChild(node2);
        viewport = new f.Viewport();
        viewport.initialize("Viewport", rootNode, cmpCamera, canvas);
        f.Debug.log(viewport);
        cmpMesh.pivot.translateX(-1);
        cmpMesh2.pivot.translateX(1);
        viewport.draw();

        setInterval(() => {
            cmpMesh.pivot.rotateY(10);
            cmpMesh2.pivot.rotateY(5);
            viewport.draw();
        }, 100)
        
    }
}