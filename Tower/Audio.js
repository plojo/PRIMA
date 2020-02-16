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
    })(AUDIO = MyGame.AUDIO || (MyGame.AUDIO = {}));
    class Audio extends ƒ.Node {
        static start() {
            Audio.appendAudio();
            MyGame.game.appendChild(Audio.node);
            ƒ.AudioManager.default.listenTo(Audio.node);
        }
        static play(_audio, _on = true) {
            ƒ.Debug.log(_audio);
            Audio.components.get(_audio).play(_on);
        }
        static async appendAudio() {
            // Audio.components.set(AUDIO.START, new ƒ.ComponentAudio(await ƒ.Audio.load(AUDIO.START), true, true));
            // Audio.components.set(AUDIO.PLAY, new ƒ.ComponentAudio(await ƒ.Audio.load(AUDIO.PLAY), true, false));
            Audio.components.set(AUDIO.JUMP, new ƒ.ComponentAudio(await ƒ.Audio.load(AUDIO.JUMP), false, false));
            Audio.components.set(AUDIO.MOVE, new ƒ.ComponentAudio(await ƒ.Audio.load(AUDIO.MOVE), false, false));
            Audio.components.forEach(element => Audio.node.addComponent(element));
        }
    }
    Audio.components = new Map();
    Audio.node = new Audio("Audio");
    MyGame.Audio = Audio;
})(MyGame || (MyGame = {}));
