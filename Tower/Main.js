"use strict";
var MyGame;
(function (MyGame) {
    MyGame.ƒ = FudgeCore;
    window.addEventListener("load", test);
    let keysPressed = {};
    let viewport;
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
        MyGame.player = new MyGame.Character("Hare");
        MyGame.level = new MyGame.ƒ.Node("Level");
        MyGame.objects = new MyGame.ƒ.Node("Objects");
        MyGame.LevelGenerator.interpretJSON(MyGame.level, MyGame.objects);
        MyGame.game.appendChild(MyGame.level);
        MyGame.game.appendChild(MyGame.objects);
        /*   let gustSpawner: GustSpawner = new GustSpawner("GustSpawner", 3, 1, 270, 3, 3);
           gustSpawner.cmpTransform.local.translateX(-4);
           gustSpawner.cmpTransform.local.translateY(1);
           game.appendChild(gustSpawner);*/
        // let gust: Gust = new Gust("bla", ƒ.Vector3.X(-3));
        // gust.cmpTransform.local.translateX(-2);
        // gust.cmpTransform.local.translateY(-3);
        // gust.cmpTransform.local.rotateZ(-90);
        // gust.cmpTransform.local.scaleX(0.1);
        // game.appendChild(gust); // TODO: split up level into tiles and dynamic objects
        MyGame.game.appendChild(MyGame.player);
        // game.broadcastEvent(new CustomEvent("registerUpdate"));
        let cmpCamera = new MyGame.ƒ.ComponentCamera();
        cmpCamera.pivot.translateZ(10);
        cmpCamera.pivot.lookAt(MyGame.ƒ.Vector3.ZERO());
        cmpCamera.backgroundColor = MyGame.ƒ.Color.CSS("aliceblue");
        // hare.addComponent(cmpCamera);
        viewport = new MyGame.ƒ.Viewport();
        viewport.initialize("Viewport", MyGame.game, cmpCamera, canvas);
        viewport.draw();
        document.addEventListener("keydown", handleKeyboard);
        document.addEventListener("keyup", handleKeyboard);
        MyGame.ƒ.Loop.addEventListener("loopFrame" /* LOOP_FRAME */, update);
        MyGame.ƒ.Loop.start(MyGame.ƒ.LOOP_MODE.TIME_GAME, 60);
        start();
        function update(_event) {
            processInput();
            let translation = cmpCamera.pivot.translation;
            translation.x = MyGame.player.mtxWorld.translation.x;
            translation.y = MyGame.player.mtxWorld.translation.y;
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
            MyGame.player.act(MyGame.ACTION.JUMP);
        }
        if (keysPressed[MyGame.ƒ.KEYBOARD_CODE.A]) {
            MyGame.player.act(MyGame.ACTION.WALK, MyGame.DIRECTION.LEFT);
            return;
        }
        if (keysPressed[MyGame.ƒ.KEYBOARD_CODE.D]) {
            MyGame.player.act(MyGame.ACTION.WALK, MyGame.DIRECTION.RIGHT);
            return;
        }
        MyGame.player.act(MyGame.ACTION.IDLE);
    }
    function hndKeyDown(_event) {
        if (_event.code == MyGame.ƒ.KEYBOARD_CODE.SPACE) {
            updateView();
        }
    }
    function updateView() {
        viewport.draw();
    }
    async function start() {
        MyGame.ƒ.Debug.log("Wait for space");
        await waitForKeyPress(MyGame.ƒ.KEYBOARD_CODE.SPACE);
        MyGame.ƒ.Debug.log("Space pressed");
        let domMenu = document.querySelector("div#Menu");
        domMenu.style.visibility = "hidden";
        window.addEventListener("keydown", hndKeyDown);
    }
    async function waitForKeyPress(_code) {
        return new Promise(_resolve => {
            window.addEventListener("keydown", hndKeyDown);
            function hndKeyDown(_event) {
                if (_event.code == _code) {
                    window.removeEventListener("keydown", hndKeyDown);
                    _resolve();
                }
            }
        });
    }
})(MyGame || (MyGame = {}));
