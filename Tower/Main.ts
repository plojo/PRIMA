namespace MyGame {
  export import ƒ = FudgeCore;

  window.addEventListener("load", test);

  interface KeyPressed {
    [code: string]: boolean;
  }
  let keysPressed: KeyPressed = {};

  export let game: ƒ.Node;
  export let level: ƒ.Node;
  export let player: Character;
  export let menu: Menu;
  let background: ƒ.Node = new ƒ.Node("Background");

  // this should be an own class but i'm running out of time
  let gui: ƒ.Node;
  // bounds will be overriden in levelgenerator
  export let cameraXBounds: number[] = [0, 1000];
  export let cameraYBounds: number[] = [0, 1000];

  let viewport: ƒ.Viewport;

  function test(): void {
    let canvas: HTMLCanvasElement = document.querySelector("canvas");
    ƒ.RenderManager.initialize(false, false); // Transparence is weired
    generateSprites();

    let backgrounds: NodeListOf<HTMLImageElement> = document.querySelectorAll(
      "img"
    );

    let distance: number = 30;

    for (let i: number = 0; i < backgrounds.length; i++) {
      let txt: ƒ.TextureImage = new ƒ.TextureImage();
      let backgroundImg: HTMLImageElement = backgrounds[i];
      if (backgroundImg.id == "background") {
        txt.image = backgroundImg;
        let bg: Background = new Background(txt, distance);
        bg.cmpTransform.local.scaleY(9 * 6);
        bg.cmpTransform.local.scaleX(16 * 6);
        background.appendChild(bg);
        distance = distance - 3;
      }
    }

    game = new ƒ.Node("Game");
    game.appendChild(background);
    player = new Character("Player");
    player.cmpTransform.local.translate(new ƒ.Vector3(14, 1, 0));
    level = new ƒ.Node("Level");
    gui = new ƒ.Node("GUI");
    gui.addComponent(new ƒ.ComponentTransform());
    menu = new Menu();
    menu.gameSpeed = 1;

    game.appendChild(player);
    game.appendChild(level);
    game.appendChild(gui);
    gui.appendChild(menu);

    LevelGenerator.generateLevel("level.json");
    
    // adjust cameraBounds to account for screensize
    cameraXBounds[0] = cameraXBounds[0] + 15.45;
    cameraXBounds[1] = cameraXBounds[1] - 15.45;
    cameraYBounds[0] = cameraYBounds[0] + 8.65;
    cameraYBounds[1] = cameraYBounds[1] - 8.65;

    // console.log(game);
    Audio.start();

    let cmpCamera: ƒ.ComponentCamera = new ƒ.ComponentCamera();
    cmpCamera.pivot.translateZ(28);
    cmpCamera.pivot.lookAt(ƒ.Vector3.ZERO());
    cmpCamera.backgroundColor = ƒ.Color.CSS("aliceblue");
    gui.addComponent(cmpCamera);

    viewport = new ƒ.Viewport();
    viewport.initialize("Viewport", game, cmpCamera, canvas);
    viewport.draw();

    document.addEventListener("keydown", handleKeyboard);
    document.addEventListener("keyup", handleKeyboard);

    gui.cmpTransform.local.translate(new ƒ.Vector3(cameraXBounds[0], cameraYBounds[0]));
    ƒ.RenderManager.update();
    game.broadcastEvent(new CustomEvent("registerUpdate"));

    ƒ.Time.game.setScale(0);
    ƒ.Loop.addEventListener(ƒ.EVENT.LOOP_FRAME, update);
    ƒ.Loop.start(ƒ.LOOP_MODE.TIME_GAME, 60);

    function update(_event: ƒ.Eventƒ): void {
      processInput();
      let translation: ƒ.Vector3 = gui.cmpTransform.local.translation;
      let playerTranslation: ƒ.Vector3 = player.mtxWorld.translation;
      // console.log(playerTranslation.toString());
      if (playerTranslation.x > cameraXBounds[0] && playerTranslation.x < cameraXBounds[1])
        translation.x = playerTranslation.x;
      if (playerTranslation.y > cameraYBounds[0] && playerTranslation.y < cameraYBounds[1])
        translation.y = playerTranslation.y;
      gui.cmpTransform.local.translation = translation;

      viewport.draw();
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
      menu.show(running);
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
    }
    if (keysPressed[ƒ.KEYBOARD_CODE.A]) {
      player.act(ACTION.WALK, DIRECTION.LEFT);
      return;
    }
    if (keysPressed[ƒ.KEYBOARD_CODE.D]) {
      player.act(ACTION.WALK, DIRECTION.RIGHT);
      return;
    }

    player.act(ACTION.IDLE);
  }
}