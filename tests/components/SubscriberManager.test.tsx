import React from "react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SubscriberManager from "../../app/components/SubscriberManager";

describe("SubscriberManager", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("renders loaded subscribers", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        subscribers: [
          {
            id: "sub-1",
            email: "test@example.com",
            status: "ACTIVE",
            tags: [],
            source: "Manual"
          }
        ]
      })
    });
    vi.stubGlobal("fetch", fetchMock);

    render(<SubscriberManager />);

    expect(await screen.findByText("test@example.com")).toBeInTheDocument();
  });

  it("adds a subscriber via API", async () => {
    const user = userEvent.setup();
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ subscribers: [] })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          subscriber: { id: "sub-2", email: "new@example.com", status: "ACTIVE" }
        })
      });
    vi.stubGlobal("fetch", fetchMock);

    render(<SubscriberManager />);

    const emailInputs = screen.getAllByPlaceholderText("Email");
    await user.type(emailInputs[0], "new@example.com");
    const addButtons = screen.getAllByRole("button", { name: "Add subscriber" });
    await user.click(addButtons[0]);

    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith("/api/subscribers", expect.any(Object))
    );
  });
});
