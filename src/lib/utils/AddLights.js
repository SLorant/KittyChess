import * as THREE from "three";

const AddLights = (isHome, isContact, isMobile) => {
  const lights = [];
  if (isMobile) {
    const pointLight3 = new THREE.DirectionalLight(0xffffff);
    pointLight3.position.set(0, 2, 5);
    pointLight3.intensity = isHome ? 6 : 5;

    lights.push(pointLight3);
  } else {
    const pointLight = new THREE.DirectionalLight(0xffffff);
    pointLight.position.set(5, 5, 5);
    pointLight.intensity = isContact ? 2 : 3;

    const pointLight3 = new THREE.DirectionalLight(0xffffff);
    pointLight3.position.set(0, 2, 10);
    pointLight3.intensity = 1;

    const pointLight2 = new THREE.DirectionalLight(isHome ? 0x85f0ff : 0xacf5ff);
    pointLight2.position.set(-5, 3, 5);
    pointLight2.intensity = isHome ? 5 : 3;

    const pointLight4 = new THREE.DirectionalLight(0xffffff);
    pointLight4.position.set(0, -3, 10);

    const pointLight5 = new THREE.PointLight(0xffffff);
    pointLight5.position.set(0, 0, -1);
    pointLight5.intensity = isHome ? 30 : 1;
    lights.push(pointLight, pointLight2, pointLight3, pointLight4, pointLight5);
  }

  return lights;
};

export default AddLights;
