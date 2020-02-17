namespace MyGame {
  import ƒ = FudgeCore;

  export enum AUDIO {
    // START = "sounds/Start.mp3",
    // PLAY = "sounds/Play.mp3",
    JUMP = "sounds/Jump.wav",
    MOVE = "sounds/Move.mp3",
    CURSOR = "sounds/Cursor.wav",
    MUSIC = "sounds/Music.wav"
  }

  // this structure is from https://github.com/JirkaDellOro/Episoma

  export class Audio extends ƒ.Node {
    public static on: boolean = true;
    private static components: Map<AUDIO, ƒ.ComponentAudio> = new Map();
    private static readonly node: Audio = new Audio("Audio");

    public static start(): void {
      Audio.appendAudio();
      game.appendChild(Audio.node);
      ƒ.AudioManager.default.listenTo(Audio.node);
    }

    public static switch(): void {
      this.on = !this.on;
      for (const audioComponent of this.components.values()) {
        audioComponent.activate(this.on);
      }
    }

    public static stop(): void {
      for (const child of this.components.values()) {
        child.play(false);
      }
    }

    public static play(_audio: AUDIO, _on: boolean = true): void {
      ƒ.Debug.log(_audio);
      if (this.on)
        Audio.components.get(_audio).play(_on);
    }


    private static async appendAudio(): Promise<void> {
      // Audio.components.set(AUDIO.START, new ƒ.ComponentAudio(await ƒ.Audio.load(AUDIO.START), true, true));
      // Audio.components.set(AUDIO.PLAY, new ƒ.ComponentAudio(await ƒ.Audio.load(AUDIO.PLAY), true, false));
      Audio.components.set(AUDIO.JUMP, new ƒ.ComponentAudio(await ƒ.Audio.load(AUDIO.JUMP), false, false));
      Audio.components.set(AUDIO.MOVE, new ƒ.ComponentAudio(await ƒ.Audio.load(AUDIO.MOVE), false, false));
      Audio.components.set(AUDIO.CURSOR, new ƒ.ComponentAudio(await ƒ.Audio.load(AUDIO.CURSOR), false, false));
      Audio.components.set(AUDIO.MUSIC, new ƒ.ComponentAudio(await ƒ.Audio.load(AUDIO.MUSIC), true, false));

      Audio.components.get(AUDIO.JUMP).volume = 0.5;
      Audio.components.get(AUDIO.MOVE).volume = 0.2;
      Audio.components.get(AUDIO.CURSOR).volume = 3;
      Audio.components.get(AUDIO.MUSIC).volume = 0.5;

      Audio.components.forEach(element => Audio.node.addComponent(element));
    }
  }
}