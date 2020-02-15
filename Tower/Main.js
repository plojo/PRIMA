"use strict";
var MyGame;
(function (MyGame) {
    MyGame.ƒ = FudgeCore;
    window.addEventListener("load", test);
    let keysPressed = {};
    let viewport;
    function test() {
        let canvas = document.querySelector("canvas");
        // let crc2: CanvasRenderingContext2D = canvas.getContext("2d");
        generateSprites();
        MyGame.ƒ.RenderManager.initialize(true, false);
        MyGame.game = new MyGame.ƒ.Node("Game");
        MyGame.player = new MyGame.Character("Hare");
        MyGame.level = new MyGame.ƒ.Node("Level");
        MyGame.staticObjects = new MyGame.ƒ.Node("StaticObjects");
        MyGame.dynamicObjects = new MyGame.ƒ.Node("DynamicObjects");
        MyGame.game.appendChild(MyGame.player);
        MyGame.game.appendChild(MyGame.level);
        MyGame.level.appendChild(MyGame.staticObjects);
        MyGame.level.appendChild(MyGame.dynamicObjects);
        // for (let sprite of Font.sprites) {
        //   let nodeSprite: NodeSprite = new NodeSprite(sprite.name, sprite);
        //   // nodeSprite.showFrame(1);
        //   // nodeSprite.activate(false);
        //   game.appendChild(nodeSprite);
        // }
        MyGame.LevelGenerator.generateLevel("level.json");
        // ƒ.Time.game.setScale(0.2);
        let cmpCamera = new MyGame.ƒ.ComponentCamera();
        cmpCamera.pivot.translateZ(14);
        cmpCamera.pivot.lookAt(MyGame.ƒ.Vector3.ZERO());
        cmpCamera.backgroundColor = MyGame.ƒ.Color.CSS("aliceblue");
        viewport = new MyGame.ƒ.Viewport();
        viewport.initialize("Viewport", MyGame.game, cmpCamera, canvas);
        viewport.draw();
        document.addEventListener("keydown", handleKeyboard);
        document.addEventListener("keyup", handleKeyboard);
        MyGame.ƒ.RenderManager.update();
        MyGame.game.broadcastEvent(new CustomEvent("registerHitBox"));
        // console.log(Block.hit[new ƒ.Vector3(0,0,0).toString()]);
        MyGame.ƒ.Loop.addEventListener("loopFrame" /* LOOP_FRAME */, update);
        MyGame.ƒ.Loop.start(MyGame.ƒ.LOOP_MODE.TIME_GAME, 60);
        // start();
        function update(_event) {
            processInput();
            let translation = cmpCamera.pivot.translation;
            translation.x = MyGame.player.mtxWorld.translation.x;
            translation.y = MyGame.player.mtxWorld.translation.y;
            cmpCamera.pivot.translation = translation;
            viewport.draw();
            // crc2.strokeRect(-1, -1, canvas.width / 2, canvas.height + 2);
            // crc2.strokeRect(-1, canvas.height / 2, canvas.width + 2, canvas.height);
        }
    }
    function generateSprites() {
        MyGame.Character.generateSprites(getTexture("player"));
        MyGame.Font.generateSprites(getTexture("font"));
        MyGame.Gust.generateSprites(getTexture("assets"));
        MyGame.Tile.generateSprites(getTexture("assets"));
        // console.log("a " + Actor.sprites + " | c " + Character.sprites + " | g " + Gust.sprites);
        function getTexture(_elementId) {
            let img = document.getElementById(_elementId);
            let txtPlayer = new MyGame.ƒ.TextureImage();
            txtPlayer.image = img;
            return txtPlayer;
        }
    }
    function handleKeyboard(_event) {
        keysPressed[_event.code] = (_event.type == "keydown");
        if (_event.code == MyGame.ƒ.KEYBOARD_CODE.ESC && _event.type == "keydown") {
            MyGame.ƒ.Time.game.setScale(MyGame.ƒ.Time.game.getScale() == 1 ? 0 : 1);
        }
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
    // function hndKeyDown(_event: KeyboardEvent): void {
    //   if (_event.code == ƒ.KEYBOARD_CODE.SPACE) {
    //     updateView();
    //   }
    // }
    // function updateView(): void {
    //   viewport.draw();
    // }
    // async function start(): Promise<void> {
    //   ƒ.Debug.log("Wait for space");
    //   await waitForKeyPress(ƒ.KEYBOARD_CODE.SPACE);
    //   ƒ.Debug.log("Space pressed");
    //   let domMenu: HTMLElement = document.querySelector("div#Menu");
    //   domMenu.style.visibility = "hidden";
    //   window.addEventListener("keydown", hndKeyDown);
    // }
    // async function waitForKeyPress(_code: ƒ.KEYBOARD_CODE): Promise<void> {
    //   return new Promise(_resolve => {
    //     window.addEventListener("keydown", hndKeyDown);
    //     function hndKeyDown(_event: KeyboardEvent): void {
    //       if (_event.code == _code) {
    //         window.removeEventListener("keydown", hndKeyDown);
    //         _resolve();
    //       }
    //     }
    //   });
    // }
})(MyGame || (MyGame = {}));
