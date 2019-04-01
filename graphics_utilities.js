class Vector2 {
    x; y;
    constructor(x = 0, y = 0){
        this.x = x;
        this.y = y;
    }
}

class Vector3 {
    x; y; z;
    constructor(x = 0, y = 0, z = 0){
        this.x = x;
        this.y = y;
        this.z = z;
    }
}

class Vector4 {
    x; y; z; w;
    constructor(x = 0, y = 0, z = 0, w = 0){
        this.x = x;
        this.y = y;
        this.z = z;
        this.w = w;
    }
}

class Quaternion {
    x; y; z; w;
    constructor(x = 0, y = 0, z = 0, w = 1){
        this.x = x;
        this.y = y;
        this.z = z;
        this.w = w;
    }
}

class Matrix4 {
    m = [];
    constructor(v){
        m = [
            v, 0, 0, 0,
            0, v, 0, 0,
            0, 0, v, 0,
            0, 0, 0, v,
        ];
    }
}

class Camera {
    projectionMatrix;
    position;

    setOrthagonalProjection(left, right, bottom, top, near, far){

    }

    setPerspectiveProjection(fov, aspect, near, far){

    }
}

class Light {
    postion;
    ambient;
    diffuse;
    specular;

    constructor(p, a, d, s){
        this.postion = p;
        this.ambient = a;
        this.diffuse = d;
        this.specular = s;
    }
}

function compileGLShader(gl, vsCode, fsCode){
    let vertShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertShader, vsCode);
    gl.compileShader(vertShader);
    var compiled = gl.getShaderParameter(vertShader, gl.COMPILE_STATUS);
    if(!compiled){
        console.log(gl.getShaderInfoLog(vertShader));
    }
    let fragShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragShader, fsCode); 
    gl.compileShader(fragShader);
    compiled = gl.getShaderParameter(fragShader, gl.COMPILE_STATUS);
    if(!compiled){
        console.log(gl.getShaderInfoLog(fragShader));
    }
    let shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertShader);
    gl.attachShader(shaderProgram, fragShader);
    gl.linkProgram(shaderProgram);
    return shaderProgram;
}