class Model3D {
    constructor(){
        this.indexCount;
        this.position;
        this.scale;
        this.color;
        this.orientation;
        this.indexOffset;
    }
}

class Model3DRenderer{
    constructor(gl, vbo = null, ebo = null){
        this.gl = gl;
        this.vertexShader = document.getElementById("modelRendererVertexShaderID").text;
        this.fragmentShader = document.getElementById("modelRendererFragmentShaderID").text;
        this.shader = compileGLShader(this.gl, this.vertexShader, this.fragmentShader);
        this.vao = this.gl.createVertexArray();
        this.gl.bindVertexArray(this.vao);
        if(vbo == null){
            this.vbo = this.gl.createBuffer();
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vbo);
            this.gl.bufferData(this.gl.ARRAY_BUFFER, 0, this.gl.STATIC_DRAW);
        }else{
            this.vbo = vbo;
        }

        this.positionID = this.gl.getAttribLocation(this.shader, "position");
        this.normalID = this.gl.getAttribLocation(this.shader, "normalCoord");
        this.gl.enableVertexAttribArray(this.positionID);
        this.gl.enableVertexAttribArray(this.normalID);
        this.gl.vertexAttribPointer(this.positionID, 3, this.gl.FLOAT, this.gl.FALSE, 24, 0);
        this.gl.vertexAttribPointer(this.normalID, 3, this.gl.FLOAT, this.gl.FALSE, 24, 12);

        if(ebo == null){
            this.ebo = this.gl.createBuffer();
            this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.ebo);
            this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, 0, this.gl.STATIC_DRAW);
        }else{
            this.ebo = ebo;
        }
    
        this.projectionViewMatrixID = this.gl.getUniformLocation(this.shader, "projectionViewMatrix");
        this.modelMatrixID = this.gl.getUniformLocation(this.shader, "modelMatrix");
        this.modelColorID = this.gl.getUniformLocation(this.shader, "modelColor");
        this.cameraPositionID = this.gl.getUniformLocation(this.shader, "cameraPosition");
        this.lightPositionID = this.gl.getUniformLocation(this.shader, "lightPosition");

        this.lightPosition = new Vector3(1, 1, 1);

        this.bytesPerVertex = 4 * 3;
        this.totalVertexSize = 0;
        this.totalIndexSize = 0;
        this.totalVertices = 0;
        this.totalIndices = 0;
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

        this.gl.bindVertexArray(this.vao);
        let nb = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, nb);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, newVertSize + this.totalVertexSize, this.gl.STATIC_DRAW);
        this.gl.bindBuffer(this.gl.COPY_READ_BUFFER, this.vbo);
        this.gl.copyBufferSubData(this.gl.COPY_READ_BUFFER, this.gl.ARRAY_BUFFER, 0, 0, this.totalVertexSize);
        this.gl.bufferSubData(this.gl.ARRAY_BUFFER, this.totalVertexSize, new Float32Array(verts));
        this.gl.deleteBuffer(this.vbo);
        this.vbo = nb;
        this.gl.vertexAttribPointer(this.positionID, 3, this.gl.FLOAT, this.gl.FALSE, 24, 0);
        this.gl.vertexAttribPointer(this.normalID, 3, this.gl.FLOAT, this.gl.FALSE, 24, 12);
        this.gl.enableVertexAttribArray(this.iPositionID);
        this.gl.enableVertexAttribArray(this.iNormalID);
        this.gl.bindVertexArray(this.vao);
        this.totalVertexSize += newVertSize;

        let iCtr = (this.totalVertexSize - newVertSize) / 24;
        for(let i = 0; i < inds.length; i++){
            inds[i] += iCtr;
        }

        nb = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, nb);
        this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, newIndSize + this.totalIndexSize, this.gl.STATIC_DRAW);
        this.gl.bindBuffer(this.gl.COPY_READ_BUFFER, this.ebo);
        this.gl.copyBufferSubData(this.gl.COPY_READ_BUFFER, this.gl.ELEMENT_ARRAY_BUFFER, 0, 0, this.totalIndexSize);
        this.gl.bufferSubData(this.gl.ELEMENT_ARRAY_BUFFER, this.totalIndexSize, new Uint16Array(inds));
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

    prepareRenderer(){
        gl.useProgram(this.shader);
        gl.bindVertexArray(this.vao);
        // gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
        // gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.ebo);
        gl.enable(this.gl.DEPTH_TEST);
        gl.enable(this.gl.CULL_FACE);
    }

    renderModel(camera, model){
        let modelMatrix = Matrix4.buildModelMatrix4(model.position, model.scale, model.orientation);
        gl.uniform3fv(this.cameraPositionID, camera.position.toArray());
        gl.uniform3fv(this.lightPositionID, this.lightPosition.toArray());
        gl.uniform4fv(this.modelColorID, model.color.toArray());
        gl.uniformMatrix4fv(this.modelMatrixID, this.gl.FALSE, modelMatrix.m);
        gl.uniformMatrix4fv(this.projectionViewMatrixID, this.gl.FALSE, camera.viewMatrix.m);
        gl.drawElements(this.gl.TRIANGLES, model.indexCount, this.gl.UNSIGNED_SHORT, model.indexOffset);
    }

    updateBuffers(vbo = null, ebo = null){
        this.gl.bindVertexArray(this.vao);
        if(vbo != null){
            this.vbo = vbo;
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vbo);
            this.gl.vertexAttribPointer(this.positionID, 3, this.gl.FLOAT, this.gl.FALSE, 24, 0);
            this.gl.vertexAttribPointer(this.normalID, 3, this.gl.FLOAT, this.gl.FALSE, 24, 12);
            this.gl.enableVertexAttribArray(this.iPositionID);
            this.gl.enableVertexAttribArray(this.iNormalID);
        }
        if(ebo != null){
            this.ebo = ebo;
            this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.ebo);
        }
    }
}

