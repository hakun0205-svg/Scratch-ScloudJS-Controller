import scloudjs from 'npm:scloudjs@1.2.6';

type Payload = {
  username?: string;
  password?: string;
  projectId?: string;
  name?: string;
  value?: string;
};

const CLOUD_NAMES = ['CLIENT', 'HOST_1', 'MESSAGE', 'STATUS'];
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

let clouddatas = scloudjs.setpredata(CLOUD_NAMES);
let connected = false;

function json(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json; charset=utf-8' },
  });
}

function getAction(req: Request) {
  const url = new URL(req.url);
  return url.pathname.split('/').filter(Boolean).pop() || 'status';
}

async function getPayload(req: Request): Promise<Payload> {
  if (req.method === 'GET') return {};
  return await req.json().catch(() => ({}));
}

function validateCredentials(payload: Payload) {
  if (!payload.username || !payload.password || !payload.projectId) {
    throw new Error('username / password / projectId が必要です。');
  }
}

async function connectToScratch(payload: Payload) {
  validateCredentials(payload);
  scloudjs.setdatas(payload.username, payload.password, payload.projectId, (data: unknown) => {
    const parsed = scloudjs.parsedata(data, clouddatas);
    clouddatas = parsed.clouddatas;
    console.log('[ScloudJS] changed:', parsed.changedlists);
  });
  await scloudjs.login();
  await scloudjs.connect();
  await scloudjs.handshake();
  connected = true;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const action = getAction(req);
    const payload = await getPayload(req);

    if (action === 'status') {
      return json({ ok: true, connected, cloudNames: CLOUD_NAMES });
    }

    if (action === 'connect') {
      await connectToScratch(payload);
      return json({ ok: true, message: 'Scratch Cloud に接続しました。' });
    }

    if (action === 'send') {
      if (!connected) await connectToScratch(payload);
      if (!payload.name || typeof payload.value === 'undefined') {
        return json({ ok: false, message: 'name と value が必要です。' }, 400);
      }
      scloudjs.sendtocloud(payload.name, payload.value);
      clouddatas[payload.name] = { ...(clouddatas[payload.name] || {}), value: payload.value };
      return json({ ok: true, message: `送信成功: ${payload.name} = ${payload.value}` });
    }

    if (action === 'cloud-values') {
      if (!connected && payload.username && payload.password && payload.projectId) {
        await connectToScratch(payload);
      }
      return json({ ok: true, clouddatas });
    }

    if (action === 'disconnect') {
      scloudjs.close?.();
      connected = false;
      return json({ ok: true, message: 'Scratch Cloud から切断しました。' });
    }

    return json({ ok: false, message: `未対応の action です: ${action}` }, 404);
  } catch (error) {
    console.error(error);
    return json({ ok: false, message: error instanceof Error ? error.message : String(error) }, 500);
  }
});
