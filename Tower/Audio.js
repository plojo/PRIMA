"use strict";
var MyGame;
(function (MyGame) {
    var ƒ = FudgeCore;
    let AUDIO;
    (function (AUDIO) {
        // START = "sounds/Start.mp3",
        // PLAY = "sounds/Play.mp3",
        AUDIO["JUMP"] = "sounds/Jump.wav";
        AUDIO["MOVE"] = "sounds/Move.mp3";
        AUDIO["CURSOR"] = "sounds/Cursor.wav";
        AUDIO["MUSIC"] = "sounds/Music.wav";
    })(AUDIO = MyGame.AUDIO || (MyGame.AUDIO = {}));
    // this structure is from https://github.com/JirkaDellOro/Episoma
    class Audio extends ƒ.Node {
        static start() {
            Audio.appendAudio();
            MyGame.game.appendChild(Audio.node);
            ƒ.AudioManager.default.listenTo(Audio.node);
        }
        static switch() {
            this.on = !this.on;
            for (const audioComponent of this.components.values()) {
                audioComponent.activate(this.on);
            }
        }
        static stop() {
            for (const child of this.components.values()) {
                child.play(false);
            }
        }
        static play(_audio, _on = true) {
            ƒ.Debug.log(_audio);
            if (this.on)
                Audio.components.get(_audio).play(_on);
        }
        static async appendAudio() {
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
    Audio.on = true;
    Audio.components = new Map();
    Audio.node = new Audio("Audio");
    MyGame.Audio = Audio;
})(MyGame || (MyGame = {}));
