namespace MyGame {
    import ƒ = FudgeCore;
  
    export enum AUDIO {
      // START = "sounds/Start.mp3",
      // PLAY = "sounds/Play.mp3",
      JUMP = "sounds/Jump.wav",
      MOVE = "sounds/Move.mp3"
    }

    export class Audio extends ƒ.Node {
      private static components: Map<AUDIO, ƒ.ComponentAudio> = new Map();
      private static readonly node: Audio = new Audio("Audio");
      
      public static start(): void {
        Audio.appendAudio();
        game.appendChild(Audio.node);
        ƒ.AudioManager.default.listenTo(Audio.node);
      }
  
      public static play(_audio: AUDIO, _on: boolean = true): void {
        ƒ.Debug.log(_audio);
        Audio.components.get(_audio).play(_on);
      }

  
      private static async appendAudio(): Promise<void> {
        // Audio.components.set(AUDIO.START, new ƒ.ComponentAudio(await ƒ.Audio.load(AUDIO.START), true, true));
        // Audio.components.set(AUDIO.PLAY, new ƒ.ComponentAudio(await ƒ.Audio.load(AUDIO.PLAY), true, false));
        Audio.components.set(AUDIO.JUMP, new ƒ.ComponentAudio(await ƒ.Audio.load(AUDIO.JUMP), false, false));
        Audio.components.set(AUDIO.MOVE, new ƒ.ComponentAudio(await ƒ.Audio.load(AUDIO.MOVE), false, false));  
        Audio.components.forEach(element => Audio.node.addComponent(element));
      }
    }
  }