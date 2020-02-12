"use strict";
var MyGame;
(function (MyGame) {
    MyGame.ƒ = FudgeCore;
    window.addEventListener("load", test);
    let keysPressed = {};
    let hare;
    function test() {
        // ƒ.Time.game.setScale(0.5);
        let canvas = document.querySelector("canvas");
        let crc2 = canvas.getContext("2d");
        let img = document.querySelector("img");
        let txtHare = new MyGame.ƒ.TextureImage();
        txtHare.image = img;
        MyGame.Character.generateSprites(txtHare);
        MyGame.ƒ.RenderManager.initialize(true, false);
        MyGame.game = new MyGame.ƒ.Node("Game");
        hare = new MyGame.Character("Hare");
        MyGame.level = createLevel();
        MyGame.game.appendChild(MyGame.level);
        MyGame.game.appendChild(hare);
        let cmpCamera = new MyGame.ƒ.ComponentCamera();
        cmpCamera.pivot.translateZ(10);
        cmpCamera.pivot.lookAt(MyGame.ƒ.Vector3.ZERO());
        cmpCamera.backgroundColor = MyGame.ƒ.Color.CSS("aliceblue");
        // hare.addComponent(cmpCamera);
        let viewport = new MyGame.ƒ.Viewport();
        viewport.initialize("Viewport", MyGame.game, cmpCamera, canvas);
        viewport.draw();
        document.addEventListener("keydown", handleKeyboard);
        document.addEventListener("keyup", handleKeyboard);
        MyGame.ƒ.Loop.addEventListener("loopFrame" /* LOOP_FRAME */, update);
        MyGame.ƒ.Loop.start(MyGame.ƒ.LOOP_MODE.TIME_GAME, 60);
        function update(_event) {
            processInput();
            let translation = cmpCamera.pivot.translation;
            translation.x = hare.mtxWorld.translation.x;
            translation.y = hare.mtxWorld.translation.y;
            cmpCamera.pivot.translation = translation;
            viewport.draw();
            crc2.strokeRect(-1, -1, canvas.width / 2, canvas.height + 2);
            crc2.strokeRect(-1, canvas.height / 2, canvas.width + 2, canvas.height);
        }
    }
    function handleKeyboard(_event) {
        keysPressed[_event.code] = (_event.type == "keydown");
        // if (_event.code == ƒ.KEYBOARD_CODE.SPACE && _event.type == "keydown")
        //   hare.act(ACTION.JUMP);
        // if (_event.code == ƒ.KEYBOARD_CODE.E && _event.type == "keydown")
        //   hare.act(ACTION.DASH);
    }
    function processInput() {
        if (keysPressed[MyGame.ƒ.KEYBOARD_CODE.SPACE]) {
            hare.act(MyGame.ACTION.JUMP);
        }
        if (keysPressed[MyGame.ƒ.KEYBOARD_CODE.A]) {
            hare.act(MyGame.ACTION.WALK, MyGame.DIRECTION.LEFT);
            return;
        }
        if (keysPressed[MyGame.ƒ.KEYBOARD_CODE.D]) {
            hare.act(MyGame.ACTION.WALK, MyGame.DIRECTION.RIGHT);
            return;
        }
        hare.act(MyGame.ACTION.IDLE);
    }
    function createLevel() {
        let lg;
        lg = new MyGame.LevelGenerator();
        return lg.interpretJSON();
        /*   let level: ƒ.Node = new ƒ.Node("Level");
           let floor: Tile = new Tile("red");
           floor.cmpTransform.local.scaleY(0.2);
           floor.cmpTransform.local.scaleX(100);
           level.appendChild(floor);
       
           floor = new Tile("blue");
           floor.cmpTransform.local.scaleY(1);
           floor.cmpTransform.local.scaleX(1);
           floor.cmpTransform.local.translateY(0);
           floor.cmpTransform.local.translateX(3.45);
           level.appendChild(floor);
       
           floor = new Tile("red");
           floor.cmpTransform.local.scaleY(0.2);
           floor.cmpTransform.local.scaleX(1);
           floor.cmpTransform.local.translateY(2);
           floor.cmpTransform.local.translateX(0);
           level.appendChild(floor);
       
           floor = new Tile("blue");
           floor.cmpTransform.local.scaleY(0.2);
           floor.cmpTransform.local.scaleX(1);
           floor.cmpTransform.local.translateY(3);
           floor.cmpTransform.local.translateX(1.45);
           level.appendChild(floor);
       
           floor = new Tile("green");
           floor.cmpTransform.local.scaleY(1);
           floor.cmpTransform.local.scaleX(1);
           floor.cmpTransform.local.translateY(0.09);
           floor.cmpTransform.local.translateX(1.42);
           level.appendChild(floor);
       
           floor = new Tile("green");
           floor.cmpTransform.local.scaleY(1);
           floor.cmpTransform.local.scaleX(1);
           floor.cmpTransform.local.translateY(0.8);
           floor.cmpTransform.local.translateX(-2.5);
           level.appendChild(floor);
       
           return level;*/
    }
})(MyGame || (MyGame = {}));
