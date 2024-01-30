<script>
  // Dynamically import the component based on ownPiece value
  import { onMount } from "svelte";
  export let isMobile;
  export let currentPiece;
  export let ownPiece;
  let PieceComponent;
  let WhitePieceComponent;
  console.log(isMobile);
  // Function to dynamically import the piece component
  const importPiece = async () => {
    try {
      // Convert the piece name to PascalCase (e.g., "pawn" to "Pawn")
      const componentName = ownPiece.charAt(0).toUpperCase() + ownPiece.slice(1);

      // Import the corresponding component dynamically
      const module = await import(`../assets/Icons/${componentName}.svelte`);
      const whitemodule = await import(`../assets/Icons/${componentName}White.svelte`);
      console.log(module);
      PieceComponent = module.default || module;
      WhitePieceComponent = whitemodule.default || whitemodule;
    } catch (error) {
      console.error("Error loading piece component:", error);
    }
  };

  // Call the importPiece function on component mount
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
