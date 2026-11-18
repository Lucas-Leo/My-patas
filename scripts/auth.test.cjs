const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const ts = require('typescript');

// Exercise the actual screen handlers without a native device or production accounts.
function screen(file, initial, api) {
  const state = [...initial];
  const storage = new Map();
  const alerts = [];
  let cursor = 0;
  const native = new Proxy({
    StyleSheet: { create: value => value },
    Alert: { alert: (...args) => alerts.push(args) },
    Animated: { Value: class {}, View: 'AnimatedView' },
  }, { get: (target, key) => target[key] || key });
  const localRequire = name => {
    if (name === 'react') return {
      useState: value => { const i = cursor++; if (state[i] === undefined) state[i] = value; return [state[i], next => { state[i] = next; }]; },
      useRef: value => ({ current: value }), useEffect() {},
    };
    if (name === 'react/jsx-runtime') return { jsx: (type, props) => ({ type, props }), jsxs: (type, props) => ({ type, props }) };
    if (name === 'react-native') return native;
    if (name === 'expo-router') return { Link: 'Link', useRouter: () => ({ replace() {} }), useNavigation: () => ({ navigate() {} }) };
    if (name === '@expo/vector-icons') return { Ionicons: 'Icon' };
    if (name === '@react-native-picker/picker') return { Picker: Object.assign(() => {}, { Item: 'Item' }) };
    if (name.includes('async-storage')) return {
      getItem: async key => storage.get(key) ?? null,
      setItem: async (key, value) => storage.set(key, value),
      removeItem: async key => storage.delete(key),
    };
    if (name.endsWith('/service/api')) return api;
    if (name.endsWith('/utils/session')) return { clearSession: async () => storage.clear(), setActiveProfile: async value => storage.set('activeProfile', value) };
    if (name.endsWith('/utils/apiError')) return { apiErrorMessage: error => error.message };
    if (name.endsWith('.png')) return 1;
    throw new Error('Unexpected import: ' + name);
  };
  const compiled = ts.transpileModule(fs.readFileSync(path.join(__dirname, '..', file), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
  }).outputText;
  const exports = {};
  vm.runInNewContext(compiled, { exports, require: localRequire, console, setTimeout() {}, clearTimeout() {} });
  const tree = exports.default();
  function find(value, handler) {
    if (!value || typeof value !== 'object') return;
    if (value.props?.onPress?.name === handler) return value.props.onPress;
    for (const child of Object.values(value)) {
      const result = find(child, handler);
      if (result) return result;
    }
  }
  return { state, storage, alerts, press: name => { const handler = find(tree, name); assert.ok(handler, name); return handler(); } };
}

test('login uses real API even for the former demo credentials and saves token', async () => {
  const app = screen('app/login.tsx', ['teste@teste.com', '123'], {
    post: async (url, body) => {
      assert.equal(url, '/login'); assert.equal(body.email, 'teste@teste.com');
      return { data: { usuario: { id: 42, email: body.email }, token: 'real-token' } };
    },
  });
  await app.press('OnClickLogin');
  assert.equal(app.storage.get('token'), 'real-token');
  assert.equal(JSON.parse(app.storage.get('usuario')).id, 42);
});

test('invalid login response cannot replace an existing session', async () => {
  const app = screen('app/login.tsx', ['test@example.invalid', 'password'], { post: async () => ({ data: { usuario: { id: 1 } } }) });
  app.storage.set('token', 'previous-token');
  await app.press('OnClickLogin');
  assert.equal(app.storage.get('token'), 'previous-token');
  assert.equal(app.alerts.length, 1);
  assert.equal(app.state[2], false);
});

const registration = [false, ' Test User ', 'TEST@example.invalid', 'long-password-123', 'long-password-123', '12345678901', '01/01/2000'];
test('registration sends the full password and does not persist passwords', async () => {
  const app = screen('app/register.tsx', registration, { post: async (url, body) => {
    assert.equal(url, '/usuarios'); assert.equal(body.senha, 'long-password-123');
    assert.equal(body.email, 'test@example.invalid'); assert.equal(body.data_nasc, '2000-01-01');
    return { data: { success: true, data: { id: 42, nome: body.nome, senha: 'server-hash' } } };
  } });
  await app.press('onClickRegistrar');
  assert.equal(app.storage.has('senhaCadastro'), false);
  assert.equal(JSON.parse(app.storage.get('usuario')).senha, undefined);
  assert.equal(app.state[0], false);
});

test('duplicate registration shows an error without creating local session', async () => {
  const app = screen('app/register.tsx', registration, { post: async () => ({ data: { success: false, message: 'E-mail já cadastrado.' } }) });
  await app.press('onClickRegistrar');
  assert.equal(app.storage.size, 0);
  assert.ok(app.state.includes('E-mail já cadastrado.'));
  assert.equal(app.state[0], false);
});

test('profile completion uses the transactional endpoint without changing the password', async () => {
  const app = screen('app/completarperfil.tsx', [false, '16999999999', 'Masculino', '15990000', 'SP', 'Matão', 'Centro', 'Rua Teste', '1', ''], {
    put: async (url, body) => {
      assert.equal(url, '/usuarios/editar-comum/42');
      assert.equal(body.senha, undefined); assert.equal(body.endereco.estado, 'SP');
      return { data: { success: true, data: { fk_idendereco: 9 } } };
    },
  });
  app.storage.set('usuario', JSON.stringify({ id: 42, nome: 'Test User' }));
  await app.press('onClickFinalizar');
  assert.equal(JSON.parse(app.storage.get('usuario')).fk_idendereco, 9);
  assert.equal(app.state[0], false);
});
