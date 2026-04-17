# webディレクトリのファイルをGAS形式に変換する実装計画

## 背景
`web` ディレクトリにある静的なHTML, CSS, JSファイルを、Google Apps Scriptで動作するようにルートディレクトリの `.html` ファイルに統合します。

## 変更内容

### 1. [MODIFY] [Index.html](file:///Users/tk/Antigravity/Idenshi/1-2-1IDENSHI/Index.html)
`web/index.html` をベースに更新します。
- `style.css` のリンクを `<?!= include('Styles'); ?>` に差し替え。
- `app.js` のスクリプトタグを `<?!= include('Scripts'); ?>` に差し替え。

### 2. [MODIFY] [Styles.html](file:///Users/tk/Antigravity/Idenshi/1-2-1IDENSHI/Styles.html)
`web/style.css` の内容を `<style>` タグで囲んで保存します。

### 3. [MODIFY] [Scripts.html](file:///Users/tk/Antigravity/Idenshi/1-2-1IDENSHI/Scripts.html)
`web/app.js` の内容を `<script>` タグで囲んで保存します。

### 4. [KEEP] [Code.gs](file:///Users/tk/Antigravity/Idenshi/1-2-1IDENSHI/Code.gs)
既存の `Code.gs` はそのまま使用します。

## 検証計画
- ファイル生成後、構造が正しく変換されているか、GASの `include` 文法が正しく挿入されているかを確認します。
