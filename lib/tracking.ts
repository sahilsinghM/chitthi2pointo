export function buildTrackingPixelUrl({
  campaignId,
  subscriberId
}: {
  campaignId: string;
  subscriberId: string;
}) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
  const params = new URLSearchParams({ campaignId, subscriberId });
  return `${baseUrl}/api/track/open?${params.toString()}`;
}

export function buildClickRedirectUrl({
  token,
  subscriberId
}: {
  token: string;
  subscriberId: string;
}) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
  const params = new URLSearchParams({ token, subscriberId });
  return `${baseUrl}/api/track/click?${params.toString()}`;
}

export function buildUnsubscribeUrl({
  token,
  campaignId
}: {
  token: string;
  campaignId?: string;
}) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
  const params = new URLSearchParams({ token });
  if (campaignId) {
    params.set("campaignId", campaignId);
  }
  return `${baseUrl}/unsubscribe?${params.toString()}`;
}

export function appendTracking(html: string, options: {
  pixelUrl: string;
  unsubscribeUrl: string;
}) {
  return `${html}
<img src="${options.pixelUrl}" alt="" width="1" height="1" style="display:none" />
<p style="font-size:12px;color:#6b7280">If you no longer want these emails, <a href="${options.unsubscribeUrl}">unsubscribe</a>.</p>`;
}

export function replaceLinksWithTracked(html: string, replacer: (url: string) => string) {
  return html.replace(/href=\"(http[^\\\"]+)\"/g, (match, url) => {
    const trackedUrl = replacer(url);
    return match.replace(url, trackedUrl);
  });
}
