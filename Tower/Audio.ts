namespace MyGame {
  import ƒ = FudgeCore;

  export enum AUDIO {
    // START = "sounds/Start.mp3",
    // PLAY = "sounds/Play.mp3",
    JUMP = "sounds/Jump.wav",
    MOVE = "sounds/Move.mp3",
    CURSOR = "sounds/Cursor.wav",
    CONFIRM = "sounds/Confirm.wav",
    MUSIC = "sounds/Music.wav"
  }

  // this structure is from https://github.com/JirkaDellOro/Episoma

  export class Audio extends ƒ.Node {
    public static on: boolean = true;
    private static components: Map<AUDIO, ƒ.ComponentAudio> = new Map();
    private static readonly node: Audio = new Audio("Audio");

    public static async start(): Promise<void> {
      await Audio.appendAudio();
      game.appendChild(Audio.node);
      ƒ.AudioManager.default.listenTo(Audio.node);
    }

    public static switch(): void {
      this.on = !this.on;
      for (const audioComponent of this.components.values()) {
        audioComponent.activate(this.on);
      }
    }

    public static pause(_on: boolean): void {
      Audio.components.get(AUDIO.MUSIC).volume = _on ? 0.25 : 0.5;
    }

    public static play(_audio: AUDIO, _on: boolean = true, _force: boolean = false): void {
      if (this.on || _force)
        Audio.getAudio(_audio).play(_on);
    }

    public static getAudio(_audio: AUDIO): ƒ.ComponentAudio {
      return Audio.components.get(_audio);
    }

    // public static switchAudio(_audio: AUDIO): void {
    //   console.log(!Audio.components.get(_audio).isActive);
    //   Audio.components.get(_audio).activate(!Audio.components.get(_audio).isActive);
    // }

    private static async appendAudio(): Promise<void> {
      Audio.components.set(AUDIO.JUMP, new ƒ.ComponentAudio(await ƒ.Audio.load(AUDIO.JUMP), false, false));
      Audio.components.set(AUDIO.MOVE, new ƒ.ComponentAudio(await ƒ.Audio.load(AUDIO.MOVE), false, false));
      Audio.components.set(AUDIO.CURSOR, new ƒ.ComponentAudio(await ƒ.Audio.load(AUDIO.CURSOR), false, false));
      Audio.components.set(AUDIO.CONFIRM, new ƒ.ComponentAudio(await ƒ.Audio.load(AUDIO.CONFIRM), false, false));
      Audio.components.set(AUDIO.MUSIC, new ƒ.ComponentAudio(await ƒ.Audio.load(AUDIO.MUSIC), true, false));

      Audio.components.get(AUDIO.JUMP).volume = 0.5;
      Audio.components.get(AUDIO.MOVE).volume = 0.2;
      Audio.components.get(AUDIO.CURSOR).volume = 2;
      Audio.components.get(AUDIO.CONFIRM).volume = 0.5;
      Audio.components.get(AUDIO.MUSIC).volume = 0.5;

      Audio.components.forEach(element => Audio.node.addComponent(element));
    }
  }
}