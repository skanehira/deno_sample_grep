import { grep, GrepResult } from "./grep.ts";
import * as io from "https://deno.land/std@0.165.0/io/mod.ts";

const encoder = new TextEncoder();

function encode(result: GrepResult): Uint8Array {
  const text = `${result.fileName}:${result.line}:${result.text}\n`;
  return encoder.encode(text);
}

const [word, root] = Deno.args;
const result = await grep(root, word);

const bw = new io.BufWriter(Deno.stdout);
for (const entry of result) {
  await bw.write(encode(entry));
}
await bw.flush();
