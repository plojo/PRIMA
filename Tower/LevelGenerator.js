"use strict";
var MyGame;
(function (MyGame) {
    //    import ƒ = FudgeCore;
    class LevelGenerator {
        interpretJSON() {
            let file = new XMLHttpRequest();
            file.open('GET', 'level.json', false);
            file.send(null);
            //           let file = require('fs')
            /*           file.readFile('level.json', 'utf8', function(err, data) {
                           if (err) {
                               return console.error(err);
                           }
                           console.log(JSON.parse(data.toString()));
                       });*/
            console.log(JSON.parse(file.responseText));
            let levelString = JSON.parse(file.responseText);
            let level = new MyGame.ƒ.Node("Level");
            for (let obj of Object.values(levelString)) {
                let values = Object.values(obj);
                console.log(obj);
                this.generateObject(level, values[0], Object.values(values[1]), Object.values(values[2]));
                //                console.log(obj);
            }
            return level;
        }
        generateObject(level, type, scale, translation) {
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
                    let wall = new MyGame.Tile("green");
                    wall.cmpTransform.local.scaleX(scale[0]);
                    wall.cmpTransform.local.scaleY(scale[1]);
                    wall.cmpTransform.local.translateX(translation[0]);
                    wall.cmpTransform.local.translateY(translation[1]);
                    level.appendChild(wall);
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
            return level;
        }
    }
    MyGame.LevelGenerator = LevelGenerator;
})(MyGame || (MyGame = {}));
