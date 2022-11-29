import { grep } from "./grep.ts";
import { assertEquals } from "https://deno.land/std@0.165.0/testing/asserts.ts";

Deno.test({
  name: "test grep",
  fn: async () => {
    const want = [{
      fileName: "testdata/foo.txt",
      line: 2,
      text: "Vestibulum quis quam eu mauris molestie viverra eu at urna.",
    }, {
      fileName: "testdata/bar/bar.txt",
      line: 1,
      text:
        "Sed suscipit mauris venenatis magna ullamcorper, vitae tempor ex viverra.",
    }, {
      fileName: "testdata/bar/baz/baz.txt",
      line: 16,
      text: "Nullam eu viverra nibh.",
    }];

    const got = await grep("testdata", "viverra");

    assertEquals(want, got);
  },
});
