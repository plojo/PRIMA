namespace MyGame {
  export import ƒ = FudgeCore;

  window.addEventListener("load", test);

  interface KeyPressed {
    [code: string]: boolean;
  }
  let keysPressed: KeyPressed = {};

  export let game: ƒ.Node;
  export let level: ƒ.Node;
  export let objects: ƒ.Node;
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
    level = new ƒ.Node("Level");
    objects = new ƒ.Node("Objects");
    LevelGenerator.interpretJSON(level, objects);
    game.appendChild(level);
    game.appendChild(objects);
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
    game.appendChild(player);

    // game.broadcastEvent(new CustomEvent("registerUpdate"));

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