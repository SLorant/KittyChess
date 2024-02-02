<script>
  import { onMount } from "svelte";
  import Menu from "../assets/Icons/Menu.svelte";
  import Close from "../assets/Icons/Close.svelte";
  import { fly } from "svelte/transition";

  export let isMobile;
  let menuOpened = false;
  let headerTransition;
  const openMenu = () => {
    menuOpened = !menuOpened;
  };

  /*   const closeMenuOnClickOutside = (event) => {
    const header = document.querySelector(".header");
    const menuButton = document.querySelector(".menu-button");
    console.log(menuButton);
    if (menuOpened && header && !header.contains(event.target) && !menuButton.contains(event.target)) {
      menuOpened = false;
    }
  };

  document.body.addEventListener("click", closeMenuOnClickOutside); */
  onMount(() => {
    headerTransition = fly;
  });
</script>

{#if isMobile}
  {#if menuOpened}
    <div
      in:headerTransition={{ y: -50, opacity: 1, duration: 300 }}
      out:headerTransition={{ y: -50, opacity: 0, duration: 300 }}
      class="header header2"
    >
      <div class="link first">
        <a href="/">HOME</a>
      </div>
      <div class="link">
        <a href="pieces">PIECES</a>
      </div>
      <div class="link">
        <a href="info">CONTACT</a>
      </div>

      <div><Close on:click={openMenu} /></div>
    </div>
  {:else}
    <div
      in:headerTransition={{ y: -50, opacity: 0, duration: 300 }}
      out:headerTransition={{ y: 0, opacity: 1, duration: 300 }}
      class="header"
    >
      <Menu on:click={openMenu} />
    </div>
  {/if}
{:else}
  <div class="header">
    <a href="/">HOME</a>
    <a href="pieces">PIECES</a>
    <a href="contact">CONTACT</a>
  </div>
{/if}

<style>
  .header {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 50;
    width: 100vw;
    height: 70px;
    gap: 200px;
    display: flex;
    justify-content: center;
    place-items: center;
    color: #3a3a3a;
    text-align: center;
    font-size: 18px;
  }
  .link {
    border-bottom: 2px solid rgba(231, 231, 231, 0.2);
    padding-bottom: 11px;
    width: 100vw;
  }
  a {
    font-family: "Fredoka", sans-serif;
    text-decoration: none !important;
    color: #3a3a3a;
    font-weight: 500;
  }
  .first {
    margin-top: 40px;
  }
  @media screen and (max-width: 600px) {
    .header2 {
      height: 180px;
      backdrop-filter: blur(20px);
      box-shadow: 0px 15px 15px rgba(20, 20, 20, 0.3);
      background: rgba(231, 231, 231, 0.3);
      gap: 14px;
      flex-direction: column;
    }
  }
</style>
