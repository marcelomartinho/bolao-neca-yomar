import { describe, it, expect } from "vitest";
import { scoreForPick } from "@/lib/score";

describe("scoreForPick", () => {
  it("retorna 1 quando palpite acerta resultado", () => {
    expect(scoreForPick("1", "1")).toBe(1);
    expect(scoreForPick("X", "X")).toBe(1);
    expect(scoreForPick("2", "2")).toBe(1);
  });

  it("retorna 0 quando palpite erra", () => {
    expect(scoreForPick("1", "X")).toBe(0);
    expect(scoreForPick("2", "1")).toBe(0);
  });

  it("retorna 0 quando resultado nulo (jogo não apitado)", () => {
    expect(scoreForPick("1", null)).toBe(0);
  });

  it("retorna 0 quando palpite ausente", () => {
    expect(scoreForPick(null, "1")).toBe(0);
  });
});
