import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, expect, it } from 'vitest';
import { CURRICULO } from '../conteudo/contato';
import { SalaContato } from './SalaContato';

const em = (rota: string) =>
  render(
    <MemoryRouter initialEntries={[rota]}>
      <SalaContato />
    </MemoryRouter>,
  );

describe('SalaContato', () => {
  it('os cinco itens apontam para o destino certo', () => {
    em('/contato');
    const destino = (nome: RegExp) =>
      screen.getByRole('link', { name: nome }).getAttribute('href');
    expect(destino(/^WhatsApp/)).toBe('https://wa.me/5561983289194');
    expect(destino(/^E-mail/)).toBe('mailto:rhuan.marques.robias@gmail.com');
    expect(destino(/^LinkedIn/)).toBe(
      'https://www.linkedin.com/in/rhuan-marques-714b4a1aa/',
    );
    expect(destino(/^GitHub/)).toBe('https://github.com/RhuanMr');
    expect(destino(/currículo/i)).toBe(
      '/curriculo/Rhuan-Marques-Curriculo.pdf',
    );
  });

  it('o currículo tem download e o link fixo', () => {
    em('/contato');
    const curriculo = screen.getByRole('link', { name: /currículo/i });
    expect(curriculo).toHaveAttribute('download');
    expect(CURRICULO).toBe('/curriculo/Rhuan-Marques-Curriculo.pdf');
  });

  it('links externos com rel="noopener noreferrer"', () => {
    em('/contato');
    for (const nome of [/^WhatsApp/, /^LinkedIn/, /^GitHub/])
      expect(screen.getByRole('link', { name: nome })).toHaveAttribute(
        'rel',
        'noopener noreferrer',
      );
  });

  it('em inglês, rótulos no idioma', () => {
    em('/en/contact');
    expect(
      screen.getByRole('heading', { level: 1, name: /Contact/ }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /Download résumé/ }),
    ).toBeInTheDocument();
    expect(
      screen.getByText('I reply in Portuguese and English.'),
    ).toBeInTheDocument();
  });
});
