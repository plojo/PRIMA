declare namespace L08_FudgeCraft_Movement {
    class Grid {
        private grid;
        setFragment(_fragment: Fragment): void;
        setCube(_cube: Cube): void;
        getCube(_position: f.Vector3): Cube;
        hasCube(_position: f.Vector3): Boolean;
        deleteCube(_position: f.Vector3): Cube;
        toKey(_position: f.Vector3): string;
    }
}
