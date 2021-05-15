<script>
  import { onMount } from 'svelte';
  import { location, querystring } from 'svelte-spa-router';
  import Http from './Http';
  let urlLink;
  const obj = Http.parseUrlParams();
  console.log(obj);
  console.log('querystring:', $querystring);
  onMount(() => {
    // api call
    // urlLink = Http.BaseUrl + '/friend?uuid=1123-abcdef-123412234-bbcdde-9986';
  });

  const handleCopyUrl = () => {
    //

    let transfer = document.createElement('input');
    document.body.appendChild(transfer);
    transfer.value = urlLink; // Here is copy URL
    transfer.focus();
    transfer.select();
    if (document.execCommand('copy')) {
      document.execCommand('copy');
    }
    transfer.blur();
    alert('copy success');
    document.body.removeChild(transfer);
  };
</script>

<div class="sPage">
  <div class="username">Welcome <b> {obj.username} </b></div>

  <div class="urlLink">
    <input type="text" disabled bind:value={urlLink} />
    <button on:click={handleCopyUrl}>Copy Url</button>
  </div>
</div>

<style>
  .sPage {
    margin: 0px auto;
    width: 900px;
    min-height: calc(100vh - 260px);
  }
  .username {
    font-size: 20px;
    text-align: center;
    padding: 20px;
  }
  .urlLink {
    text-align: center;
  }
  .urlLink input {
    width: 600px;
  }
</style>
