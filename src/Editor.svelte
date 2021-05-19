<script lang="ts">
  import { conjoin, parseVTT } from "./parse";
  import type { Dialogue } from "./parse";

  interface SpeakerProps {
    name: string;
    moderator: boolean;
    visible: boolean;
    showName: boolean;
    alias: string | null;
  }
  let conjoinOutput = true;
  let showNumbers = false;
  let showTimestamps = false;
  let timestampFreq = 60;

  let error = "";

  export let data: string;

  let vttdata: Dialogue[], vttdataConj: Dialogue[];
  try {
    vttdata = parseVTT(data);
    vttdataConj = conjoin(vttdata);
  } catch (e: any) {
    error = e.message;
    vttdata = [];
    vttdataConj = [];
  }

  let speakerData = new Map<string, SpeakerProps>();
  vttdata.forEach((d) => {
    if (!speakerData.has(d.speaker)) {
      speakerData.set(d.speaker, {
        name: d.speaker,
        moderator: false,
        visible: true,
        showName: true,
        alias: null,
      });
    }
  });
  let speakers = Array.from(speakerData.values());
  let [sepLines, sepLinesConjoined] = [vttdata, vttdataConj].map((data) =>
    data.map(
      (dialogue) =>
        [dialogue, speakerData.get(dialogue.speaker)] as [
          Dialogue,
          SpeakerProps
        ]
    )
  );

  let timestamps: (string | null)[] = [];
  $: timestamps = (function () {
    let target = 0;

    let data = conjoinOutput ? sepLinesConjoined : sepLines;

    return data.map(([d]) => {
      if (d.startTime >= target) {
        while (target < d.startTime) target += timestampFreq;
        return timeString(d.startTime);
      }
      return null;
    });
  })();

  function timeString(t: number): string {
    let h = Math.floor(t / 3600);
    t %= 3600;
    let m = Math.floor(t / 60);
    t %= 60;
    let s = Math.floor(t);
    let output = "";
    if (h) {
      output += h + ":";
    }
    output += (h ? pad(m) : m) + ":";
    output += pad(s);
    return output;
  }

  function pad(d: number): string {
    return ("0" + d).substr(-2);
  }

  function setAlias(speaker: SpeakerProps) {
    return function () {
      let { name, alias } = speaker;
      let result = prompt(`Alias for ${name}`, alias ?? "");
      speaker.alias = result ? result : null;
      speakers = speakers;
    };
  }
</script>

<div class="editor">
  {#if error}
    <div>
      <h1>An error occurred while parsing:</h1>
      <pre>{error}</pre>
    </div>
  {:else}
    <div class="controls fh-scroll">
      <h2>Options</h2>
      <div class="top-controls">
        <label>
          <input type="checkbox" bind:checked={conjoinOutput} />
          Combine consecutive with same speaker
        </label>
        <label>
          <input type="checkbox" bind:checked={showNumbers} />
          Add sentence numbers
        </label>
        <label>
          <input type="checkbox" bind:checked={showTimestamps} />
          Add timestamps
        </label>
        <label>
          Timestamp frequency
          <select bind:value={timestampFreq}>
            <option value={1}>all</option>
            <option value={60}>1m</option>
            <option value={120}>2m</option>
            <option value={300}>5m</option>
            <option value={600}>10m</option>
          </select>
        </label>
      </div>
      <h2>Speakers</h2>
      <ul>
        {#each speakers as speaker}
          <li class="speaker-slat">
            <label>
              <input type="checkbox" bind:checked={speaker.visible} />
              {speaker.alias ? speaker.alias : speaker.name}
            </label>
            <label>
              <input type="checkbox" bind:checked={speaker.moderator} />
              <abbr title="moderator">M</abbr>
            </label>
            <label>
              <input type="checkbox" bind:checked={speaker.showName} />
              <abbr title="show label">L</abbr>
            </label>
            <label>
              <button on:click={setAlias(speaker)}>alias</button>
            </label>
          </li>
        {/each}
      </ul>
    </div>

    <article class="output fh-scroll">
      {#each (conjoinOutput ? sepLinesConjoined : sepLines) || speakers as [{ text }, { name, visible, moderator, showName, alias }], i}
        {#if visible}
          <p>
            {#if showNumbers}
              [{i}]
            {/if}
            {#if showTimestamps && timestamps[i]}
              [{timestamps[i]}]
            {/if}
            {#if moderator}
              <strong>
                {#if showName}
                  {alias ? alias : name}:
                {/if}
                {text}
              </strong>
            {:else}
              {#if showName}
                <strong>{alias ? alias : name}: </strong>
              {/if}
              {text}
            {/if}
          </p>
        {/if}
      {/each}
    </article>
  {/if}
</div>

<style>
  .editor {
    display: flex;
    justify-content: flex-start;
    align-items: stretch;
  }

  .fh-scroll {
    box-sizing: border-box;
    max-height: 100%;
    padding: 1.5rem;
    overflow-y: auto;
  }

  .top-controls label {
    display: block;
  }

  ul {
    padding: 0;
  }

  .speaker-slat {
    padding: 0.25rem;
    margin: 0;
    list-style-type: none;
    display: flex;
    align-items: center;
  }
  .speaker-slat:hover {
    background-color: rgba(0, 0, 0, 0.1);
  }

  .speaker-slat label:first-child {
    flex: 1;
    border-right: 1px solid rgba(0, 0, 0, 0.5);
    margin-right: 0.5rem;
    padding-right: 0.5rem;
  }
  .speaker-slat label:not(:first-child) input {
    display: none;
  }
  .speaker-slat label:not(:first-child) abbr {
    display: block;
    text-decoration: none;
    font-weight: 600;
    background-color: #abb7c6;
    color: black;
    width: 1.5rem;
    margin: 0 0.25rem;
    text-align: center;
  }

  .speaker-slat label:not(:first-child) input:checked + abbr {
    background-color: #1b4c88;
    color: white;
  }

  .controls {
    background-color: #edf2f6;
    border-right: 1px solid rgba(0, 0, 0, 0.2);
  }

  .output {
    flex: 1;
    background-color: transparent;
  }

  strong {
    font-weight: 700;
  }
</style>
