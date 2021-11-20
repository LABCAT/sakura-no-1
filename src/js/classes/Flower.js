export default class Flower {
    constructor(p5, x, y, hue) {
        this.p = p5;
        this.x = x;
        this.y = y;
        this.hue = hue;
        this.size = 0;
    }

    update() {
        this.size++;
    }

    draw() {
        this.p.translate(this.x, this.y);
        this.p.strokeWeight(2);
        for (let i = 0; i < 5; i ++) {
            this.p.fill(this.hue, 100, 100, 50);
            this.p.stroke(this.hue, 100, 100, 50);
            this.p.ellipse(0, 20, this.size / 2, this.size);
            this.p.fill(this.hue, 0, 100, 100);
            this.p.ellipse(0, 25, this.size / 8, this.size / 8);
            this.p.rotate(this.p.PI/2.5);
        }
        this.p.fill(this.hue + 20, 100, 100, 100);
        this.p.stroke(this.hue + 20, 100, 100, 100);
        this.p.ellipse(0, 0, this.size / 8 * 3, this.size / 8 * 3);
        this.p.fill(this.hue, 0, 100, 100);
        this.p.ellipse(0, 0, this.size / 8 * 1.5, this.size / 8 * 1.5);
        for (let i = 0; i < 5; i ++) {
            this.p.fill(this.hue, 0, 100, 100);
            this.p.stroke(this.hue5, 0, 100, 100);
            this.p.line(0, 0, 0, this.size / 8 * 3);
            this.p.rotate(this.p.PI/2.5);
        }
        this.p.translate(-this.x, -this.y);
    }
}