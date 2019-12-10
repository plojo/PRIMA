declare namespace L08_FudgeCraft_Collision {
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
