namespace MyGame {

    export enum TYPE {
        TILE = "Tile",
        PLATFORM = "Platform",
        FLOOR = "Floor",
        CEILING = "Ceiling",
        WALLLEFT = "WallLeft",
        WALLRIGHT = "WallRight",
        GUST = "Gust",
        GUSTSPAWNER = "GustSpawner"
    }

    interface TranslationJSON {
        x: number;
        y: number;
    }

    // interface ScaleJSON {
    //     x: number;
    //     y: number;
    // }

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

    interface TileJSON extends GenericJSON {
        length: number;
        cornerBlocks?: boolean;
    }

    interface GustSpawnerJSON extends GenericJSON {
        parameter: ParameterJSON;
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
            let translation: ƒ.Vector3 = new ƒ.Vector3(_object.translation.x * 0.5, _object.translation.y * 0.5, 0);
            switch (_object.type) {
                case TYPE.PLATFORM:
                case TYPE.FLOOR:
                case TYPE.CEILING: {
                    let tileJSON: TileJSON = <TileJSON>_object;
                    let tile: Tile = new Tile(_object.type, tileJSON.length, ORIENTATION.RIGHT, tileJSON.cornerBlocks);
                    tile.cmpTransform.local.translate(translation);
                    staticObjects.appendChild(tile);
                    break;
                }
                case TYPE.WALLLEFT:
                case TYPE.WALLRIGHT: {
                    let tileJSON: TileJSON = <TileJSON>_object;
                    let tile: Tile = new Tile(_object.type, tileJSON.length, ORIENTATION.UP, tileJSON.cornerBlocks ? tileJSON.cornerBlocks : false);
                    tile.cmpTransform.local.translate(translation);
                    staticObjects.appendChild(tile);
                    break;
                }
                case TYPE.GUSTSPAWNER:
                    let gustSpawnerJSON: GustSpawnerJSON = <GustSpawnerJSON>_object;
                    let gustSpawner: GustSpawner = new GustSpawner(gustSpawnerJSON.parameter.offset, gustSpawnerJSON.parameter.interval, gustSpawnerJSON.parameter.lifespan, gustSpawnerJSON.parameter.speed);
                    gustSpawner.cmpTransform.local.translate(new ƒ.Vector3(gustSpawnerJSON.translation.x, gustSpawnerJSON.translation.y, 0));
                    gustSpawner.cmpTransform.local.rotateZ(gustSpawnerJSON.parameter.rotation);
                    dynamicObjects.appendChild(gustSpawner);
                    break;
            }
        }
    }
}