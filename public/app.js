const $ = (id) => document.getElementById(id);

const elements = {
  apiModeInputs: [...document.querySelectorAll('input[name="apiMode"]')],
  supabaseSettings: $('supabaseSettings'),
  supabaseUrl: $('supabaseUrl'),
  supabaseAnonKey: $('supabaseAnonKey'),
  functionName: $('functionName'),
  saveSupabaseSettingsBtn: $('saveSupabaseSettingsBtn'),
  username: $('username'),
  password: $('password'),
  projectId: $('projectId'),
  connectBtn: $('connectBtn'),
  connectStatus: $('connectStatus'),
  cloudName: $('cloudName'),
  cloudValue: $('cloudValue'),
  sendBtn: $('sendBtn'),
  sendStatus: $('sendStatus'),
  refreshBtn: $('refreshBtn'),
  disconnectBtn: $('disconnectBtn'),
  cloudValues: $('cloudValues'),
};

const SETTINGS_KEY = 'scratch-cloud-controller:supabase';

function getMode() {
  return document.querySelector('input[name="apiMode"]:checked').value;
}

function loadSettings() {
  const saved = JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}');
  elements.supabaseUrl.value = saved.supabaseUrl || '';
  elements.supabaseAnonKey.value = saved.supabaseAnonKey || '';
  elements.functionName.value = saved.functionName || 'scratch-controller';
}

function saveSettings() {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify({
    supabaseUrl: elements.supabaseUrl.value.trim().replace(/\/$/, ''),
    supabaseAnonKey: elements.supabaseAnonKey.value.trim(),
    functionName: elements.functionName.value.trim() || 'scratch-controller',
  }));
}

function updateModeVisibility() {
  elements.supabaseSettings.hidden = getMode() !== 'supabase';
}

function getCredentials() {
  return {
    username: elements.username.value.trim(),
    password: elements.password.value,
    projectId: elements.projectId.value.trim(),
  };
}

function getSupabaseEndpoint(action) {
  const supabaseUrl = elements.supabaseUrl.value.trim().replace(/\/$/, '');
  const functionName = elements.functionName.value.trim() || 'scratch-controller';
  if (!supabaseUrl || !elements.supabaseAnonKey.value.trim()) {
    throw new Error('Supabase URL と anon key を入力してください。');
  }
  return `${supabaseUrl}/functions/v1/${functionName}/${action}`;
}

async function request(action, payload = {}, method = 'POST') {
  const mode = getMode();
  const endpoint = mode === 'supabase' ? getSupabaseEndpoint(action) : `/api/${action}`;
  const headers = { 'Content-Type': 'application/json' };

  if (mode === 'supabase') {
    const anonKey = elements.supabaseAnonKey.value.trim();
    headers.apikey = anonKey;
    headers.Authorization = `Bearer ${anonKey}`;
  }

  const options = { method, headers };
  if (method !== 'GET') {
    options.body = JSON.stringify(payload);
  }

  const response = await fetch(endpoint, options);
  const data = await response.json().catch(() => ({}));
  if (!response.ok || data.ok === false) {
    throw new Error(data.message || data.error || `HTTP ${response.status}`);
  }
  return data;
}

async function runWithStatus(button, statusElement, pendingText, task) {
  button.disabled = true;
  statusElement.textContent = pendingText;
  statusElement.className = 'status';
  try {
    const data = await task();
    statusElement.textContent = data.message || '完了しました。';
    statusElement.classList.add('success');
    return data;
  } catch (error) {
    statusElement.textContent = error.message;
    statusElement.classList.add('error');
    return null;
  } finally {
    button.disabled = false;
  }
}

elements.saveSupabaseSettingsBtn.addEventListener('click', () => {
  saveSettings();
  elements.connectStatus.textContent = 'Supabase 設定を保存しました。';
  elements.connectStatus.className = 'status success';
});

elements.apiModeInputs.forEach((input) => input.addEventListener('change', updateModeVisibility));

elements.connectBtn.addEventListener('click', async () => {
  saveSettings();
  await runWithStatus(elements.connectBtn, elements.connectStatus, '接続中...', () => (
    request('connect', getCredentials())
  ));
});

elements.sendBtn.addEventListener('click', async () => {
  await runWithStatus(elements.sendBtn, elements.sendStatus, '送信中...', () => (
    request('send', {
      ...getCredentials(),
      name: elements.cloudName.value.trim(),
      value: elements.cloudValue.value.trim(),
    })
  ));
});

elements.refreshBtn.addEventListener('click', async () => {
  await runWithStatus(elements.refreshBtn, elements.connectStatus, '読み込み中...', async () => {
    const data = await request('cloud-values', getCredentials());
    elements.cloudValues.textContent = JSON.stringify(data.clouddatas || {}, null, 2);
    return { message: 'クラウド変数一覧を更新しました。' };
  });
});

elements.disconnectBtn.addEventListener('click', async () => {
  await runWithStatus(elements.disconnectBtn, elements.connectStatus, '切断中...', () => (
    request('disconnect', getCredentials())
  ));
});

loadSettings();
updateModeVisibility();
