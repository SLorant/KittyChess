<script>
  import * as THREE from "three";
  import { OrbitControls } from "three/addons/controls/OrbitControls.js";
  import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
  import Header from "./Header.svelte";
  import isUserUsingMobile from "./utils/CheckDevice";
  import AddLights from "./utils/AddLights";
  import SvelteSeo from "svelte-seo";
  import App from "../App.svelte";
  import ElasticDot from "./utils/ElasticDot.svelte";

  let loading = true;

  let loadedModels = 0;
  let camera, scene, renderer, controls;
  let meshes = [];
  const meshnames = [];
  let mouseX = 0;
  let mouseY = 0;
  let targetX = 0;
  let targetY = 0;
  const rotationspeed = 0.005;
  const windowHalfX = window.innerWidth / 2;
  const windowHalfY = window.innerHeight / 2;
  let bgmesh;
  const isMobile = isUserUsingMobile();

  init();
  render();

  function compareMeshes(mesh1, mesh2) {
    if (mesh1.position.x < mesh2.position.x) {
      return -1;
    } else if (mesh1.position.x > mesh2.position.x) {
      return 1;
    } else {
      return 0;
    }
  }

  function init() {
    camera = new THREE.PerspectiveCamera(15, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, 0, 15.5);
    camera.rotation.set(0, 0, 0);
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xe7e7e7);

    const material = new THREE.MeshPhysicalMaterial({
      color: 0x8bf7ff,
      transmission: 1,
      transparent: true,
      thickness: 0.5,
      roughness: 0.32,
      envMapIntensity: 0,
      clearcoat: 1,
      clearcoatRoughness: 1,
    });

    const manager = new THREE.LoadingManager();
    manager.onStart = function (url, itemsLoaded, itemsTotal) {
      console.log("Started loading file: " + url + ".\nLoaded " + itemsLoaded + " of " + itemsTotal + " files.");
    };
    manager.onLoad = function () {
      console.log("Loading complete!");
      loading = false;
      scene.add(...meshes);
    };
    manager.onProgress = function (url, itemsLoaded, itemsTotal) {
      console.log("Loading file: " + url + ".\nLoaded " + itemsLoaded + " of " + itemsTotal + " files.");
    };
    manager.onError = function (url) {
      console.log("There was an error loading " + url);
    };

    function addPieceToWorldFromModel(model, index, isEye) {
      if (meshnames.find((mesh) => mesh === model.name) === undefined) {
        if (model.name === "pawn_eye") isEye = true;

        const isTransparent = isEye ? false : materials[index];
        const mesh = new THREE.Mesh(model.geometry, isTransparent ? material : model.material);

        if (model.name === "king_eye" || model.name === "king") {
          isMobile ? mesh.scale.set(4, 4, 4) : mesh.scale.set(4.25, 4.25, 4.25);
        } else {
          isMobile ? mesh.scale.set(3.5, 3.5, 3.5) : mesh.scale.set(3.75, 3.75, 3.75);
        }

        mesh.position.set(...positions[index]);
        mesh.rotation.set(0, 0, 0);
        meshes.push(mesh);
        meshnames.push(model.name);
        //scene.add(mesh);
      }
    }

    // Background mesh loader
    const bgLoader = new GLTFLoader();
    const bg = isMobile ? "assets/bg_phone.glb" : "assets/background.glb";
    bgLoader.load(`${bg}`, function (gltf) {
      gltf.scene.traverse(function (child) {
        let mesh = new THREE.Mesh(
          child.geometry,
          new THREE.MeshStandardMaterial({
            color: 0x141414,
          })
        );
        isMobile ? mesh.position.set(0, 0.1, 2) : mesh.position.set(0, -0.1, 2);
        isMobile ? mesh.scale.set(0.7, 0.7, 0.7) : mesh.scale.set(1.6, 1.6, 1.6);
        mesh.rotation.set(0, 0, 0);
        bgmesh = mesh;
        scene.add(mesh);
      });
    });

    let pieces = ["rook", "pawn", "knight", "king"];
    let positions = [
      [-1.5, 0.8, 4],
      [-2, -1, 4],
      [1, -0.2, 4],

      [2, 0.8, 0],
    ];
    let materials = [true, false, true, false];
    if (isMobile) {
      pieces = ["knight", "king"];
      positions = [
        [0, 0.8, 3],
        [0, -1, 0],
      ];
      materials = [true, false];
    }

    for (let i = 0; i < pieces.length; i++) {
      let piece = pieces[i];

      const loader = new GLTFLoader(manager);
      // loads the pieces one by one, meshes are a bit confusing so manual intervention is needed
      loader.load(`assets/${piece}.glb`, function (gltf) {
        gltf.scene.traverse(function (child) {
          if (child.name == `${piece}_eye` || child.name == "pawn") {
            addPieceToWorldFromModel(child, i, true);
          } else if (child.name == "pawn") {
            let model = child.children[0];
            addPieceToWorldFromModel(model, i, true);
          } else if (piece == "king" || piece == "knight") {
            let model = gltf.scene.children.find((mesh) => mesh.name === piece);
            addPieceToWorldFromModel(model, i, false);
          } else {
            let ogmodel = gltf.scene.children.find((mesh) => mesh.name === piece);
            let model = ogmodel.children[0];
            addPieceToWorldFromModel(model, i, false);
            if (piece == "rook") {
              let model2 = ogmodel.children[1];
              addPieceToWorldFromModel(model2, i, false);
            }
          }
        });
      });
    }

    const lights = AddLights(true, false, isMobile);
    scene.add(...lights);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    controls = new OrbitControls(camera, renderer.domElement);
    controls.addEventListener("change", render);
    controls.target.set(0, 2, 0);
    //disable camera handling
    controls.enableZoom = false;
    controls.enableRotate = false;
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

    renderer.render(scene, camera);
  }

  const mousedir = { x: 1, y: 1 };
  const knightdir = { x: 1, y: 1 };
  const rookdir = { x: 1, y: 1 };
  const kingdir = { x: 1, y: 1 };

  const pawngroup = new THREE.Group();
  const knightgroup = new THREE.Group();
  const rookgroup = new THREE.Group();
  const kinggroup = new THREE.Group();

  // adds the pieces to groups, because the eyes and body are different pieces
  // and when moving, the whole group needs to move
  function addToGroup(group, index, rook) {
    if (group.children.length < 1) {
      group.add(meshes[index]);
      group.add(meshes[index + 1]);
      if (rook) {
        group.add(meshes[index + 2]);
      }
      scene.add(group);
    }
  }

  function move(group, dir, speed, left) {
    if (left) group.position.x -= 0.00025 * dir.x * speed;
    else group.position.x += 0.00025 * dir.x * speed;

    group.position.y -= 0.001 * dir.y * speed;
    if (isMobile) {
      if (group.position.x > 0.3 || group.position.x < -0.3) {
        dir.x *= -1;
      }
      if (group.position.y > 0.5 || group.position.y < -0.3) {
        dir.y *= -1;
      }
    } else {
      if (group.position.x > 1 || group.position.x < -1.2) {
        dir.x *= -1;
      }
      if (group.position.y > 0.5 || group.position.y < -0.3) {
        dir.y *= -1;
      }
    }
  }
  function updateRotation(axis) {
    if (bgmesh.rotation[axis] < 0.2 && bgmesh.rotation[axis] > -0.2) {
      bgmesh.rotation[axis] += 0.002 * (targetX - bgmesh.rotation[axis]) * (1 - bgmesh.rotation[axis]);
    } else {
      bgmesh.rotation[axis] -= 0.002 * (targetX + bgmesh.rotation[axis]) * (1 - bgmesh.rotation[axis]);
    }
  }

  function animate() {
    if (meshes.length > 8) {
      if (meshnames[2] !== "rook_1") {
        meshes = meshes.sort(compareMeshes);
        meshnames[2] = "rook_1";
      }

      targetX = mouseX * 0.001;
      targetY = mouseY * 0.001;
      updateRotation("x");
      updateRotation("y");

      addToGroup(pawngroup, 0, false);
      addToGroup(knightgroup, 2, true);
      addToGroup(rookgroup, 5, false);
      addToGroup(kinggroup, 7, false);

      move(pawngroup, mousedir, 2, true);
      move(knightgroup, rookdir, 1.5);
      move(rookgroup, knightdir, 0.5);
      move(kinggroup, kingdir, 1);

      meshes[0].rotation.x += rotationspeed;
      meshes[1].rotation.x += rotationspeed;
      meshes[0].rotation.y += rotationspeed;
      meshes[1].rotation.y += rotationspeed;

      meshes[2].rotation.z += rotationspeed;
      meshes[3].rotation.z += rotationspeed;
      meshes[4].rotation.z += rotationspeed;

      meshes[5].rotation.y += rotationspeed;
      meshes[6].rotation.y += rotationspeed;

      meshes[5].rotation.z -= 0.003;
      meshes[6].rotation.z -= 0.003;

      meshes[7].rotation.z -= rotationspeed;
      meshes[8].rotation.z -= rotationspeed;
    } else if (isMobile) {
      if (meshes.length > 3) {
        if (meshnames[2] !== "rook_1") {
          meshes = meshes.sort(compareMeshes);
          meshnames[2] = "rook_1";
        }
        addToGroup(pawngroup, 0, false);

        move(pawngroup, mousedir, 2, true);

        meshes[0].rotation.z -= rotationspeed;
        meshes[1].rotation.z -= rotationspeed;

        addToGroup(knightgroup, 2, false);
        move(knightgroup, rookdir, 1.5);
        meshes[2].rotation.y += 0.002;
        meshes[3].rotation.y += 0.002;
      }
    }
    controls.update();
    requestAnimationFrame(animate);
  }

  animate();
</script>

<SvelteSeo
  title="KITTY CHESS"
  description="Showcase website of the coolest chess set you've ever seen."
  canonical="https://kittychess.netlify.app/"
  keywords="cat, chess, chess pieces, 3d, art, design"
  openGraph={{
    title: "KITTY CHESS",
    description: "Showcase website of the coolest chess set you've ever seen.",
    image: "https://kittychess.netlify.app/cover.webp",
    url: "https://kittychess.netlify.app/",
    type: "website",
    images: [
      {
        url: "https://kittychess.netlify.app/cover.webp",
        width: 1000,
        height: 750,
        alt: "Landing",
      },
    ],
    site_name: "KITTY CHESS",
  }}
  twitter={{
    card: "summary_large_image",
    site: "@kittychess",
    title: "KITTY CHESS",
    description: "Showcase website of the coolest chess set you've ever seen.",
    image: "https://kittychess.netlify.app/cover.webp",
  }}
/>
<main>
  <Header {isMobile} />

  {#if loading}
    <div class="loading-screen">
      <ElasticDot />
    </div>
  {:else}
    <canvas id="bg"></canvas>
  {/if}
</main>

<style>
  .loading-screen {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: #e7e7e7;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 24px;
    z-index: 100;
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
