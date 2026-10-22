import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { CURRICULO } from './contato';

// O PDF vem do Memento (npm run curriculo -- --vault <vault> --publicar
// <este repositório>), ADR 0005. Issue 7.1.
describe('currículo publicado', () => {
  it('o botão de Contato aponta para o PDF de public/', () => {
    expect(CURRICULO).toBe('/curriculo/Rhuan-Marques-Curriculo.pdf');
  });

  it('o arquivo existe e é um PDF', () => {
    const pdf = readFileSync(join(__dirname, '../../public', CURRICULO));
    expect(pdf.subarray(0, 5).toString('latin1')).toBe('%PDF-');
    expect(pdf.length).toBeGreaterThan(10_000);
  });
});
