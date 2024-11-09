import { describe, expect, test } from "bun:test";
import { MaslowErrMsgKeyValueCantUse, MaslowErrMsgKeyValueSuffix, maslowMsgHandling } from "../maslow";

describe("Message Handling", () => {
    test("Some message", () => {
      expect(maslowMsgHandling("Some message")).toBe(`${MaslowErrMsgKeyValueCantUse} ${MaslowErrMsgKeyValueSuffix}Some message`);
    });
  });