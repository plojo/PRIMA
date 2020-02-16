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

  let viewport: ƒ.Viewport;

  function test(): void {
    let canvas: HTMLCanvasElement = document.querySelector("canvas");
    // let crc2: CanvasRenderingContext2D = canvas.getContext("2d");

    generateSprites();

    ƒ.RenderManager.initialize(true, false);

    game = new ƒ.Node("Game");
    player = new Character("Player");
    player.cmpTransform.local.translate(new ƒ.Vector3(3, 3, 0));
    level = new ƒ.Node("Level");
    staticObjects = new ƒ.Node("StaticObjects");
    dynamicObjects = new ƒ.Node("DynamicObjects");

    game.appendChild(player);
    game.appendChild(level);
    level.appendChild(staticObjects);
    level.appendChild(dynamicObjects);

    // for (let sprite of Font.sprites) {
    //   let nodeSprite: NodeSprite = new NodeSprite(sprite.name, sprite);
    //   // nodeSprite.showFrame(1);
    //   // nodeSprite.activate(false);
    //   game.appendChild(nodeSprite);
    // }
    LevelGenerator.generateLevel("level.json");

    console.log(game);
    Audio.start();

    // ƒ.Time.game.setScale(0.2);
    let cmpCamera: ƒ.ComponentCamera = new ƒ.ComponentCamera();
    cmpCamera.pivot.translateZ(28);
    cmpCamera.pivot.lookAt(ƒ.Vector3.ZERO());
    cmpCamera.backgroundColor = ƒ.Color.CSS("aliceblue");

    viewport = new ƒ.Viewport();
    viewport.initialize("Viewport", game, cmpCamera, canvas);
    viewport.draw();

    document.addEventListener("keydown", handleKeyboard);
    document.addEventListener("keyup", handleKeyboard);

    ƒ.RenderManager.update();
    game.broadcastEvent(new CustomEvent("registerHitBox"));

    // console.log(Block.hit[new ƒ.Vector3(0,0,0).toString()]);

    ƒ.Loop.addEventListener(ƒ.EVENT.LOOP_FRAME, update);
    ƒ.Loop.start(ƒ.LOOP_MODE.TIME_GAME, 60);


    // start();

    function update(_event: ƒ.Eventƒ): void {
      processInput();
      let translation: ƒ.Vector3 = cmpCamera.pivot.translation;
      translation.x = player.mtxWorld.translation.x;
      translation.y = player.mtxWorld.translation.y;
      cmpCamera.pivot.translation = translation;

      viewport.draw();

      // crc2.strokeRect(-1, -1, canvas.width / 2, canvas.height + 2);
      // crc2.strokeRect(-1, canvas.height / 2, canvas.width + 2, canvas.height);
    }
  }

  function generateSprites(): void {
    Character.generateSprites(getTexture("player"));
    Font.generateSprites(getTexture("font"));
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
    keysPressed[_event.code] = (_event.type == "keydown");
    if (_event.code == ƒ.KEYBOARD_CODE.ESC && _event.type == "keydown") {
      ƒ.Time.game.setScale(ƒ.Time.game.getScale() == 1 ? 0 : 1);
    }
  }

  function processInput(): void {
    if (keysPressed[ƒ.KEYBOARD_CODE.SPACE]) {
      player.act(ACTION.JUMP);
      Audio.play(AUDIO.JUMP);
    }
    if (keysPressed[ƒ.KEYBOARD_CODE.A]) {
      player.act(ACTION.WALK, DIRECTION.LEFT);
      Audio.play(AUDIO.MOVE);
      return;
    }
    if (keysPressed[ƒ.KEYBOARD_CODE.D]) {
      player.act(ACTION.WALK, DIRECTION.RIGHT);
      setInterval(function(){
        Audio.play(AUDIO.MOVE);
      }, 3000);
      return;
    }

    player.act(ACTION.IDLE);
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
}