<script lang="ts">
  import { createEventDispatcher } from "svelte";

  const dispatch = createEventDispatcher<{
    fileready: { name: string; result: string };
    fileerror: ProgressEvent<FileReader>;
  }>();
  let dragging = false;
  let fileInput: HTMLInputElement | null = null;

  function startDrag(e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    dragging = true;
  }

  function stopDrag(e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    dragging = false;
  }

  function drop(e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    dragging = false;

    if (e.dataTransfer === null) return;
    process(e.dataTransfer.files);
  }

  function process(files: FileList) {
    if (files.length < 1) return;
    let reader = new FileReader();
    let name = files[0].name;

    reader.readAsText(files[0], "UTF-8");
    reader.onload = function () {
      if (typeof reader.result !== "string")
        return console.error("expected to read string from file!!");
      dispatch("fileready", { name, result: reader.result });
    };
    reader.onerror = function (e) {
      dispatch("fileerror", e);
    };
  }

  function changeFiles() {
    if (fileInput?.files) {
      process(fileInput.files);
    }
  }

  function pick() {
    fileInput?.click();
  }
</script>

<button
  class="target"
  class:dragging
  on:dragenter={startDrag}
  on:dragover={startDrag}
  on:dragleave={stopDrag}
  on:dragend={stopDrag}
  on:drop={drop}
  on:click={pick}
>
  Drag & drop here or click to select a file
</button>
<input bind:this={fileInput} on:change={changeFiles} type="file" />

<style>
  button {
    background-color: #c4d9eb;
    color: black;
    font-size: 1rem;
    font-family: inherit;
    border: 0;
    display: block;
    width: 100%;
    height: 100%;
    padding: 1rem;
  }
  .dragging {
    background-color: #98bbd6;
  }
  input {
    display: none;
  }
</style>
