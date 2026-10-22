import { act, render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Fogo } from './Fogo';

const { iniciar, controle } = vi.hoisted(() => {
  const controle = { definirIntensidade: vi.fn(), parar: vi.fn() };
  return { controle, iniciar: vi.fn(() => controle) };
});
vi.mock('./chamas', () => ({ iniciarFogo: iniciar }));

function sistemaCom(reduzido: boolean) {
  vi.stubGlobal('matchMedia', () => ({
    matches: reduzido,
    addEventListener: () => {},
    removeEventListener: () => {},
  }));
}

async function esperarCarga() {
  await act(async () => {
    await vi.runAllTimersAsync();
  });
}

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

describe('Fogo', () => {
  it('com movimento normal, liga o fogo animado depois da pintura', async () => {
    vi.useFakeTimers();
    sistemaCom(false);
    const { container } = render(<Fogo intensidade={1} />);
    expect(iniciar).not.toHaveBeenCalled();
    await esperarCarga();
    expect(iniciar).toHaveBeenCalledWith(container.querySelector('canvas'), {
      estatico: false,
      intensidade: 1,
    });
  });

  it('com movimento reduzido, desenha um quadro estático', async () => {
    vi.useFakeTimers();
    sistemaCom(true);
    render(<Fogo intensidade={0.8} />);
    await esperarCarga();
    expect(iniciar).toHaveBeenCalledWith(expect.anything(), {
      estatico: true,
      intensidade: 0.8,
    });
  });

  it('muda a intensidade ao trocar de sala, sem religar', async () => {
    vi.useFakeTimers();
    sistemaCom(false);
    const { rerender } = render(<Fogo intensidade={1} />);
    await esperarCarga();
    rerender(<Fogo intensidade={0.25} />);
    expect(controle.definirIntensidade).toHaveBeenCalledWith(0.25);
    expect(iniciar).toHaveBeenCalledTimes(1);
  });

  it('para ao desmontar', async () => {
    vi.useFakeTimers();
    sistemaCom(false);
    const { unmount } = render(<Fogo intensidade={1} />);
    await esperarCarga();
    unmount();
    expect(controle.parar).toHaveBeenCalled();
  });
});
