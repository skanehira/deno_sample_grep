import * as io from "https://deno.land/std@0.165.0/io/mod.ts";
import { walk } from "https://deno.land/std@0.165.0/fs/walk.ts";

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
  root: string,
  word: string,
): Promise<GrepResult[]> {
  const result = [];
  for await (const entry of walk(root, { skip: [/^\.git/] })) {
    if (entry.isFile) {
      const file = await Deno.open(entry.path);
      try {
        let line = 1;
        for await (const text of io.readLines(file)) {
          if (text.match(word)) {
            result.push({
              fileName: entry.path,
              line: line,
              text: text,
            });
          }
          line++;
        }
      } finally {
        file.close();
      }
    }
  }
  return result;
}

const [word, root] = Deno.args;

const result = await grep(root, word);
const bw = new io.BufWriter(Deno.stdout);

for (const entry of result) {
  await bw.write(encode(entry));
}
await bw.flush();