class InstancedModel3DRenderer{
    constructor(gl, vbo = null, ebo = null){
        this.gl = gl;
        this.vertexShader = document.getElementById("instancedModelRendererVertexShaderID").text;
        this.fragmentShader = document.getElementById("instancedModelRendererFragmentShaderID").text;
        this.shader = compileGLShader(this.gl, this.vertexShader, this.fragmentShader);
        this.vao = this.gl.createVertexArray();
        this.gl.bindVertexArray(this.vao);
        if(vbo == null){
            this.vbo = this.gl.createBuffer();
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vbo);
            this.gl.bufferData(this.gl.ARRAY_BUFFER, 0, this.gl.STATIC_DRAW);
        }else{
            this.vbo = vbo;
        }

        this.positionID = this.gl.getAttribLocation(this.shader, "position");
        this.normalID = this.gl.getAttribLocation(this.shader, "normalCoord");
        this.gl.enableVertexAttribArray(this.positionID);
        this.gl.enableVertexAttribArray(this.normalID);
        this.gl.vertexAttribPointer(this.positionID, 3, this.gl.FLOAT, this.gl.FALSE, 24, 0);
        this.gl.vertexAttribPointer(this.normalID, 3, this.gl.FLOAT, this.gl.FALSE, 24, 12);
    
