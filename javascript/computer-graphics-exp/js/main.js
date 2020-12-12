const create_scene = () => {
    return new THREE.Scene()
}

const create_camera = (scene) => {
    return new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.01, 2000)
}

const create_renderer = () => {
    const renderer = new THREE.WebGLRenderer()
    renderer.setSize(window.innerWidth, window.innerHeight)
    document.body.appendChild(renderer.domElement)
    return renderer
}

const create_mouse_control = (camera, renderer) => {
    const controls = new THREE.OrbitControls(camera, renderer.domElement)
    controls.enableZoom = true;
    controls.minDistance  = 200;
    controls.maxDistance  = 600;
    controls.enablePan = true;
    return controls
}

function ModernCity (renderer) {
    var cube=new THREE.CubeGeometry(1,1,1);
    cube.applyMatrix(new THREE.Matrix4().makeTranslation(0,0.5,0));   //将参考点设置在立方体的底部
    cube.faces.splice(6, 2);   //去掉立方体的底面
    cube.faceVertexUvs[0].splice(6, 2);
    //去掉顶面的纹理
    cube.faceVertexUvs[0][4][0].set(0, 0);
    cube.faceVertexUvs[0][4][1].set(0, 0);
    cube.faceVertexUvs[0][4][2].set(0, 0);

    cube.faceVertexUvs[0][5][0].set(0, 0);
    cube.faceVertexUvs[0][5][1].set(0, 0);
    cube.faceVertexUvs[0][5][2].set(0, 0);

    let buildingMesh=new THREE.Mesh(cube);

    //楼房
    let buildingMaxW=15;
    let buildingMaxD=15;

    //社区
    let blockNumX=20;
    let blockNumZ=20;
    let blockSizeX=50;
    let blockSizeZ=50;
    let blockDensity= 15;

    //街道
    let roadW=8;
    let roadD=8;

    //人行道
    let sidewayW=2;
    let sidewayH=0.3;
    let sidewayD=2;

    // 生成纹理
    let buildingTexture=new THREE.Texture(generateTextureCanvas());
    buildingTexture.anisotropy=renderer.getMaxAnisotropy();
    buildingTexture.needsUpdate=true; //在下次使用纹理时触发一次更新

    //建立城市
    let object=new THREE.Object3D();

    let groundMesh=createSquareGround();
    groundMesh.castShadow=true;
    groundMesh.receiveShadow=true;
    object.add(groundMesh);

    let sidewayMesh=createSquareSideWay();
    sidewayMesh.castShadow=true;
    sidewayMesh.receiveShadow=true;
    object.add(sidewayMesh);

    let buildingsMesh=createSquareBuildings();
    buildingsMesh.castShadow=true;
    buildingsMesh.receiveShadow=true;
    object.add(buildingsMesh);

    return object;

    function createSquareGround() {
        //建立地面
        let geometry=new THREE.PlaneGeometry(1,1,1);
        let material=new THREE.MeshLambertMaterial({color:0x222222});
        let ground=new THREE.Mesh(geometry,material);
        ground.rotation.x = (-90 * Math.PI) / 180;
        ground.scale.x=blockNumX*blockSizeX;
        ground.scale.y=blockNumZ*blockSizeZ;
        ground.receiveShadow=true;
        return ground;
    }

    function createSquareSideWay() {
        let sidewayGeometry=new THREE.Geometry();

        for(let i=0;i<blockNumZ;i++){
            for(let j=0;j<blockNumX;j++){
                //选取初始坐标
                buildingMesh.position.x=(i+0.5-blockNumX/2)*blockSizeX;
                buildingMesh.position.z=(j+0.5-blockNumZ/2)*blockSizeZ;

                //初始化大小
                buildingMesh.scale.x=blockSizeX-roadW;
                buildingMesh.scale.y=sidewayH;
                buildingMesh.scale.z=blockSizeZ-roadD;

                //加入城市
                buildingMesh.updateMatrix();
                sidewayGeometry.merge(buildingMesh.geometry, buildingMesh.matrix);
            }
        }
        let material=new THREE.MeshLambertMaterial();
        material.map=buildingTexture;
        material.vertexColors=THREE.VertexColors;
        let sidewayMesh=new THREE.Mesh(sidewayGeometry,material);
        return sidewayMesh;

    }


    function createSquareBuildings() {
        //建立楼房
        let cityGeometry=new THREE.Geometry();

        for(let i=0;i<blockNumZ;i++){
            for(let j=0;j<blockNumX;j++){
                for(let k=0;k<blockDensity;k++){
                    //随机选取楼房初始坐标
                    buildingMesh.position.x=Math.floor((Math.random()-0.5)*(blockSizeX-buildingMaxW-roadW-sidewayW));//在-1000到1000之间
                    buildingMesh.position.z=Math.floor((Math.random()-0.5)*(blockSizeZ-buildingMaxD-roadD-sidewayD));

                    buildingMesh.position.x=buildingMesh.position.x+(j+0.5-blockNumX/2)*blockSizeX;
                    buildingMesh.position.z=buildingMesh.position.z+(i+0.5-blockNumZ/2)*blockSizeZ;
                    //console.log(buildingMesh.position);


                    //随机初始化楼房大小
                    buildingMesh.scale.x=Math.min(Math.random() * Math.random()* 5 + 10, buildingMaxW);
                    buildingMesh.scale.y=(Math.random() * Math.random() * Math.random() * buildingMesh.scale.x) * 3 + 8;
                    buildingMesh.scale.z=Math.min(buildingMesh.scale.x,buildingMaxD);

                    //随机初始化楼房的颜色
                    let value=1-Math.random()*Math.random();
                    let basicColor=new THREE.Color().setRGB(value+0.2*Math.random(),value,value+0.2*Math.random());

                    //逐面添加颜色
                    let geometry=buildingMesh.geometry;
                    for (let m=0, jmax=geometry.faces.length; m<jmax; m++){
                        geometry.faces[m].vertexColors = [basicColor, basicColor, basicColor];
                    }

                    //将楼房加入城市
                    buildingMesh.updateMatrix();
                    cityGeometry.merge(buildingMesh.geometry, buildingMesh.matrix);
                }
            }
        }
        let material=new THREE.MeshLambertMaterial();
        material.map=buildingTexture;
        material.vertexColors=THREE.VertexColors;
        let cityMesh=new THREE.Mesh(cityGeometry,material);
        return cityMesh;
    }
}


