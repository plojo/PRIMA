"use strict";
var MyGame;
(function (MyGame) {
    MyGame.ƒ = FudgeCore;
    window.addEventListener("load", start);
    let keysPressed = {};
    let background = new MyGame.ƒ.Node("Background");
    // this should be an own class but i'm running out of time
    let gui;
    // bounds will be overriden in levelgenerator
    MyGame.cameraXBounds = [0, 1000];
    MyGame.cameraYBounds = [0, 1000];
    let viewport;
    function start() {
        let canvas = document.querySelector("canvas");
        MyGame.ƒ.RenderManager.initialize(false, false); // Transparence is weired
        generateSprites();
        let backgrounds = document.querySelectorAll("img");
        let distance = 30;
        for (let i = 0; i < backgrounds.length; i++) {
            let txt = new MyGame.ƒ.TextureImage();
            let backgroundImg = backgrounds[i];
            if (backgroundImg.id == "background") {
                txt.image = backgroundImg;
                let bg = new MyGame.Background(txt, distance);
                bg.cmpTransform.local.scaleY(9 * 6);
                bg.cmpTransform.local.scaleX(16 * 6);
                background.appendChild(bg);
                distance = distance - 3;
            }
        }
        MyGame.game = new MyGame.ƒ.Node("Game");
        MyGame.player = new MyGame.Character("Player");
        MyGame.player.cmpTransform.local.translate(new MyGame.ƒ.Vector3(14, 1, 0));
        MyGame.level = new MyGame.ƒ.Node("Level");
        gui = new MyGame.ƒ.Node("GUI");
        gui.addComponent(new MyGame.ƒ.ComponentTransform());
        MyGame.menu = new MyGame.Menu();
        MyGame.menu.gameSpeed = 1;
        MyGame.game.appendChild(MyGame.player);
        MyGame.game.appendChild(MyGame.level);
        MyGame.game.appendChild(gui);
        MyGame.level.appendChild(background);
        gui.appendChild(MyGame.menu);
        MyGame.LevelGenerator.generateLevel("level.json");
        // adjust cameraBounds to account for screensize
        MyGame.cameraXBounds[0] = MyGame.cameraXBounds[0] + 15.45;
        MyGame.cameraXBounds[1] = MyGame.cameraXBounds[1] - 15.45;
        MyGame.cameraYBounds[0] = MyGame.cameraYBounds[0] + 8.65;
        MyGame.cameraYBounds[1] = MyGame.cameraYBounds[1] - 8.65;
        // console.log(game);
        MyGame.Audio.start();
        let cmpCamera = new MyGame.ƒ.ComponentCamera();
        cmpCamera.pivot.translateZ(28);
        cmpCamera.pivot.lookAt(MyGame.ƒ.Vector3.ZERO());
        cmpCamera.backgroundColor = MyGame.ƒ.Color.CSS("aliceblue");
        gui.addComponent(cmpCamera);
        viewport = new MyGame.ƒ.Viewport();
        viewport.initialize("Viewport", MyGame.game, cmpCamera, canvas);
        viewport.draw();
        document.addEventListener("keydown", handleKeyboard);
        document.addEventListener("keyup", handleKeyboard);
        gui.cmpTransform.local.translate(new MyGame.ƒ.Vector3(MyGame.cameraXBounds[0] + 0.05, MyGame.cameraYBounds[0] + 0.05));
        // followPlayer();
        MyGame.ƒ.RenderManager.update();
        MyGame.level.broadcastEvent(new CustomEvent("registerHitBox"));
        MyGame.ƒ.Time.game.setScale(0);
        MyGame.ƒ.Loop.addEventListener("loopFrame" /* LOOP_FRAME */, update);
        MyGame.ƒ.Loop.start(MyGame.ƒ.LOOP_MODE.TIME_GAME, 60);
        function update(_event) {
            followPlayer();
            processInput();
            viewport.draw();
        }
    }
    function generateSprites() {
        MyGame.Character.generateSprites(getTexture("player"));
        MyGame.MenuComponent.generateSprites(getTexture("menu"));
        MyGame.Gust.generateSprites(getTexture("gust"));
        MyGame.Tile.generateSprites(getTexture("assets"));
        function getTexture(_elementId) {
            let img = document.getElementById(_elementId);
            let txtPlayer = new MyGame.ƒ.TextureImage();
            txtPlayer.image = img;
            return txtPlayer;
        }
    }
    function handleKeyboard(_event) {
        let running = MyGame.ƒ.Time.game.getScale() != 0;
        if (_event.code == MyGame.ƒ.KEYBOARD_CODE.ESC && _event.type == "keydown") {
            MyGame.ƒ.Time.game.setScale(0);
            MyGame.menu.show(true);
            viewport.draw();
        }
        if (running)
            keysPressed[_event.code] = (_event.type == "keydown");
        else {
            if (_event.code == MyGame.ƒ.KEYBOARD_CODE.W && _event.type == "keydown") {
                MyGame.menu.navigate(1);
            }
            if (_event.code == MyGame.ƒ.KEYBOARD_CODE.S && _event.type == "keydown") {
                MyGame.menu.navigate(-1);
            }
            if (_event.code == MyGame.ƒ.KEYBOARD_CODE.SPACE && _event.type == "keydown") {
                MyGame.menu.triggerAction();
            }
            viewport.draw();
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
    function followPlayer() {
        let translation = gui.cmpTransform.local.translation;
        let playerTranslation = MyGame.player.mtxWorld.translation;
        // console.log(playerTranslation.toString());
        if (playerTranslation.x > MyGame.cameraXBounds[0] && playerTranslation.x < MyGame.cameraXBounds[1])
            translation.x = playerTranslation.x;
        if (playerTranslation.y > MyGame.cameraYBounds[0] && playerTranslation.y < MyGame.cameraYBounds[1])
            translation.y = playerTranslation.y;
        gui.cmpTransform.local.translation = translation;
    }
})(MyGame || (MyGame = {}));
