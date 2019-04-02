const refreshRate = 1.0 / 60.0;
const W_KEY = 87;
const S_KEY = 83;
const A_KEY = 65;
const D_KEY = 68;
const R_KEY = 82;
const F_KEY = 70;
const Q_KEY = 81;
const E_KEY = 69;
const LEFT_KEY = 37;
const UP_KEY = 38;
const RIGHT_KEY = 39;
const DOWN_KEY = 40;

var canvas;
var textCanvas;
var gl;
var g2d;

var camera;
var cameraMoveSpeed = 5;
var cameraRotateSpeed = 1;

var moveForward = false;
var moveBack = false;
var moveLeft = false;
var moveRight = false;
var moveUp = false;
var moveDown = false;
var pitchUp = false;
var pitchDown = false;
var rollLeft = false;
var rollRight = false;
var yawLeft = false;
var yawRight = false;

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

var maze;
var mazeModels = [];

function update(){
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    handleCameraMovement();
    camera.updateView();

    modelRenderer.prepare();
    for(let i = 0; i < mazeModels.length; i++){
        modelRenderer.renderModel(camera, mazeModels[i]);
    }


    g2d.clearRect(0, 0, textCanvas.width, textCanvas.height);
    renderText("fps: " + framesPerSecond, 10, 0);

    totalFrames++;
    fpsCounter++;

    if(fpsTimer >= 1){
        framesPerSecond = fpsCounter;
        fpsCounter = 0;
        fpsTimer = 0;
    }

    endTime = new Date().getTime();
    deltaTime = (endTime - startTime) / 1000.0;
    totalTime += deltaTime;
    fpsTimer += deltaTime;
    animationTimer += deltaTime;

    startTime = endTime;
}

window.onload = function(){
    window.addEventListener("keydown", keyDown);
    window.addEventListener("keyup", keyUp);

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

    camera = new Camera();
    camera.position = new Vector3(5, 10, 5);
    camera.orientation.rotate(camera.right, -Math.PI - 1)
    camera.setPerspectiveProjection(70.0, (canvas.width / canvas.height), 0.001, 1000.0);

    modelRenderer = new Model3DRenderer(gl);
    let vs = [];
    let is = [];
    generateUnitCubeVerticesIndexedWithNormals(vs, is);
    let mod = modelRenderer.generateModel(vs, is);
    maze = generateMaze(30, 14);
    for(let i = 0; i < maze.width; i++){
        for(let j = 0; j < maze.height; j++){
            let m = modelRenderer.copyModel(mod);
            let c = maze.cells[i][j];
            if(c == maze.startCell){
                let o = modelRenderer.copyModel(mod);
                o.position.x = i;
                o.position.z = j;
                o.position.y += 0.25;
                o.scale = new Vector3(0.3, 0.3, 0.3);
                o.color = new Vector4(0, 1, 0, 1);
                mazeModels.push(o);
            }
            if(c == maze.endCell){
                let o = modelRenderer.copyModel(mod);
                o.position.x = i;
                o.position.z = j;
                o.position.y += 0.25;
                o.scale = new Vector3(0.3, 0.3, 0.3);
                o.color = new Vector4(1, 1, 0, 1);
                mazeModels.push(o);
            }
            m.position.x = i;
            m.position.z = j;
            m.scale.y = 0.1;
            mazeModels.push(m);
            if(c.westWall){
                let n = modelRenderer.copyModel(mod);
                n.position = new Vector3(m.position.x, m.position.y, m.position.z);
                n.position.x -= 0.45;
                n.position.y += 0.25;
                n.scale.x = 0.125;
                n.scale.y = 0.5;
                n.color = new Vector4(0, 0, 1, 1);
                mazeModels.push(n);
            }
            if(c.northWall){
                let n = modelRenderer.copyModel(mod);
                n.position = new Vector3(m.position.x, m.position.y, m.position.z);
                n.position.z -= 0.45;
                n.position.y += 0.25;
                n.scale.z = 0.125;
                n.scale.y = 0.5;
                n.color = new Vector4(0, 0, 1, 1);
                mazeModels.push(n);
            }
            if(c.eastWall){
                let n = modelRenderer.copyModel(mod);
                n.position = new Vector3(m.position.x, m.position.y, m.position.z);
                n.position.x += 0.45;
                n.position.y += 0.25;
                n.scale.x = 0.125;
                n.scale.y = 0.5;
                n.color = new Vector4(0, 0, 1, 1);
                mazeModels.push(n);
            }
            if(c.southWall){
                let n = modelRenderer.copyModel(mod);
                n.position = new Vector3(m.position.x, m.position.y, m.position.z);
                n.position.z += 0.45;
                n.position.y += 0.25;
                n.scale.z = 0.125;
                n.scale.y = 0.5;
                n.color = new Vector4(0, 0, 1, 1);
                mazeModels.push(n);
            }
        }
    }

    startTime = new Date().getTime();
    timer = setInterval(update, 1);
}

