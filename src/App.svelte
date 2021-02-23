<script>
  import { onMount } from "svelte";

  // prop: array of objects { id: number, text: string }
  export let sample_programs;
  export let preload;
  export let clear_hash;
  export let save_program_to_hash;
  export let parse_cbpv;
  export let evaluate;

  let which;
  let value = '';
  let _err = false;
  let result = "_____";

  onMount(async () => {
    if (preload) {
      which = 0;
      value = preload; }
    else {
      which = Math.floor(Math.random() * sample_programs.length);
      value = sample_programs.map(({ text }) => text)[which]; } });

  const try_to_parse = (src) => {
    let res = null;
    try {
      res = parse_cbpv(src);
      _err = false; }
    catch (e) {
      res = `${e}`;
      _err = true; }
    return res; };

  const handle_eval = (event) => {
    save_program_to_hash(value);
    result = try_to_parse(value);
    if (!_err) {
      result = evaluate(result); } };

  const handle_reset = (event) => {
    clear_hash();
    result = "_____"; };

  const handle_select = (event) => {
    clear_hash();
    result = "_____";
    value = sample_programs.map(({ text }) => text)[which]; };
</script>

<main>
{#if result}
<h1>{result}</h1>
{/if}
<p>
edit this program or refresh to get a random example.
  <a target="_blank" href="//github.com/gatlin/precursor-ts">
    more info on github.
  </a>
  <a target="_blank" href="//github.com/gatlin/precursor-site">
    source for this site.
  </a>
</p>
<select bind:value={which} on:blur={handle_select}>
  {#each sample_programs as p}
    <option value={p.id}>
    { `sample ${p.id + 1}` }
    </option>
  {/each}
</select>
<textarea
     bind:value
     spellcheck="false"
     ></textarea>
<button on:click={handle_reset}>Reset</button>
<button on:click={handle_eval}>Evaluate</button>
</main>

<style>
  @import url('https://fonts.googleapis.com/css2?family=Fira+Code:wght@300&display=swap');
  main {
    width: 100%;
    text-align: center;
    margin: 0 auto;
    min-height: 100%;
    display: flex;
    flex-direction: column;
  }
  p {
    text-align: left;
  }

  h1 {
    /* color: #00ff54; */
    color: #86C29C;
    font-size: 3em;
    font-weight: 200;
    display: flex;
    flex-direction: col;
    flex-height: 1;
    margin: 0;
    padding: 0;
    max-height: 100%;
  }

  textarea {
    width: 100%;
    max-height: 100%;
    flex: 1;
    box-sizing: border-box;
    font-family: 'Fira Code', monospace;
  }

  @media (min-width: 640px) {
    main {
      max-width: none;
    }
  }
</style>
