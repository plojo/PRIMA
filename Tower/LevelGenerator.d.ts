declare namespace MyGame {
    enum TYPE {
        TILE = "Tile",
        PLATFORM = "Platform",
        GUST = "Gust",
        GUSTSPAWNER = "GustSpawner"
    }
    class LevelGenerator {
        static generateLevel(_filename: string): void;
        private static generateObject;
    }
}
