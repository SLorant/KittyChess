<script>
  // Dynamically import the component based on ownPiece value
  import { onMount } from "svelte";
  export let isMobile;
  export let currentPiece;
  export let ownPiece;
  let PieceComponent;
  let WhitePieceComponent;
  const importPiece = async () => {
    try {
      // Convert the piece name to PascalCase ("pawn" to "Pawn")
      const componentName = ownPiece.charAt(0).toUpperCase() + ownPiece.slice(1);

      // Import the corresponding component dynamically
      const module = await import(`../assets/Icons/${componentName}.svelte`);
      const whitemodule = await import(`../assets/Icons/${componentName}White.svelte`);
      PieceComponent = module.default || module;
      WhitePieceComponent = whitemodule.default || whitemodule;
    } catch (error) {
      console.error("Error loading piece component:", error);
    }
  };

  onMount(importPiece);
</script>

<button on:click>
  {#if currentPiece === ownPiece}
    {#if PieceComponent}
      <svelte:component this={WhitePieceComponent} {isMobile}></svelte:component>
    {/if}
  {:else}
    <svelte:component this={PieceComponent} {isMobile}></svelte:component>
  {/if}
</button>

<style>
  button {
    border: none;
    background: none;
    cursor: pointer;
  }
  button:hover {
    background: none;
  }
</style>
