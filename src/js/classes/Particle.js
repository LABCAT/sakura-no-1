export default class Particle {

    constructor(x, y, p5, globalHue){
        this.lastPos = p5.createVector(x, y);
        this.pos = p5.createVector(x, y);
        this.vel = p5.createVector(0, 0);
        this.acc = p5.createVector(0, 0);
        this.size = p5.random(2, 20);
        this.h = globalHue;
    }
    
}