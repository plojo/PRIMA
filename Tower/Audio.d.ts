declare namespace MyGame {
    import ƒ = FudgeCore;
    enum AUDIO {
        JUMP = "sounds/Jump.wav",
        MOVE = "sounds/Move.mp3"
    }
    class Audio extends ƒ.Node {
        private static components;
        private static readonly node;
        static start(): void;
        static play(_audio: AUDIO, _on?: boolean): void;
        private static appendAudio;
    }
}
