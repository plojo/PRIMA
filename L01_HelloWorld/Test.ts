namespace L01_HelloWorld {
console.log("Hello World");
window.addEventListener("load", handleLoad);
/**
 * 
 * @param _event event pls
 */
function handleLoad(_event: Event): void {
    document.body.innerHTML = "Hi";
} //TODO: make game
}