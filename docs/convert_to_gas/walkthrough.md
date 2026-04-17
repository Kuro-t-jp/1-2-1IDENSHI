# Google Apps Script への移行完了報告 (Walkthrough)

「遺伝子とその変化」インタラクティブ学習アプリの Google Apps Script (GAS) への移行作業が完了しました。静的な Web ファイル（HTML/CSS/JS）を GAS のテンプレート構造に再構成しました。

## 実施内容

### 1. プロジェクト構造の再編
GAS の仕様に基づき、ファイルを以下の構成に配置しました：

- **Code.gs**: Web アプリのエントリーポイント (`doGet`) と、ファイルを連結するための `include` 関数を定義。
- **Index.html**: メインの HTML 構造。外部ライブラリ (Chart.js, jsPDF, html2canvas) の CDN リンクを保持。
- **Styles.html**: `web/style.css` の全スタイルを `<style>` タグでラップして格納。
- **Scripts.html**: `web/app.js` の全ロジックを `<script>` タグでラップして格納。

### 2. テンプレートの統合
`Index.html` 内で GAS のテンプレート構文を使用し、CSS と JavaScript を動的にインクルードするように設定しました：
- `<?!= include('Styles'); ?>`
- `<?!= include('Scripts'); ?>`

## 動作確認のポイント

GAS の Web アプリとしてデプロイした後、以下の機能が正常に動作することを確認してください：

- [ ] **DNAビルダー**: 塩基のクリックによる変更と、アミノ酸の自動更新。
- [ ] **突然変異ラボ**: 置換・挿入・欠失のシミュレーション。
- [ ] **進化シミュレーター**: Chart.js によるグラフ描画と世代更新。
- [ ] **確認テスト**: クイズの進行とスコア表示。
- [ ] **PDF書き出し**: 授業案の PDF エクスポート機能（jsPDF / html2canvas が正常にロードされているか）。

## 修正ファイル一覧

- [Code.gs](file:///Users/tk/Antigravity/Idenshi/1-2-1IDENSHI/Code.gs)
- [Index.html](file:///Users/tk/Antigravity/Idenshi/1-2-1IDENSHI/Index.html)
- [Styles.html](file:///Users/tk/Antigravity/Idenshi/1-2-1IDENSHI/Styles.html)
- [Scripts.html](file:///Users/tk/Antigravity/Idenshi/1-2-1IDENSHI/Scripts.html)

> [!IMPORTANT]
> このプロジェクトを実際に動作させるには、Google Apps Script エディタにこれらのファイルの内容をコピー＆ペーストし、「デプロイ」>「新しいデプロイ」から Web アプリとして公開する必要があります。
