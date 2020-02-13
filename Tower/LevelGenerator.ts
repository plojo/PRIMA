namespace MyGame {
    //    import ƒ = FudgeCore;

    export class LevelGenerator {
        public interpretJSON(): ƒ.Node {
            let file = new XMLHttpRequest();
            file.open('GET', 'level.json', false);
            file.send(null);
            console.log(JSON.parse(file.responseText));
            let levelString = JSON.parse(file.responseText);
            let level: ƒ.Node = new ƒ.Node("Level");
            for (let obj of Object.values(levelString)) {
                let values = Object.values(obj);
                console.log(obj);
                this.generateObject(level, values[0], Object.values(values[1]), Object.values(values[2]));
            }
            return level;
        }


        public generateObject(level: ƒ.Node, type: any, scale: any, translation: any) {
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
                    let wall: Tile = new Tile("green");
                    wall.cmpTransform.local.scaleX(scale[0]);
                    wall.cmpTransform.local.scaleY(scale[1]);

                    wall.cmpTransform.local.translateX(translation[0]);
                    wall.cmpTransform.local.translateY(translation[1]);

                    level.appendChild(wall);
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
            return level;
        }
    }
}