# Scratch Cloud Controller
ScloudJS 1.2.6 対応の Scratch Cloud Controller  
Webページから Scratch Cloud に接続し、クラウド変数の送受信ができます。

---

## 📦 必要環境
- Node.js 16+
- npm

---

## 📁 プロジェクト構成
project/
├── server.js        # Node.js サーバー（ScloudJS 1.2.6）
├── package.json
└── public/
├── index.html   # Web UI
├── style.css    # UI スタイル
└── app.js       # ブラウザ側の処理

---

## 🔧 インストール

### 1. 依存ライブラリをインストール

npm install express body-parser scloudjs

### 2. サーバー起動

node server.js

起動後、ブラウザで以下にアクセス：
http://localhost:3000

---

## 🌐 Web UI の使い方

### 1. Scratch Cloud に接続

Webページ上部のフォームに以下を入力：

- **ユーザー名**（Scratch アカウント）
- **パスワード**
- **プロジェクトID**（Scratch の URL の末尾の数字）

例：

https://scratch.mit.edu/projects/123456789/
→ プロジェクトID = 123456789

「接続する」を押すと、ScloudJS が Scratch Cloud に接続します。

---

## ☁ クラウド変数の送信

「クラウド変数送信」フォームで：

- 変数名（例: MESSAGE）
- 値（例: Hello）

を入力して「送信」を押すと、クラウド変数に値が送られます。

---

## 📄 クラウド変数一覧の確認

「更新」ボタンを押すと、現在のクラウド変数キャッシュが表示されます。

---

## 🔌 切断

サーバー側 API `/api/disconnect` を叩くことで Scratch Cloud から切断できます。

---

## 📝 注意点

- Scratch Cloud は送信頻度が高すぎると制限される場合があります。
- パスワードは安全のため、公開環境では使用しないでください。
- ScloudJS 1.2.6 の仕様に合わせて動作しています。

---

## 👤 作者


