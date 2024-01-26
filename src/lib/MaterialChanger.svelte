<script>
  import White from "../assets/Icons/White.svelte";
  import Blue from "../assets/Icons/Blue.svelte";
  import X from "../assets/Icons/X.svelte";
  export let whitematerial;
  export let material;
  export let currentMaterial;
  export let meshes;
  function changeMaterial() {
    currentMaterial = whitematerial;
    console.log(meshes[0]);
    if (meshes[0].name === "pawn_eye") meshes[1].material = whitematerial;
    else meshes[0].material = whitematerial;

    if (meshes.length > 2) {
      meshes[0].material = whitematerial;
      meshes[1].material = whitematerial;
      if (meshes.length > 3) meshes[2].material = whitematerial;
    }
  }

  function changeMaterialToBlue() {
    currentMaterial = material;
    if (meshes[0].name === "pawn_eye") meshes[1].material = material;
    else meshes[0].material = material;
    if (meshes.length > 2) {
      meshes[0].material = material;
      meshes[1].material = material;
      if (meshes.length > 3) meshes[2].material = material;
    }
  }
</script>

<div class="container">
  <White on:click={changeMaterial} />
  <Blue on:click={changeMaterialToBlue} />
  {#if currentMaterial === whitematerial}
    <div class="x white">
      <X on:click={changeMaterialToBlue} />
    </div>
  {:else}
    <div class="x blue">
      <X on:click={changeMaterial} />
    </div>
  {/if}
</div>

<style>
  .container {
    position: relative;
    width: 30px;
    height: 45px;
    gap: 10px;
    display: flex;
    justify-content: center;
    place-items: center;
  }
  .x {
    position: absolute;
    top: 0;
  }
  .white {
    left: -35px;
  }
  .blue {
    left: 20px;
  }
</style>
