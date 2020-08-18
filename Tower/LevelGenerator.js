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
        TYPE["GUST"] = "Gust";
        TYPE["GUSTSPAWNER"] = "GustSpawner";
        TYPE["CAMERABOUNDS"] = "CameraBounds";
    })(TYPE = MyGame.TYPE || (MyGame.TYPE = {}));
    class LevelGenerator {
        static async generateLevel(_filename) {
            // let file: XMLHttpRequest = new XMLHttpRequest();
            // file.open("GET", _filename, false);
            // file.send(null);
            let levelJSON = await window.fetch(_filename)
                .then(_response => _response.json());
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
                    MyGame.level.appendChild(tile);
                    break;
                case TYPE.GUSTSPAWNER:
                    let gustSpawnerJSON = _object;
                    let gustSpawner = new MyGame.GustSpawner(gustSpawnerJSON.parameter.offset, gustSpawnerJSON.parameter.interval, gustSpawnerJSON.parameter.lifespan, gustSpawnerJSON.parameter.speed);
                    gustSpawner.cmpTransform.local.translate(new MyGame.ƒ.Vector3(gustSpawnerJSON.translation.x, gustSpawnerJSON.translation.y, 0));
                    gustSpawner.cmpTransform.local.rotateZ(gustSpawnerJSON.parameter.rotation);
                    MyGame.level.appendChild(gustSpawner);
                    break;
                case TYPE.CAMERABOUNDS:
                    let cameraBoundsJSON = _object;
                    MyGame.cameraXBounds = [];
                    MyGame.cameraYBounds = [];
                    MyGame.cameraXBounds[0] = cameraBoundsJSON.leftBound;
                    MyGame.cameraXBounds[1] = cameraBoundsJSON.rightBound;
                    MyGame.cameraYBounds[0] = cameraBoundsJSON.lowerBound;
                    MyGame.cameraYBounds[1] = cameraBoundsJSON.upperBound;
            }
        }
    }
    MyGame.LevelGenerator = LevelGenerator;
})(MyGame || (MyGame = {}));
