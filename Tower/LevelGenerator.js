"use strict";
var MyGame;
(function (MyGame) {
    let TYPE;
    (function (TYPE) {
        TYPE["TILE"] = "Tile";
        TYPE["PLATFORM"] = "Platform";
        TYPE["FLOOR"] = "Floor";
        TYPE["CEILING"] = "Ceiling";
        TYPE["WALL"] = "Wall";
        TYPE["WALLRIGHT"] = "WallRight";
        TYPE["GUST"] = "Gust";
        TYPE["GUSTSPAWNER"] = "GustSpawner";
    })(TYPE = MyGame.TYPE || (MyGame.TYPE = {}));
    class LevelGenerator {
        static generateLevel(_filename) {
            let file = new XMLHttpRequest();
            file.open("GET", _filename, false);
            file.send(null);
            let levelJSON = JSON.parse(file.responseText);
            for (let object of levelJSON.objects) {
                this.generateObject(object);
            }
        }
        static generateObject(_object) {
            switch (_object.type) {
                case TYPE.PLATFORM:
                case TYPE.FLOOR:
                case TYPE.WALL:
                    let tileJSON = _object;
                    let tile = new MyGame.Tile(_object.type);
                    tile.cmpTransform.local.translate(new MyGame.ƒ.Vector3(tileJSON.translation.x, tileJSON.translation.y, 0));
                    MyGame.staticObjects.appendChild(tile);
                    break;
                // case TYPE.CEILING: {
                //     let tileJSON: TileJSON = <TileJSON>_object;
                //     let tile: Tile = new Tile(_object.type, tileJSON.length, ORIENTATION.RIGHT);
                //     tile.cmpTransform.local.translate(new ƒ.Vector3(tileJSON.translation.x, tileJSON.translation.y, 0));
                //     staticObjects.appendChild(tile);
                //     break;
                // }
                // case TYPE.WALLLEFT:
                // case TYPE.WALLRIGHT: {
                //     let tileJSON: TileJSON = <TileJSON>_object;
                //     let tile: Tile = new Tile(_object.type, tileJSON.length, ORIENTATION.UP, false);
                //     tile.cmpTransform.local.translate(new ƒ.Vector3(tileJSON.translation.x, tileJSON.translation.y, 0));
                //     staticObjects.appendChild(tile);
                //     break;
                // }   
                case TYPE.GUSTSPAWNER:
                    let gustSpawnerJSON = _object;
                    let gustSpawner = new MyGame.GustSpawner(gustSpawnerJSON.parameter.offset, gustSpawnerJSON.parameter.interval, gustSpawnerJSON.parameter.lifespan, gustSpawnerJSON.parameter.speed);
                    gustSpawner.cmpTransform.local.translate(new MyGame.ƒ.Vector3(gustSpawnerJSON.translation.x, gustSpawnerJSON.translation.y, 0));
                    gustSpawner.cmpTransform.local.rotateZ(gustSpawnerJSON.parameter.rotation);
                    MyGame.dynamicObjects.appendChild(gustSpawner);
                    break;
            }
        }
    }
    MyGame.LevelGenerator = LevelGenerator;
})(MyGame || (MyGame = {}));
