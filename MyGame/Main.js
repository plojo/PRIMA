"use strict";
var MyGame;
(function (MyGame) {
    MyGame.ƒ = FudgeCore;
    window.addEventListener("load", test);
    let keysPressed = {};
    let hare;
    function test() {
        let canvas = document.querySelector("canvas");
        let crc2 = canvas.getContext("2d");
        let img = document.querySelector("img");
        let txtHare = new MyGame.ƒ.TextureImage();
        txtHare.image = img;
        MyGame.Hare.generateSprites(txtHare);
        MyGame.ƒ.RenderManager.initialize(true, false);
        MyGame.game = new MyGame.ƒ.Node("Game");
        hare = new MyGame.Hare("Hare");
        MyGame.level = createLevel();
        MyGame.game.appendChild(MyGame.level);
        MyGame.game.appendChild(hare);
        let cmpCamera = new MyGame.ƒ.ComponentCamera();
        cmpCamera.pivot.translateZ(5);
        cmpCamera.pivot.lookAt(MyGame.ƒ.Vector3.ZERO());
        cmpCamera.backgroundColor = MyGame.ƒ.Color.CSS("aliceblue");
        let viewport = new MyGame.ƒ.Viewport();
        viewport.initialize("Viewport", MyGame.game, cmpCamera, canvas);
        viewport.draw();
        document.addEventListener("keydown", handleKeyboard);
        document.addEventListener("keyup", handleKeyboard);
        MyGame.ƒ.Loop.addEventListener("loopFrame" /* LOOP_FRAME */, update);
        MyGame.ƒ.Loop.start(MyGame.ƒ.LOOP_MODE.TIME_GAME, 10);
        function update(_event) {
            processInput();
            viewport.draw();
            crc2.strokeRect(-1, -1, canvas.width / 2, canvas.height + 2);
            crc2.strokeRect(-1, canvas.height / 2, canvas.width + 2, canvas.height);
        }
    }
    function handleKeyboard(_event) {
        keysPressed[_event.code] = (_event.type == "keydown");
        if (_event.code == MyGame.ƒ.KEYBOARD_CODE.SPACE && _event.type == "keydown")
            hare.act(MyGame.ACTION.JUMP);
    }
    function processInput() {
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
        let level = new MyGame.ƒ.Node("Level");
        let floor = new MyGame.Floor();
        floor.cmpTransform.local.scaleY(0.2);
        level.appendChild(floor);
        floor = new MyGame.Floor();
        floor.cmpTransform.local.scaleY(0.2);
        floor.cmpTransform.local.scaleX(2);
        floor.cmpTransform.local.translateY(0.2);
        floor.cmpTransform.local.translateX(1.5);
        level.appendChild(floor);
        return level;
    }
})(MyGame || (MyGame = {}));
