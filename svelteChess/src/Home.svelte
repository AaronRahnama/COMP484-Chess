<script>
  import { push } from 'svelte-spa-router';

  import Http from './Http';
  let error = '';
  let username = '';
  let orientation = 'white';

  const handleOrientation = (val) => {
    orientation = val;
    console.log(val);
  };

  const handleLogin = async () => {
    if (!username || !username.trim()) {
      error = 'username cannot be empty';
      return;
    }
    error = '';

    try {
      const info = await Http.postApi('/create', { user: username, orientation });
      console.log(info);
      Http.setValue('userInfo', info);
      push('/chess?username=' + username);
    } catch (ex) {
      console.log(ex);
    }
  };
</script>

<div class="home">
  <div class="logoInfo">
    <p>Pick a username and create a game. A unique link will be provided to invite your friends.</p>
    <div class="form-field">
      <input type="text" name="username" bind:value={username} />
      <span>{error}</span>
    </div>
    <div class="row">
      <input type="radio" id="whiteRadio" name="orientation" on:click={() => handleOrientation('white')} value="white" checked />
      <label for="white">White</label><br />
      <input type="radio" id="blackRadio" name="orientation" on:click={() => handleOrientation('black')} value="black" />
      <label for="black">Black</label><br />
      <input type="radio" id="randomRadio" name="orientation" on:click={() => handleOrientation('random')} value="random" />
      <label for="random">Random</label><br />
    </div>
    <div class="form-field">
      <button class="login" on:click={handleLogin}>Login</button>
    </div>
  </div>
</div>

<style>
  .home {
    /* border: 1px solid; */
    position: relative;
    display: -webkit-box;
    -webkit-box-pack: center;
    -webkit-box-align: center;
    height: calc(100vh - 200px);
  }
  .row {
    display: flex;
    align-items: center;
  }
  .row input {
    margin: unset;
    width: 40px;
  }

  .logoInfo {
    border: 1px solid #f0f0f0;
    box-shadow: 1px 2px 3px rgba(0, 0, 0, 0.2);
    padding: 20px;
    padding-bottom: 0px;
    border-radius: 5px;

    width: 400px;
    margin: 0 auto;
    text-align: center;
    margin-top: -20%;
    font-size: 18px;
  }

  .form-field {
    margin: 18px auto;
  }

  input {
    width: 100%;
    border-radius: 5px;
  }

  /* label {
    margin: 10px auto;
    text-align: left;
  } */

  .login {
    font-weight: 700;
    padding: 10px 30px;
    border-radius: 5px;
    box-shadow: 0px 2px 3px rgba(0, 0, 255, 0.3);
  }
  .login:active {
    box-shadow: 0px 2px 3px rgba(255, 0, 0, 0.3);
  }
</style>
