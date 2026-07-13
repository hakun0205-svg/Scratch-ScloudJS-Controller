// app.js

// ------------------------------
// DOM 要素
// ------------------------------
const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");
const projectIdInput = document.getElementById("projectId");

const connectBtn = document.getElementById("connectBtn");
const connectStatus = document.getElementById("connectStatus");

const cloudNameInput = document.getElementById("cloudName");
const cloudValueInput = document.getElementById("cloudValue");
const sendBtn = document.getElementById("sendBtn");
const sendStatus = document.getElementById("sendStatus");

const refreshBtn = document.getElementById("refreshBtn");
const cloudValuesBox = document.getElementById("cloudValues");

// ------------------------------
// Scratch Cloud 接続
// ------------------------------
connectBtn.addEventListener("click", async () => {
  const username = usernameInput.value.trim();
  const password = passwordInput.value.trim();
  const projectId = projectIdInput.value.trim();

  connectStatus.textContent = "接続中...";

  const res = await fetch("/api/connect", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password, projectId })
  });

  const data = await res.json();

  if (data.ok) {
    connectStatus.textContent = "接続成功！";
  } else {
    connectStatus.textContent = "接続失敗: " + data.message;
  }
});

// ------------------------------
// クラウド変数送信
// ------------------------------
sendBtn.addEventListener("click", async () => {
  const name = cloudNameInput.value.trim();
  const value = cloudValueInput.value.trim();

  sendStatus.textContent = "送信中...";

  const res = await fetch("/api/send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, value })
  });

  const data = await res.json();

  if (data.ok) {
    sendStatus.textContent = `送信成功: ${name} = ${value}`;
  } else {
    sendStatus.textContent = "送信失敗: " + data.message;
  }
});

// ------------------------------
// クラウド変数一覧の取得
// ------------------------------
refreshBtn.addEventListener("click", async () => {
  cloudValuesBox.textContent = "読み込み中...";

  const res = await fetch("/api/cloud-values");
  const data = await res.json();

  if (data.ok) {
    cloudValuesBox.textContent = JSON.stringify(data.clouddatas, null, 2);
  } else {
    cloudValuesBox.textContent = "取得失敗";
  }
});
