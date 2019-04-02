class Model3D {
    indexCount;
    position;
    scale;
    color;
    orientation;
    indexOffset;
}

class Model3DRenderer{
    gl;
    shader;
    vao;
    vbo;
    ebo;
    bytesPerVertex = 4 * 3;
    totalVertexSize = 0;
    totalIndexSize = 0;
    totalVertices = 0;
    totalIndices = 0;

    positionID;
    normalID;
    projectionViewMatrixID;
    modelMatrixID;
    modelColorID;

    vertexShader;
    fragmentShader; 

    constructor(gl){
        this.gl = gl;
        this.vertexShader = document.getElementById("modelRendererVertexShaderID").text;
        this.fragmentShader = document.getElementById("modelRendererFragmentShaderID").text;
        this.shader = compileGLShader(this.gl, this.vertexShader, this.fragmentShader);

        this.vao = this.gl.createVertexArray();
        this.gl.bindVertexArray(this.vao);
        this.vbo = this.gl.createBuffer();
        this.ebo = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vbo);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, 0, this.gl.STATIC_DRAW);

        this.positionID = this.gl.getAttribLocation(this.shader, "position");
        this.normalID = this.gl.getAttribLocation(this.shader, "normalCoord");
        this.gl.vertexAttribPointer(this.positionID, 3, this.gl.FLOAT, this.gl.FALSE, 24, 0);
        this.gl.vertexAttribPointer(this.normalID, 3, this.gl.FLOAT, this.gl.FALSE, 24, 12);
        this.gl.enableVertexAttribArray(this.positionID);
        this.gl.enableVertexAttribArray(this.normalID);
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.ebo);
        this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, 0, this.gl.STATIC_DRAW);

        this.projectionViewMatrixID = this.gl.getUniformLocation(this.shader, "projectionViewMatrix");
        this.modelMatrixID = this.gl.getUniformLocation(this.shader, "modelMatrix");
        this.modelColorID = this.gl.getUniformLocation(this.shader, "modelColor");
    }

    copyModel(model){
        let m = new Model3D();
        m.indexCount = model.indexCount;
        m.indexOffset = model.indexOffset;
        m.position = new Vector3(model.position.x, model.position.y, model.position.z);
        m.scale = new Vector3(model.scale.x, model.scale.y, model.scale.z);
        m.color = new Vector4(model.color.x, model.color.y, model.color.z, model.color.w);
        m.orientation = new Quaternion(model.orientation.x, model.orientation.y, model.orientation.z, model.orientation.w);
        return m;
    }

    generateModel(verts, inds){
        let newVertSize = verts.length * 4;
        let newIndSize = inds.length * 2;
        let m = new Model3D();

        let nb = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, nb);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, newVertSize + this.totalVertexSize, this.gl.STATIC_DRAW);
        this.gl.bindBuffer(this.gl.COPY_READ_BUFFER, this.vbo);
        this.gl.copyBufferSubData(this.gl.COPY_READ_BUFFER, this.gl.ARRAY_BUFFER, 0, 0, this.totalVertexSize);
        this.gl.bufferSubData(this.gl.ARRAY_BUFFER, this.totalVertexSize, new Float32Array(verts), 0);
        this.gl.deleteBuffer(this.vbo);
        this.vbo = nb;
        this.gl.vertexAttribPointer(this.positionID, 3, this.gl.FLOAT, this.gl.FALSE, 24, 0);
        this.gl.vertexAttribPointer(this.normalID, 3, this.gl.FLOAT, this.gl.FALSE, 24, 12);
        this.gl.enableVertexAttribArray(this.positionID);
        this.gl.enableVertexAttribArray(this.normalID);
        this.totalVertexSize += newVertSize;

        nb = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, nb);
        this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, newIndSize + this.totalIndexSize, this.gl.STATIC_DRAW);
        this.gl.bindBuffer(this.gl.COPY_READ_BUFFER, this.ebo);
        this.gl.copyBufferSubData(this.gl.COPY_READ_BUFFER, this.gl.ELEMENT_ARRAY_BUFFER, 0, 0, this.totalIndexSize);
        this.gl.bufferSubData(this.gl.ELEMENT_ARRAY_BUFFER, this.totalIndexSize, new Uint16Array(inds), 0);
        this.gl.deleteBuffer(this.ebo);
        this.ebo = nb;
        this.totalIndexSize += newIndSize;

        m.position = new Vector3();
        m.scale = new Vector3(1, 1, 1);
        m.orientation = new Quaternion();
        m.color = new Vector4(0.8, 0.8, 0.8, 1);
        m.indexCount = inds.length;
        m.indexOffset = this.totalIndexSize - newIndSize;

        return m;
    }

    prepare(){
        this.gl.useProgram(this.shader);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vbo);
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.ebo);
        this.gl.enable(gl.DEPTH_TEST);
    }

    renderModel(camera, model){
        let modelMatrix = Matrix4.buildModelMatrix4(model.position, model.scale, model.orientation);
        this.gl.uniform4fv(this.modelColorID, model.color.toArray());
        this.gl.uniformMatrix4fv(this.modelMatrixID, this.gl.FALSE, modelMatrix.m);
        this.gl.uniformMatrix4fv(this.projectionViewMatrixID, this.gl.FALSE, camera.viewMatrix.m);
        this.gl.drawElements(this.gl.TRIANGLES, model.indexCount, this.gl.UNSIGNED_SHORT, model.indexOffset);
    }
}