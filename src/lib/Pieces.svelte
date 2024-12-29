<script>
  import * as THREE from "three";
  import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
  import Buttons from "./Buttons.svelte";
  import MaterialChanger from "./MaterialChanger.svelte";
  import isUserUsingMobile from "./utils/CheckDevice";
  import Header from "./Header.svelte";
  import AddLights from "./utils/AddLights";
  import ElasticDot from "./utils/ElasticDot.svelte";

  let camera, scene, renderer;
  let meshes = [];
  let meshnames = [];
  let whitematerial;
  let material;
  let currentPiece;
  let currentMaterial;
  let bgmeshes = [];
  const pieces = ["king", "queen", "bishop", "knight", "rook", "pawn"];
  let position = [0, 2.1, 0];
  let loading = true;
  const clock = new THREE.Clock()
  let rotationSpeed = 0.01;
  let isDragging = false;
  let isDecelerating = false;
  let decelerationDirection = { x: 0, y: 0 };
  let initialPosition = { x: 0, y: 0 };

  const isMobile = isUserUsingMobile();
  const bgcount = isMobile ? 1 : 3;

  if (isMobile) position = [0, 2.3, 0];

  const manager = new THREE.LoadingManager();

  function addPieceToWorldFromModel(model, isEye, first) {
    if (meshes.length < 5 && meshnames.find((mesh) => mesh === model.name) === undefined) {
      if (model.name === "pawn_eye") isEye = true;
      if (first && model.name === "king") isEye = true;
      const isTransparent = !isEye;
      const mesh = new THREE.Mesh(model.geometry, isTransparent ? currentMaterial : model.material);
      mesh.position.set(...position);

      //Mesh sizes are varied, device and piece matters too
      if (model.name === "pawn_eye" || model.name == "pawn") {
        isMobile ? mesh.scale.set(3.2, 3.2, 3.2) : mesh.scale.set(4, 4, 4);
      } else if (model.name === "king" || model.name == "king_eye") {
        isMobile ? mesh.scale.set(2.5, 2.5, 2.5) : mesh.scale.set(3.1, 3.1, 3.1);
      } else isMobile ? mesh.scale.set(2.7, 2.7, 2.7) : mesh.scale.set(3.3, 3.3, 3.3);

      mesh.rotation.set(0, 0, 0);
      mesh.name = model.name;

      if (scene.children.length < 12) {
        meshes.push(mesh);
        meshnames.push(model.name);
      }
    }
  }

  const loadBgModel = (piece) => {
    for (let i = 0; i < bgcount; i++) {
      const loader = new GLTFLoader(manager);
      loader.load(`assets/bg_${piece}.glb`, function (gltf) {
        let child = gltf.scene.children[0];
        child.material = new THREE.MeshStandardMaterial({
          color: 0x141414,
        });
        isMobile ? child.position.set(-0.6, 2.2, -2) : child.position.set(-5.5 + i * 4.1, 1.8, -2);
        isMobile ? child.scale.set(0.7, 0.7, 0.7) : child.scale.set(1, 1, 1);
        child.rotation.set(1.7, 0, 0);
        child.name = "bg" + i;
        if (bgmeshes.length < bgcount) {
          bgmeshes.push(child);
        }
      });
    }
  };

  const loadGltf = (piece, first) => {
    let rotationBefore;

    if (meshes.length > 1) {
      const pieceParts = meshes.slice(0, 4).map((mesh) => scene.getObjectByName(mesh.name));
      const isBishop = piece === "bishop" && pieceParts[0].name === "Cube016";
      const isQueen = piece === "queen" && pieceParts[0].name === "Cylinder003";

      if (!pieceParts[0].name.includes(piece) && !isBishop && !isQueen) {
        let initialRotation = pieceParts[0].rotation.clone();
        let targetRotation = new THREE.Euler(Math.PI * 1.5, 0, 0);
        let startTime = Date.now();

        function rotateAndRemove() {
          let currentTime = Date.now();
          let elapsed = (currentTime - startTime) / 1000; // Convert milliseconds to seconds

          if (elapsed < 1) {
            // Rotate for 1 second
            let t = elapsed; /* / 1; */
            pieceParts.forEach((model) => {
              model.rotation.x = THREE.MathUtils.lerp(initialRotation.x, targetRotation.x, t);
            });

            requestAnimationFrame(rotateAndRemove);
          } else if (meshes.length < 5) {
            if (bgmeshes.length > bgcount - 1) {
              scene.remove(...bgmeshes);
              bgmeshes = [];
            }

            loadBgModel(piece);
            rotationBefore = pieceParts[0].rotation;
            // Rotation complete, now remove the object
            pieceParts.forEach((model) => scene.remove(model));

            if (piece === "queen") {
              meshes = meshes.filter((mesh) => mesh.name.includes("Cylinder003") || mesh.name.includes(piece));
              meshnames = meshnames.filter((mesh) => mesh.includes("Cylinder003") || mesh.includes(piece));
            } else if (piece === "bishop") {
              meshes = meshes.filter((mesh) => mesh.name.includes("Cube") || mesh.name.includes(piece));
              meshnames = meshnames.filter((mesh) => mesh.includes("Cube") || mesh.includes(piece));
            } else {
              meshes = meshes.filter((mesh) => mesh.name.includes(piece));
              meshnames = meshnames.filter((mesh) => mesh.includes(piece));
            }
            loadNewModel(piece);
          }
        }

        rotateAndRemove();
      }
    }

    const loadNewModel = (piece) => {
      currentPiece = piece;
      const loader = new GLTFLoader(manager);
      loader.load(`assets/${piece}.glb`, function (gltf) {
        gltf.scene.traverse(function (child) {
          if (child.name == `${piece}_eye`) {
            addPieceToWorldFromModel(child, true);
          } else if (piece == "king" || piece == "knight" || piece === "pawn") {
            let ogmodel = gltf.scene.children.find((mesh) => mesh.name === piece);
            whitematerial = ogmodel.material;
            if (first) currentMaterial = whitematerial;
            addPieceToWorldFromModel(ogmodel, false, first);
          } else {
            let ogmodel = gltf.scene.children.find((mesh) => mesh.name === piece);
            let model = ogmodel.children[0];
            addPieceToWorldFromModel(model, false, first);

            if (piece === "rook" || piece === "bishop") {
              let model2 = ogmodel.children[1];

              addPieceToWorldFromModel(model2, false, first);
            }
            if (piece === "queen") {
              let model2 = ogmodel.children[1];
              whitematerial = model2.material;
              let model3 = ogmodel.children[2];
              addPieceToWorldFromModel(model2, false);
              addPieceToWorldFromModel(model3, false);
            }
          }
        });

        // Set the initial rotation of the new model to be the same as the previous model
        let newPieceParts = meshes.slice(0, 4);
        if (rotationBefore) {
          newPieceParts.forEach((model) => (model.rotation.x = rotationBefore.x));
        }

        let initialRotation = newPieceParts[0].rotation.clone();
        let targetRotation = new THREE.Euler(0, 0, 0); // Target rotation is 0 position
        let startTime = Date.now();

        function rotateNewModel() {
          let currentTime = Date.now();
          let elapsed = (currentTime - startTime) / 1000; // Convert milliseconds to seconds

          if (elapsed < 1) {
            let t = elapsed; /* / 1; */
            newPieceParts.forEach((model) => {
              model.rotation.x = THREE.MathUtils.lerp(initialRotation.x, targetRotation.x, t);
            });
            requestAnimationFrame(rotateNewModel);
          }
        }
        if (!first) rotateNewModel();
      });
    };

    if (piece === "king" && first) {
      loadNewModel(piece);
    }

    if (first) {
      loadBgModel(piece);
    }
  };

  init();
  render();
  function init() {
    camera = new THREE.PerspectiveCamera(15, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, 2, 10.5);
    camera.rotation.set(0, 0, 0);
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xe7e7e7);

    manager.onLoad = function () {
      loading = false;
      scene.add(...meshes);
      scene.add(...bgmeshes);
    };

    material = new THREE.MeshPhysicalMaterial({
      color: 0x8bf7ff,
      transmission: 1,
      transparent: true,
      thickness: 0.5,
      roughness: 0.32,
      envMapIntensity: 0,
      clearcoat: 1,
      clearcoatRoughness: 1,
    });

    loadGltf(pieces[0], true);

    const lights = AddLights(false, false, isMobile);
    scene.add(...lights);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);

    document.body.appendChild(renderer.domElement);

    let previousPosition = {
      x: 0,
      y: 0,
    };

    function onMouseMove(event, isTouch) {
      const position = isTouch ? event.touches[0] : event;
      const deltaMove = {
        x: position.clientX - (isTouch ? initialPosition.x : previousPosition.x),
        y: position.clientY - (isTouch ? initialPosition.y : previousPosition.y),
      };
      if (isDragging) {
        rotationSpeed = 0.005; // Decelerate slightly while dragging
        meshes.forEach((mesh) => {
          mesh.rotation.x += (isTouch ? deltaMove.y / 40 : deltaMove.y) * rotationSpeed;
          mesh.rotation.y += (isTouch ? deltaMove.x / 10 : deltaMove.x) * rotationSpeed;
        });
      }
      previousPosition = {
        x: position.clientX,
        y: position.clientY,
      };
    }

    function onStart(event, isTouch) {
      const position = isTouch ? event.touches[0] : event;

      isDragging = true;
      initialPosition = {
        x: position.clientX,
        y: position.clientY,
      };
      if (isTouch) {
        previousPosition = {
          x: position.clientX,
          y: position.clientY,
        };
      }
    }

    function onEnd() {
      isDragging = false;
      isDecelerating = true;
      decelerationDirection = {
        x: previousPosition.x - initialPosition.x,
        y: previousPosition.y - initialPosition.y,
      };
    }

    if (isMobile) {
      document.addEventListener("touchmove", (event) => onMouseMove(event, true)), { passive: false };
      document.addEventListener("touchstart", (event) => onStart(event, true));
      document.addEventListener("touchend", onEnd);
    } else {
      document.addEventListener("mousemove", (event) => onMouseMove(event, false));
      document.addEventListener("mousedown", (event) => onStart(event, false));
      document.addEventListener("mouseup", onEnd);
    }

    window.addEventListener("resize", onWindowResize);
  }

  function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    camera.rotation.set(0, 0, 0);
    renderer.setSize(window.innerWidth, window.innerHeight);
    render();
  }

  function render() {
    renderer.render(scene, camera);
  }

  function animate() {
    const elapsedTime = clock.getElapsedTime()
    const fixedElapsedTime = Math.min(elapsedTime, 0.016);
    if (bgmeshes.length > bgcount - 1) {
      for (let i = 0; i < bgmeshes.length; i++) {
        if (bgmeshes[i].position.x < (isMobile ? -3.4 : -7.3)) {
          bgmeshes[i].position.x = isMobile ? 0.8 : 5;
        } else {
          bgmeshes[i].position.x -= 0.005;
        }
      }
    }
    if (!isDragging && isDecelerating) {
      rotationSpeed *= 1 - 0.02;
      meshes.forEach((mesh) => {
        mesh.rotation.x += decelerationDirection.y * rotationSpeed * (isMobile ? 1 : 2) * fixedElapsedTime;
        mesh.rotation.y += decelerationDirection.x * rotationSpeed * (isMobile ? 1 : 2) * fixedElapsedTime;
      }); 

      // If rotation speed is very small, stop decelerating
      if (rotationSpeed < (isMobile ? 0.0001 : 0.000001)) {
        isDecelerating = false;
      }
    }
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }

  animate();
