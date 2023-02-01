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
        AUDIO["CONFIRM"] = "sounds/Confirm.wav";
        AUDIO["MUSIC"] = "sounds/Music.wav";
    })(AUDIO = MyGame.AUDIO || (MyGame.AUDIO = {}));
    // this structure is from https://github.com/JirkaDellOro/Episoma
    class Audio extends ƒ.Node {
        static on = true;
        static components = new Map();
        static node = new Audio("Audio");
        static async start() {
            await Audio.appendAudio();
            MyGame.game.appendChild(Audio.node);
            ƒ.AudioManager.default.listenTo(Audio.node);
        }
        static switch() {
            this.on = !this.on;
            for (const audioComponent of this.components.values()) {
                audioComponent.activate(this.on);
            }
        }
        static pause(_on) {
            Audio.components.get(AUDIO.MUSIC).volume = _on ? 0.25 : 0.5;
        }
        static play(_audio, _on = true, _force = false) {
            if (this.on || _force)
                Audio.getAudio(_audio).play(_on);
        }
        static getAudio(_audio) {
            return Audio.components.get(_audio);
        }
        // public static switchAudio(_audio: AUDIO): void {
        //   console.log(!Audio.components.get(_audio).isActive);
        //   Audio.components.get(_audio).activate(!Audio.components.get(_audio).isActive);
        // }
        static async appendAudio() {
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
    MyGame.Audio = Audio;
})(MyGame || (MyGame = {}));
