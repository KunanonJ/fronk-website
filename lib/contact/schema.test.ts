import { describe, expect, it } from "vitest";
import { contactMessages } from "@/lib/content/contact";
import { firstContactIssue } from "./schema";

const valid = {
  name: "Ada",
  message: "Hello there, a project.",
  topics: [],
};

describe("contactFormSchema", () => {
  it("accepts a valid message", () => {
    expect(firstContactIssue(valid)).toBeNull();
    expect(
      firstContactIssue({ ...valid, topics: ["Freelance or consulting"] }),
    ).toBeNull();
  });

  it.each([
    [{ ...valid, name: "   " }, "name", contactMessages.invalidName],
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
    "rejects %j at the field, in the form's words",
    (values, field, message) => {
      expect(firstContactIssue(values)).toEqual({ field, message });
    },
  );

  it("refuses a topic the form does not offer", () => {
    expect(firstContactIssue({ ...valid, topics: ["Spam"] })?.field).toBe(
      "topics.0",
    );
  });

  it("reports the first problem in form order", () => {
    expect(firstContactIssue({ ...valid, name: "", message: "" })).toEqual({
      field: "name",
      message: contactMessages.invalidName,
    });
  });
});
