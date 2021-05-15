<script>
  import Footer from './components/footer.svelte';
  import Header from './components/Header.svelte';

  let items = ['Current Polls', 'Add New Poll'];
  let activeItem = items[0];
</script>

<Header />
<main>
  ddd
  {#if activeItem === items[0]}
    a
  {:else if activeItem === items[1]}
    b
  {/if}
</main>
<Footer />

<style>
  main {
    max-width: 960px;
    margin: 40px auto;
  }
</style>
