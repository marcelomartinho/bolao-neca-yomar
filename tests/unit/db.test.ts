import { describe, it, expect } from "vitest";
import { distributePrize, scoreForPick } from "@/lib/score";

describe("scoreForPick edge cases", () => {
  it("matches all 3 verdicts", () => {
    expect(scoreForPick("1", "1")).toBe(1);
    expect(scoreForPick("X", "X")).toBe(1);
    expect(scoreForPick("2", "2")).toBe(1);
  });
});

describe("distributePrize", () => {
  it("dá tudo pro 1º quando sem empate", () => {
    const out = distributePrize(
      [
        { id: "neca", score: 17 },
        { id: "yomar", score: 14 },
        { id: "belle", score: 12 },
      ],
      { first: 10_000, second: 5_000 },
    );
    expect(out.neca).toBe(10_000);
    expect(out.yomar).toBe(5_000);
    expect(out.belle).toBeUndefined();
  });

  it("rateia 1º lugar entre empatados", () => {
    const out = distributePrize(
      [
        { id: "a", score: 17 },
        { id: "b", score: 17 },
        { id: "c", score: 14 },
      ],
      { first: 10_000, second: 5_000 },
    );
    expect(out.a).toBe(5_000);
    expect(out.b).toBe(5_000);
    expect(out.c).toBe(5_000);
  });

  it("rateia 2º lugar entre empatados", () => {
    const out = distributePrize(
      [
        { id: "neca", score: 17 },
        { id: "a", score: 15 },
        { id: "b", score: 15 },
      ],
      { first: 10_000, second: 5_000 },
    );
    expect(out.neca).toBe(10_000);
    expect(out.a).toBe(2_500);
    expect(out.b).toBe(2_500);
  });

  it("retorna vazio com lista vazia", () => {
    expect(distributePrize([], { first: 1, second: 1 })).toEqual({});
  });
});
