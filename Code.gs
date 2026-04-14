/**
 * 遺伝子とその変化 - インタラクティブ学習アプリ
 * Google Apps Script メインファイル
 * 
 * 学習指導要領（高等学校 生物）準拠
 * 「遺伝子とその変化」単元
 */

/**
 * WebアプリのエントリーポイントとなるdoGet関数
 * GASがWebアプリとしてデプロイされた際に呼ばれる
 */
function doGet(e) {
  // Index.htmlをテンプレートとして読み込む
  const template = HtmlService.createTemplateFromFile('Index');
  
  // テンプレートを評価してHTMLOutputを生成
  const htmlOutput = template.evaluate()
    .setTitle('遺伝子とその変化 | 高校生物インタラクティブ学習')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1.0');
  
  return htmlOutput;
}

/**
 * HTMLファイルのインクルード用ユーティリティ関数
 * Index.html内で <?= include('Styles') ?> のように使用する
 * 
 * @param {string} filename - インクルードするファイル名（拡張子なし）
 * @return {string} ファイルの内容
 */
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

/**
 * 学習記録をGoogleスプレッドシートに保存する関数
 * クライアントサイドからgoogle.script.run経由で呼び出す
 * 
 * @param {Object} data - 保存する学習データ
 * @param {string} data.studentName - 生徒名
 * @param {number} data.score - クイズスコア
 * @param {string} data.reflection - 振り返り内容
 * @param {string} data.timestamp - タイムスタンプ
 */
function saveLearningRecord(data) {
  try {
    // スプレッドシートのIDを設定（デプロイ後に変更が必要）
    // const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID_HERE';
    // const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getActiveSheet();
    
    // 現時点では記録のみ（スプレッドシート連携はオプション）
    console.log('学習記録を受信:', JSON.stringify(data));
    
    return { success: true, message: '記録が保存されました' };
  } catch (error) {
    console.error('保存エラー:', error.message);
    return { success: false, message: error.message };
  }
}
