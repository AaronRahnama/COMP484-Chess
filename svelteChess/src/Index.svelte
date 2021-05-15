<script>
  // import { Router, Link, Route } from 'svelte-routing';
  import Router from 'svelte-spa-router';
  import About from './About.svelte';
  import App from './App.svelte';
  import Chess from './Chess.svelte';
  import Footer from './components/footer.svelte';
  import Header from './components/Header.svelte';
  import Home from './Home.svelte';
  import SecondPage from './SecondPage.svelte';
</script>

<Header />
 <div class="pageBody"> 
  <!-- <nav>
    <a href="/#/">Home</a>
    <a href="/#/about">About</a>
    <a href="/#/app">App</a>
    <a href="/#/chess">Chess</a>
  </nav>   --> 
  <Router
    routes={{
      '/': Home,
      '/secondPage': SecondPage,
      '/about': About,
      '/app': App,
      '/chess': Chess,
    }}
  />
</div>
<Footer />

<style>
  .pageBody {
    position: relative;
    min-height: calc(100vh - 300px);
    /* border: 1px solid; */
  }
</style>
