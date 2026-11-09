import { describe, expect, it } from "vitest";
import { contactMessages } from "@/lib/content/contact";
import { firstContactError } from "./schema";

const valid = { name: "Ada", email: "ada@example.com", message: "Hello there, a project.", topics: [], company: "" };

describe("contactFormSchema", () => {
  it("accepts a valid message", () => {
    expect(firstContactError(valid)).toBeNull();
  });

  it.each([
    [{ ...valid, name: "   " }, contactMessages.invalidName],
    [{ ...valid, email: "nope" }, contactMessages.invalidEmail],
    [{ ...valid, message: "short" }, contactMessages.messageTooShort],
    [{ ...valid, message: "x".repeat(5001) }, contactMessages.messageTooLong],
  ])("rejects %j with the server's wording", (values, message) => {
    expect(firstContactError(values)).toBe(message);
  });
});
