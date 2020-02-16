declare namespace MyGame {
    import ƒ = FudgeCore;
    enum AUDIO {
        START = "Sound/Start.mp3",
        PLAY = "Sound/Play.mp3",
        JUMP = "Sound/Hit.mp3",
        MOVE = "Sound/Move.wav"
    }
    class Audio extends ƒ.Node {
        private static components;
        private static readonly node;
        static start(): void;
        static play(_audio: AUDIO, _on?: boolean): void;
        private static appendAudio;
    }
}
