const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

function load(file, imports, globals = {}) {
  const exports = {};
  const code = ts.transpileModule(fs.readFileSync(path.join(__dirname, '..', file), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true },
  }).outputText;
  vm.runInNewContext(code, { ...globals, exports, require: name => {
    if (!(name in imports)) throw new Error('Unexpected import: ' + name);
    return imports[name];
  } });
  return exports;
}
const utils = load('src/utils/adocao.ts', { './pets': { formatarIdadePet: value => String(value) } });

test('age respects the birthday and ignores timezone shifts in ISO birth dates', () => {
  const today = new Date(2026, 8, 16);
  assert.equal(utils.calcularIdadeUsuario('2000-09-16T00:00:00.000Z', today), '26');
  assert.equal(utils.calcularIdadeUsuario('2000-09-17', today), '25');
  assert.equal(utils.calcularIdadeUsuario('16/09/2000', today), '26');
  assert.equal(utils.calcularIdadeUsuario('2000-02-31', today), '');
  assert.equal(utils.calcularIdadeUsuario(null, today), '');
});

test('Next stays disabled for missing answers, whitespace, or unanswered follow-up questions', () => {
  const first = { nome: 'Ana', idade: '26', telefone: '(16) 99999-9999', cidade: 'Matão', moradia: 'casa', possuiAnimais: 'nao', possuiCriancas: 'nao' };
  assert.equal(utils.etapa1Completa(first), true);
  assert.equal(utils.etapa1Completa({ ...first, nome: ' ' }), false);
  assert.equal(utils.etapa1Completa({ ...first, possuiCriancas: '' }), false);
  assert.equal(utils.etapa1Completa({ ...first, idade: '17' }), false);
  const second = { motivacao: 'lar', motivacaoOutro: '', experiencia: 'nao', experienciaTexto: '', apoioFamilia: 'sim', rotina: 'nunca', financeiro: 'sim', ambiente: 'sim' };
  assert.equal(utils.etapa2Completa(second), true);
  assert.equal(utils.etapa2Completa({ ...second, motivacao: 'outro' }), false);
  assert.equal(utils.etapa2Completa({ ...second, experiencia: 'sim' }), false);
  assert.equal(utils.etapa2Completa({ ...second, experiencia: 'sim', experienciaTexto: 'Já cuidei de um cão.' }), true);
});

function backend({ existing = [], first = [], second = [], failSecond = false, token = 'valid-token' } = {}) {
  const posts = [];
  let requests = existing;
  const api = {
    get: async (url, config) => {
      assert.equal(config.headers.Authorization, 'Bearer valid-token');
      if (url.includes('/usuario/')) return { data: requests };
      return { data: url.includes('etapa1') ? first : second };
    },
    post: async (url, body, config) => {
      assert.equal(config.headers.Authorization, 'Bearer valid-token');
      posts.push({ url, body });
      if (url === '/solicitacoesadocao') requests = [{ idsolicitacao: 90, fk_idpet: body.fk_idpet }];
      if (url === '/adocaoetapa1') first = [{ idetapa1: 1 }];
      if (url === '/adocaoetapa2') {
        if (failSecond) { failSecond = false; throw new Error('Network interruption'); }
        second = [{ idetapa2: 1 }];
      }
      return { data: { id: 90 } };
    },
  };
  return { posts, ...load('src/service/adoption.ts', { './api': api, '../utils/session': { getToken: async () => token } }) };
}
const payload = { petId: 5, userId: 2, etapa1: { nome: 'Ana', idade: '26' }, etapa2: { motivacao: 'Dar um lar' } };

test('submission authenticates every call and saves both questionnaires for the selected pet', async () => {
  const service = backend();
  assert.equal(await service.submitAdoption(payload), 90);
  assert.equal(service.posts.length, 3);
  assert.equal(service.posts[0].body.fk_idpet, 5);
  assert.equal(service.posts[1].body.fk_idsolicitacao, 90);
  assert.equal(service.posts[2].body.fk_idsolicitacao, 90);
});

test('completed duplicate produces the specific popup error and no new writes', async () => {
  const service = backend({ existing: [{ idsolicitacao: 90, fk_idpet: '5' }], first: [{}], second: [{}] });
  await assert.rejects(service.submitAdoption(payload), error => error instanceof service.AdoptionAlreadySentError);
  assert.equal(service.posts.length, 0);
});

