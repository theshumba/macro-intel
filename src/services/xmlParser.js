// ---------------------------------------------------------------------------
// xmlParser.js — Shared browser-side XML parsing module for Macro Intel
// Contains stripHtml, getTagText, and parseXml used by the ingestion engine.
//
// Note: The Cloudflare Worker at workers/rss-proxy/src/index.js has its own
// regex-based XML parsing since Workers lack DOMParser. That implementation
// is intentionally separate and should NOT be changed to use this module.
// ---------------------------------------------------------------------------

/**
 * Strip CDATA wrappers, HTML tags, and decode common HTML entities.
 */
export function stripHtml(html) {
  if (!html) return '';
  let text = html.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1');
  text = text.replace(/<[^>]*>/g, '');
  text = text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ');
  return text.trim();
}

/**
 * Get the text content of the first matching XML tag element.
 */
export function getTagText(item, tagName) {
  const el = item.getElementsByTagName(tagName)[0];
  return el ? (el.textContent || '') : '';
}

/**
 * Parse RSS/Atom XML using DOMParser.
 * Returns an array of { title, description, link, pubDate }.
 */
export function parseXml(xmlString) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlString, 'text/xml');
  if (doc.querySelector('parsererror')) return [];

  const items = [];

  const rssItems = doc.getElementsByTagName('item');
  if (rssItems.length > 0) {
    for (const item of rssItems) {
      items.push({
        title: stripHtml(getTagText(item, 'title')),
        description: stripHtml(getTagText(item, 'description')),
        link: getTagText(item, 'link').trim(),
        pubDate: getTagText(item, 'pubDate'),
      });
    }
    return items;
  }

  const entries = doc.getElementsByTagName('entry');
  for (const entry of entries) {
    const linkEl = entry.getElementsByTagName('link')[0];
    const href = linkEl ? (linkEl.getAttribute('href') || linkEl.textContent || '') : '';
    items.push({
      title: stripHtml(getTagText(entry, 'title')),
      description: stripHtml(getTagText(entry, 'summary') || getTagText(entry, 'content')),
      link: href.trim(),
      pubDate: getTagText(entry, 'updated') || getTagText(entry, 'published'),
    });
  }

  return items;
}
