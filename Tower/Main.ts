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
  
  let viewport: ƒ.Viewport;

  


  function test(): void {
    // ƒ.Time.game.setScale(0.5);
    let canvas: HTMLCanvasElement = document.querySelector("canvas");
    let crc2: CanvasRenderingContext2D = canvas.getContext("2d");
    let img: HTMLImageElement = document.querySelector("img");
    let txtHare: ƒ.TextureImage = new ƒ.TextureImage();
    txtHare.image = img;
    Character.generateSprites(txtHare);

    ƒ.RenderManager.initialize(true, false);
    game = new ƒ.Node("Game");
    player = new Character("Hare");
    level = createLevel();
    let gust: Gust = new Gust("bla", ƒ.Vector3.X(-4));
    gust.cmpTransform.local.translateX(5);
    gust.cmpTransform.local.translateY(1);
    level.appendChild(gust);

    game.appendChild(level);
    game.appendChild(player);

    let cmpCamera: ƒ.ComponentCamera = new ƒ.ComponentCamera();
    cmpCamera.pivot.translateZ(10);
    cmpCamera.pivot.lookAt(ƒ.Vector3.ZERO());
    cmpCamera.backgroundColor = ƒ.Color.CSS("aliceblue");
    // hare.addComponent(cmpCamera);

    viewport = new ƒ.Viewport();
    viewport.initialize("Viewport", game, cmpCamera, canvas);
    viewport.draw();

    document.addEventListener("keydown", handleKeyboard);
    document.addEventListener("keyup", handleKeyboard);

    ƒ.Loop.addEventListener(ƒ.EVENT.LOOP_FRAME, update);
    ƒ.Loop.start(ƒ.LOOP_MODE.TIME_GAME, 60);

    start();

    function update(_event: ƒ.Eventƒ): void {
      processInput();
      let translation: ƒ.Vector3 = cmpCamera.pivot.translation;
      translation.x = player.mtxWorld.translation.x;
      translation.y = player.mtxWorld.translation.y;
      cmpCamera.pivot.translation = translation;

      viewport.draw();

      crc2.strokeRect(-1, -1, canvas.width / 2, canvas.height + 2);
      crc2.strokeRect(-1, canvas.height / 2, canvas.width + 2, canvas.height);
    }
  }

  function handleKeyboard(_event: KeyboardEvent): void {
    keysPressed[_event.code] = (_event.type == "keydown");
    // if (_event.code == ƒ.KEYBOARD_CODE.SPACE && _event.type == "keydown")
    //   hare.act(ACTION.JUMP);
    // if (_event.code == ƒ.KEYBOARD_CODE.E && _event.type == "keydown")
    //   hare.act(ACTION.DASH);
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

  function createLevel(): ƒ.Node {
    let lg: LevelGenerator;
    lg = new LevelGenerator();
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

  function hndKeyDown(_event: KeyboardEvent): void {
    if (_event.code == ƒ.KEYBOARD_CODE.SPACE) {
      updateView();
    }
  }

  function updateView(): void{
    viewport.draw();
  }

  async function start(): Promise<void> {
    ƒ.Debug.log("Wait for space");
    await waitForKeyPress(ƒ.KEYBOARD_CODE.SPACE);
    ƒ.Debug.log("Space pressed");
    let domMenu: HTMLElement = document.querySelector("div#Menu");
    domMenu.style.visibility = "hidden";
    window.addEventListener("keydown", hndKeyDown);
  }
  async function waitForKeyPress(_code: ƒ.KEYBOARD_CODE): Promise<void> {
    return new Promise(_resolve => {
      window.addEventListener("keydown", hndKeyDown);
      function hndKeyDown(_event: KeyboardEvent): void {
        if (_event.code == _code) {
          window.removeEventListener("keydown", hndKeyDown);
          _resolve();
        }
      }
    });
  }
}