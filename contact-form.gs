/**
 * きみのまなび おてつだい — お問い合わせフォーム受信スクリプト
 *
 * 役割: LP(kiminomanabi.online)のフォームから送られた内容を
 *       info@kyouiku-koubou.com にメール通知し、申込者には自動返信する。
 *
 * デプロイ手順:
 *   1. script.google.com で新規プロジェクトを作成し、このコードを貼り付け
 *   2. 「デプロイ」→「新しいデプロイ」→ 種類「ウェブアプリ」
 *   3. 「次のユーザーとして実行: 自分」/「アクセスできるユーザー: 全員」
 *   4. デプロイ → 承認 → 表示される ウェブアプリ URL (.../exec) をコピー
 */

// 通知先（受け取りたいアドレス）
var NOTIFY_TO = 'info@kyouiku-koubou.com';

function doPost(e) {
  try {
    var p = (e && e.parameter) ? e.parameter : {};
    var name  = p['お名前']        || '(未入力)';
    var grade = p['お子様の学年']  || '(未入力)';
    var email = p['メールアドレス'] || '(未入力)';
    var tel   = p['お電話番号']    || '(未入力)';

    var hasEmail = email && email.indexOf('@') > -1;

    // --- 管理者あて通知 ---
    var body = [
      'きみのまなび おてつだい LP からお申し込みがありました。',
      '',
      '■ お名前        : ' + name,
      '■ お子様の学年  : ' + grade,
      '■ メールアドレス: ' + email,
      '■ お電話番号    : ' + tel,
      '',
      '受信日時: ' + new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' })
    ].join('\n');

    var opts = {};
    if (hasEmail) opts.replyTo = email; // 返信でそのまま申込者へ返せる
    MailApp.sendEmail(NOTIFY_TO, '【きみのまなび】無料体験のお申し込み', body, opts);

    // --- 申込者あて自動返信 ---
    if (hasEmail) {
      var reply = [
        name + ' 様',
        '',
        'この度はお申し込みいただき、ありがとうございます。',
        '内容を確認のうえ、担当者より折り返しご連絡いたします。',
        '',
        'お急ぎの場合はお電話でもどうぞ。',
        '0120-91-6374（10:00〜22:00）',
        '',
        '──────────────',
        'きみのまなび おてつだい',
        '不登校から受験合格まで／小中学生専門オンライン学習塾'
      ].join('\n');
      MailApp.sendEmail(email, '【きみのまなび おてつだい】お申し込みありがとうございます', reply);
    }

    return ContentService
      .createTextOutput(JSON.stringify({ result: 'success' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    // エラーでも申込を取りこぼさないよう、自分あてに控えを送る
    try {
      MailApp.sendEmail(NOTIFY_TO, '【きみのまなび】フォーム受信エラー', String(err) + '\n\n' + JSON.stringify((e && e.parameter) || {}));
    } catch (e2) {}
    return ContentService
      .createTextOutput(JSON.stringify({ result: 'error', message: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// 動作確認用（ブラウザでURLを開くと OK と表示される）
function doGet(e) {
  return ContentService.createTextOutput('OK - kiminomanabi contact form is running.');
}
