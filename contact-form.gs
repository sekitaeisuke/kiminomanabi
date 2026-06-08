/**
 * きみのまなび おてつだい — お問い合わせフォーム受信スクリプト
 *
 * 役割: LP(kiminomanabi.online)のフォームから送られた内容を
 *       info@kyouiku-koubou.com にメール通知し、申込者には自動返信する。
 *
 * 重要: フォームの項目名は英語(name/grade/email/tel)。日本語の項目名は
 *       e.parameter で正しく受け取れないことがあるため英語キーにしている。
 *
 * 更新手順（コードを直したら必ず再デプロイ）:
 *   1. コードを貼り替えて保存（💾）
 *   2. 「デプロイ」→「デプロイを管理」→ 既存のデプロイの鉛筆✏️
 *   3. バージョン:「新バージョン」を選択 →「デプロイ」
 *      ※これで /exec のURLは変わらないまま中身が更新される
 */

// 通知先（受け取りたいアドレス）
var NOTIFY_TO = 'info@kyouiku-koubou.com';

function doPost(e) {
  try {
    var p = (e && e.parameter) ? e.parameter : {};

    var name  = p.name  || '';
    var grade = p.grade || '';
    var email = p.email || '';
    var tel   = p.tel   || '';
    var hasEmail = email && email.indexOf('@') > -1;

    // --- 管理者あて通知 ---
    var lines = [
      'きみのまなび おてつだい LP からお申し込みがありました。',
      '',
      '■ お名前        : ' + (name  || '(未入力)'),
      '■ お子様の学年  : ' + (grade || '(未入力)'),
      '■ メールアドレス: ' + (email || '(未入力)'),
      '■ お電話番号    : ' + (tel   || '(未入力)')
    ];

    // 念のため、想定外の項目も取りこぼさず記録
    var known = ['name', 'grade', 'email', 'tel', '_gotcha'];
    var extra = [];
    for (var k in p) { if (known.indexOf(k) < 0) extra.push(k + ': ' + p[k]); }
    if (extra.length) { lines.push('', '[その他受信データ]'); lines = lines.concat(extra); }

    lines.push('', '受信日時: ' + new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' }));

    var opts = {};
    if (hasEmail) opts.replyTo = email; // 返信でそのまま申込者へ返せる
    MailApp.sendEmail(NOTIFY_TO, '【きみのまなび】無料体験のお申し込み', lines.join('\n'), opts);

    // --- 申込者あて自動返信 ---
    if (hasEmail) {
      var reply = [
        (name || 'お申し込み者') + ' 様',
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
