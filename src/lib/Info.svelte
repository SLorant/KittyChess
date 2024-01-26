<script>
  import * as THREE from "three";
  import { OrbitControls } from "three/addons/controls/OrbitControls.js";
  import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
  import { GUI } from "dat.gui";
  let camera, scene, renderer, controls;
  let meshes = [];
  let mouseX = 0;
  let mouseY = 0;
  const meshnames = [];

  let targetX = 0;
  let targetY = 0;
  const windowHalfX = window.innerWidth / 2;
  const windowHalfY = window.innerHeight / 2;
  init();
  render();
  let bgmesh;

  function init() {
    camera = new THREE.PerspectiveCamera(15, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, 0, 15.5);
    camera.rotation.set(0, 0, 0);

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xe7e7e7);

    const material = new THREE.MeshPhysicalMaterial({
      color: 0x79e0e8,
      transmission: 1,
      transparent: true,

      thickness: 0.5,
      roughness: 0.32,
      envMapIntensity: 0,
      clearcoat: 1,
      clearcoatRoughness: 1,
    });

    function addPieceToWorldFromModel(model) {
      if (meshnames.find((mesh) => mesh === model.name) === undefined) {
        const mesh = new THREE.Mesh(model.geometry, model.material);
        mesh.position.set(...positions[0]);
        mesh.scale.set(3.75, 3.75, 3.75);
        mesh.rotation.set(0, 0, 0);
        meshnames.push(model.name);
        meshes.push(mesh);
        scene.add(mesh);
      }
    }
    /*new THREE.MeshBasicMaterial({
                color: 0x414141,
              })*/
    const loader2 = new GLTFLoader();
    loader2.load(`background.glb`, function (gltf) {
      gltf.scene.traverse(function (child) {
        let mesh = new THREE.Mesh(
          child.geometry,
          new THREE.MeshStandardMaterial({
            color: 0x141414,
          })
        );
        mesh.position.set(0, -0.1, 2);
        mesh.scale.set(1.6, 1.6, 1.6);
        mesh.renderOrder = 5;
        mesh.rotation.set(0, 0, 0);
        bgmesh = mesh;
        scene.add(mesh);
      });
    });

    const pieces = ["rook", "pawn", "knight", "king"];
    const positions = [[1.5, -1.2, 4]];

    const loader = new GLTFLoader();
    loader.load(`bishop.glb`, function (gltf) {
      gltf.scene.traverse(function (child) {
        if (child.name == `bishop_eye`) {
          addPieceToWorldFromModel(child);
        } else {
          let ogmodel = gltf.scene.children.find((mesh) => mesh.name === "bishop");
          let model = ogmodel.children[0];
          addPieceToWorldFromModel(model);
        }
      });

      render();
    });

    const pointLight = new THREE.DirectionalLight(0xffffff);
    pointLight.position.set(5, 5, 5);
    pointLight.intensity = 3;

    const pointLight3 = new THREE.DirectionalLight(0xffffff);
    pointLight3.position.set(0, 2, 10);
    pointLight3.intensity = 1;

    const pointLight2 = new THREE.DirectionalLight(0x85f0ff);
    pointLight2.position.set(-5, 3, 5);
    pointLight2.intensity = 5;

    const pointLight4 = new THREE.DirectionalLight(0xffffff);
    pointLight4.position.set(0, -3, 10);

    const pointLight5 = new THREE.PointLight(0xffffff);
    pointLight5.position.set(0, 0, -1);
    pointLight5.intensity = 30;

    scene.add(pointLight, pointLight2, pointLight3, pointLight4, pointLight5);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    controls = new OrbitControls(camera, renderer.domElement);
    controls.addEventListener("change", render);
    controls.target.set(0, 2, 0);
    // to disable zoom
    controls.enableZoom = false;

    // to disable rotation
    controls.enableRotate = false;
    // to disable pan
    controls.enablePan = false;
    controls.update();

    window.addEventListener("resize", onWindowResize);
    document.addEventListener("mousemove", onDocumentMouseMove);
  }

  function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    camera.rotation.set(0, 0, 0);
    renderer.setSize(window.innerWidth, window.innerHeight);
    render();
  }
  function onDocumentMouseMove(event) {
    mouseX = event.clientX - windowHalfX;
    mouseY = event.clientY - windowHalfY;
  }
  function render() {
    camera.rotation.set(0, 0, 0);

    targetX = mouseX * 0.001;
    targetY = mouseY * 0.001;

    if (meshes.length > 1) {
      meshes[0].rotation.x += 0.02 * (targetY - bgmesh.rotation.x);
      meshes[0].rotation.y += 0.02 * (targetX - bgmesh.rotation.y);
      meshes[1].rotation.x += 0.02 * (targetY - bgmesh.rotation.x);
      meshes[1].rotation.y += 0.02 * (targetX - bgmesh.rotation.y);
    }
    renderer.render(scene, camera);
  }

  function animate() {
    controls.update();
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }

  animate();
  //2A3739
</script>

<main>
  <div>
    <a href="/">HOME</a>
    <a href="pieces">PIECES</a>
    <a href="info">INFO</a>
  </div>
  <canvas id="bg"></canvas>
</main>

<style>
  div {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 50;
    width: 100vw;
    height: 30px;
    gap: 200px;
    margin-top: 20px;
    display: flex;
    justify-content: center;
    place-items: center;
    color: #3a3a3a;
    text-align: center;
    font-family: "Baloo 2", sans-serif;
    font-size: 18px;
    font-weight: 600;
  }
  a {
    font-family: "Baloo 2", sans-serif;
    text-decoration: none !important;
    color: #3a3a3a;
  }
  main {
    position: absolute;
    top: 0;
    left: 0;
  }
  canvas {
    position: absolute;
    top: 0;
    left: 0;
  }
</style>
