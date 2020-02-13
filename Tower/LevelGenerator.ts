namespace MyGame {

    interface TranslationJSON {
        x: number;
        y: number;
    }

    interface ScaleJSON {
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

    interface TileJSON extends GenericJSON {
        scale?: ScaleJSON;
    }

    interface GustSpawnerJSON extends GenericJSON {
        parameter: ParameterJSON;
    }

    interface LevelJSON {
        objects: GenericJSON[];
    }

    export class LevelGenerator {
        public static generateLevel(): void {
            let file: XMLHttpRequest = new XMLHttpRequest();
            file.open("GET", "level.json", false);
            file.send(null);
            let levelJSON: LevelJSON = JSON.parse(file.responseText);
            for (let object of levelJSON.objects) {
                this.generateObject(object);
            }
        }

        private static generateObject(_object: GenericJSON): void {
            switch (_object.type) {
                case "Tile":
                    let tileJSON: TileJSON = <TileJSON>_object;
                    let tile: Tile = new Tile("green");
                    tile.cmpTransform.local.translate(new ƒ.Vector3(tileJSON.translation.x, tileJSON.translation.y, 0));
                    tile.cmpTransform.local.scale(new ƒ.Vector3(tileJSON.scale.x, tileJSON.scale.y, 0));
                    staticObjects.appendChild(tile);
                    break;
                case "GustSpawner":
                    let gustSpawnerJSON: GustSpawnerJSON = <GustSpawnerJSON>_object;
                    let gustSpawner: GustSpawner = new GustSpawner(gustSpawnerJSON.parameter.offset, gustSpawnerJSON.parameter.interval, gustSpawnerJSON.parameter.rotation, gustSpawnerJSON.parameter.lifespan, gustSpawnerJSON.parameter.speed);
                    gustSpawner.cmpTransform.local.translate(new ƒ.Vector3(gustSpawnerJSON.translation.x, gustSpawnerJSON.translation.y, 0));
                    dynamicObjects.appendChild(gustSpawner);
                    break;
            }
        }
    }
}