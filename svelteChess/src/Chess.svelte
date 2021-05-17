<script>
  import { onMount } from 'svelte';
  import { push } from 'svelte-spa-router';

  import { Chess } from './chess/js/chess.js';
  import './chess/js/chessboard-1.0.0.js';
  import Board from './chess/board.js';
  import Http from './Http.js';
  window.Chess = Chess;

  $: userInfo = Http.getValue('userInfo'); // {};
  let urlParams = Http.parseUrlParams();
  let joinLink = '';

  let type;
  onMount(() => {
    setTimeout(() => {
      Board();
    }, 100);

    userInfo = Object.assign({}, Http.getValue('userInfo'), Http.parseUrlParams());
    joinLink = `http://localhost:5000/#/chess?game_id=${userInfo.game_id}`;
    console.log('user_id:', userInfo);
  });

  const handleNew = () => {
    Board();
  };
  const handleColor = (val) => {
    type = val;
  };
  const handleLogout = () => {
    console.log('logout');
    push('/');
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(joinLink);
    alert('copy success');
  };
</script>

<div class="chess">
  <div>
    <div class="menu">
      <button on:click={handleNew}> New Game </button>
      <button class="colour_1" on:click={() => handleColor('colour_1')}> Color 1</button>
      <button class="colour_2" on:click={() => handleColor('colour_2')}> Color 2</button>
      <button class="colour_3" on:click={() => handleColor('colour_3')}> Color 3</button>
      <div class="flex-1" />
      {#if userInfo && userInfo.username}
        Welcome <span class="username"> {userInfo.username || ''}</span>
      {/if}
      <button on:click={handleLogout}> Logout </button>
    </div>

    {#if !urlParams.game_id}
    <h2 id="status"> Make a move!</h2>
    {/if}

    {#if urlParams.game_id}
    <h2 id="status"> Make a move!</h2>
    {/if}
    <div class={type} id="board1" />

    <div id="promotionBox" class="promotionGUI">
      <p class="promotionText">Promotion: Queen</p>
      <div class="promotionPieceContainer">
        <img src="img/chesspieces/wikipedia/emptyPiece.png" alt="" class="buttonPiece buttonPieceActive" id="queenButton" style="background-image: url(img/chesspieces/wikipedia/bwQ.png)" />
        <img src="img/chesspieces/wikipedia/emptyPiece.png" alt="" class="buttonPiece" id="rookButton" style="background-image: url(img/chesspieces/wikipedia/bwR.png)" />
        <img src="img/chesspieces/wikipedia/emptyPiece.png" alt="" class="buttonPiece" id="bishopButton" style="background-image: url(img/chesspieces/wikipedia/bwB.png)" />
        <img src="img/chesspieces/wikipedia/emptyPiece.png" alt="" class="buttonPiece" id="knightButton" style="background-image: url(img/chesspieces/wikipedia/bwN.png)" />
        <button id="cancelButton">Cancel</button>
      </div>
    </div>
    {#if !urlParams.game_id}
      <div class="urlLink">
        <input type="text" disabled bind:value={joinLink} />
        <button on:click={handleCopyUrl}>Copy Url</button>
      </div>
    {/if}
    <div id="joinLinkContainer" class="panel" style="display:none">
      <form style="font-size: 0;">
        <label class="linkLabel" for="joinLink">Share:</label>
        <input id="joinLink" disabled bind:value={joinLink} />
        <p class="copyButton">copy <i class="far fa-clipboard fa-xs" /></p>
      </form>
    </div>
  </div>
</div>

<!-- svelte-ignore a11y-media-has-caption -->
<audio controls id="audio">
  <source src="/audio/01.wav" type="audio/mpeg" />
</audio>

<style lang="css">
  #joinLinkContainer {
    display: none;
  }
  .chess {
    margin: 0px auto;

    display: -webkit-box;
    -webkit-box-pack: center;
    -webkit-box-align: center;
  }

  .chess > div {
    position: relative;
  }
  .flex-1 {
    flex: 1;
  }
  .menu {
    margin-top: 10px;
    margin-bottom: 20px;
    display: flex;
    align-items: center;
  }
  .username {
    margin-left: 5px;
    margin-right: 10px;
    font-size: 20px;
    font-weight: 700;
    margin-top: -5px;
  }

  .menu button {
    margin: unset;
    margin-right: 10px;
    /* width: 100px; */
    white-space: nowrap;
    padding-left: 15px;
    padding-right: 15px;
    border-radius: 5px;
    cursor: pointer;
    text-align: center;
  }

  .menu button:last-child {
    margin-right: 0px;
  }

  #board1 {
    min-width: calc(100vh - 280px);
    margin: unset;
  }

  audio {
    height: 0px;
    width: 0px;
  }
  .colour_1,
  .colour_1 :global(.white-1e1d7) {
    background-color: unset;
  }

  .colour_2,
  .colour_2 :global(.white-1e1d7) {
    color: #fff;
    background-color: red;
  }
  .colour_3,
  .colour_3 :global(.white-1e1d7) {
    background-color: #d7ef54;
  }

  .urlLink {
    margin-top: 10px;
    /* text-align: center; */
  }
  .urlLink input {
    width: 600px;
  }
</style>
