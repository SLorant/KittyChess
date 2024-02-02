<script>
  import White from "../assets/Icons/White.svelte";
  import Blue from "../assets/Icons/Blue.svelte";
  import X from "../assets/Icons/X.svelte";
  export let whitematerial;
  export let material;
  export let currentMaterial;
  export let meshes;
  function changeMaterial(isWhite) {
    currentMaterial = isWhite ? whitematerial : material;

    if (meshes[0].name === "pawn_eye") meshes[1].material = currentMaterial;
    else meshes[0].material = currentMaterial;
    if (meshes.length > 2) {
      meshes[0].material = currentMaterial;
      meshes[1].material = currentMaterial;
      if (meshes.length > 3) meshes[2].material = currentMaterial;
    }
  }
</script>

<div class="container">
  <White on:click={() => changeMaterial(true)} />
  <Blue on:click={() => changeMaterial(false)} />
  {#if currentMaterial === whitematerial}
    <div class="x white">
      <X on:click={() => changeMaterial(false)} />
    </div>
  {:else if currentMaterial === material}
    <div class="x blue">
      <X on:click={() => changeMaterial(true)} />
    </div>
  {:else}
    <div class="x white">
      <X on:click={() => changeMaterial(true)} />
    </div>
  {/if}
</div>

<style>
  .container {
    position: relative;
    width: 30px;
    height: 20px;
    gap: 10px;
    display: flex;
    justify-content: center;
    place-items: center;
  }
  .x {
    position: absolute;
    top: -12px;
  }
  .white {
    left: -37px;
  }
  .blue {
    left: 20px;
  }
  @media screen and (max-width: 600px) {
    .container {
      margin-bottom: 60px;
    }
  }
</style>
