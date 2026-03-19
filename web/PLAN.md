# 遺伝子とその変化 — Webアプリ実装計画

## Goal
高校生物「遺伝子とその変化」を視覚的に・印象深く・楽しく・深く学べる
スタンドアロンWebアプリ（HTML/CSS/JS 3ファイル構成）を構築する。

## Assumptions
- フレームワーク不使用（バニラJS）— ブラウザで直接 index.html を開ける
- CDN: Chart.js（グラフ）, Google Fonts のみ
- ダークテーマ（バイオルミネッセントカラー）
- 学習指導要領（高校生物）準拠コンテンツ

## Plan

### 1. index.html — HTMLスケルトン
- Files: `web/index.html`
- Change:
  - ナビ・ヒーロー・8セクション・フッターの構造を作成
  - Canvas（DNAアニメーション）・ラボ・クイズの DOM を定義
- Verify: ブラウザで開いてセクション構造が表示される

### 2. style.css — デザインシステム
- Files: `web/style.css`
- Change:
  - CSS カスタムプロパティ（カラー・フォント・スペース）
  - ヒーロー・カード・シミュレーター・クイズの全スタイル
  - scroll reveal アニメーション・レスポンシブ対応
- Verify: ページが美しく表示される

### 3. app.js — インタラクティブ機能
- Files: `web/app.js`
- Change:
  - DNA ダブルヘリックス Canvas アニメーション（3D風）
  - スクロール進捗バー + IntersectionObserver reveal
  - 変異ラボ（選択・置換・挿入・欠失・コドン→アミノ酸変換）
  - フレームシフトビジュアライザー
  - SNP 個人差デモ
  - クイズ（8問・即時フィードバック・スコア）
- Verify: 各インタラクションが正常動作

## Sections
| # | ID | 内容 |
|---|----|----|
| 1 | hero | Canvas DNAヘリックス + キャッチコピー |
| 2 | basics | セントラルドグマ・コドン復習 |
| 3 | mutations | 置換・挿入・欠失の3種 + フレームシフト |
| 4 | lab | インタラクティブ変異シミュレーター |
| 5 | classification | サイレント・ミスセンス・ナンセンス・フレームシフト |
| 6 | snp | SNP個人差・活用例 |
| 7 | evolution | 進化フロー・中立進化論・染色体変化 |
| 8 | quiz | 8問確認テスト |
| 9 | summary | まとめ・振り返りテキストエリア |

## Risks & mitigations
- Canvas の resize でちらつく → requestAnimationFrame と debounce で対処
- コドン変換の誤り → 全64コドンテーブルを検証済みコードで実装
- モバイルで DNA ヘリックスが重い → opacity を下げて軽量化オプション

## Rollback plan
- 既存 GAS ファイルはそのまま残す（web/ サブディレクトリに新設）
- 新ファイルのみ削除すれば元の状態に戻る
