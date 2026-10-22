import fs from 'node:fs';
import { describe, expect, it } from 'vitest';

const DIR = 'marca/runas';
const runas = fs
  .readdirSync(DIR)
  .filter((n) => n.endsWith('.svg'))
  .map((n) => [n, fs.readFileSync(`${DIR}/${n}`, 'utf8')]);

describe('conjunto de runas', () => {
  it('tem de 8 a 10 runas', () => {
    expect(runas.length).toBeGreaterThanOrEqual(8);
    expect(runas.length).toBeLessThanOrEqual(10);
  });

  it('todas usam a mesma grade de 24 x 24', () => {
    const viewBoxes = new Set(
      runas.map(([, svg]) => /viewBox="([^"]+)"/.exec(svg)?.[1]),
    );
    expect([...viewBoxes]).toEqual(['0 0 24 24']);
  });

  it.each(runas)(
    '%s usa currentColor, sem cor fixa, e tem <title>',
    (_n, svg) => {
      expect(svg).toContain('stroke="currentColor"');
      expect(svg).not.toMatch(/#[0-9a-f]{3,8}\b|rgba?\(|hsla?\(/i);
      expect(svg).toMatch(/<title[^>]*>[^<]+<\/title>/);
    },
  );
});