function renderText(text, x, y){
    g2d.fillText(text, x, y + textSize);
}

function handleCameraMovement(){
    let camMov = cameraMoveSpeed * deltaTime;
    let camRot = cameraRotateSpeed * deltaTime;
    if(moveForward){
        camera.position.add(Vector3.scale(camera.forward, camMov));
    }
    if(moveBack){
        camera.position.sub(Vector3.scale(camera.forward, camMov));
    }
    if(moveLeft){
        camera.position.sub(Vector3.scale(camera.right, camMov));
    }
    if(moveRight){
        camera.position.add(Vector3.scale(camera.right, camMov));
    }
    if(moveUp){
        camera.position.add(Vector3.scale(camera.up, camMov));
    }
    if(moveDown){
        camera.position.sub(Vector3.scale(camera.up, camMov));
    }
    if(pitchUp){
        camera.orientation.rotate(camera.right, -camRot);
    }
    if(pitchDown){
        camera.orientation.rotate(camera.right, camRot);
    }
    if(yawLeft){
        camera.orientation.rotate(camera.up, -camRot);
    }
    if(yawRight){
        camera.orientation.rotate(camera.up, camRot);
    }
    if(rollLeft){
        camera.orientation.rotate(camera.forward, camRot);
    }
    if(rollRight){
        camera.orientation.rotate(camera.forward, -camRot);
    }
}

function keyDown(event){
    switch(event.keyCode){
        case W_KEY:{
            moveForward = true;
            break;
        }
        case S_KEY:{
            moveBack = true;
            break;
        }
        case A_KEY:{
            moveLeft = true;
            break;
        }
        case D_KEY:{
            moveRight = true;
            break;
        }
        case R_KEY:{
            moveUp = true;
            break;
        }
        case F_KEY:{
            moveDown = true;
            break;
        }
        case UP_KEY:{
            pitchUp = true;
            break;
        }
        case DOWN_KEY:{
            pitchDown = true;
            break;
        }
        case LEFT_KEY:{
            yawLeft = true;
            break;
        }
        case RIGHT_KEY:{
            yawRight = true;
            break;
        }
        case Q_KEY:{
            rollLeft = true;
            break;
        }
        case E_KEY:{
            rollRight = true;
            break;
        }
    }
}

function keyUp(event){
    switch(event.keyCode){
        case W_KEY:{
            moveForward = false;
            break;
        }
        case S_KEY:{
            moveBack = false;
            break;
        }
        case A_KEY:{
            moveLeft = false;
            break;
        }
        case D_KEY:{
            moveRight = false;
            break;
        }
        case R_KEY:{
            moveUp = false;
            break;
        }
        case F_KEY:{
            moveDown = false;
            break;
        }
        case UP_KEY:{
            pitchUp = false;
            break;
        }
        case DOWN_KEY:{
            pitchDown = false;
            break;
        }
        case LEFT_KEY:{
            yawLeft = false;
            break;
        }
        case RIGHT_KEY:{
            yawRight = false;
            break;
        }
        case Q_KEY:{
            rollLeft = false;
            break;
        }
        case E_KEY:{
            rollRight = false;
            break;
        }
    }
}