test('retry after a partial failure resumes the missing questionnaire without duplicating the request', async () => {
  const service = backend({ failSecond: true });
  await assert.rejects(service.submitAdoption(payload), /Network interruption/);
  assert.equal(await service.submitAdoption(payload), 90);
  assert.equal(service.posts.filter(p => p.url === '/solicitacoesadocao').length, 1);
  assert.equal(service.posts.filter(p => p.url === '/adocaoetapa1').length, 1);
});

test('missing or fake session prevents all writes', async () => {
  for (const token of [null, 'token-ficticio-123']) {
    const service = backend({ token });
    await assert.rejects(service.submitAdoption(payload), /Entre novamente/);
    assert.equal(service.posts.length, 0);
  }
});

test('tracking retains the real pet name and photo', () => {
  const result = utils.normalizarSolicitacaoAdocao({ idsolicitacao: 90, pet: 'Amora', pet_foto: 'https://example.invalid/amora.jpg' });
  assert.equal(result.id, '90');
  assert.equal(result.petName, 'Amora');
  assert.equal(result.imageUri, 'https://example.invalid/amora.jpg');
});

test('status aliases share colors and progress, and rejection is never approval', () => {
  assert.equal(utils.getStatusConfig('Em análise').step, 1);
  assert.equal(utils.getStatusConfig('Em analise').step, 1);
  assert.equal(utils.getStatusConfig('Entrevista').step, 2);
  assert.equal(utils.getStatusConfig('Visita').step, 3);
  assert.equal(utils.getStatusConfig('Aprovado').step, 4);
  assert.equal(utils.getStatusConfig('Finalizado').step, 5);
  assert.equal(utils.getStatusConfig('Reprovado').step, -1);
  assert.equal(utils.getStatusConfig('Não aprovado').step, -1);
});

test('visible screen refreshes on interval, mutations and foreground, and cleans up on blur', async () => {
  let cleanup, tick, appListener, eventListener;
  let count = 0, cleared = false, removed = false, unsubscribed = false;
  const AppState = { currentState: 'active', addEventListener: (_, fn) => { appListener = fn; return { remove: () => { removed = true; } }; } };
  const hook = load('hooks/useAdoptionRefresh.ts', {
    react: { useRef: value => ({ current: value }), useCallback: fn => fn },
    'react-native': { AppState },
    '@react-navigation/native': { useFocusEffect: fn => { cleanup = fn(); } },
    '../src/utils/adoptionUpdates': { subscribeAdoptionUpdates: fn => { eventListener = fn; return () => { unsubscribed = true; }; } },
  }, { setInterval: (fn, ms) => { assert.equal(ms, 5000); tick = fn; return 1; }, clearInterval: () => { cleared = true; } });
  hook.useAdoptionRefresh(async isCurrent => { if (isCurrent()) count++; });
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(count, 1);
  tick(); await new Promise(resolve => setImmediate(resolve)); assert.equal(count, 2);
  eventListener(); await new Promise(resolve => setImmediate(resolve)); assert.equal(count, 3);
  AppState.currentState = 'background'; appListener('background');
  tick(); await new Promise(resolve => setImmediate(resolve)); assert.equal(count, 3);
  AppState.currentState = 'active'; appListener('active');
  await new Promise(resolve => setImmediate(resolve)); assert.equal(count, 4);
  cleanup(); tick(); await new Promise(resolve => setImmediate(resolve)); assert.equal(count, 4);
  assert.ok(cleared && removed && unsubscribed);
});

test('an old response cannot overwrite a status changed during its request', async () => {
  let eventListener, release;
  let requests = 0;
  const applied = [];
  const hook = load('hooks/useAdoptionRefresh.ts', {
    react: { useRef: value => ({ current: value }), useCallback: fn => fn },
    'react-native': { AppState: { currentState: 'active', addEventListener: () => ({ remove() {} }) } },
    '@react-navigation/native': { useFocusEffect: fn => fn() },
    '../src/utils/adoptionUpdates': { subscribeAdoptionUpdates: fn => { eventListener = fn; return () => {}; } },
  }, { setInterval: () => 1, clearInterval() {} });
  hook.useAdoptionRefresh(async isCurrent => {
    requests++;
    const n = requests;
    if (n === 1) await new Promise(resolve => { release = resolve; });
    if (isCurrent()) applied.push(n);
  });
  eventListener(); assert.equal(requests, 1);
  release();
  for (let i = 0; i < 6; i++) await new Promise(resolve => setImmediate(resolve));
  assert.deepEqual(applied, [2]);
});
