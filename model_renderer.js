class ModelRenderer{
    gl;
    shader;
    vbo;
    ebo;
    positionID;

    vertexShader = "#version 300 es\n\
    in vec3 position;\n\
    void main(){\n\
        gl_Position = vec4(position, 1.0);\n\
    }"
    fragmentShader = "#version 300 es\n\
    precision mediump float;\
    out vec4 finalColor;\n\
    void main(){\n\
        finalColor = vec4(1.0, 0, 0, 1.0);\n\
    }"

    constructor(gl){
        this.gl = gl;
        this.shader = compileGLShader(this.gl, this.vertexShader, this.fragmentShader);
        this.vbo = this.gl.createBuffer();
        this.ebo = this.gl.createBuffer();
        let vs = [
            -0.5, -0.5, 0.0,
            -0.5,  0.5, 0.0,
             0.5,  0.5, 0.0,
             0.5, -0.5, 0.0, 
        ];
        let is = [
            0, 1, 2, 2, 3, 0
        ];
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vbo);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(vs), this.gl.STATIC_DRAW);
        this.positionID = this.gl.getAttribLocation(this.shader, "position");
        this.gl.vertexAttribPointer(this.positionID, 3, this.gl.FLOAT, this.gl.FALSE, 0, 0);
        this.gl.enableVertexAttribArray(this.positionID);
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.ebo);
        this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Int16Array(is), this.gl.STATIC_DRAW);
        
        
    }

    prepare(){
        this.gl.useProgram(this.shader);
    }

    render(){
        this.gl.drawElements(this.gl.TRIANGLES, 6, this.gl.UNSIGNED_SHORT, 0);
    }

}