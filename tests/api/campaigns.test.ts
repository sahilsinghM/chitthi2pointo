/* @vitest-environment node */
import { describe, expect, it, vi } from "vitest";
import { POST } from "../../app/api/campaigns/route";

vi.mock("../../lib/auth", () => ({
  requireUser: vi.fn().mockResolvedValue({ id: "user-1" }),
  requirePublication: vi.fn().mockResolvedValue({ id: "pub-1" })
}));

vi.mock("../../lib/prisma", () => ({
  prisma: {
    campaign: {
      create: vi.fn().mockResolvedValue({
        id: "camp-1",
        title: "Test",
        subject: "Test",
        status: "DRAFT"
      })
    }
  }
}));

describe("campaigns API", () => {
  it("creates a campaign", async () => {
    const request = new Request("http://localhost/api/campaigns", {
      method: "POST",
      body: JSON.stringify({ title: "Test", subject: "Test", body: "Hello", status: "draft" })
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.campaign.id).toBe("camp-1");
  });
});
