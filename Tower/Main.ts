namespace MyGame {
  export import ƒ = FudgeCore;

  window.addEventListener("load", test);

  interface KeyPressed {
    [code: string]: boolean;
  }
  let keysPressed: KeyPressed = {};

  export let game: ƒ.Node;
  export let level: ƒ.Node;
  export let dynamicObjects: ƒ.Node;
  export let staticObjects: ƒ.Node;
  export let player: Character;
  export let menu: Menu;
  let gui: ƒ.Node;

  let viewport: ƒ.Viewport;

  function test(): void {
    let canvas: HTMLCanvasElement = document.querySelector("canvas");
    // let crc2: CanvasRenderingContext2D = canvas.getContext("2d");

    generateSprites();

    ƒ.RenderManager.initialize(true, false); // Transparence is weired

    game = new ƒ.Node("Game");
    player = new Character("Player");
    player.cmpTransform.local.translate(new ƒ.Vector3(3, 3, 0));
    level = new ƒ.Node("Level");
    staticObjects = new ƒ.Node("StaticObjects");
    dynamicObjects = new ƒ.Node("DynamicObjects");
    gui = new ƒ.Node("GUI");
    gui.addComponent(new ƒ.ComponentTransform());
    menu = new Menu();
    menu.gameSpeed = 1;

    game.appendChild(player);
    game.appendChild(level);
    game.appendChild(gui);
    gui.appendChild(menu);
    level.appendChild(staticObjects);
    level.appendChild(dynamicObjects);

    LevelGenerator.generateLevel("level.json");

    // console.log(game);
    // Audio.start();

    // let cmpLightAmbient: ƒ.ComponentLight = new ƒ.ComponentLight(new ƒ.LightAmbient(new ƒ.Color(0.25, 0.25, 0.25, 1)));
    // game.addComponent(cmpLightAmbient);

    let cmpCamera: ƒ.ComponentCamera = new ƒ.ComponentCamera();
    cmpCamera.pivot.translateZ(28);
    cmpCamera.pivot.lookAt(ƒ.Vector3.ZERO());
    // cmpCamera.pivot.rotateY(60, true);
    cmpCamera.backgroundColor = ƒ.Color.CSS("aliceblue");
    gui.addComponent(cmpCamera);

    viewport = new ƒ.Viewport();
    viewport.initialize("Viewport", game, cmpCamera, canvas);
    viewport.draw();

    document.addEventListener("keydown", handleKeyboard);
    document.addEventListener("keyup", handleKeyboard);

    ƒ.RenderManager.update();
    game.broadcastEvent(new CustomEvent("registerHitBox"));

    ƒ.Loop.addEventListener(ƒ.EVENT.LOOP_FRAME, update);
    ƒ.Loop.start(ƒ.LOOP_MODE.TIME_GAME, 60);

    function update(_event: ƒ.Eventƒ): void {
      processInput();
      let translation: ƒ.Vector3 = gui.cmpTransform.local.translation;
      translation.x = player.mtxWorld.translation.x;
      translation.y = player.mtxWorld.translation.y;
      gui.cmpTransform.local.translation = translation;

      viewport.draw();

      // crc2.strokeRect(-1, -1, canvas.width / 2, canvas.height + 2);
      // crc2.strokeRect(-1, canvas.height / 2, canvas.width + 2, canvas.height);
    }
  }

  function generateSprites(): void {
    Character.generateSprites(getTexture("player"));
    MenuComponent.generateSprites(getTexture("menu"));
    Gust.generateSprites(getTexture("assets"));
    Tile.generateSprites(getTexture("assets"));

    function getTexture(_elementId: string): ƒ.TextureImage {
      let img: HTMLImageElement = <HTMLImageElement>document.getElementById(_elementId);
      let txtPlayer: ƒ.TextureImage = new ƒ.TextureImage();
      txtPlayer.image = img;
      return txtPlayer;
    }
  }

  function handleKeyboard(_event: KeyboardEvent): void {
    let running: boolean = ƒ.Time.game.getScale() != 0;

    if (_event.code == ƒ.KEYBOARD_CODE.ESC && _event.type == "keydown") {
      ƒ.Time.game.setScale(running ? 0 : menu.gameSpeed);
      menu.activate(running);
      viewport.draw();
    }
    if (running)
      keysPressed[_event.code] = (_event.type == "keydown");
    else {
      if (_event.code == ƒ.KEYBOARD_CODE.W && _event.type == "keydown") {
        menu.navigate(1);
      }
      if (_event.code == ƒ.KEYBOARD_CODE.S && _event.type == "keydown") {
        menu.navigate(-1);
      }
      if (_event.code == ƒ.KEYBOARD_CODE.SPACE && _event.type == "keydown") {
        menu.triggerAction();
      }
      viewport.draw();
    }
  }

  function processInput(): void {
    if (keysPressed[ƒ.KEYBOARD_CODE.SPACE]) {
      player.act(ACTION.JUMP);
      // Audio.play(AUDIO.JUMP);
    }
    if (keysPressed[ƒ.KEYBOARD_CODE.A]) {
      player.act(ACTION.WALK, DIRECTION.LEFT);
      // Audio.play(AUDIO.MOVE);
      return;
    }
    if (keysPressed[ƒ.KEYBOARD_CODE.D]) {
      player.act(ACTION.WALK, DIRECTION.RIGHT);
      // setInterval(function () {
      //   Audio.play(AUDIO.MOVE);
      // }, 3000);
      return;
    }

    player.act(ACTION.IDLE);
  }
}