<script>
  import * as THREE from "three";
  import { OrbitControls } from "three/addons/controls/OrbitControls.js";
  import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
  import { GUI } from "dat.gui";
  import Header from "./Header.svelte";
  import isUserUsingMobile from "./CheckDevice";
  let camera, scene, renderer, controls;
  let meshes = [];
  const meshnames = [];
  let mouseX = 0;
  let mouseY = 0;

  let targetX = 0;
  let targetY = 0;
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
    // 0xe7e7e7
    //

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

    function addPieceToWorld(index, gltf) {
      const isTransparent = materials[index];
      const piece = pieces[index];
      let model = gltf.scene.children.find((mesh) => mesh.name === piece);

      console.log(meshnames.find((mesh) => mesh === model.name));
      if (meshnames.find((mesh) => mesh === model.name) === undefined) {
        const mesh = new THREE.Mesh(model.geometry, isTransparent ? material : model.material);
        if (isMobile) mesh.material = material;
        mesh.position.set(...positions[index]);
        if (model.name === "king") {
          isMobile ? mesh.scale.set(4, 4, 4) : mesh.scale.set(4.25, 4.25, 4.25);
        } else {
          isMobile ? mesh.scale.set(3.5, 3.5, 3.5) : mesh.scale.set(3.75, 3.75, 3.75);
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
          isMobile ? mesh.scale.set(4, 4, 4) : mesh.scale.set(4.25, 4.25, 4.25);
        } else {
          isMobile ? mesh.scale.set(3.5, 3.5, 3.5) : mesh.scale.set(3.75, 3.75, 3.75);
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
    const loader2 = new GLTFLoader();
    console.log(isMobile);
    const bg = isMobile ? "bg_phone.glb" : "background.glb";
    loader2.load(`${bg}`, function (gltf) {
      gltf.scene.traverse(function (child) {
        let mesh = new THREE.Mesh(
          child.geometry,
          new THREE.MeshStandardMaterial({
            color: 0x141414,
          })
        );
        isMobile ? mesh.position.set(0, 0.1, 2) : mesh.position.set(0, -0.1, 2);

        isMobile ? mesh.scale.set(0.7, 0.7, 0.7) : mesh.scale.set(1.6, 1.6, 1.6);
        mesh.renderOrder = 5;
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
    let materials = [true, false, true, false, false];
    if (isMobile) {
      pieces = ["knight", "king"];
      positions = [
        [0, 0.8, 3],
        [0, -1, 0],
      ];
      materials = [true, false, true];
    }
    for (let i = 0; i < pieces.length; i++) {
      let piece = pieces[i];

      const loader = new GLTFLoader();
      loader.load(`${piece}.glb`, function (gltf) {
        gltf.scene.traverse(function (child) {
          console.log(child);
          if (child.name == `${piece}_eye` || child.name == "pawn") {
            addPieceToWorldFromModel(child, i, true);
          } else if (child.name == "pawn") {
            let model = child.children[0];
            addPieceToWorldFromModel(model, i, true);
          } else if (piece == "king" || piece == "knight") {
            addPieceToWorld(i, gltf);
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

        //render();
      });
    }

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

    if (meshes.length > 8) {
      //console.log(bgmesh.rotation.y);
      if (bgmesh.rotation.y < 0.2 && bgmesh.rotation.y > -0.2) {
        bgmesh.rotation.y += 0.002 * (targetX - bgmesh.rotation.y) * (1 - bgmesh.rotation.y);
      } else {
        bgmesh.rotation.y -= 0.002 * (targetX + bgmesh.rotation.y) * (1 - bgmesh.rotation.y);
      }

      if (bgmesh.rotation.x < 0.2 && bgmesh.rotation.x > -0.2) {
        bgmesh.rotation.x += 0.002 * (targetY - bgmesh.rotation.x) * (1 - bgmesh.rotation.x);
      } else {
        bgmesh.rotation.x -= 0.002 * (targetY + bgmesh.rotation.x) * (1 - bgmesh.rotation.x);
      }
    }
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

  function animate() {
    if (meshes.length > 8) {
      if (meshnames[2] !== "rook_1") {
        console.log("AAAAAAAAAAAAAA");
        meshes = meshes.sort(compareMeshes);
        meshnames[2] = "rook_1";
        console.log(meshes);
      }
      addToGroup(pawngroup, 0, false);
      addToGroup(knightgroup, 2, true);
      addToGroup(rookgroup, 5, false);
      addToGroup(kinggroup, 7, false);

      move(pawngroup, mousedir, 2, true);
      move(knightgroup, rookdir, 1.5);
      move(rookgroup, knightdir, 0.5);
      move(kinggroup, kingdir, 1);

      meshes[0].rotation.x += 0.005;
      meshes[1].rotation.x += 0.005;
      meshes[0].rotation.y += 0.005;
      meshes[1].rotation.y += 0.005;

      meshes[2].rotation.z += 0.005;
      meshes[3].rotation.z += 0.005;
      meshes[4].rotation.z += 0.005;

      meshes[5].rotation.y += 0.005;
      meshes[6].rotation.y += 0.005;
      meshes[5].rotation.z -= 0.003;
      meshes[6].rotation.z -= 0.003;

      meshes[7].rotation.z -= 0.005;
      meshes[8].rotation.z -= 0.005;
    } else if (isMobile) {
      if (meshes.length > 3) {
        if (meshnames[2] !== "rook_1") {
          console.log("AAAAAAAAAAAAAA");
          meshes = meshes.sort(compareMeshes);
          meshnames[2] = "rook_1";
          console.log(meshes);
        }
        addToGroup(pawngroup, 0, false);
        addToGroup(knightgroup, 2, false);

        move(pawngroup, mousedir, 2, true);
        move(knightgroup, rookdir, 1.5);

        meshes[0].rotation.z -= 0.005;
        meshes[1].rotation.z -= 0.005;

        meshes[2].rotation.z += 0.002;
        meshes[3].rotation.z += 0.002;
      }
    }
    controls.update();
    //renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }

  animate();
  //2A3739
  //screen.orientation.lock("portrait");
</script>

<main>
  <Header {isMobile} />

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
