// Kiem thu doc lap dot gop y 18/10: FAQ tre em tung tau (VI + EN), thanh lien he an san, thanh duoi, hero, so sanh.
const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const GOC = path.join(__dirname, '..');
const doc = (rel) => fs.readFileSync(path.join(GOC, rel), 'utf8');
const { GIA_TRE_EM, DANH_SACH_TAU } = require('../js/du-lieu-tau.js');
const td = require('../js/tu-dien-en.js');
global.TU_DIEN_EN = td.TU_DIEN_EN;
global.MAU_DICH_EN = td.MAU_DICH_EN;
const nn = require('../js/ngon-ngu.js');

const unesc = (s) => s.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'");
const CO_DAU = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i;

function muc(slug) {
  const faq = doc('faq.html');
  const bd = faq.indexOf('<a href="tau/' + slug + '.html"><b>');
  assert.ok(bd > 0, slug);
  return faq.slice(bd, faq.indexOf('</ul></li>', bd));
}
const chuTrong = (html) => html.split(/<[^>]+>/).map((s) => unesc(s).trim()).filter(Boolean);

test('faq: moi tau dung chinh sach rieng cua minh (mien phi, 50%, ghi chu)', () => {
  assert.strictEqual(DANH_SACH_TAU.length, 6);
  for (const t of DANH_SACH_TAU) {
    const m = unesc(muc(t.slug));
    const cs = GIA_TRE_EM[t.slug];
    assert.ok(cs, t.slug);
    for (const loai of Object.keys(cs)) {
      assert.ok(m.includes(cs[loai].mienPhi), t.slug + ' mien phi ' + loai);
      if (cs[loai].nuaGia) assert.ok(m.includes(cs[loai].nuaGia), t.slug + ' 50% ' + loai);
      if (cs[loai].ghiChu) assert.ok(m.includes(cs[loai].ghiChu), t.slug + ' ghi chu ' + loai);
    }
    assert.strictEqual((m.match(/<li>/g) || []).length, Object.keys(cs).length, t.slug + ' so dong');
    // set menu khong nua gia thi khong duoc in dong "Vé trẻ em 50%"
    const soNuaGia = Object.values(cs).filter((x) => x.nuaGia).length;
    assert.strictEqual((m.match(/Vé trẻ em 50%/g) || []).length, soNuaGia, t.slug + ' so dong 50%');
  }
});

test('faq: ban tieng Anh day du cho muc tre em tung tau, khong con chu Viet, khong cau nua Anh nua Viet', () => {
  for (const t of DANH_SACH_TAU) {
    for (const s of chuTrong(muc(t.slug)).filter((x) => x !== t.ten)) { // ten rieng cua tau giu nguyen
      const en = nn.dichChuoi(s, 'en');
      const ra = (en === null ? s : en).replace(/Ms Nguyên/g, 'Ms N');
      assert.ok(!CO_DAU.test(ra), t.slug + ' chua dich: ' + s + ' => ' + ra);
      assert.ok(!/\b(tuổi|miễn phí|trẻ em|người lớn|vé|bé)\b/i.test(ra), t.slug + ' lan Viet: ' + ra);
    }
  }
});

test('faq: ban dich EN giu dung tuoi / gia phu thu cua tung tau', () => {
  const ra = (slug) => chuTrong(muc(slug)).map((s) => nn.dichChuoi(s, 'en') || s).join(' | ');
  assert.ok(/100,000/.test(ra('saigon-princess')) && /100,000/.test(ra('ben-thanh-princess')));
  assert.ok(/under 4|below 4|0.4|0–4/i.test(ra('ben-nghe')), ra('ben-nghe'));
  assert.ok(/5.9/.test(ra('indochina-star')), ra('indochina-star'));
  assert.ok(/4.{1,12}11|under 11|below 11/i.test(ra('elite-of-saigon')), ra('elite-of-saigon'));
});

test('thanh-lien-he: an san trong HTML; hien-thi.js va dat-cho.js chi bat khi ve noi dung', () => {
  assert.ok(/thanh\.hidden = false;[\s\S]{0,80}thanh\.innerHTML/.test(doc('js/hien-thi.js')));
  assert.ok(/thanhDuoi\.hidden = false;[\s\S]{0,80}thanhDuoi\.innerHTML/.test(doc('js/dat-cho.js')));
  for (const f of ['index.html', 'faq.html', 'chinh-sach.html', 'kiem-tra-ve.html', 'xac-nhan.html']) {
    assert.ok(/id="thanh-lien-he" hidden><\/div>/.test(doc(f)), f);
  }
});

test('css: .hero-toan-man phu toan man hinh va [hidden] luon an', () => {
  const css = doc('css/style.css');
  assert.ok(/\.hero-toan-man\s*\{[^}]*(100vh|100svh|100dvh)/.test(css), 'hero toan man');
  assert.ok(/\[hidden\]\s*\{[^}]*display:\s*none\s*!important/.test(css), '[hidden]');
});

test('chu "so sanh" khong con trong trang/JS/CSS hien thi cho khach', () => {
  for (const f of ['index.html', 'faq.html', 'dat-cho.html', 'chinh-sach.html']) assert.ok(!/so sánh/i.test(doc(f)), f);
  for (const f of ['js/hien-thi.js', 'js/dat-cho.js', 'cong-cu/tao-trang.js', 'css/style.css']) assert.ok(!/so sánh|so-sanh/i.test(doc(f)), f);
});
