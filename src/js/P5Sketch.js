import React, { useEffect } from "react";
import PlayIcon from './PlayIcon.js';
import './globals';
import "p5/lib/addons/p5.sound";
import * as p5 from "p5";
import audio from '../audio/sakura-no-1.mp3'

class Particle {

    constructor(x, y, p5, globalHue){
        this.lastPos = p5.createVector(x, y);
        this.pos = p5.createVector(x, y);
        this.vel = p5.createVector(0, 0);
        this.acc = p5.createVector(0, 0);
        this.size = p5.random(2, 20);
        this.h = globalHue;
    }
    
}

const P5Sketch = () => {

    const Sketch = p5 => {

        p5.canvas = null;

        p5.framesPerSecond = 24;

        p5.canvasWidth = window.innerWidth;

        p5.canvasHeight = window.innerHeight;
        
        p5.song = null;

        p5.tempo = 101;
        
        p5.particlesArray = [];
        p5.globalHue = 300;
        p5.spawnPerFrame = 3;
        p5.mouseSize = 100;

        p5.setup = () => {
            p5.song = p5.loadSound(audio);
            p5.colorMode(p5.HSB, 360);
            p5.canvas = p5.createCanvas(p5.canvasWidth, p5.canvasHeight); 
            //p5.background(0,0,94);
            p5.smooth();
            p5.noStroke();
            p5.mouseX = p5.width / 2;
            p5.mouseY = p5.height / 2;
            
        };

        p5.draw = () => {
            let currentBar = p5.getSongBar();
            if (p5.song._lastPos > 0 && currentBar >= 0 && p5.song.isPlaying()) {
                console.log(p5.particlesArray);
                
            }
            p5.fill(0, 5);
            p5.rect(0, 0, p5.width, p5.height);

            for (var i = 0; i < p5.spawnPerFrame; i++) {
                p5.particlesArray.push(new Particle(p5.random(p5.width), 0, p5, p5.globalHue));
            }

            for (var i = p5.particlesArray.length - 1; i > -1; i--) {
                p5.particlesArray[i].acc.add(p5.createVector(0, p5.particlesArray[i].size * 0.01));

                // Quick check to avoid calculating distance if possible.
                if (p5.abs(p5.particlesArray[i].pos.x - p5.mouseX) < p5.mouseSize) {
                    let d = p5.dist(p5.mouseX, p5.mouseY, p5.particlesArray[i].pos.x, p5.particlesArray[i].pos.y);
                    if (d < p5.mouseSize) {
                        let vec = p5.createVector(p5.mouseX, p5.mouseY - p5.mouseSize);
                        vec.sub(p5.createVector(p5.particlesArray[i].pos.x, p5.particlesArray[i].pos.y));
                        vec.normalize();
                        p5.particlesArray[i].vel.add(vec);

                        p5.particlesArray[i].h += 1.5;
                        if (p5.particlesArray[i].h > 360) {
                            p5.particlesArray[i].h = 0;
                        }
                    }
                }

                p5.particlesArray[i].vel.add(p5.particlesArray[i].acc);
                p5.particlesArray[i].pos.add(p5.particlesArray[i].vel);
                p5.particlesArray[i].acc.mult(0);

                p5.stroke(p5.particlesArray[i].h, 360, 360);
                p5.strokeWeight(p5.particlesArray[i].size);
                p5.line(
                    p5.particlesArray[i].lastPos.x, 
                    p5.particlesArray[i].lastPos.y,
                    p5.particlesArray[i].pos.x, 
                    p5.particlesArray[i].pos.y
                );

                p5.particlesArray[i].lastPos.set(p5.particlesArray[i].pos.x, p5.particlesArray[i].pos.y);

                if (p5.particlesArray[i].pos.y > p5.height || p5.particlesArray[i].pos.x < 0 || p5.particlesArray[i].pos.x > p5.width) {
                    p5.particlesArray.splice(i, 1);
                }
            }

            p5.globalHue += 0.15;
            if (p5.globalHue > 360) {
                p5.globalHue = 270;
            }
        };

        p5.beatPerBar = 4;

        p5.getSongBeat = () => {
            if (p5.song && p5.song.buffer) {
                const barAsBufferLength = (p5.song.buffer.sampleRate * 60 / p5.tempo);
                return Math.floor(p5.song._lastPos / barAsBufferLength) + 1;
            }
            return -1;
        }


        p5.getSongBar = () => {
            if (p5.song && p5.song.buffer){
                const barAsBufferLength = (p5.song.buffer.sampleRate * 60 / p5.tempo) * p5.beatPerBar;
                return Math.floor(p5.song._lastPos / barAsBufferLength) + 1;
            }
            return -1;
        }

        p5.mousePressed = () => {
            if (p5.song.isPlaying()) {
                p5.song.pause();
            } else {
                document.getElementById("play-icon").classList.add("fade-out");
                p5.canvas.addClass('fade-in');
                p5.song.play();
            }
            p5.createParticle = true;
        };

        p5.mouseReleased = () => {
            p5.createParticle = false;
        };

        p5.updateCanvasDimensions = () => {
            p5.canvasWidth = window.innerWidth;
            p5.canvasHeight = window.innerHeight;
            p5.createCanvas(p5.canvasWidth, p5.canvasHeight);
            p5.redraw();
        }

        if (window.attachEvent) {
            window.attachEvent(
                'onresize',
                function () {
                    p5.updateCanvasDimensions();
                }
            );
        }
        else if (window.addEventListener) {
            window.addEventListener(
                'resize',
                function () {
                    p5.updateCanvasDimensions();
                },
                true
            );
        }
        else {
            //The browser does not support Javascript event binding
        }
    };

    useEffect(() => {
        new p5(Sketch);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <>
            <PlayIcon />
        </>
    );
};

export default P5Sketch;
