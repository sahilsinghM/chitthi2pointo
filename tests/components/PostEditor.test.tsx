import React from "react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PostEditor from "../../app/components/PostEditor";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    replace: vi.fn(),
    refresh: vi.fn()
  })
}));

describe("PostEditor", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("saves a new campaign", async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ campaign: { id: "camp-1" } })
    });
    vi.stubGlobal("fetch", fetchMock);

    render(
      <PostEditor title="" subject="" body="" status="draft" />
    );

    await user.type(screen.getByPlaceholderText("Weekly product update"), "Hello");
    await user.type(screen.getByPlaceholderText("Subject line"), "Hello subject");
    await user.type(screen.getByPlaceholderText("Write your newsletter content here..."), "Body");
    await user.click(screen.getByRole("button", { name: "Save changes" }));

    expect(fetchMock).toHaveBeenCalledWith("/api/campaigns", expect.any(Object));
  });
});
