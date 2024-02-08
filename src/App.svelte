<!-- src/App.svelte -->

<script>
  import { Router, Route } from "svelte-routing";
  import Home from "./lib/Home.svelte";
  import Pieces from "./lib/Pieces.svelte";
  import Contact from "./lib/Contact.svelte";
</script>

<Router>
  <Route path="/" component={Home} />
  <Route path="/pieces" component={Pieces} />
  <Route path="/contact" component={Contact} />
</Router>

<style>
</style>
