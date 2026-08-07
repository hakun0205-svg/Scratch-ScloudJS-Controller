# Scratch Cloud Controller

ScloudJS 1.2.6 対応の Scratch Cloud Controller です。Web ページから Scratch のユーザー名・パスワード・プロジェクト ID を入力し、Scratch Cloud へ接続してクラウド変数の送信とキャッシュ確認を行えます。

この版は次の 2 つの実行方法に対応しています。

- **GitHub Pages + Supabase Edge Function**: 静的サイトから Supabase の Function を呼び出して Scratch Cloud を操作します。
- **Local Express API**: `node server.js` でローカル検証できます。

> GitHub Pages は Node.js プロセスや WebSocket サーバーを常駐できないため、ScloudJS は Supabase Edge Function 側で実行します。

---

## 必要環境

- Node.js 16+
- npm
- Supabase CLI（GitHub Pages + Supabase 構成でデプロイする場合）

---

## プロジェクト構成

```text
.
├── server.js                              # ローカル Express API（ScloudJS 1.2.6）
├── package.json
├── public/
│   ├── index.html                         # GitHub Pages 対応の Web UI
│   ├── style.css
│   └── app.js
└── supabase/
    ├── config.toml
    └── functions/scratch-controller/
        └── index.ts                       # Supabase Edge Function
```

---

## ローカルで動かす

```bash
npm install
npm start
```

ブラウザで `http://localhost:3000` を開き、バックエンド設定で **Local Express API** を選択してください。

---

## GitHub Pages + Supabase で動かす

### 1. Supabase Edge Function をデプロイ

Supabase CLI にログインしてプロジェクトをリンクした後、Function をデプロイします。

```bash
supabase login
supabase link --project-ref <your-project-ref>
supabase functions deploy scratch-controller
```

`supabase/config.toml` では GitHub Pages などの静的サイトから呼び出せるよう、`scratch-controller` の JWT 検証を無効化しています。必要に応じてアクセス制限を追加してください。

### 2. GitHub Pages に `public/` を公開

GitHub Pages の公開元を `public/` 相当の静的ファイルに設定するか、`public/index.html`、`public/app.js`、`public/style.css` を Pages の公開ブランチへ配置してください。

### 3. Web UI に Supabase 情報を入力

Web ページの「バックエンド設定」で以下を入力します。

- Supabase URL: `https://xxxxx.supabase.co`
- Supabase anon key
- Function 名: `scratch-controller`

「Supabase 設定を保存」を押すと、ブラウザの localStorage に保存されます。

---

## Web UI の使い方

1. 「Scratch Cloud 接続」に Scratch のユーザー名、パスワード、プロジェクト ID を入力します。
2. 「接続する」を押して Scratch Cloud に接続します。
3. 「クラウド変数送信」で変数名と値を入力し、「送信」を押します。
4. 「クラウド変数一覧」の「更新」で ScloudJS が保持しているクラウド変数キャッシュを表示します。
5. 必要に応じて「切断」を押します。

---

## 注意点

- Scratch Cloud は送信頻度が高すぎると制限される場合があります。
- Scratch のパスワードは Supabase Edge Function / ローカル API へ送信されます。共有 PC や信頼できない Function では入力しないでください。
- Edge Function のインスタンスは永続サーバーではありません。インスタンスが停止した場合は、再度接続操作が必要になることがあります。
- ScloudJS 1.2.6 の API に合わせ、`login`、`connect`、`handshake`、`sendtocloud` を利用しています。
