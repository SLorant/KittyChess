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
    meshes[0].material = whitematerial;
    if (meshes.length > 2) {
      meshes[0].material = whitematerial;
      meshes[1].material = whitematerial;
      if (meshes.length > 3) meshes[2].material = whitematerial;
    }
  }

  function changeMaterialToBlue() {
    currentMaterial = material;
    meshes[0].material = material;
    if (meshes.length > 2) {
      meshes[0].material = material;
      meshes[1].material = material;
      if (meshes.length > 3) meshes[2].material = material;
    }
  }
</script>

<div>
  <White on:click={changeMaterial} />
  <Blue on:click={changeMaterialToBlue} />
  {#if currentMaterial === whitematerial}
    <X />
  {/if}
</div>
