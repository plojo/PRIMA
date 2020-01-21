namespace L15_ {
    import f = FudgeCore;

    let ground: f.Rectangle = new f.Rectangle(0, 0, 0, -10);
    let velocity: number = 0; // units per second
    const acceleration: number = -10; // units per square second
    let box: f.Rectangle = new f.Rectangle(-5, 20, 5, 0);
    let posLast: f.Vector2 = box.position;
    
    console.time("timer");
    f.Loop.addEventListener(f.EVENT.LOOP_FRAME, update);
    f.Loop.start(f.LOOP_MODE.TIME_GAME, 30);

    function update(_event: Event): void {
        let timeFrame: number = f.Loop.timeFrameGame / 1000;
        velocity += acceleration * timeFrame;

        posLast = box.position.copy;
        box.position.add(f.Vector2.Y(velocity * timeFrame));
        if (box.collides(ground)) {
            processCollison(posLast, box.position, 0.01);
            velocity = 0;
        }
        console.timeLog("timer", box.position.y);
    }

    function processCollison(upperBound: f.Vector2, lowerBound: f.Vector2, epsilon: number): void {
        let delta: number = upperBound.y - lowerBound.y;
        if (delta < epsilon) {
            box.position.y = upperBound.y;
            return;
        }
        box.position.y += delta / 2;
        if (box.collides(ground)) {
            processCollison(upperBound, box.position, epsilon);
        } else {
            processCollison(box.position, lowerBound, epsilon);
        }
    }
}
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