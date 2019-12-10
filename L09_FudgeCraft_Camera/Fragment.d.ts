declare namespace L09_FudgeCraft_Camera {
    import f = FudgeCore;
    class Fragment extends f.Node {
        private static shapes;
        private static shapeToCubeType;
        constructor(_shape: number);
        static getRandom(): Fragment;
        private static getShapeArray;
        private static getShapeToCubeType;
    }
}
