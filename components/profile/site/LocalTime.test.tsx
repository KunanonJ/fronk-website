import { act, render } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { LocalTime } from "@/components/profile/site/LocalTime";

/*
 * The footer's clock (the "Now" line): nothing from the server, so no time
 * is cached in a page; in the browser, the time in the place, to the minute,
 * moving on as each minute starts.
 */
afterEach(() => {
  vi.useRealTimers();
});

describe("LocalTime", () => {
  it("draws nothing on the server", () => {
    expect(renderToString(<LocalTime timeZone="Asia/Bangkok" />)).toBe("");
  });

  it("shows the place's time to the minute, and moves on each minute", () => {
    vi.useFakeTimers();
    // 03:07:40 UTC is 10:07 in Bangkok (UTC+7).
    vi.setSystemTime(new Date("2026-11-20T03:07:40Z"));
    const { container } = render(<LocalTime timeZone="Asia/Bangkok" />);
    const time = container.querySelector("time")!;
    expect(time).toHaveTextContent("10:07");
    expect(time).toHaveAttribute("datetime", "2026-11-20T03:07:00.000Z");
    expect(time).toHaveAttribute("data-clock");

    act(() => {
      vi.advanceTimersByTime(20_100);
    });
    expect(container.querySelector("time")).toHaveTextContent("10:08");
  });

  it("hands its children the hour there, at each minute, and draws them after it", () => {
    vi.useFakeTimers();
    // 15:59:30 UTC is 22:59 in Bangkok; the next minute is 23:00.
    vi.setSystemTime(new Date("2026-11-20T15:59:30Z"));
    const hours: number[] = [];
    const { container } = render(
      <p>
        <LocalTime timeZone="Asia/Bangkok">
          {(hour) => {
            hours.push(hour);
            return <span data-testid="after">{hour}</span>;
          }}
        </LocalTime>
      </p>,
    );
    const after = container.querySelector('[data-testid="after"]');
    expect(after).toHaveTextContent("22");
    expect(after?.previousElementSibling?.tagName).toBe("TIME");

    act(() => {
      vi.advanceTimersByTime(30_100);
    });
    expect(container.querySelector('[data-testid="after"]')).toHaveTextContent(
      "23",
    );
    expect(hours.every((hour) => hour === 22 || hour === 23)).toBe(true);
  });

  it("hands midnight there as hour 0", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-11-20T17:00:30Z"));
    const { container } = render(
      <LocalTime timeZone="Asia/Bangkok">
        {(hour) => <span data-testid="after">{hour}</span>}
      </LocalTime>,
    );
    expect(container.querySelector("time")).toHaveTextContent("00:00");
    expect(container.querySelector('[data-testid="after"]')).toHaveTextContent(
      /^0$/,
    );
  });

  it("draws no children on the server", () => {
    expect(
      renderToString(
        <LocalTime timeZone="Asia/Bangkok">{() => <b>after</b>}</LocalTime>,
      ),
    ).toBe("");
  });
});
