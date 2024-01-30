<script>
  import * as THREE from "three";
  import { OrbitControls } from "three/addons/controls/OrbitControls.js";
  import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
  import { GUI } from "dat.gui";
  import Buttons from "./Buttons.svelte";
  import MaterialChanger from "./MaterialChanger.svelte";
  import * as TWEEN from "@tweenjs/tween.js";
  import { gsap, Power1 } from "gsap";
  import { TweenLite } from "gsap/gsap-core";

  let camera, scene, renderer, controls;
  let meshes = [];
  let meshnames = [];
  let whitematerial;
  let material;
  let currentPiece;
  let bgCamera, bgScene;
  let currentMaterial;
  let bgmeshes = [];
  const pieces = ["king", "queen", "bishop", "knight", "rook", "pawn"];
  const materials = [true, false, true, false, false, false, false];
  const positions = [
    [0, 2.1, 0],
    [-2, -1, 4],
    [1, -0.2, 4],

    [2, 0.8, 0],
  ];
  let rotationSpeed = 0.01;
  let isDragging = false;
  let isDecelerating = false;
  let decelerationDirection = { x: 0, y: 0 };
  let initialMouseDownPosition = { x: 0, y: 0 };

  const isMobile = () => {
    // User agent string method
    let isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    // Screen resolution method
    if (!isMobile) {
      let screenWidth = window.screen.width;
      let screenHeight = window.screen.height;
      isMobile = screenWidth < 768 || screenHeight < 768;
    }

    // Touch events method
    if (!isMobile) {
      isMobile = "ontouchstart" in window || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0;
    }

    // CSS media queries method
    if (!isMobile) {
      let bodyElement = document.getElementsByTagName("body")[0];
      isMobile = window.getComputedStyle(bodyElement).getPropertyValue("content").indexOf("mobile") !== -1;
    }

    return isMobile;
  };

  function addPieceToWorldFromModel(model, index, isEye, first) {
    if (meshes.length < 5 && meshnames.find((mesh) => mesh === model.name) === undefined) {
      if (model.name === "pawn_eye") isEye = true;
      if (first && model.name === "king") isEye = true;
      const isTransparent = !isEye;
      const mesh = new THREE.Mesh(model.geometry, isTransparent ? currentMaterial : model.material);
      mesh.position.set(...positions[index]);

      if (model.name === "pawn_eye" || model.name == "pawn") {
        mesh.scale.set(4, 4, 4);
      } else if (model.name === "king" || model.name == "king_eye") {
        mesh.scale.set(3.1, 3.1, 3.1);
      } else mesh.scale.set(3.3, 3.3, 3.3);

      mesh.rotation.set(0, 0, 0);
      mesh.name = model.name;

      console.log(scene.children);
      if (scene.children.length < 12) {
        meshes.push(mesh);
        meshnames.push(model.name);
        scene.add(mesh);
      }
    }
    // } else if (model.name === "pawn") {
    //   const mesh = new THREE.Mesh(model.geometry, isTransparent ? currentMaterial : model.material);
    //   mesh.position.set(...positions[index]);
    //   mesh.scale.set(3.75, 3.75, 3.75);
    //   mesh.rotation.set(0, 0, 0);
    //   mesh.name = model.name;
    //   meshes.push(mesh);
    //   meshnames.push(model.name);

    //   scene.add(mesh);
    // }
  }

  const loadGltf = (piece, first) => {
    let rotationBefore;
    let positionBefore;

    if (meshes.length > 1) {
      let selectedObject = scene.getObjectByName(meshes[0].name);

      const isBishop = piece === "bishop" && selectedObject.name === "Cube016";
      const isQueen = piece === "queen" && selectedObject.name === "Cylinder003";

      if (!selectedObject.name.includes(piece) && !isBishop && !isQueen) {
        let selectedObject2 = scene.getObjectByName(meshes[1].name);
        let selectedObject3;
        let selectedObject4;
        if (meshes.length > 2) {
          selectedObject3 = scene.getObjectByName(meshes[2].name);
          if (meshes.length > 3) selectedObject4 = scene.getObjectByName(meshes[3].name);
          //scene.remove(selectedObject3);
        }

        if (selectedObject !== undefined) {
          // bgmeshes[0].material.transparent = true;
          console.log(bgmeshes.length);

          // console.log(bgmeshes[0].opacity);

          let initialRotation = selectedObject.rotation.clone();
          let targetRotation = new THREE.Euler(Math.PI * 1.5, 0, 0); // You can adjust the target rotation
          let startTime = Date.now();

          function rotateAndRemove() {
            let currentTime = Date.now();
            let elapsed = (currentTime - startTime) / 1000; // Convert milliseconds to seconds

            if (elapsed < 1) {
              // Rotate for 1 second
              let t = elapsed / 1; // 1 is the duration of rotation
              selectedObject.rotation.x = THREE.MathUtils.lerp(initialRotation.x, targetRotation.x, t);
              selectedObject2.rotation.x = THREE.MathUtils.lerp(initialRotation.x, targetRotation.x, t);
              //selectedObject.rotation.y = THREE.MathUtils.lerp(initialRotation.y, targetRotation.y, t);
              if (selectedObject3 !== undefined) {
                selectedObject3.rotation.x = THREE.MathUtils.lerp(initialRotation.x, targetRotation.x, t);
              }
              if (selectedObject4 !== undefined) {
                selectedObject4.rotation.x = THREE.MathUtils.lerp(initialRotation.x, targetRotation.x, t);
              }
              selectedObject.rotation.z = THREE.MathUtils.lerp(initialRotation.z, targetRotation.z, t);
              requestAnimationFrame(rotateAndRemove);
            } else if (meshes.length < 5) {
              console.log(meshes);
              if (bgmeshes.length > 2) {
                scene.remove(bgmeshes[0]);
                scene.remove(bgmeshes[1]);
                scene.remove(bgmeshes[2]);
                bgmeshes = [];
              }

              for (let i = 0; i < 3; i++) {
                const loader2 = new GLTFLoader();
                loader2.load(`bg_${piece}.glb`, function (gltf) {
                  let child = gltf.scene.children[0]; // Assuming you have a single child in the GLTF scene
                  child.material = new THREE.MeshStandardMaterial({
                    color: 0x141414,
                    //transparent: true,
                  });
                  child.position.set(-5.5 + i * 4.1, 1.8, -2);
                  child.scale.set(1, 1, 1);
                  child.rotation.set(1.7, 0, 0);
                  child.name = "bg" + i;
                  console.log(scene.children);
                  if (bgmeshes.length < 3) {
                    console.log(bgmeshes);
                    scene.add(child);
                    bgmeshes.push(child);
                    //child.material.opacity = 0;
                    const fadeInDuration = 1; // Adjust the duration as needed
                    //gsap.to(child.material, { duration: 0.3, opacity: 1, ease: Power1.easeInOut });
                  }
                });
              }
              rotationBefore = selectedObject.rotation;
              positionBefore = selectedObject.position;
              // Rotation complete, now remove the object
              scene.remove(selectedObject);
              scene.remove(selectedObject2);
              if (selectedObject3 !== undefined) {
                scene.remove(selectedObject3);
              }
              if (selectedObject4 !== undefined) {
                scene.remove(selectedObject4);
              }
              meshes = meshes.filter((mesh) => mesh.name.includes(piece));
              meshnames = meshnames.filter((mesh) => mesh.includes(piece));
              loadNewModel(piece);
            }
          }

          rotateAndRemove();
        }
      }
    }

    const loadNewModel = (piece) => {
      currentPiece = piece;
      const loader = new GLTFLoader();
      loader.load(`${piece}.glb`, function (gltf) {
        gltf.scene.traverse(function (child) {
          if (child.name == `${piece}_eye`) {
            addPieceToWorldFromModel(child, 0, true);
          } else if (piece == "king" || piece == "knight" || piece === "pawn") {
            let ogmodel = gltf.scene.children.find((mesh) => mesh.name === piece);
            whitematerial = ogmodel.material;

            if (first) currentMaterial = whitematerial;
            addPieceToWorldFromModel(ogmodel, 0, false, first);
          } else {
            let ogmodel = gltf.scene.children.find((mesh) => mesh.name === piece);
            let model = ogmodel.children[0];
            addPieceToWorldFromModel(model, 0, false, first);

            if (piece === "rook" || piece === "bishop") {
              let model2 = ogmodel.children[1];

              addPieceToWorldFromModel(model2, 0, false, first);
            }
            if (piece === "queen") {
              let model2 = ogmodel.children[1];
              whitematerial = model2.material;
              let model3 = ogmodel.children[2];
              addPieceToWorldFromModel(model2, 0, false);
              addPieceToWorldFromModel(model3, 0, false);
            }
          }
        });

        // Set the initial rotation of the new model to be the same as the previous model
        let newModel = meshes[0];
        //  newModel.position = positionBefore;
        let newModel2 = meshes[1];
        let newModel3;
        let newModel4;
        if (meshes.length > 2) {
          newModel3 = meshes[2];
          if (meshes.length > 3) newModel4 = meshes[3];
        }
        if (rotationBefore) {
          newModel.rotation.x = rotationBefore.x;
          newModel2.rotation.x = rotationBefore.x;
          if (meshes.length > 2) {
            newModel3.rotation.x = rotationBefore.x;
            if (meshes.length > 3) newModel4.rotation.x = rotationBefore.x;
          }
        }

        let initialRotation = newModel.rotation.clone();
        let targetRotation = new THREE.Euler(0, 0, 0); // Target rotation is 0 position
        let startTime = Date.now();

        function easeInOutCubic(t) {
          return t < 0.5 ? 4 * t ** 3 : 1 - Math.pow(-2 * t + 2, 3) / 2;
        }
        function rotateNewModel() {
          let currentTime = Date.now();

          let elapsed = (currentTime - startTime) / 1000; // Convert milliseconds to seconds

          if (elapsed < 1) {
            // Rotate for 1 second
            let t = elapsed / 1;
            newModel.rotation.x = THREE.MathUtils.lerp(initialRotation.x, targetRotation.x, t);
            newModel2.rotation.x = THREE.MathUtils.lerp(initialRotation.x, targetRotation.x, t);
            if (meshes.length > 2) {
              newModel3.rotation.x = THREE.MathUtils.lerp(initialRotation.x, targetRotation.x, t);
              if (meshes.length > 3)
                newModel4.rotation.x = THREE.MathUtils.lerp(initialRotation.x, targetRotation.x, t);
            }
            render();
            requestAnimationFrame(rotateNewModel);
          } else {
            // Rotation complete
            render();
          }
        }

        rotateNewModel();
      });
    };

    if (piece === "king" && first) {
      loadNewModel(piece);
    }
    if (first) {
      for (let i = 0; i < 3; i++) {
        const loader2 = new GLTFLoader();
        loader2.load(`bg_${piece}.glb`, function (gltf) {
          let child = gltf.scene.children[0]; // Assuming you have a single child in the GLTF scene
          child.material = new THREE.MeshStandardMaterial({
            color: 0x141414,
            // transparent: true,
          });
          child.renderorder = -5;
          child.position.set(-5.5 + i * 4.1, 1.8, -2);
          child.scale.set(1, 1, 1);
          child.rotation.set(1.7, 0, 0);
          child.name = "bg" + i;
          console.log(scene.children);
          if (bgmeshes.length < 3) {
            console.log(bgmeshes);
            scene.add(child);
            bgmeshes.push(child);
            //child.material.opacity = 0.4;
            const fadeInDuration = 1; // Adjust the duration as needed
            //gsap.to(child.material, { duration: 0.3, opacity: 1, ease: Power1.easeInOut });
          }
        });
      }
    }
    //let selectedObject = scene.getObjectByName(meshes[0].name);
    //gmeshes = [];
  };

  init();
  render();
  function init() {
    camera = new THREE.PerspectiveCamera(15, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, 2, 10.5);
    camera.rotation.set(0, 0, 0);
    scene = new THREE.Scene();

    scene.background = new THREE.Color(0xe7e7e7);
    // 0xe7e7e7
    //

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

    const pointLight = new THREE.DirectionalLight(0xffffff);
    pointLight.position.set(5, 5, 5);
    pointLight.intensity = 3;

    const pointLight3 = new THREE.DirectionalLight(0xffffff);
    pointLight3.position.set(0, 2, 10);
    pointLight3.intensity = 1;

    const pointLight2 = new THREE.DirectionalLight(0xacf5ff);
    pointLight2.position.set(-5, 3, 5);
    pointLight2.intensity = 3;

    const pointLight4 = new THREE.DirectionalLight(0xffffff);
    pointLight4.position.set(0, -3, 10);

    const pointLight5 = new THREE.PointLight(0xffffff);
    pointLight5.position.set(0, 0, -1);
    pointLight5.intensity = 1;

    scene.add(pointLight, pointLight2, pointLight3, pointLight4, pointLight5);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    //renderer.sortObjects = false;

    document.body.appendChild(renderer.domElement);

    // controls = new OrbitControls(camera, renderer.domElement);
    // controls.enableDamping = true; // an animation loop is required when damping is enabled
    // controls.dampingFactor = 0.05;
    // controls.addEventListener("change", render);
    // controls.target.set(0, 2, 0);
    // // to disable zoom
    // controls.enableZoom = false;
    // controls.enablePan = false;
    // controls.update();

    let previousMousePosition = {
      x: 0,
      y: 0,
    };

    function onMouseMove(event) {
      const deltaMove = {
        x: event.clientX - previousMousePosition.x,
        y: event.clientY - previousMousePosition.y,
      };

      if (isDragging) {
        rotationSpeed = 0.005; // Decelerate slightly while dragging

        meshes.forEach((mesh) => {
          mesh.rotation.x += deltaMove.y * rotationSpeed;
          mesh.rotation.y += deltaMove.x * rotationSpeed;
        });
      }

      previousMousePosition = {
        x: event.clientX,
        y: event.clientY,
      };
    }

    function onTouchMove(event) {
      const touch = event.touches[0];

      const deltaMove = {
        x: touch.clientX - previousMousePosition.x,
        y: touch.clientY - previousMousePosition.y,
      };

      if (isDragging) {
        meshes.forEach((mesh) => {
          mesh.rotation.x += deltaMove.y * rotationSpeed;
          mesh.rotation.y += deltaMove.x * rotationSpeed;
        });
      }

      previousMousePosition = {
        x: touch.clientX,
        y: touch.clientY,
      };
    }
    function onTouchStart(event) {
      const touch = event.touches[0];

      isDragging = true;
      initialMouseDownPosition = {
        x: touch.clientX,
        y: touch.clientY,
      };
    }
    if (isMobile()) {
      document.addEventListener("touchmove", onTouchMove, { passive: false });
      document.addEventListener("touchstart", onTouchStart);
      document.addEventListener("touchend", onTouchEnd);
    } else {
      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mousedown", () => {
        isDragging = true;
        initialMouseDownPosition = {
          x: event.clientX,
          y: event.clientY,
        };
      });

      document.addEventListener("mouseup", () => {
        isDragging = false;
        isDecelerating = true;
        decelerationDirection = {
          x: previousMousePosition.x - initialMouseDownPosition.x,
          y: previousMousePosition.y - initialMouseDownPosition.y,
        };
      });
    }

    function onTouchEnd() {
      isDragging = false;
      isDecelerating = true;
      decelerationDirection = {
        x: previousMousePosition.x - initialMouseDownPosition.x,
        y: previousMousePosition.y - initialMouseDownPosition.y,
      };
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
    if (bgmeshes.length > 2) {
      for (let i = 0; i < bgmeshes.length; i++) {
        if (bgmeshes[i].position.x < -7.3) {
          bgmeshes[i].position.x = 5;
        } else {
          bgmeshes[i].position.x -= 0.005;
        }
      }
    }
    //controls.update();

    if (!isDragging && isDecelerating) {
      // Gradually decrease rotation speed when not dragging
      rotationSpeed *= 1 - 0.02;

      meshes.forEach((mesh) => {
        mesh.rotation.x += decelerationDirection.y * rotationSpeed * 0.05;
        mesh.rotation.y += decelerationDirection.x * rotationSpeed * 0.05;
      });

      // If rotation speed is very small, stop decelerating
      if (rotationSpeed < 0.01) {
        isDecelerating = false;
      }
    }

    renderer.render(scene, camera);

    requestAnimationFrame(animate);
  }

  animate();
  //2A3739
</script>

<main>
  {#if isMobile()}
    <div>asd</div>
  {:else}
    <div>
      <a href="/">HOME</a>
      <a href="pieces">PIECES</a>
      <a href="info">INFO</a>
    </div>
  {/if}

  <canvas id="bg"></canvas>
  <div class="options">
    <div class="pieceoptions">
      {#each pieces as piece}
        <Buttons on:click={() => loadGltf(piece)} {currentPiece} ownPiece={piece} />
      {/each}
    </div>
    <MaterialChanger bind:meshes bind:currentMaterial {whitematerial} {material} />
  </div>
</main>

<style>
  .options {
    position: absolute;
    bottom: 0;
    left: 0;
    z-index: 50;
    width: 100vw;
    height: 130px;
    display: flex;
    justify-content: center;
    place-items: center;
    flex-direction: column;
  }
  .pieceoptions {
    height: 30px;
    gap: 40px;
    display: flex;
    justify-content: center;
    place-items: center;
  }
  .header {
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
    height: 100vh;
  }
  canvas {
    width: 100vw;
    height: 100vh;
    position: absolute;
    top: 0;
    left: 0;
  }
</style>
