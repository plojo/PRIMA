namespace MyGame {

    export enum TYPE {
        TILE = "Tile",
        PLATFORM = "Platform",
        FLOOR = "Floor",
        CEILING = "Ceiling",
        WALL = "Wall",
        GUST = "Gust",
        GUSTSPAWNER = "GustSpawner",
        CAMERABOUNDS = "CameraBounds"
    }

    interface TranslationJSON {
        x: number;
        y: number;
    }

    interface ParameterJSON {
        offset: number;
        interval: number;
        rotation: number;
        lifespan: number;
        speed: number;
    }

    interface GenericJSON {
        type: string;
        translation: TranslationJSON;
    }

    interface GustSpawnerJSON extends GenericJSON {
        parameter: ParameterJSON;
    }

    interface CameraBoundsJSON extends GenericJSON {
        leftBound: number;
        rightBound: number;
        lowerBound: number;
        upperBound: number;
    }

    interface LevelJSON {
        objects: GenericJSON[];
    }

    export class LevelGenerator {
        public static generateLevel(_filename: string): void {
            let file: XMLHttpRequest = new XMLHttpRequest();
            file.open("GET", _filename, false);
            file.send(null);
            let levelJSON: LevelJSON = JSON.parse(file.responseText);
            for (let object of levelJSON.objects) {
                this.generateObject(object);
            }
        }

        private static generateObject(_object: GenericJSON): void {
            switch (_object.type) {
                case TYPE.PLATFORM:
                case TYPE.FLOOR:
                case TYPE.WALL:
                    let tileJSON: GenericJSON = _object;
                    let tile: Tile = new Tile(_object.type);
                    tile.cmpTransform.local.translate(new ƒ.Vector3(tileJSON.translation.x, tileJSON.translation.y, 0));
                    level.appendChild(tile);
                    break;
                case TYPE.GUSTSPAWNER:
                    let gustSpawnerJSON: GustSpawnerJSON = <GustSpawnerJSON>_object;
                    let gustSpawner: GustSpawner = new GustSpawner(gustSpawnerJSON.parameter.offset, gustSpawnerJSON.parameter.interval, gustSpawnerJSON.parameter.lifespan, gustSpawnerJSON.parameter.speed);
                    gustSpawner.cmpTransform.local.translate(new ƒ.Vector3(gustSpawnerJSON.translation.x, gustSpawnerJSON.translation.y, 0));
                    gustSpawner.cmpTransform.local.rotateZ(gustSpawnerJSON.parameter.rotation);
                    level.appendChild(gustSpawner);
                    break;
                case TYPE.CAMERABOUNDS:
                    let cameraBoundsJSON: CameraBoundsJSON = <CameraBoundsJSON>_object;
                    cameraXBounds = [];
                    cameraYBounds = [];
                    cameraXBounds[0] = cameraBoundsJSON.leftBound;
                    cameraXBounds[1] = cameraBoundsJSON.rightBound;
                    cameraYBounds[0] = cameraBoundsJSON.lowerBound;
                    cameraYBounds[1] = cameraBoundsJSON.upperBound;
            }
        }
    }
}