namespace MyGame {
    import ƒ = FudgeCore;
  
    export enum AUDIO {
      START = "Sound/Start.mp3",
      PLAY = "Sound/Play.mp3",
      JUMP = "Sound/Hit.mp3",
      MOVE = "Sound/Move.wav"
    }

    export class Audio extends ƒ.Node {
      private static components: Map<AUDIO, ƒ.ComponentAudio> = new Map();
      private static readonly node: Audio = new Audio("Audio");
      
      public static start(_game: ƒ.Node): void {
        Audio.appendAudio();
        _game.appendChild(Audio.node);
        ƒ.AudioManager.default.listenTo(Audio.node);
      }
  
      public static play(_audio: AUDIO, _on: boolean = true): void {
        ƒ.Debug.log(_audio);
        Audio.components.get(_audio).play(_on);
      }

  
      private static async appendAudio(): Promise<void> {
        Audio.components.set(AUDIO.START, new ƒ.ComponentAudio(await ƒ.Audio.load(AUDIO.START), true, true));
        Audio.components.set(AUDIO.PLAY, new ƒ.ComponentAudio(await ƒ.Audio.load(AUDIO.PLAY), true, false));
        Audio.components.set(AUDIO.JUMP, new ƒ.ComponentAudio(await ƒ.Audio.load(AUDIO.JUMP), false, false));
        Audio.components.set(AUDIO.MOVE, new ƒ.ComponentAudio(await ƒ.Audio.load(AUDIO.MOVE), false, false));  
        Audio.components.forEach(element => Audio.node.addComponent(element));
      }
    }
  }