declare namespace MyGame {
    enum TYPE {
        TILE = "Tile",
        PLATFORM = "Platform",
        FLOOR = "Floor",
        CEILING = "Ceiling",
        WALL = "Wall",
        WALLRIGHT = "WallRight",
        GUST = "Gust",
        GUSTSPAWNER = "GustSpawner"
    }
    class LevelGenerator {
        static generateLevel(_filename: string): void;
        private static generateObject;
    }
}
