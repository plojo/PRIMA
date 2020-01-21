declare namespace L10_FudgeCraft_DetectCombos {
    import f = FudgeCore;
    class Fragment extends f.Node {
        private static shapes;
        constructor(_shape: number);
        static getRandom(): Fragment;
        private static getShapeArray;
        private static getRandomEnum;
    }
}