        if(ebo == null){
            this.ebo = this.gl.createBuffer();
            this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.ebo);
            this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, 0, this.gl.STATIC_DRAW);
        }else{
            this.ebo = ebo;
        }

        this.matricesID = this.gl.getAttribLocation(this.shader, "modelMatrix");
        this.matricesBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.matricesBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, 16 * 4 * 30000, this.gl.DYNAMIC_DRAW);
        this.gl.enableVertexAttribArray(this.matricesID    );
        this.gl.enableVertexAttribArray(this.matricesID + 1);
        this.gl.enableVertexAttribArray(this.matricesID + 2);
        this.gl.enableVertexAttribArray(this.matricesID + 3);
        this.gl.vertexAttribPointer(this.matricesID    , 4, this.gl.FLOAT, this.gl.FALSE, 4 * 4 * 4, 0);
        this.gl.vertexAttribPointer(this.matricesID + 1, 4, this.gl.FLOAT, this.gl.FALSE, 4 * 4 * 4, 4 * 4);
        this.gl.vertexAttribPointer(this.matricesID + 2, 4, this.gl.FLOAT, this.gl.FALSE, 4 * 4 * 4, 2 * 4 * 4);
        this.gl.vertexAttribPointer(this.matricesID + 3, 4, this.gl.FLOAT, this.gl.FALSE, 4 * 4 * 4, 3 * 4 * 4);
        this.gl.vertexAttribDivisor(this.matricesID    , 1);
        this.gl.vertexAttribDivisor(this.matricesID + 1, 1);
        this.gl.vertexAttribDivisor(this.matricesID + 2, 1);
        this.gl.vertexAttribDivisor(this.matricesID + 3, 1);

        this.projectionViewMatrixID = this.gl.getUniformLocation(this.shader, "projectionViewMatrix");
        this.modelColorID = this.gl.getUniformLocation(this.shader, "modelColor");
        this.cameraPositionID = this.gl.getUniformLocation(this.shader, "cameraPosition");
        this.lightPositionID = this.gl.getUniformLocation(this.shader, "lightPosition");

        this.lightPosition = new Vector3(1, 1, 1);

        this.bytesPerVertex = 4 * 3;
        this.totalVertexSize = 0;
        this.totalIndexSize = 0;
        this.totalVertices = 0;
        this.totalIndices = 0;
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

        this.gl.bindVertexArray(this.vao);
        let nb = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, nb);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, newVertSize + this.totalVertexSize, this.gl.STATIC_DRAW);
        this.gl.bindBuffer(this.gl.COPY_READ_BUFFER, this.vbo);
        this.gl.copyBufferSubData(this.gl.COPY_READ_BUFFER, this.gl.ARRAY_BUFFER, 0, 0, this.totalVertexSize);
        this.gl.bufferSubData(this.gl.ARRAY_BUFFER, this.totalVertexSize, new Float32Array(verts));
        this.gl.deleteBuffer(this.vbo);
        this.vbo = nb;
        this.gl.vertexAttribPointer(this.positionID, 3, this.gl.FLOAT, this.gl.FALSE, 24, 0);
        this.gl.vertexAttribPointer(this.normalID, 3, this.gl.FLOAT, this.gl.FALSE, 24, 12);
        this.gl.enableVertexAttribArray(this.iPositionID);
        this.gl.enableVertexAttribArray(this.iNormalID);
        this.totalVertexSize += newVertSize;

        let iCtr = (this.totalVertexSize - newVertSize) / 24;
        for(let i = 0; i < inds.length; i++){
            inds[i] += iCtr;
        }

        nb = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, nb);
        this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, newIndSize + this.totalIndexSize, this.gl.STATIC_DRAW);
        this.gl.bindBuffer(this.gl.COPY_READ_BUFFER, this.ebo);
        this.gl.copyBufferSubData(this.gl.COPY_READ_BUFFER, this.gl.ELEMENT_ARRAY_BUFFER, 0, 0, this.totalIndexSize);
        this.gl.bufferSubData(this.gl.ELEMENT_ARRAY_BUFFER, this.totalIndexSize, new Uint16Array(inds));
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

    updateModelMatrices(matrices){
        let data = [];
        for(let i = 0; i < matrices.length; i++){
            for(let j = 0; j < 16; j++){
                data.push(matrices[i].m[j]);
            }
        }
        gl.bindVertexArray(this.vao);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.matricesBuffer);
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, new Float32Array(data));
    }

    prepareRenderer(){
        gl.useProgram(this.shader);
        gl.bindVertexArray(this.vao);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.ebo);
        
        gl.enable(this.gl.DEPTH_TEST);
        gl.enable(this.gl.CULL_FACE);
    }

    renderModel(camera, model, instances){
        gl.uniform3fv(this.cameraPositionID, camera.position.toArray());
        gl.uniform3fv(this.lightPositionID, this.lightPosition.toArray());
        gl.uniform4fv(this.modelColorID, model.color.toArray());
        gl.uniformMatrix4fv(this.projectionViewMatrixID, this.gl.FALSE, camera.viewMatrix.m);
        gl.drawElementsInstanced(this.gl.TRIANGLES, model.indexCount, this.gl.UNSIGNED_SHORT, model.indexOffset, instances);
    }

    renderModels(camera, model, matrices){
        gl.uniform3fv(this.cameraPositionID, camera.position.toArray());
        gl.uniform3fv(this.lightPositionID, this.lightPosition.toArray());
        gl.uniform4fv(this.modelColorID, model.color.toArray());
        gl.uniformMatrix4fv(this.projectionViewMatrixID, this.gl.FALSE, camera.viewMatrix.m);

        let len = matrices.length;
        let ctr = 0;
        let data = [];
        for(let i = 0; i < len; i++){
            for(let j = 0; j < 16; j++){
                data.push(matrices[i].m[j]);
            }
        }
        gl.bindBuffer(gl.ARRAY_BUFFER, this.matricesBuffer);
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, new Float32Array(data));
        gl.drawElementsInstanced(this.gl.TRIANGLES, model.indexCount, this.gl.UNSIGNED_SHORT, model.indexOffset, len);
    }

    updateBuffers(vbo = null, ebo = null){
        this.gl.bindVertexArray(this.vao);
        if(vbo != null){
            this.vbo = vbo;
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vbo);
            this.gl.vertexAttribPointer(this.positionID, 3, this.gl.FLOAT, this.gl.FALSE, 24, 0);
            this.gl.vertexAttribPointer(this.normalID, 3, this.gl.FLOAT, this.gl.FALSE, 24, 12);
            this.gl.enableVertexAttribArray(this.iPositionID);
            this.gl.enableVertexAttribArray(this.iNormalID);
        }
        if(ebo != null){
            this.ebo = ebo;
            this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.ebo);
        }
    }
}