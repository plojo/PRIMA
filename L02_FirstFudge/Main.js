"use strict";
var L02_FirstFudge;
(function (L02_FirstFudge) {
    var f = FudgeCore;
    window.addEventListener("load", hndLoad);
    function hndLoad(_event) {
        const canvas = document.querySelector("canvas");
        f.RenderManager.initialize();
        console.log(canvas);
        let rootNode = new f.Node("root");
        let node = new f.Node("Quad");
        let mesh = new f.MeshQuad();
        let cmpMesh = new f.ComponentMesh(mesh);
        node.addComponent(cmpMesh);
        let mtrSolidWhite = new f.Material("SolidWhite", f.ShaderUniColor, new f.CoatColored(new f.Color(Math.random(), Math.random(), Math.random(), 1)));
        let cmpMaterial = new f.ComponentMaterial(mtrSolidWhite);
        node.addComponent(cmpMaterial);
        let zPos = 4;
        let cmpCamera = new f.ComponentCamera();
        cmpCamera.pivot.translateZ(zPos);
        let node2 = new f.Node("Quad2");
        let cmpMesh2 = new f.ComponentMesh(mesh);
        let cmpMaterial2 = new f.ComponentMaterial(mtrSolidWhite);
        node2.addComponent(cmpMesh2);
        node2.addComponent(cmpMaterial2);
        rootNode.appendChild(node);
        rootNode.appendChild(node2);
        L02_FirstFudge.viewport = new f.Viewport();
        L02_FirstFudge.viewport.initialize("Viewport", rootNode, cmpCamera, canvas);
        f.Debug.log(L02_FirstFudge.viewport);
        cmpMesh.pivot.translateX(-1);
        cmpMesh2.pivot.translateX(1);
        L02_FirstFudge.viewport.draw();
        setInterval(() => {
            cmpMesh.pivot.rotateY(10);
            cmpMesh2.pivot.rotateY(5);
            L02_FirstFudge.viewport.draw();
        }, 100);
    }
})(L02_FirstFudge || (L02_FirstFudge = {}));
