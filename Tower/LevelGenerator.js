"use strict";
var MyGame;
(function (MyGame) {
    let TYPE;
    (function (TYPE) {
        TYPE["TILE"] = "Tile";
        TYPE["PLATFORM"] = "Platform";
        TYPE["FLOOR"] = "Floor";
        TYPE["CEILING"] = "Ceiling";
        TYPE["WALLLEFT"] = "WallLeft";
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
            let translation = new MyGame.ƒ.Vector3(_object.translation.x * 0.5, _object.translation.y * 0.5, 0);
            switch (_object.type) {
                case TYPE.PLATFORM:
                case TYPE.FLOOR:
                case TYPE.CEILING: {
                    let tileJSON = _object;
                    let tile = new MyGame.Tile(_object.type, tileJSON.length, MyGame.ORIENTATION.RIGHT, tileJSON.cornerBlocks);
                    tile.cmpTransform.local.translate(translation);
                    MyGame.staticObjects.appendChild(tile);
                    break;
                }
                case TYPE.WALLLEFT:
                case TYPE.WALLRIGHT: {
                    let tileJSON = _object;
                    let tile = new MyGame.Tile(_object.type, tileJSON.length, MyGame.ORIENTATION.UP, tileJSON.cornerBlocks ? tileJSON.cornerBlocks : false);
                    tile.cmpTransform.local.translate(translation);
                    MyGame.staticObjects.appendChild(tile);
                    break;
                }
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
