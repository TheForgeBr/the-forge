import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import {
  arquivosDoConteudo,
  carregarRegras,
  problemasDosArquivos,
  problemasDoTexto,
  sha256,
} from './privacidade.mjs';

// Regras de exemplo: o nome reservado é fictício, para o teste não depender
// dos termos reais (que só existem como hash em proibidos.json).
const regras = {
  termos: [
    { texto: 'Automations', motivo: 'projeto fora' },
    { texto: 'token', motivo: 'segredo' },
    { texto: '.env', motivo: 'segredo' },
  ],
  padroes: [{ regex: '\\bghp_[A-Za-z0-9]{20,}', motivo: 'token do GitHub' }],
  hashes: [{ sha256: sha256('Forja Secreta'), palavras: 2, motivo: 'cliente' }],
  contatosAprovados: ['contato@exemplo.com'],
};

describe('problemasDoTexto', () => {
  it('aceita um texto limpo', () => {
    expect(problemasDoTexto('Projetos com React e Node.js.', regras)).toEqual(
      [],
    );
  });

  it('acusa termo proibido sem diferenciar maiúsculas', () => {
    expect(problemasDoTexto('O repositório automations', regras)).toEqual([
      'termo proibido "Automations" (projeto fora)',
    ]);
  });

  it('compara palavras inteiras: "token" não pega "tokens"', () => {
    expect(problemasDoTexto('design tokens da marca', regras)).toEqual([]);
    expect(problemasDoTexto('guarde o token aqui', regras)).toHaveLength(1);
    expect(problemasDoTexto('arquivo .envelope', regras)).toEqual([]);
  });

  it('acusa padrão de chave', () => {
    expect(
      problemasDoTexto('ghp_abcdefghijklmnopqrstuvwxyz', regras),
    ).toContain('padrão proibido /\\bghp_[A-Za-z0-9]{20,}/ (token do GitHub)');
  });

  it('acha o termo reservado pelo hash, com acento e maiúsculas diferentes', () => {
    expect(
      problemasDoTexto('Trabalhei para a FORJA  secréta em 2025.', regras),
    ).toEqual(['termo reservado (cliente), guardado como hash']);
  });

  it('acusa e-mail, telefone e caminho de disco fora dos contatos aprovados', () => {
    const texto =
      'Fale em eu@pessoal.com ou (61) 91234-5678; o arquivo está em C:\\Users\\alguem.';
    expect(problemasDoTexto(texto, regras)).toEqual([
      'e-mail fora dos contatos aprovados: eu@pessoal.com',
      'telefone fora dos contatos aprovados: (61) 91234-5678',
      'caminho de disco fora dos contatos aprovados: C:\\Users\\alguem.',
    ]);
    expect(
      problemasDoTexto('Escreva para contato@exemplo.com', regras),
    ).toEqual([]);
  });

  it('não confunde URL com caminho de disco', () => {
    expect(problemasDoTexto('https://github.com/TheForgeBr', regras)).toEqual(
      [],
    );
  });
});

describe('arquivos do conteúdo', () => {
  let raiz;
  afterEach(() => raiz && fs.rmSync(raiz, { recursive: true, force: true }));

  it('um termo proibido num texto do site falha; sem ele, passa', () => {
    raiz = fs.mkdtempSync(path.join(os.tmpdir(), 'forja-'));
    fs.mkdirSync(path.join(raiz, 'app/conteudo'), { recursive: true });
    fs.mkdirSync(path.join(raiz, 'conteudo/posts'), { recursive: true });
    const projetos = path.join(raiz, 'app/conteudo/projetos.ts');
    fs.writeFileSync(
      projetos,
      "export const resumo = 'Scripts do Automations';",
    );
    fs.writeFileSync(path.join(raiz, 'conteudo/posts/ola.pt.md'), '# Olá');
    fs.writeFileSync(
      path.join(raiz, 'app/conteudo/projetos.test.ts'),
      "it('Automations', () => {});",
    );

    const arquivos = arquivosDoConteudo(raiz);
    expect(arquivos.map((a) => path.basename(a)).sort()).toEqual([
      'ola.pt.md',
      'projetos.ts',
    ]);
    expect(problemasDosArquivos(arquivos, regras)).toHaveLength(1);

    fs.writeFileSync(projetos, "export const resumo = 'Scripts de teste';");
    expect(problemasDosArquivos(arquivos, regras)).toEqual([]);
  });
});

describe('conteúdo real do site', () => {
  it('não tem termo proibido nem contato fora da lista', () => {
    expect(
      problemasDosArquivos(arquivosDoConteudo(), carregarRegras()),
    ).toEqual([]);
  });
});
