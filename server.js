// server.js (1-100)

const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const scloudjs = require("scloudjs");

// ------------------------------
// Scratch Cloud Controller Server
// ScloudJS 1.2.6 対応
// ------------------------------

const app = express();
const PORT = process.env.PORT || 3000;

// 静的ファイル（publicフォルダ）
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.json());

// ------------------------------
// クラウド変数キャッシュ
// ------------------------------
let clouddatas = {};
let isConfigured = false;
let isConnected = false;

// Scratch プロジェクトのクラウド変数名
// 必要に応じて増やしてOK
const PRESET_CLOUD_NAMES = [
  "CLIENT",
  "HOST_1",
  "MESSAGE",
  "STATUS",
];

// ScloudJS にプリセット変数を登録
clouddatas = scloudjs.setpredata(PRESET_CLOUD_NAMES);

// ------------------------------
// Scratch からクラウド変数が届いた時の処理
// ------------------------------
const processFromCloud = (data) => {
  const parsed = scloudjs.parsedata(data, clouddatas);
  clouddatas = parsed.clouddatas;

  console.log("=== Cloud Update ===");
  console.log(parsed.changedlists);
};

// ------------------------------
// Scratch に接続する関数
// ------------------------------
async function connectToScratch(username, password, projectId) {
  try {
    console.log("[ScloudJS] setdatas...");
    scloudjs.setdatas(username, password, projectId, processFromCloud);

    console.log("[ScloudJS] login...");
    await scloudjs.login();

    console.log("[ScloudJS] connect...");
    await scloudjs.connect();

    console.log("[ScloudJS] handshake...");
    await scloudjs.handshake();

    isConfigured = true;
    isConnected = true;

    console.log("[ScloudJS] Connected OK");
    return { ok: true };
  } catch (err) {
    console.error("[ScloudJS ERROR]", err);
    isConfigured = false;
    isConnected = false;
    return { ok: false, error: err.message };
  }
}

// ------------------------------
// API: 状態確認
// ------------------------------
app.get("/api/status", (req, res) => {
  res.json({
    ok: true,
    configured: isConfigured,
    connected: isConnected,
    cloudNames: PRESET_CLOUD_NAMES,
  });
});

// ------------------------------
// API: 接続（Webページから）
// ------------------------------
app.post("/api/connect", async (req, res) => {
  const { username, password, projectId } = req.body;

  if (!username || !password || !projectId) {
    return res.json({
      ok: false,
      message: "username / password / projectId が必要です。",
    });
  }

  console.log("[API] connect request");
  const result = await connectToScratch(username, password, projectId);

  if (!result.ok) {
    return res.json({
      ok: false,
      message: "Scratch Cloud に接続できませんでした。",
      error: result.error,
    });
  }

  res.json({
    ok: true,
    message: "Scratch Cloud に接続しました。",
  });
});
// server.js (101-200)

// ------------------------------
// API: クラウド変数へ値を送信
// ------------------------------
app.post("/api/send", (req, res) => {
  if (!isConnected) {
    return res.json({
      ok: false,
      message: "Scratch Cloud に接続されていません。",
    });
  }

  const { name, value } = req.body;

  if (!name || typeof value === "undefined") {
    return res.json({
      ok: false,
      message: "name と value が必要です。",
    });
  }

  try {
    console.log(`[API] Send Cloud: ${name} = ${value}`);
    scloudjs.sendtocloud(name, value);

    // ローカルキャッシュ更新
    if (!clouddatas[name]) {
      clouddatas[name] = { value: value };
    } else {
      clouddatas[name].value = value;
    }

    res.json({
      ok: true,
      message: "クラウド変数に送信しました。",
      name,
      value,
    });
  } catch (err) {
    console.error("[SEND ERROR]", err);
    res.json({
      ok: false,
      message: "クラウド変数送信に失敗しました。",
      error: err.message,
    });
  }
});

// ------------------------------
// API: 現在のクラウド変数キャッシュを返す
// ------------------------------
app.post("/api/cloud-values", (req, res) => {
  res.json({
    ok: true,
    clouddatas,
  });
});

// ------------------------------
// API: 切断
// ------------------------------
app.post("/api/disconnect", (req, res) => {
  try {
    if (typeof scloudjs.close === "function") {
      scloudjs.close();
    }
    isConnected = false;
    res.json({
      ok: true,
      message: "Scratch Cloud から切断しました。",
    });
  } catch (err) {
    res.json({
      ok: false,
      message: "切断に失敗しました。",
      error: err.message,
    });
  }
});

// ------------------------------
// サーバー起動
// ------------------------------
app.listen(PORT, () => {
  console.log("======================================");
  console.log(" Scratch Cloud Controller 起動完了");
  console.log(` Port: ${PORT}`);
  console.log("======================================");
});
