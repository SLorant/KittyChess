<!-- src/App.svelte -->

<script>
  import { Router, Route } from "svelte-routing";
  import Home from "./lib/Home.svelte";
  import Pieces from "./lib/Pieces.svelte";
  import Info from "./lib/Info.svelte";
</script>

<Router>
  <Route path="/" component={Home} />
  <Route path="/pieces" component={Pieces} />
  <Route path="/info" component={Info} />
</Router>

<style>
  /* Add your global styles here if needed */
</style>
