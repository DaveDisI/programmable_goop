const refreshRate = 1.0 / 6.0;

var canvas;
var textCanvas;
var gl;
var g2d;

var timer;

var textSize = 15;

var modelRenderer;

var startTime = 0;
var endTime = 0;
var deltaTime = 0;
var totalTime = 0;
var fpsTimer = 0;
var fpsCounter = 0;
var animationTimer = 0;
var totalFrames = 0;
var framesPerSecond = 0;

function render(){
    gl.clear(gl.COLOR_BUFFER_BIT);

    modelRenderer.prepare();
    modelRenderer.render();

    g2d.clearRect(0, 0, textCanvas.width, textCanvas.height);
    renderText("fps: " + framesPerSecond, 10, 0);
}

function update(){
    if(animationTimer >= refreshRate){
        render();
        animationTimer = 0;
    }

    if(fpsTimer >= 1){
        framesPerSecond = fpsCounter;
        fpsCounter = 0;
        fpsTimer = 0;
    }

    totalFrames++;
    fpsCounter++;

    endTime = new Date().getTime();
    deltaTime = (endTime - startTime) / 1000.0;
    totalTime += deltaTime;
    fpsTimer += deltaTime;
    animationTimer += deltaTime;

    startTime = endTime;
}

window.onload = function(){
    canvas = document.getElementById("canvasID");
    canvas.width = window.innerWidth * 0.9;
    canvas.height = window.innerHeight * 0.9;
    gl = canvas.getContext("webgl2");

    textCanvas = document.getElementById("textCanvasID");
    textCanvas.width = canvas.width;
    textCanvas.height = canvas.height;
    g2d = textCanvas.getContext("2d");
    g2d.font = textSize + "px Arial";

    gl.clearColor(0.7, 0.8, 0.9, 1.0);

    modelRenderer = new ModelRenderer(gl);

    startTime = new Date().getTime();
    timer = setInterval(update, 1);
}

function renderText(text, x, y){
    g2d.fillText(text, x, y + textSize);
}