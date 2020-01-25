namespace MyGame {
    export import ƒ = FudgeCore;
  
    window.addEventListener("load", test);
  
    interface KeyPressed {
      [code: string]: boolean;
    }
    let keysPressed: KeyPressed = {};
  
    export let game: ƒ.Node;
    export let level: ƒ.Node;
    let hare: Character;
  
  
    function test(): void {
      ƒ.Time.game.setScale(0.5);
      let canvas: HTMLCanvasElement = document.querySelector("canvas");
      let crc2: CanvasRenderingContext2D = canvas.getContext("2d");
      let img: HTMLImageElement = document.querySelector("img");
      let txtHare: ƒ.TextureImage = new ƒ.TextureImage();
      txtHare.image = img;
      Character.generateSprites(txtHare);
  
      ƒ.RenderManager.initialize(true, false);
      game = new ƒ.Node("Game");
      hare = new Character("Hare");
      level = createLevel();
      game.appendChild(level);
      game.appendChild(hare);
  
      let cmpCamera: ƒ.ComponentCamera = new ƒ.ComponentCamera();
      cmpCamera.pivot.translateZ(6);
      cmpCamera.pivot.lookAt(ƒ.Vector3.ZERO());
      cmpCamera.backgroundColor = ƒ.Color.CSS("aliceblue");
      hare.addComponent(cmpCamera);

      let viewport: ƒ.Viewport = new ƒ.Viewport();
      viewport.initialize("Viewport", game, cmpCamera, canvas);
      viewport.draw();
  
      document.addEventListener("keydown", handleKeyboard);
      document.addEventListener("keyup", handleKeyboard);
  
      ƒ.Loop.addEventListener(ƒ.EVENT.LOOP_FRAME, update);
      ƒ.Loop.start(ƒ.LOOP_MODE.TIME_GAME, 60);
  
      function update(_event: ƒ.Eventƒ): void {
        processInput();
  
        viewport.draw();
  
        crc2.strokeRect(-1, -1, canvas.width / 2, canvas.height + 2);
        crc2.strokeRect(-1, canvas.height / 2, canvas.width + 2, canvas.height);
      }
    }
  
    function handleKeyboard(_event: KeyboardEvent): void {
      keysPressed[_event.code] = (_event.type == "keydown");
      if (_event.code == ƒ.KEYBOARD_CODE.SPACE && _event.type == "keydown")
        hare.act(ACTION.JUMPSQUAT);
    }
  
    function processInput(): void {
      if (keysPressed[ƒ.KEYBOARD_CODE.A]) {
        hare.act(ACTION.WALK, DIRECTION.LEFT);
        return;
      }
      if (keysPressed[ƒ.KEYBOARD_CODE.D]) {
        hare.act(ACTION.WALK, DIRECTION.RIGHT);
        return;
      }
  
      hare.act(ACTION.IDLE);
    }
  
    function createLevel(): ƒ.Node {
      let level: ƒ.Node = new ƒ.Node("Level");
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

      return level;
    }
  }