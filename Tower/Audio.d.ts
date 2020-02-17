declare namespace MyGame {
    import ƒ = FudgeCore;
    enum AUDIO {
        JUMP = "sounds/Jump.wav",
        MOVE = "sounds/Move.mp3",
        CURSOR = "sounds/Cursor.wav",
        CONFIRM = "sounds/Confirm.wav",
        MUSIC = "sounds/Music.wav"
    }
    class Audio extends ƒ.Node {
        static on: boolean;
        private static components;
        private static readonly node;
        static start(): void;
        static switch(): void;
        static pause(_on: boolean): void;
        static play(_audio: AUDIO, _on?: boolean, _force?: boolean): void;
        static getAudio(_audio: AUDIO): ƒ.ComponentAudio;
        private static appendAudio;
    }
}
