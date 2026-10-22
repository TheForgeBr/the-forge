// Sincroniza as issues do repositório com Docs/ISSUES.json usando o gh CLI.
// Upsert por título: atualiza a issue aberta que já existe (só se mudou) ou
// cria uma nova. Issues fechadas não são recriadas nem reabertas. Nunca fecha
// nem apaga nada. Rodar duas vezes seguidas não gera duplicatas.
//
// Uso: node scripts/sync-issues.mjs [--dry-run]
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';

const dryRun = process.argv.includes('--dry-run');
const spec = JSON.parse(fs.readFileSync('Docs/ISSUES.json', 'utf8'));

// Sem shell: os argumentos vão direto para o gh, sem interpretação.
const gh = (args, input) =>
  execFileSync('gh', args, { encoding: 'utf8', input });

const titles = new Set();
for (const issue of spec.issues) {
  const title = issue.title.trim();
  if (titles.has(title)) throw new Error(`Título repetido no JSON: ${title}`);
  titles.add(title);
}

for (const label of spec.labels ?? []) {
  console.log(`label  ${label.name}`);
  if (!dryRun) {
    gh([
      'label',
      'create',
      label.name,
      '--color',
      label.color,
      '--description',
      label.description ?? '',
      '--force',
    ]);
  }
}

const existing = JSON.parse(
  gh([
    'issue',
    'list',
    '--state',
    'all',
    '--limit',
    '1000',
    '--json',
    'number,title,body,state,labels',
  ]),
);
const byTitle = new Map(existing.map((i) => [i.title.trim(), i]));

for (const issue of spec.issues) {
  const title = issue.title.trim();
  const labels = [...(issue.labels ?? [])].sort();
  const current = byTitle.get(title);

  if (!current) {
    console.log(`criar  ${title}`);
    if (!dryRun) {
      const args = ['issue', 'create', '--title', title, '--body-file', '-'];
      for (const l of labels) args.push('--label', l);
      console.log(`       ${gh(args, issue.body).trim()}`);
    }
    continue;
  }

  if (current.state !== 'OPEN') {
    console.log(`fechada #${current.number} ${title}`);
    continue;
  }

  const currentLabels = current.labels.map((l) => l.name).sort();
  const changed =
    current.body.trim() !== issue.body.trim() ||
    currentLabels.join(',') !== labels.join(',');
  if (!changed) {
    console.log(`igual  #${current.number} ${title}`);
    continue;
  }

  console.log(`atual. #${current.number} ${title}`);
  if (!dryRun) {
    const args = ['issue', 'edit', String(current.number), '--body-file', '-'];
    const add = labels.filter((l) => !currentLabels.includes(l));
    const remove = currentLabels.filter((l) => !labels.includes(l));
    if (add.length) args.push('--add-label', add.join(','));
    if (remove.length) args.push('--remove-label', remove.join(','));
    gh(args, issue.body);
  }
}
