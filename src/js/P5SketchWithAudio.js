import React, { useRef, useEffect } from "react";
import "./helpers/Globals";
import "p5/lib/addons/p5.sound";
import * as p5 from "p5";
import { Midi } from '@tonejs/midi'
import PlayIcon from './functions/PlayIcon.js';
import Particle from './classes/Particle.js';
import Flower from './classes/Flower.js';

import audio from "../audio/sakura-no-1.ogg";
import midi from "../audio/sakura-no-1.mid";

const P5SketchWithAudio = () => {
    const sketchRef = useRef();

    const Sketch = p => {

        p.canvas = null;

        p.canvasWidth = window.innerWidth;

        p.canvasHeight = window.innerHeight;

        p.audioLoaded = false;

        p.player = null;

        p.tempo = 98;

        p.barAsSeconds = Math.floor(((60 / p.tempo) * 4) * 100000) / 100000;

        p.PPQ = 3840 * 4;

        p.particlesArray = [];
        p.globalHue = 300;
        p.spawnPerFrame = 3;
        p.noteSize = 200;
        p.notePosX = 0;
        p.notePosY = 0;
        p.noteHue = 0;
        p.flowers = [];

        p.loadMidi = () => {
            Midi.fromUrl(midi).then(
                function(result) {
                    console.log(result);
                    const noteSet1 = result.tracks[3].notes; // Thor 2 - A New Blade
                    p.scheduleCueSet(noteSet1, 'executeCueSet1');
                    p.audioLoaded = true;
                    document.getElementById("loader").classList.add("loading--complete");
                    //document.getElementById("play-icon").classList.remove("fade-out");
                }
            );
            
        }

        p.preload = () => {
            p.song = p.loadSound(audio, p.loadMidi);
            p.song.onended(p.logCredits);
        }

        p.scheduleCueSet = (noteSet, callbackName, poly = false)  => {
            let lastTicks = -1,
                currentCue = 1;
            for (let i = 0; i < noteSet.length; i++) {
                const note = noteSet[i],
                    { ticks, time } = note;
                if(ticks !== lastTicks || poly){
                    note.currentCue = currentCue;
                    p.song.addCue(time, p[callbackName], note);
                    lastTicks = ticks;
                    currentCue++;
                }
            }
        } 

        p.setup = () => {
            p.colorMode(p.HSB, 360, 100, 100, 100);
            p.canvas = p.createCanvas(p.canvasWidth, p.canvasHeight);
            p.background(0);
            p.smooth();
            p.noStroke();
        }

        p.draw = () => {
            if(p.audioLoaded && p.song.isPlaying()){
                p.fill(0, 5);
                p.rect(0, 0, p.width, p.height);

                for (var i = 0; i < p.spawnPerFrame; i++) {
                    p.particlesArray.push(new Particle(p.random(p.width), 0, p, p.globalHue));
                }
                for (var i = p.particlesArray.length - 1; i > -1; i--) {
                    p.particlesArray[i].acc.add(p.createVector(0, p.particlesArray[i].size * 0.01));

                    // Quick check to avoid calculating distance if possible.
                    if (p.notePosX && p.abs(p.particlesArray[i].pos.x - p.notePosX) < p.noteSize) {
                        let d = p.dist(p.notePosX, p.notePosY, p.particlesArray[i].pos.x, p.particlesArray[i].pos.y);
                        if (d < p.noteSize) {
                            let vec = p.createVector(p.notePosX, p.notePosY - p.noteSize);
                            vec.sub(p.createVector(p.particlesArray[i].pos.x, p.particlesArray[i].pos.y));
                            vec.normalize();
                            p.particlesArray[i].vel.add(vec);

                            p.particlesArray[i].h += 1.5;
                            if (p.particlesArray[i].h > 360) {
                                p.particlesArray[i].h = 0;
                            }
                        }
                    }

                    p.particlesArray[i].vel.add(p.particlesArray[i].acc);
                    p.particlesArray[i].pos.add(p.particlesArray[i].vel);
                    p.particlesArray[i].acc.mult(0);

                    p.stroke(p.particlesArray[i].h, 100, 100);
                    p.strokeWeight(p.particlesArray[i].size);
                    p.line(
                        p.particlesArray[i].lastPos.x, 
                        p.particlesArray[i].lastPos.y,
                        p.particlesArray[i].pos.x, 
                        p.particlesArray[i].pos.y
                    );

                    p.particlesArray[i].lastPos.set(p.particlesArray[i].pos.x, p.particlesArray[i].pos.y);

                    if (p.particlesArray[i].pos.y > p.height || p.particlesArray[i].pos.x < 0 || p.particlesArray[i].pos.x > p.width) {
                        p.particlesArray.splice(i, 1);
                    }
                }

                for (var i = 0; i < p.flowers.length; i++) {
                    p.flowers[i].draw();
                    p.flowers[i].update();
                    if (p.flowers[i].size > 80) {
                        p.flowers.splice(i, 1);
                    }
                }

                p.globalHue += 0.15;
                if (p.globalHue > 330) {
                    p.globalHue = 270;
                }
            }

        }

        p.barAsTicks = 61440;

        p.executeCueSet1 = (note) => {
            const { time, midi  } = note;
            let xPos = Math.floor(time * 100000) / 100000;
            //two bars
            if(parseFloat(xPos) >= parseFloat((p.barAsSeconds *2))){
                while(xPos >= (p.barAsSeconds *2)){
                    xPos = xPos - (p.barAsSeconds *2);
                }

                xPos = xPos > 0 ? xPos : 0;
            }

            p.notePosX = (p.width/16) + (p.width  / (p.barAsSeconds *2) * xPos);
            p.notePosY = p.map(midi, 60, 77, (p.height/16), p.height - (p.height/16));
            p.noteHue = p.random(0, 360);

            p.flowers.push(
                new Flower(p, p.notePosX, p.notePosY, p.globalHue)
            );
        }

        p.mousePressed = () => {
            if(p.audioLoaded){
                if (p.song.isPlaying()) {
                    p.song.pause();
                } else {
                    if (parseInt(p.song.currentTime()) >= parseInt(p.song.buffer.duration)) {
                        p.reset();
                    }
                    document.getElementById("play-icon").classList.add("fade-out");
                    p.canvas.addClass("fade-in");
                    p.song.play();
                }
            }
        }

        p.creditsLogged = false;

        p.logCredits = () => {
            if (
                !p.creditsLogged &&
                parseInt(p.song.currentTime()) >= parseInt(p.song.buffer.duration)
            ) {
                p.creditsLogged = true;
                    console.log(
                    "Music By: http://labcat.nz/",
                    "\n",
                    "Animation By: https://github.com/LABCAT/"
                );
                p.song.stop();
            }
        };

        p.reset = () => {

        }

        p.updateCanvasDimensions = () => {
            p.canvasWidth = window.innerWidth;
            p.canvasHeight = window.innerHeight;
            p.canvas = p.resizeCanvas(p.canvasWidth, p.canvasHeight);
        }

        if (window.attachEvent) {
            window.attachEvent(
                'onresize',
                function () {
                    p.updateCanvasDimensions();
                }
            );
        }
        else if (window.addEventListener) {
            window.addEventListener(
                'resize',
                function () {
                    p.updateCanvasDimensions();
                },
                true
            );
        }
        else {
            //The browser does not support Javascript event binding
        }
    };

    useEffect(() => {
        new p5(Sketch, sketchRef.current);
    }, []);

    return (
        <div ref={sketchRef}>
            <PlayIcon />
        </div>
    );
};

export default P5SketchWithAudio;
