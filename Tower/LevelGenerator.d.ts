declare namespace MyGame {
    enum TYPE {
        TILE = "Tile",
        PLATFORM = "Platform",
        FLOOR = "Floor",
        CEILING = "Ceiling",
        WALL = "Wall",
        GUST = "Gust",
        GUSTSPAWNER = "GustSpawner",
        CAMERABOUNDS = "CameraBounds"
    }
    class LevelGenerator {
        static generateLevel(_filename: string): Promise<void>;
        private static generateObject;
    }
}
