import { describe, expect, it } from "vitest";
import { contactMessages } from "@/lib/content/contact";
import { firstContactIssue } from "./schema";

const valid = {
  name: "Ada",
  email: "ada@example.com",
  message: "Hello there, a project.",
  topics: [],
  company: "",
};

describe("contactFormSchema", () => {
  it("accepts a valid message", () => {
    expect(firstContactIssue(valid)).toBeNull();
  });

  it.each([
    [{ ...valid, name: "   " }, "name", contactMessages.invalidName],
    [{ ...valid, email: "nope" }, "email", contactMessages.invalidEmail],
    [
      { ...valid, message: "short" },
      "message",
      contactMessages.messageTooShort,
    ],
    [
      { ...valid, message: "x".repeat(5001) },
      "message",
      contactMessages.messageTooLong,
    ],
  ])(
    "rejects %j at the field, with the server's wording",
    (values, field, message) => {
      expect(firstContactIssue(values)).toEqual({ field, message });
    },
  );

  it("reports the first problem in form order", () => {
    expect(
      firstContactIssue({ ...valid, name: "", email: "nope", message: "" }),
    ).toEqual({ field: "name", message: contactMessages.invalidName });
  });
});
