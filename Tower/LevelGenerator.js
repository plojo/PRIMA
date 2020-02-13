"use strict";
var MyGame;
(function (MyGame) {
    //    import ƒ = FudgeCore;
    class LevelGenerator {
        static interpretJSON(level, objects) {
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
        static generateObject(level, objects, type, scale, translation) {
            switch (type) {
                case 1:
                    let floor = new MyGame.Tile("green");
                    floor.cmpTransform.local.scaleX(scale[0]);
                    floor.cmpTransform.local.scaleY(scale[1]);
                    floor.cmpTransform.local.translateX(translation[0]);
                    floor.cmpTransform.local.translateY(translation[1]);
                    level.appendChild(floor);
                    break;
                case 2:
                    let gustSpawner = new MyGame.GustSpawner("Gust", scale[0], scale[1], scale[2], scale[3], scale[4]);
                    gustSpawner.cmpTransform.local.translateX(translation[0]);
                    gustSpawner.cmpTransform.local.translateY(translation[1]);
                    objects.appendChild(gustSpawner);
                    break;
                case 3:
                    let object = new MyGame.Tile("green");
                    object.cmpTransform.local.scaleX(scale[0]);
                    object.cmpTransform.local.scaleY(scale[1]);
                    object.cmpTransform.local.translateX(translation[0]);
                    object.cmpTransform.local.translateY(translation[1]);
                    level.appendChild(object);
                    break;
            }
        }
    }
    MyGame.LevelGenerator = LevelGenerator;
})(MyGame || (MyGame = {}));
