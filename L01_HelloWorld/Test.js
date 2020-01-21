"use strict";
var L01_HelloWorld;
(function (L01_HelloWorld) {
    console.log("Hello World");
    window.addEventListener("load", handleLoad);
    /**
     *
     * @param _event event pls
     */
    function handleLoad(_event) {
        document.body.innerHTML = "Hi";
    } //TODO: make game
})(L01_HelloWorld || (L01_HelloWorld = {}));
