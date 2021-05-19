export interface Dialogue {
  speaker: string;
  text: string;
  startTime: number;
  endTime: number;
}

export function parseVTT(data: string): Dialogue[] {
  data = data.replace(/\r\n/g, "\n");
  data = data.replace(/\r/g, "\n");
  let entries = data.trim().split("\n\n");
  console.log(entries);
  if (entries.shift() !== "WEBVTT") {
    throw new Error("Not properly formatted VTT file.");
  }
  let lastSpeaker = "";
  let lastErrorState = "";
  try {
    return entries.map((entry, i) => {
      entry = entry.trim();
      lastErrorState = `splitting utterance ${i}:\n\n${entry}`;
      let [_id, times, body] = entry.split("\n");
      lastErrorState = `splitting utterance ${i}'s times:\n    ==> ${times}\n\n[[${entry}]]`;
      let [startTime, endTime] = times.split(" --> ").map(parseTime);
      let colon = body.indexOf(": ");
      let speaker = colon >= 0 ? body.substr(0, colon) : lastSpeaker;
      lastSpeaker = speaker;
      let text = body.substr(colon >= 0 ? colon + 2 : 0);
      return {
        startTime,
        endTime,
        speaker,
        text,
      };
    });
  } catch (_) {
    throw new Error(lastErrorState);
  }
}

function parseTime(timeString: string): number {
  let [, ...matches] = timeString.match(
    /(\d\d):(\d\d):(\d\d).(\d\d\d)/
  ) as RegExpMatchArray;
  let [h, m, s, ms] = matches.map((t) => parseInt(t));
  return h * 3600 + m * 60 + s + ms / 1000;
}

export function conjoin(data: Dialogue[]): Dialogue[] {
  let output: Dialogue[] = [];
  let lastSpeaker = "";
  let lastEntry: Dialogue;
  data.forEach(({ speaker, endTime, startTime, text }) => {
    if (speaker === lastSpeaker) {
      lastEntry.endTime = endTime;
      lastEntry.text += " " + text;
    } else {
      let newEntry = { speaker, endTime, startTime, text };
      lastEntry = newEntry;
      lastSpeaker = speaker;
      output.push(newEntry);
    }
  });
  return output;
}
