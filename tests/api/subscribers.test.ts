/* @vitest-environment node */
import { describe, expect, it, vi } from "vitest";
import { POST } from "../../app/api/subscribers/route";

vi.mock("../../lib/auth", () => ({
  requireUser: vi.fn().mockResolvedValue({ id: "user-1" }),
  requirePublication: vi.fn().mockResolvedValue({ id: "pub-1" })
}));

vi.mock("../../lib/prisma", () => ({
  prisma: {
    $transaction: vi.fn((fn) =>
      fn({
        tag: {
          upsert: vi.fn().mockResolvedValue({ id: "tag-1", name: "Weekly" })
        },
        subscriber: {
          create: vi.fn().mockResolvedValue({
            id: "sub-1",
            email: "test@example.com",
            status: "ACTIVE"
          })
        }
      })
    )
  }
}));

describe("subscribers API", () => {
  it("creates a subscriber", async () => {
    const request = new Request("http://localhost/api/subscribers", {
      method: "POST",
      body: JSON.stringify({ email: "test@example.com", tags: ["Weekly"] })
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.subscriber.id).toBe("sub-1");
  });
});
