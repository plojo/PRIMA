declare namespace MyGame {
    import ƒ = FudgeCore;
    enum AUDIO {
        JUMP = "sounds/Jump.wav",
        MOVE = "sounds/Move.mp3",
        CURSOR = "sounds/Cursor.wav",
        MUSIC = "sounds/Music.wav"
    }
    class Audio extends ƒ.Node {
        static on: boolean;
        private static components;
        private static readonly node;
        static start(): void;
        static switch(): void;
        static stop(): void;
        static play(_audio: AUDIO, _on?: boolean): void;
        private static appendAudio;
    }
}
