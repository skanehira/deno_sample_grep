import * as io from "https://deno.land/std@0.165.0/io/mod.ts";
import { walk } from "https://deno.land/std@0.165.0/fs/walk.ts";

// 出力に必要な情報のデータ型を定義
export type GrepResult = {
  fileName: string;
  line: number;
  text: string;
};

export async function grep(
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