function generateTextureCanvas(){
    let canvas = document.createElement('canvas');
    canvas.width=16;
    canvas.height=32;
    var context=canvas.getContext( '2d' );
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, 32, 64);

    //画窗户
    for(let y=2;y<32;y+=2){
        for(let x=0;x<16;x+=2){
            var value=Math.floor(Math.random()*64);
            context.fillStyle='rgb('+[value,value,value].join(',')+')';
            context.fillRect(x,y,2,1);
        }
    }

    let canvas2=document.createElement('canvas');
    canvas2.width=512;
    canvas2.height=1024;
    var context=canvas2.getContext('2d');

    context.imageSmoothingEnabled=false;
    context.webkitImageSmoothingEnabled=false;
    context.mozImageSmoothingEnabled=false;

    context.drawImage(canvas,0,0,canvas2.width,canvas2.height);
    return canvas2;
}

const init = () => {
    const scene = create_scene()
    const camera = create_camera(scene)
    const renderer = create_renderer()
    const mouse_control = create_mouse_control(camera, renderer)
    let move_forward = false
    let move_back = false
    let move_right = false
    let move_left = false
    const on_resize = () => {
        camera.aspect = window.innerWidth / window.innerHeight
        camera.updateProjectionMatrix()
        renderer.setSize(window.innerWidth, window.innerHeight)
    }
    window.addEventListener('resize', on_resize, false)

    //
    let spotLight=new THREE.SpotLight(0xffffcc);
    spotLight.position.set(200, 150, 0);
    spotLight.castShadow=true;
    scene.add(spotLight);
    // 添加球体
    let geometry = new THREE.SphereGeometry( 5, 32, 32 );
    let material = new THREE.MeshBasicMaterial( {color: 0xCC0000} );
    let sphere = new THREE.Mesh( geometry, material );
    sphere.position.set(200, 150, 0);
    scene.add(sphere);

// 打开renderer开关
    renderer.shadowMap.enabled=true;
    renderer.shadowMap.type=THREE.PCFSoftShadowMap;
    camera.position.x = 0;
    camera.position.y = 50;
    camera.position.z = 30;
    const city=new ModernCity(renderer);
    city.castShadow=true;
    city.receiveShadow=true;
    scene.add(city);

    camera.position.z = 30
    let updateFcts = [];
    const controls = new Control(camera);
    controls.movementSpeed = 10;
    controls.lookSpeed = 0.05;
    controls.lookVertical = true;
    updateFcts.push(function(delta, now) {controls.update(delta)});
    updateFcts.push(() => {
        renderer.render(scene, camera)
        mouse_control.update()
    });
    let lastTimeMsec = null;
    requestAnimationFrame(function animate(nowMsec) {
        requestAnimationFrame(animate);
        lastTimeMsec = lastTimeMsec || nowMsec - 1000 / 60;
        let deltaMsec = Math.min(200, nowMsec - lastTimeMsec);
        lastTimeMsec = nowMsec;
        updateFcts.forEach(function(updateFn) {updateFn(deltaMsec / 1000, nowMsec / 1000)});
    });
}