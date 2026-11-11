import { describe, expect, it } from "vitest";
import { plural } from "./plural";

describe("plural", () => {
  it("uses the Polish one/few/many forms", () => {
    const form = (n: number) => plural(n, "osobę", "osoby", "osób");
    expect([1, 2, 4, 5, 12, 14, 22, 25, 0].map(form)).toEqual([
      "osobę",
      "osoby",
      "osoby",
      "osób",
      "osób",
      "osób",
      "osoby",
      "osób",
      "osób",
    ]);
  });
});
