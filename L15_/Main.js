"use strict";
var L15_;
(function (L15_) {
    var f = FudgeCore;
    let ground = new f.Rectangle(0, 0, 0, -10);
    let velocity = 0; // units per second
    const acceleration = -10; // units per square second
    let box = new f.Rectangle(-5, 20, 5, 0);
    let posLast = box.position;
    console.time("timer");
    f.Loop.addEventListener("loopFrame" /* LOOP_FRAME */, update);
    f.Loop.start(f.LOOP_MODE.TIME_GAME, 30);
    function update(_event) {
        let timeFrame = f.Loop.timeFrameGame / 1000;
        velocity += acceleration * timeFrame;
        posLast = box.position.copy;
        box.position.add(f.Vector2.Y(velocity * timeFrame));
        if (box.collides(ground)) {
            processCollison(posLast, box.position, 0.01);
            velocity = 0;
        }
        // console.timeLog("timer", box.position.y);
    }
    function processCollison(upperBound, lowerBound, epsilon) {
        let delta = upperBound.y - lowerBound.y;
        if (delta < epsilon) {
            box.position.y = upperBound.y;
            return;
        }
        box.position.y += delta / 2;
        if (box.collides(ground)) {
            processCollison(upperBound, box.position, epsilon);
        }
        else {
            processCollison(box.position, lowerBound, epsilon);
        }
    }
})(L15_ || (L15_ = {}));
//     function findBorderPoint(top: f.Vector2, bottom: f.Vector2, epsilon: number): f.Vector2 {
//         let delta: number = top.y - bottom.y;
//         if (delta < epsilon) {
//             return top;
//         }
//         let middle: f.Vector2 = new f.Vector2(bottom.x , bottom.y + delta / 2);
//         // console.log("delta: " + delta + " t: " + top.y + " m: " + middle.y + " b: " + bottom.y);
//         if (ground.isInside(middle)) {
//             return findBorderPoint(top, middle, epsilon);
//         } else {
//             return findBorderPoint(middle, bottom, epsilon);
//         }
//     }
// }
