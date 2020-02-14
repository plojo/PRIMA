"use strict";
var MyGame;
(function (MyGame) {
    let TYPE;
    (function (TYPE) {
        TYPE["TILE"] = "Tile";
        TYPE["GUSTSPAWNER"] = "GustSpawner";
    })(TYPE || (TYPE = {}));
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
                case TYPE.TILE:
                    let tileJSON = _object;
                    let tile = new MyGame.Tile("green");
                    tile.cmpTransform.local.translate(new MyGame.ƒ.Vector3(tileJSON.translation.x, tileJSON.translation.y, 0));
                    tile.cmpTransform.local.scale(new MyGame.ƒ.Vector3(tileJSON.scale.x, tileJSON.scale.y, 0));
                    MyGame.staticObjects.appendChild(tile);
                    break;
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
