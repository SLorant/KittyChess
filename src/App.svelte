<script>
  import * as THREE from "three";
  import { OrbitControls } from "three/addons/controls/OrbitControls.js";
  import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
  import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";
  import { GUI } from "dat.gui";
  import { SVGLoader } from "three/addons/loaders/SVGLoader.js";
  let camera, scene, renderer, controls;
  const meshes = [];
  init();
  render();

  function init() {
    camera = new THREE.PerspectiveCamera(15, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, 0, 15.5);
    camera.rotation.set(0, 0, 0);
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xe7e7e7);
    // 0xe7e7e7
    //

    const gui = new GUI();

    const options = {
      enableSwoopingCamera: false,
      enableRotation: true,
      transmission: 1,
      thickness: 0.5,
      roughness: 0.32,
      envMapIntensity: 0,
      clearcoat: 1,
      clearcoatRoughness: 1,
      color: 0x79e0e8,
    };

    const material = new THREE.MeshPhysicalMaterial({
      color: options.color,
      transmission: options.transmission,
      transparent: true,

      thickness: options.thickness,
      roughness: options.roughness,
      envMapIntensity: options.envMapIntensity,
      clearcoat: options.clearcoat,
      clearcoatRoughness: options.clearcoatRoughness,
    });

    function addPieceToWorld(index, gltf) {
      const isTransparent = materials[index];
      const piece = pieces[index];
      let model = gltf.scene.children.find((mesh) => mesh.name === piece);
      const mesh = new THREE.Mesh(model.geometry, isTransparent ? material : model.material);
      mesh.position.set(...positions[index]);
      mesh.scale.set(3, 3, 3);
      mesh.rotation.set(0, 0, 0);
      meshes.push(mesh); // Store the loaded model in the array
      scene.add(mesh);
    }

    function addPieceToWorldFromModel(model, index, isEye) {
      const isTransparent = isEye ? false : materials[index];
      const mesh = new THREE.Mesh(model.geometry, isTransparent ? material : model.material);
      mesh.position.set(...positions[index]);
      mesh.scale.set(3, 3, 3);
      mesh.rotation.set(0, 0, 0);
      meshes.push(mesh); // Store the loaded model in the array
      scene.add(mesh);
    }

    const loader2 = new GLTFLoader();
    loader2.load(`background.glb`, function (gltf) {
      gltf.scene.traverse(function (child) {
        let mesh = new THREE.Mesh(
          child.geometry,
          new THREE.MeshBasicMaterial({
            color: 0x414141,
          })
        );
        mesh.position.set(0, 0, 2);
        mesh.scale.set(1.5, 1.5, 1.5);
        mesh.renderOrder = 5;
        mesh.rotation.set(0, 0, 0);
        scene.add(mesh);
      });
    });

    const pieces = ["rook", "pawn", "knight", "pawn", "king"];
    const positions = [
      [-1.5, 0.8, 4],
      [-2, -1, 3],
      [-0.5, -1.2, 4],
      [1, 0.3, 3],
      [2, 0.8, 1],
    ];
    const materials = [true, false, true, true, false];
    for (let i = 0; i < pieces.length; i++) {
      let piece = pieces[i];
      const loader = new GLTFLoader();
      loader.load(`${piece}.glb`, function (gltf) {
        gltf.scene.traverse(function (child) {
          if (child.name == `${piece}_eye` || child.name == "pawn") {
            addPieceToWorldFromModel(child, i, true);
          }
          if (child.name == "pawn") {
            let model = child.children[0];
            addPieceToWorldFromModel(model, i, true);
          }
          if (piece == "king" || piece == "knight") {
            addPieceToWorld(i, gltf);
          } else {
            let ogdragon = gltf.scene.children.find((mesh) => mesh.name === piece);
            let model = ogdragon.children[0];
            addPieceToWorldFromModel(model, i, false);

            if (piece == "rook") {
              let model2 = ogdragon.children[1];
              addPieceToWorldFromModel(model2, i, false);
            }
          }
        });
        //scene.add( gltf.scene );
        render();
      });
    }

    const pointLight = new THREE.DirectionalLight(0xffffff);
    pointLight.position.set(5, 5, 5);
    const pointLight3 = new THREE.DirectionalLight(0xffffff);
    pointLight3.position.set(0, 2, 10);
    pointLight3.intensity = 1;

    const pointLight2 = new THREE.DirectionalLight(0x85f0ff);
    pointLight2.position.set(-5, 3, 5);
    pointLight2.intensity = 3;
    pointLight.intensity = 3;

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
    controls.update();

    window.addEventListener("resize", onWindowResize);
  }

  function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    camera.rotation.set(0, 0, 0);
    renderer.setSize(window.innerWidth, window.innerHeight);
    console.log(camera.position);
    render();
  }

  function render() {
    renderer.render(scene, camera);
  }

  function animate() {
    requestAnimationFrame(animate);
    meshes.forEach((model, index) => {
      model.rotation.x += 0.01;
      model.rotation.y += 0.007;
    });
    controls.update();

    renderer.render(scene, camera);
  }

  animate();
</script>

<main>
  <canvas id="bg"></canvas>
</main>

<style>
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
