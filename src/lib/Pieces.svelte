<script>
  import * as THREE from "three";
  import { OrbitControls } from "three/addons/controls/OrbitControls.js";
  import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
  import { GUI } from "dat.gui";
  let camera, scene, renderer, controls;
  let meshes = [];
  const meshnames = [];
  let video;
  init();
  render();
  let bgmesh;

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
    camera.position.set(0, 0, 10.5);
    camera.rotation.set(0, 0, 0);
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xe7e7e7);
    // 0xe7e7e7
    //

    // const bgTexture = new THREE.TextureLoader().load("emo.gif");
    // const bgGeometry = new THREE.PlaneGeometry(5, 5);
    // const bgMaterial = new THREE.MeshBasicMaterial({ map: bgTexture });
    // const bgMesh = new THREE.Mesh(bgGeometry, bgMaterial);
    // bgMesh.position.set(0, 0, -1);
    // scene.add(bgMesh);

    video = document.getElementById("video");
    video.play();
    video.addEventListener("play", function () {
      this.currentTime = 3;
    });

    // Load video texture

    let videoTexture = new THREE.VideoTexture(video);
    videoTexture.format = THREE.RGBFormat;
    videoTexture.minFilter = THREE.NearestFilter;
    videoTexture.maxFilter = THREE.NearestFilter;
    videoTexture.generateMipmaps = false;

    // Create mesh
    var geometry = new THREE.BoxGeometry(1, 1, 1);
    var material3 = new THREE.MeshBasicMaterial({ map: videoTexture });
    let bgmesh = new THREE.Mesh(geometry, material3);
    bgmesh.position.set(0, 0, 3);
    scene.add(bgmesh);

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

      console.log(meshnames.find((mesh) => mesh === model.name));
      if (meshnames.find((mesh) => mesh === model.name) === undefined) {
        const mesh = new THREE.Mesh(model.geometry, isTransparent ? material : model.material);
        mesh.position.set(...positions[index]);
        if (model.name === "king") {
          mesh.scale.set(4.25, 4.25, 4.25);
        } else {
          mesh.scale.set(3.75, 3.75, 3.75);
        }
        mesh.rotation.set(0, 0, 0);

        meshes.push(mesh);
        meshnames.push(model.name);
        scene.add(mesh);
      }
    }

    function addPieceToWorldFromModel(model, index, isEye) {
      if (meshnames.find((mesh) => mesh === model.name) === undefined) {
        console.log(model.name + " " + isEye);
        if (model.name === "pawn_eye") isEye = true;
        const isTransparent = isEye ? false : materials[index];
        const mesh = new THREE.Mesh(model.geometry, isTransparent ? material : model.material);
        mesh.position.set(...positions[index]);
        if (model.name === "king_eye") {
          mesh.scale.set(4.25, 4.25, 4.25);
        } else {
          mesh.scale.set(3.75, 3.75, 3.75);
        }
        mesh.rotation.set(0, 0, 0);

        meshes.push(mesh);
        meshnames.push(model.name);
        scene.add(mesh);
      } else if (model.name === "pawn") {
        const mesh = new THREE.Mesh(model.geometry, material);
        mesh.position.set(...positions[index]);
        mesh.scale.set(3.75, 3.75, 3.75);
        mesh.rotation.set(0, 0, 0);
        meshes.push(mesh);
        meshnames.push(model.name);
        scene.add(mesh);
      }
    }
    /*new THREE.MeshBasicMaterial({
                color: 0x414141,
              })*/
    // const loader2 = new GLTFLoader();
    // loader2.load(`background.glb`, function (gltf) {
    //   gltf.scene.traverse(function (child) {
    //     let mesh = new THREE.Mesh(
    //       child.geometry,
    //       new THREE.MeshStandardMaterial({
    //         color: 0x141414,
    //       })
    //     );
    //     mesh.position.set(0, -0.1, 2);
    //     mesh.scale.set(1.6, 1.6, 1.6);
    //     mesh.renderOrder = 5;
    //     mesh.rotation.set(0, 0, 0);
    //     bgmesh = mesh;
    //     scene.add(mesh);
    //   });
    // });

    const pieces = ["rook", "pawn", "knight", "king"];
    const positions = [
      [0, 0, 0],
      [-2, -1, 4],
      [1, -0.2, 4],

      [2, 0.8, 0],
    ];
    const materials = [true, false, true, false, false];

    const loader = new GLTFLoader();
    loader.load(`${pieces[0]}.glb`, function (gltf) {
      gltf.scene.traverse(function (child) {
        console.log(child);
        if (child.name == `${pieces[0]}_eye` || child.name == "pawn") {
          addPieceToWorldFromModel(child, 0, true);
        } else if (child.name == "pawn") {
          let model = child.children[0];
          addPieceToWorldFromModel(model, 0, true);
        } /*else if (piece == "king" || piece == "knight") {
          addPieceToWorld(i, gltf);
        }*/ else {
          let ogmodel = gltf.scene.children.find((mesh) => mesh.name === pieces[0]);
          let model = ogmodel.children[0];
          addPieceToWorldFromModel(model, 0, false);

          if (pieces[0] == "rook") {
            let model2 = ogmodel.children[1];
            addPieceToWorldFromModel(model2, 0, false);
          }
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
    camera.rotation.set(0, 0, 0);

    renderer.render(scene, camera);
  }

  function animate() {
    camera.rotation.set(0, 0, 0);

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
  <video id="video" loop crossOrigin="anonymous" playsinline style="display:none">
    <source src="/emo.mp4" type="video/mp4;" codecs="avc1.42E01E, mp4a.40.2" />
  </video>
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
