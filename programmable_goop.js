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
var iModelRenderer;

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

var mod;
var isph;
var light;

var mats = [];

var totalObjects = 30000;

function update(){
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    handleCameraMovement();
    camera.updateView();

    light.position.x = Math.sin(totalFrames * 0.001) * 10;
    //light.position.y = Math.cos(totalFrames * 0.002) * 10;
    light.position.z = Math.cos(totalFrames * 0.001) * 10;

    modelRenderer.prepareRenderer();
    for(let i = 0; i < mazeModels.length; i++){
        modelRenderer.renderModel(camera, mazeModels[i]);
    }

    iModelRenderer.prepareRenderer();
    //iModelRenderer.renderModels(camera, mod, mats);
    iModelRenderer.renderModel(camera, mod, mats.length);
    
    
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
    camera.position = new Vector3(5.2441990459752255, 8.350125524843746, 12.274175305664611);
    camera.orientation = new Quaternion(0.41672606067672807, 0.02790608166927432, -0.006805983268214414, 0.9085781857113214);
    camera.setPerspectiveProjection(70.0, (canvas.width / canvas.height), 0.001, 1000.0);

    iModelRenderer = new InstancedModel3DRenderer(gl);
    modelRenderer = new Model3DRenderer(gl, iModelRenderer.vbo, iModelRenderer.ebo);

    let vs = [];
    let is = [];
    generateUnitCubeVerticesIndexedWithNormals(vs, is);
    mod = iModelRenderer.generateModel(vs, is);
    mod.position.x += 1;
    mod.color = new Vector4(0, 0, 1, 1);
    //mazeModels.push(mod);

    let v2s = [];
    let i2s = [];
    generateIcoSphereVerticesIndexedWithNormals(v2s, i2s, 3);
    light = iModelRenderer.generateModel(v2s, i2s);
    light.scale = new Vector3(0.2, 0.2, 0.2);
    light.color = new Vector4(1, 1, 0, 1);
    light.position = iModelRenderer.lightPosition;
    modelRenderer.lightPosition = light.position;
    light.position.y += 10;
    mazeModels.push(light);

    maze = generateMaze(60, 60, randomInteger(232));
    let mod2 = iModelRenderer.copyModel(mod);
    mod2.position = new Vector3(maze.width / 2, 0, maze.height / 2);
    mod2.scale = new Vector3(maze.width, 0.5, maze.height);
    mod2.color = new Vector4(0.7, 0.7, 0.7, 1.0);
    mazeModels.push(mod2);

    let mst = iModelRenderer.copyModel(light);
    let men = iModelRenderer.copyModel(light);
    mst.color = new Vector4(1, 1, 0, 1);
    mst.scale = new Vector3(0.5, 0.5, 0.5);
    men.scale = new Vector3(0.5, 0.5, 0.5);
    men.color = new Vector4(0, 1, 0, 1);
    mst.position = new Vector3(maze.startCell.x + 0.5, 0.5, maze.startCell.y + 0.5);
    men.position = new Vector3(maze.endCell.x + 0.5, 0.5, maze.endCell.y + 0.5);
    mazeModels.push(mst);
    mazeModels.push(men);

    let mm;
    for(let i = 0; i < maze.height; i++){
        for(let j = 0; j < maze.width; j++){
            let cell = maze.cells[j][i];
            if(cell.westWall){
                mm = new Matrix4();
                mm.scale(new Vector3(0.1, 0.5, 1));
                mm.translate(new Vector3(j + 0.05, 0.5, i + 0.5));
                mats.push(mm);
            }
            if(cell.northWall){
                mm = new Matrix4();
                mm.scale(new Vector3(1, 0.5, 0.1));
                mm.translate(new Vector3(j + 0.5, 0.5, i + 0.05));
                mats.push(mm);
            }
            if(cell.eastWall){
                mm = new Matrix4();
                mm.scale(new Vector3(0.1, 0.5, 1));
                mm.translate(new Vector3(j + 0.95, 0.5, i + 0.5));
                mats.push(mm);
            }
            if(cell.southWall){
                mm = new Matrix4();
                mm.scale(new Vector3(1, 0.5, 0.1));
                mm.translate(new Vector3(j + 0.5, 0.5, i + 0.95));
                mats.push(mm);
            }
        }
    }
    iModelRenderer.updateModelMatrices(mats);
    modelRenderer.updateBuffers(iModelRenderer.vbo, iModelRenderer.ebo);


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