import * as path from "https://deno.land/std@0.161.0/path/mod.ts";
import * as io from "https://deno.land/std@0.161.0/io/mod.ts";

const ignore = new Set([".git", "node_modules"]);
const encoder = new TextEncoder();

type GrepResult = {
  fileName: string;
  line: number;
  text: string;
};

function encode(result: GrepResult): Uint8Array {
  const text = `${result.fileName}:${result.line}:${result.text}\n`;
  return encoder.encode(text);
}

async function grep(
  dir: string,
  word: string,
): Promise<GrepResult[]> {
  let result: GrepResult[] = [];
  for await (const entry of Deno.readDir(dir)) {
    const name = path.join(dir, entry.name);
    if (entry.isDirectory && !ignore.has(entry.name)) {
      result = result.concat(await grep(name, word));
    } else if (entry.isFile) {
      const file = await Deno.open(name);
      try {
        let linenum = 1;
        for await (const text of io.readLines(file)) {
          if (text.match(word)) {
            result.push({
              fileName: name,
              line: linenum,
              text: text,
            });
          }
          linenum++;
        }
      } finally {
        file.close();
      }
    }
  }
  return result;
}

const [word, dir] = Deno.args;
const result = await grep(dir, word);

const bw = new io.BufWriter(Deno.stdout);

for (const entry of result) {
  await bw.write(encode(entry));
  if (bw.buffered() === 1000) {
    await bw.flush();
  }
}
bw.flush();
