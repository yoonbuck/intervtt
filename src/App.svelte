<script lang="ts">
  import FileTarget from "./components/FileTarget.svelte";
  import Editor from "./Editor.svelte";

  // let name: string;
  let body: string;

  function fileerror(e: CustomEvent<ProgressEvent<FileReader>>) {
    console.error(e.detail);
  }

  function fileready(e: CustomEvent<{ name: string; result: string }>) {
    // name = e.detail.name;
    body = e.detail.result;
  }
</script>

<main>
  {#if body}
    <Editor data={body} />
  {:else}
    <FileTarget on:fileerror={fileerror} on:fileready={fileready} />
  {/if}
</main>

<style>
  main {
    flex: 1;
    display: flex;
    align-items: stretch;
    justify-content: flex-start;
    max-height: 100%;
  }
</style>
