<script>
  import * as THREE from "three";
  import { OrbitControls } from "three/addons/controls/OrbitControls.js";
  import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
  import { GUI } from "dat.gui";
  import isUserUsingMobile from "./utils/CheckDevice";
  import Header from "./Header.svelte";
  import AddLights from "./utils/AddLights";
  let camera, scene, renderer, controls;
  const isMobile = isUserUsingMobile();

  let meshes = [];
  let mouseX = 0;
  let mouseY = 0;
  const mouseSpeed = 0.005;
  const dampingFactor = 0.1;
  const meshnames = [];
  let position = [0.7, -0.9, 11];
  if (isMobile) position = [0, -0.5, 10];

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

    function addPieceToWorldFromModel(model) {
      if (meshnames.find((mesh) => mesh === model.name) === undefined) {
        const mesh = new THREE.Mesh(model.geometry, model.material);
        mesh.position.set(...position);
        mesh.scale.set(3.75, 3.75, 3.75);
        mesh.rotation.set(0, 0, 0);
        meshnames.push(model.name);
        meshes.push(mesh);
        scene.add(mesh);
      }
    }

    //adds the contact background model
    if (!isMobile) {
      const bgloader = new GLTFLoader();
      bgloader.load(`assets/contact.glb`, function (gltf) {
        gltf.scene.traverse(function (child) {
          let mesh = new THREE.Mesh(
            child.geometry,
            new THREE.MeshStandardMaterial({
              color: 0x141414,
            })
          );
          isMobile ? mesh.position.set(-2.7, -0.3, 0) : mesh.position.set(-2.6, -0.2, 3);
          isMobile ? mesh.scale.set(0.7, 0.7, 0.7) : mesh.scale.set(1, 1, 1);
          mesh.rotation.set(0, 0, 0);
          bgmesh = mesh;
          scene.add(mesh);
        });
      });
    }

    /*     if (isMobile) {
      const bgloader2 = new GLTFLoader();
      bgloader2.load(`assets/contact.glb`, function (gltf) {
        gltf.scene.traverse(function (child) {
          let mesh = new THREE.Mesh(
            child.geometry,
            new THREE.MeshStandardMaterial({
              color: 0x141414,
            })
          );
          mesh.position.set(-0.9, 0.6, 0);
          mesh.scale.set(0.7, 0.7, 0.7);
          mesh.rotation.set(0, 0, 0);
          scene.add(mesh);
        });
      });
    } */
    const model = isMobile ? "rook" : "bishop";
    //loads the piece model
    const loader = new GLTFLoader();
    loader.load(`assets/${model}.glb`, function (gltf) {
      gltf.scene.traverse(function (child) {
        if (child.name == `${model}_eye`) {
          addPieceToWorldFromModel(child);
        } else {
          let ogmodel = gltf.scene.children.find((mesh) => mesh.name === `${model}`);
          let model1 = ogmodel.children[0];
          let model2 = ogmodel.children[1];
          addPieceToWorldFromModel(model1);
          addPieceToWorldFromModel(model2);
        }
      });

      render();
    });

    const lights = AddLights(false, true);
    scene.add(...lights);

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
    !isMobile && document.addEventListener("mousemove", onDocumentMouseMove);
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
    //the piece follows the mouse

    renderer.render(scene, camera);
  }

  let back = false;
  function animate() {
    controls.update();
    if (isMobile) {
      if (meshes.length > 0) {
        meshes.forEach((mesh) => {
          if (mesh.rotation.y > 0.2) {
            back = true;
          } else if (mesh.rotation.y < -0.2) {
            back = false;
          }

          if (back) {
            mesh.rotation.y -= 0.002;
          } else {
            mesh.rotation.y += 0.002;
          }
        });
      }
    } else {
      targetX = (mouseX / 5 - 200) * mouseSpeed;
      targetY = (mouseY / 10 - 50) * mouseSpeed;
      if (meshes.length > 0) {
        meshes.forEach((mesh) => {
          mesh.rotation.x += dampingFactor * (targetY - mesh.rotation.x);
          if (mouseX > 180) {
            mesh.rotation.y += dampingFactor * (targetX - mesh.rotation.y);
          } else {
            mesh.rotation.y += dampingFactor * (targetX - mesh.rotation.y);
          }
        });
      }
    }

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }

  animate();
</script>

<main>
  <Header {isMobile} />
  <div>
    <span>
      <p>Modelling & UI by&nbsp;</p>
      <p class="bold">Adrienn Kovács</p>
      <a href="https://www.behance.net/adriennkovcs2" target="_blank"><img src="behance.svg" alt="behance" /></a>
    </span>
    <span>
      <p>Developed by&nbsp;</p>
      <p class="bold">Lóránt Sutus</p>
      <a href="https://github.com/SLorant" target="_blank"><img src="github.svg" alt="github" /></a></span
    >
  </div>

  <canvas id="bg"></canvas>
</main>

<style>
  div {
    position: absolute;
    bottom: 30%;
    left: 30%;
    z-index: 50;
    font-family: "Fredoka", sans-serif;
    text-decoration: none !important;
    color: #3a3a3a;
    font-weight: 400;
    font-size: 18px;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .bold {
    font-weight: 500;
  }
  span {
    display: flex;
    justify-content: start;
    place-items: center;
    height: 30px;
  }

  img {
    margin-left: 10px;
    height: 30px;
    width: 30px;
    margin-top: 4px;
  }
  main {
    position: absolute;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
  }
  canvas {
    position: absolute;
    top: 0;
    left: 0;
  }
  @media screen and (max-width: 768px) {
    div {
      bottom: 10%;
      left: 12%;
    }
    span {
      justify-content: center;
    }
  }
</style>