</script>

<main>
  <Header {isMobile} />
  {#if loading}
    <div class="loading-screen">
      <ElasticDot />
    </div>
  {:else}
    <canvas id="bg"></canvas>
    <div class="options">
      <div class="pieceoptions">
        {#each pieces as piece}
          <Buttons on:click={() => loadGltf(piece)} {currentPiece} ownPiece={piece} {isMobile} />
        {/each}
      </div>
      <MaterialChanger bind:meshes bind:currentMaterial {whitematerial} {material} />
    </div>
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
  .options {
    position: absolute;
    bottom: 0;
    left: 0;
    z-index: 40;
    width: 100vw;
    height: 130px;
    display: flex;
    justify-content: center;
    place-items: center;
    flex-direction: column;
    margin-bottom: 40px;
  }
  .pieceoptions {
    height: 30px;
    gap: 40px;
    display: flex;
    justify-content: center;
    place-items: center;
    margin-bottom: 60px;
  }

  main {
    position: absolute;
    top: 0;
    left: 0;
    height: 100vh;
  }
  canvas {
    width: 100vw;
    height: 100vh;
    position: absolute;
    top: 0;
    left: 0;
  }

  @media screen and (max-width: 768px) {
    .pieceoptions {
      display: grid;
      grid-template-columns: auto auto auto;
      margin-bottom: 40px;
      height: auto;
      gap: 20px;
    }
    .options {
      height: auto;
      margin-bottom: 40px;
    }
  }
</style>
