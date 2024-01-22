<script>
  import * as THREE from "three";
  import { OrbitControls } from "three/addons/controls/OrbitControls.js";
  import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
  import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";
  import { GUI } from "dat.gui";
  import { SVGLoader } from "three/addons/loaders/SVGLoader.js";
  let camera, scene, renderer, controls;
  let meshes = [];
  const meshnames = [];
  init();
  render();

  function compareMeshes(mesh1, mesh2) {
    // Compare UUIDs
    if (mesh1.position.x < mesh2.position.x) {
      return -1;
    } else if (mesh1.position.x > mesh2.position.x) {
      return 1;
    } else {
      return 0;
    }
  }

  let boxes = {};
  $: sortedmeshes = meshes.sort(compareMeshes);
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

    const bgmaterial = new THREE.MeshPhysicalMaterial({
      color: 0x414141,
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
          mesh.scale.set(4, 4, 4);
        } else {
          mesh.scale.set(3.75, 3.75, 3.75);
        }
        mesh.rotation.set(0, 0, 0);

        meshes.push(mesh); // Store the loaded model in the array
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
          mesh.scale.set(4, 4, 4);
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
        scene.add(mesh);
      });
    });

    const pieces = ["rook", "pawn", "knight", "king"];
    const positions = [
      [-1.5, 0.8, 4],
      [-2, -1, 3],
      [0.5, -0.2, 4],

      [2, 0.8, 1],
    ];
    const materials = [true, false, true, false, false];
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
            let ogdragon = gltf.scene.children.find((mesh) => mesh.name === piece);
            let model = ogdragon.children[0];
            addPieceToWorldFromModel(model, i, false);

            if (piece == "rook") {
              let model2 = ogdragon.children[1];
              addPieceToWorldFromModel(model2, i, false);
            }
          }

          //boxes[piece] = child;
        });
        //scene.add( gltf.scene );

        console.log(meshes);
        console.log(meshnames);

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

  function rotateRandomly(model, x, y, z) {
    const randomRotationX = Math.random() * 0.07 - 0.01; // Adjust the range as needed
    const randomRotationY = Math.random() * 0.07 - 0.01;
    const randomRotationZ = Math.random() * 0.07 - 0.01;
    model.rotation.x += x;
    model.rotation.y += y;
    model.rotation.z += z;
  }
  let dir1,
    dir2,
    dir3,
    dir4 = 1;
  let mousedir = { x: 1, y: 1 };
  let knightdir = { x: 1, y: 1 };

  let rookdir = { x: 1, y: 1 };

  let kingdir = { x: 1, y: 1 };

  let movementDirection2 = 1;
  const group = new THREE.Group();
  const group2 = new THREE.Group();
  const group3 = new THREE.Group();
  const group4 = new THREE.Group();

  function addToGroup(group, index, rook) {
    if (group.children.length < 1) {
      group.add(meshes[index]);
      group.add(meshes[index + 1]);
      if (rook) {
        group.add(meshes[index + 2]);
      }
      console.log(group);
      scene.add(group);
    }
  }
  function move(group, dir, speed, left) {
    if (left) group.position.x -= 0.00025 * dir.x * speed;
    else group.position.x += 0.00025 * dir.x * speed;

    group.position.y -= 0.001 * dir.y * speed;
    if (group.position.x > 1 || group.position.x < -1.2) {
      //mousedirX *= -1;
      dir.x *= -1;
    }
    if (group.position.y > 0.5 || group.position.y < -0.3) {
      dir.y *= -1;
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
      addToGroup(group, 0, false);
      addToGroup(group2, 2, true);
      addToGroup(group3, 5, false);
      addToGroup(group4, 7, false);
      // group.add(meshes[0]);
      // group.add(meshes[1]);
      // scene.add(group);

      // group2.add(meshes[2]);
      // group2.add(meshes[3]);
      // group2.add(meshes[4]);
      // scene.add(group2);

      move(group, mousedir, 4, true);
      move(group2, rookdir, 3);
      move(group3, knightdir, 1);
      move(group4, kingdir, 3);
      //move(group2, knightdirX, knightdirY);

      // meshes[1].position.x += 0.003 * movementDirection * Math.sin(meshes[1].position.x);
      // if (meshes[1].position.x > -1.7 || meshes[1].position.x < -2.3) {
      //   movementDirection *= -1;
      // }

      //group.rotation.y += 0.02;
      //group.rotation.z += 0.02;
      meshes[0].rotation.x += 0.0075;
      meshes[1].rotation.x += 0.0075;
      meshes[0].rotation.y += 0.0075;
      meshes[1].rotation.y += 0.0075;
      //meshes[0].rotation.y += 0.0075;
      //meshes[1].rotation.y += 0.0075;
      meshes[2].rotation.z += 0.0075;
      meshes[3].rotation.z += 0.0075;
      meshes[4].rotation.z += 0.0075;

      meshes[5].rotation.y += 0.0075;
      meshes[6].rotation.y += 0.0075;
      meshes[5].rotation.z -= 0.003;
      meshes[6].rotation.z -= 0.003;

      meshes[7].rotation.z -= 0.0075;
      meshes[8].rotation.z -= 0.0075;
    }
    //   for (let i = 0; i < 3; i++) {
    //     const randomRotationX = Math.random() * 0.07 - 0.01; // Adjust the range as needed
    //     const randomRotationY = Math.random() * 0.07 - 0.01;
    //     const randomRotationZ = Math.random() * 0.07 - 0.01;
    //     meshes.rotation.x += x;
    // model.rotation.y += y;
    // model.rotation.z += z;
    //     rotateRandomly(meshes[i], randomRotationX, randomRotationY, randomRotationZ);
    //   }
    // }

    controls.update();
    camera.rotation.set(0, 0, 0);
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
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
