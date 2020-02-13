namespace MyGame {
    //    import ƒ = FudgeCore;

    export class LevelGenerator {
        public static interpretJSON(level: ƒ.Node, objects: ƒ.Node): void {
            let file = new XMLHttpRequest();
            file.open('GET', 'level.json', false);
            file.send(null);
            console.log(JSON.parse(file.responseText));
            let levelString = JSON.parse(file.responseText);
            for (let obj of Object.values(levelString)) {
                let values = Object.values(obj);
                console.log(obj);
                this.generateObject(level, objects, values[0], Object.values(values[1]), Object.values(values[2]));
            }
        }


        private static generateObject(level: ƒ.Node, objects: ƒ.Node, type: any, scale: any, translation: any): void{
            switch (type) {
                case 1:
                    let floor: Tile = new Tile("green");
                    floor.cmpTransform.local.scaleX(scale[0]);
                    floor.cmpTransform.local.scaleY(scale[1]);

                    floor.cmpTransform.local.translateX(translation[0]);
                    floor.cmpTransform.local.translateY(translation[1]);

                    level.appendChild(floor);
                    break;
                case 2:
                    let gustSpawner: GustSpawner = new GustSpawner("Gust", scale[0], scale[1], scale[2], scale[3], scale[4]);

                    gustSpawner.cmpTransform.local.translateX(translation[0]);
                    gustSpawner.cmpTransform.local.translateY(translation[1]);

                    objects.appendChild(gustSpawner);
                    break;
                case 3:
                    let object: Tile = new Tile("green");
                    object.cmpTransform.local.scaleX(scale[0]);
                    object.cmpTransform.local.scaleY(scale[1]);

                    object.cmpTransform.local.translateX(translation[0]);
                    object.cmpTransform.local.translateY(translation[1]);

                    level.appendChild(object);
                    break;

            }
        }
    }
}