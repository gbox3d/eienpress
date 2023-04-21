import * as THREE from 'three';

import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { DragControls } from 'three/addons/controls/DragControls.js';

import Elvis from 'evlis';

import ObjectMngSetup from 'ideon/elvisPlugins/objMng.js';

export default async function ({
    container,
    window_size,
    cameraPosition = new THREE.Vector3(0, 0, 10),
    cameraTarget = new THREE.Vector3(),
    // cameraFov = 90,
    cameraNear = -256, cameraFar = 256,
    isGrid = true,
    onUpdate
}) {

    console.log(`objectViewer version 1.0.0`);
    console.log(`THREE version ${THREE.REVISION}`);
    console.log(`elvis version ${Elvis.version}`);

    // const _HDRILoader = envMapFileFormat === 'exr' ? new EXRLoader() : new RGBELoader();

    let bEnableKeyInput = true;
    let keyStates = [];

    // let container, stats;
    let camera, scene, raycaster, renderer;

    let theta = 0;
    let INTERSECTED;

    const pointer = new THREE.Vector2();
    const radius = 500;
    const frustumSize = 1000;
    // const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const aspect = window_size.width / window_size.height;
    camera = new THREE.OrthographicCamera(frustumSize * aspect / - 2, frustumSize * aspect / 2, frustumSize / 2, frustumSize / - 2, -256, 256);

    camera.position.set(0, 0, 10);
    camera.lookAt(0, 0, 0);

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);



    raycaster = new THREE.Raycaster();

    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window_size.width, window_size.height);
    container.appendChild(renderer.domElement);

    //오빗컨트롤
    //카메라의 현재 위치 기준으로 시작한다.
    const orbitControl = new OrbitControls(camera, renderer.domElement);
    orbitControl.target.set(0, 0, 0);
    orbitControl.enableRotate = false; // 회전 비활성화
    orbitControl.update();
    // scope.orbitControl = orbitControl;

    //dummy object setup
    const root_dummy = new THREE.Group();
    scene.add(root_dummy);

    // const grid_helper = new THREE.GridHelper(5000, 50, 0x00ff00, 0xff0000);
    // scope.scene.add(grid_helper);

    // if (!isGrid) {
    //     grid_helper.visible = false;
    // }

    const geometry = new THREE.PlaneGeometry(128, 128, 1);
    const material = new THREE.MeshBasicMaterial();

    const planeImage = new THREE.Mesh(geometry, material);
    root_dummy.add(planeImage);

    //label point dummy
    const labelPointDummy = new THREE.Group();
    root_dummy.add(labelPointDummy);

    // DragControls 초기화
    const dragControls = new DragControls(labelPointDummy.children, camera, renderer.domElement);

    // 드래그 이벤트 리스너
    dragControls.addEventListener('dragstart', function (event) {
        orbitControl.enabled = false;
    });

    dragControls.addEventListener('dragend', function (event) {
        orbitControl.enabled = true;

        console.log(event.object.position);

        // 3D 위치를 2D 화면 좌표로 변환
        const screenPosition = new THREE.Vector3();
        screenPosition.copy(event.object.position);
        screenPosition.project(camera);
        console.log('Screen position:', screenPosition.x, screenPosition.y);

        // NDC (Normalized Device Coordinates)를 화면 픽셀 좌표로 변환
        const containerElement = container;
        const containerRect = containerElement.getBoundingClientRect();
        const x = (screenPosition.x * 0.5 + 0.5) * containerElement.clientWidth + containerRect.left;
        const y = (-(screenPosition.y * 0.5) + 0.5) * containerElement.clientHeight + containerRect.top;

        console.log('Screen client position:', x, y);

        


    });



    // const objMng = await ObjectMngSetup({
    //     scope: scope
    // });

    function onPointerMove(event) {

        const containerElement = container;

        const containerRect = containerElement.getBoundingClientRect();

        // 컨테이너의 위치를 고려하여 마우스 좌표를 계산합니다.
        const clientX = event.clientX - containerRect.left;
        const clientY = event.clientY - containerRect.top;

        // 마우스 좌표를 NDC (Normalized Device Coordinates)로 변환합니다.
        pointer.x = (clientX / containerElement.clientWidth) * 2 - 1;
        pointer.y = -(clientY / containerElement.clientHeight) * 2 + 1;

        // console.log(pointer);

    }

    function onPointerDown(event) {

        const containerElement = container;

        const containerRect = containerElement.getBoundingClientRect();

        // 컨테이너의 위치를 고려하여 마우스 좌표를 계산합니다.
        const clientX = event.clientX - containerRect.left;
        const clientY = event.clientY - containerRect.top;

        // 마우스 좌표를 NDC (Normalized Device Coordinates)로 변환합니다.
        pointer.x = (clientX / containerElement.clientWidth) * 2 - 1;
        pointer.y = -(clientY / containerElement.clientHeight) * 2 + 1;

        // find intersections
        if (event.button == 0) {
            raycaster.setFromCamera(pointer, camera);

            // raycaster.setFromCamera(pointer, camera);

            const label_intersects = raycaster.intersectObjects(labelPointDummy.children, false);

            if (label_intersects.length > 0) {
                console.log(label_intersects[0].object);
            } else {

                const intersects = raycaster.intersectObject(planeImage, false);

                if (intersects.length > 0) {

                    console.log(intersects[0].object);

                    const intersectionPoint = intersects[0].point;

                    // 구 생성 및 위치 설정
                    const sphereGeometry = new THREE.SphereGeometry(8, 8, 8);
                    const sphereMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
                    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);

                    // intersectionPoint.z = 8;

                    sphere.position.copy(intersectionPoint);
                    labelPointDummy.add(sphere);

                }
            }
        }


    }

    //

    function animate() {

        requestAnimationFrame(animate);
        render();

    }

    function render() {

        // theta += 0.1;

        // camera.position.x = radius * Math.sin(THREE.MathUtils.degToRad(theta));
        // camera.position.y = radius * Math.sin(THREE.MathUtils.degToRad(theta));
        // camera.position.z = radius * Math.cos(THREE.MathUtils.degToRad(theta));
        // camera.lookAt(scene.position);
        camera.updateMatrixWorld();

        // find intersections



        renderer.render(scene, camera);
    }

    document.addEventListener('pointermove', onPointerMove);

    document.addEventListener('pointerdown', onPointerDown);

    return {
        elvis: {
            camera: camera,
            scene: scene,
            renderer: renderer
        },
        startRenderer: () => {
            animate();
        },
        // objMng: objMng,
        changeTexture: async ({
            repo_ip, textureFile
        }) => {

            let loader = new THREE.TextureLoader();

            const texture = await new Promise((resolve, reject) => {
                loader.load(`${repo_ip ? repo_ip : ''}/com/file/download/pub/${textureFile}`, function (texture) {
                    resolve(texture);
                },
                    function (xhr) {
                        onProgress ? onProgress({
                            name: textureFile,
                            progress: (xhr.loaded / xhr.total * 100)
                        }) : null;
                    }
                    ,
                    err => {
                        console.log(err);
                        return reject(err);
                    }
                );
            })

            // Dispose the old texture
            if (planeImage.material.map) {
                planeImage.material.map.dispose();
            }
            planeImage.material.map = texture;
            planeImage.material.needsUpdate = true;

            planeImage.scale.set(texture.image.width / 128, texture.image.height / 128, 1);

        },

        resetCamera: function () {
            scope.camera.position.set(0, 100, 200);
            scope.camera.lookAt(0, 0, 0);
        },
        getEnableKeyInput: function () {
            return bEnableKeyInput;
        },
        setEnableKeyInput: function (bEnable) {
            bEnableKeyInput = bEnable;
        },
        getKeyStates: function (keyCode) {
            return keyStates[keyCode];
        }
    }

}

