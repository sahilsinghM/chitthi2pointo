import { describe, expect, it } from "vitest";
import { escapeHtml, htmlToPlainText, renderBodyToHtml, toPreviewText } from "../../lib/content";

describe("content helpers", () => {
  it("escapes HTML entities", () => {
    expect(escapeHtml("<div>&\"'</div>")).toBe("&lt;div&gt;&amp;&quot;&#39;&lt;/div&gt;");
  });

  it("renders body to HTML with line breaks", () => {
    expect(renderBodyToHtml("Line 1\nLine 2")).toBe("<div>Line 1<br />Line 2</div>");
  });

  it("creates preview text with ellipsis", () => {
    expect(toPreviewText("a".repeat(200), 10)).toBe("aaaaaaaaa…");
  });

  it("converts HTML to plain text", () => {
    const html = "<div>Hello<br />World</div>";
    expect(htmlToPlainText(html)).toBe("Hello\nWorld");
  });
});
