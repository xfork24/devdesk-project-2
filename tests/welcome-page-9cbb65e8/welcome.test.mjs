import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

const entry = new URL('../../index.html', import.meta.url);

function page() {
  // A missing delivery file is an acceptance failure, never an import error.
  assert.ok(existsSync(entry), 'AC-01: root index.html must be delivered');
  const bytes = readFileSync(entry);
  const html = new TextDecoder('utf-8', { fatal: true }).decode(bytes);
  assert.ok(html.trim(), 'AC-01: the delivered page must not be empty');
  return html.replace(/<!--[\s\S]*?-->/g, '');
}

// Small static HTML reader; browser parsing and layout remain separate checks.
function tags(html) {
  return [...html.matchAll(/<([a-z][\w:-]*)\b((?:"[^"]*"|'[^']*'|[^'">])*)>/gi)].map(match => {
    const attrs = Object.create(null);
    for (const attr of match[2].matchAll(/([^\s=/'"<>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g)) {
      attrs[attr[1].toLowerCase()] = attr[2] ?? attr[3] ?? attr[4] ?? '';
    }
    return { name: match[1].toLowerCase(), attrs };
  });
}

function text(html) {
  return html.replace(/<(script|style|template)\b[^>]*>[\s\S]*?<\/\1\s*>/gi, '')
    .replace(/<[^>]*>/g, '').replace(/&#(x[0-9a-f]+|\d+);/gi, (_, n) =>
      String.fromCodePoint(n[0].toLowerCase() === 'x' ? parseInt(n.slice(1), 16) : Number(n)))
    .replace(/&nbsp;/gi, ' ').trim();
}

test('WP-01: HTML5, Chinese language, UTF-8 and viewport metadata', () => {
  const html = page();
  const elements = tags(html);
  assert.match(html, /^\s*<!doctype\s+html\s*>/i);
  assert.equal(elements.find(t => t.name === 'html')?.attrs.lang?.toLowerCase(), 'zh-cn');
  assert.ok(elements.some(t => t.name === 'meta' && t.attrs.charset?.toLowerCase() === 'utf-8'));
  const viewport = elements.find(t => t.name === 'meta' && t.attrs.name?.toLowerCase() === 'viewport');
  assert.match(viewport?.attrs.content ?? '', /(?:^|[,;\s])width\s*=\s*device-width(?:$|[,;\s])/i);
});

test('WP-02: tab title and welcome heading in the main body', () => {
  const html = page();
  assert.equal(text(html.match(/<title\b[^>]*>([\s\S]*?)<\/title\s*>/i)?.[1] ?? ''), '欢迎');
  const body = html.match(/<body\b[^>]*>([\s\S]*?)<\/body\s*>/i)?.[1] ?? '';
  const main = body.match(/<main\b[^>]*>([\s\S]*?)<\/main\s*>/i)?.[1] ?? '';
  const heading = main.match(/<h1\b[^>]*>([\s\S]*?)<\/h1\s*>/i)?.[1] ?? '';
  assert.equal(text(heading), '欢迎！', 'AC-01: main must contain the Chinese welcome h1');
  assert.ok(text(main).includes('欢迎！'));
});

test('WP-03: welcome content has no script, interaction or embedded state dependency', () => {
  const elements = tags(page());
  for (const { name, attrs } of elements) {
    assert.ok(!['script', 'iframe', 'frame', 'object', 'embed', 'form', 'input', 'button', 'select', 'textarea'].includes(name),
      `AC-02: unsupported interactive or executable element <${name}>`);
    assert.ok(!Object.keys(attrs).some(key => /^on/i.test(key)), 'AC-02: no event handlers');
    assert.ok(!('contenteditable' in attrs), 'AC-02: no editable state');
    if (name === 'meta') assert.notEqual(attrs['http-equiv']?.toLowerCase(), 'refresh');
  }
});

test('WP-04: resources and basic styles are embedded for offline opening', () => {
  const html = page();
  for (const { name, attrs } of tags(html)) {
    assert.ok(!['link', 'base'].includes(name), `AC-03: no linked resource or base URL <${name}>`);
    for (const attr of ['src', 'href', 'poster', 'background', 'action', 'data', 'xlink:href']) {
      if (attr in attrs) assert.match(attrs[attr], /^(?:data:|#)/i, `AC-03: ${name}.${attr} must be embedded`);
    }
    assert.ok(!('srcset' in attrs), 'AC-03: srcset resource selection requires browser review; use embedded resources');
  }
  const styles = [...html.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style\s*>/gi)].map(m => m[1]);
  assert.ok(styles.some(css => css.trim()), 'AC-03: basic CSS must be embedded');
  const inline = tags(html).map(t => t.attrs.style ?? '');
  const css = [...styles, ...inline].join('\n').replace(/\/\*[\s\S]*?\*\//g, '');
  assert.doesNotMatch(css, /@import\b/i, 'AC-03: no CSS imports');
  assert.doesNotMatch(css, /@font-face\b/i, 'AC-03: use system fonts');
  for (const match of css.matchAll(/url\(\s*(["']?)(.*?)\1\s*\)/gi)) {
    assert.match(match[2].trim(), /^(?:data:|#)/i, 'AC-03: CSS resources must be embedded');
  }
});
