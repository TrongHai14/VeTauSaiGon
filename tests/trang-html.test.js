const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { DANH_SACH_TAU, CONG_TY } = require('../js/du-lieu-tau.js');
const { CAU_HINH } = require('../js/cau-hinh.js');

const GOC = path.join(__dirname, '..');
const doc = (rel) => fs.readFileSync(path.join(GOC, rel), 'utf8');
const meta = (html, key, val) => {
  const m = new RegExp('<meta ' + key + '="' + val + '" content="([^"]*)">').exec(html);
  return m ? m[1] : null;
};
const unesc = (s) => s.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#39;/g, "'");
const title = (html) => unesc(/<title>([^<]*)<\/title>/.exec(html)[1]);
const KHUNG = ['<html lang="vi">', '<meta charset="utf-8">', 'name="viewport"', 'href="tel:0948170036"', 'href="https://zalo.me/0948170036"',
  'data-logo="header"', 'data-logo="footer"', 'data-gioi-thieu'];
const TEN_MIEN = CAU_HINH.tenMien.replace(/\/+$/, '');
// og:image chỉ có khi file ảnh có thật, và khi có thì trỏ đúng file đó.
const kiemTraOgImage = (html, anh) => {
  const coFile = !!anh && fs.existsSync(path.join(GOC, anh));
  assert.strictEqual(meta(html, 'property', 'og:image'), coFile ? TEN_MIEN + '/' + anh : null);
};
const TAT_CA = ['index.html', 'dat-cho.html', 'xac-nhan.html', 'chinh-sach.html', 'kiem-tra-ve.html'].concat(DANH_SACH_TAU.map((t) => 'tau/' + t.slug + '.html'));

// Vị trí các script theo thứ tự; -1 nếu thiếu.
// Script có thể kèm ?v=<mã phiên bản> để trình duyệt không dùng bản cũ trong bộ nhớ đệm.
const thoatRegex = (t) => t.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&');
const viTriScript = (html, tienTo, ds) => ds.map((s) => html.search(new RegExp('<script src="' + thoatRegex(tienTo + 'js/' + s) + '(\\?v=[0-9a-f]{8})?"></script>')));
const dungThuTu = (v) => v.every((x) => x >= 0) && v.every((x, i) => i === 0 || v[i - 1] < x);

for (const t of DANH_SACH_TAU) {
  test('tau/' + t.slug + '.html: data-tau, meta, og:image, khung, script', () => {
    const html = doc('tau/' + t.slug + '.html');
    assert.ok(html.includes('<body data-tau="' + t.slug + '">'));
    const tieuDe = t.ten + ' – Du thuyền ăn tối sông Sài Gòn | Vé Tàu Sài Gòn';
    assert.strictEqual(title(html), tieuDe);
    assert.strictEqual(unesc(meta(html, 'name', 'description')), t.moTaNgan);
    assert.strictEqual(unesc(meta(html, 'property', 'og:title')), tieuDe);
    kiemTraOgImage(html, CAU_HINH.anhTau[t.slug].daiDien);
    assert.strictEqual(meta(html, 'property', 'og:url'), TEN_MIEN + '/tau/' + t.slug + '.html');
    for (const k of KHUNG) assert.ok(html.includes(k), k);
    assert.ok(html.includes('id="noi-dung-tau"') && html.includes('<h1>' + t.ten + '</h1>') && html.includes('<noscript>'));
    assert.match(html, /href="\.\.\/css\/style\.css\?v=[0-9a-f]{8}"/);
    const v = viTriScript(html, '../', ['cau-hinh.js', 'du-lieu-tau.js', 'hien-thi.js']);
    assert.ok(dungThuTu(v));
    assert.ok(html.indexOf('khoiChayTrangTau()') > v[2]);
  });
}

test('index.html: meta, khung, o tim kiem, script', () => {
  const html = doc('index.html');
  assert.strictEqual(title(html), 'Vé Tàu Sài Gòn – Du thuyền ăn tối sông Sài Gòn');
  const mt = meta(html, 'name', 'description');
  assert.ok(mt && mt.length <= 160);
  kiemTraOgImage(html, CAU_HINH.anhBia[0]);
  for (const k of KHUNG.concat(['id="danh-sach-tau"', 'id="form-tim"', 'class="hero hero-toan-man"', 'href="#dat-ngay">Đặt chỗ ngay<', 'id="dat-ngay"'])) assert.ok(html.includes(k), k);
  assert.ok(dungThuTu(viTriScript(html, '', ['cau-hinh.js', 'du-lieu-tau.js', 'hien-thi.js'])));
  assert.ok(html.includes('khoiChayTrangChu()'));
});

test('dat-cho.html: 4 buoc, o VAT, khong co phieu cho khach, khong tai html2canvas', () => {
  const html = doc('dat-cho.html');
  for (const k of KHUNG.concat(['data-buoc="1"', 'data-buoc="2"', 'data-buoc="3"', 'data-buoc="4"', 'name="vat"',
    'name="congTyMst"', 'data-hanh-dong="da-chuyen"', 'id="khung-tom-tat"'])) assert.ok(html.includes(k), k);
  assert.ok(!html.includes('id="phieu"') && !html.includes('html2canvas'), 'trang khach khong tao phieu');
  assert.ok(dungThuTu(viTriScript(html, '', ['cau-hinh.js', 'du-lieu-tau.js', 'hien-thi.js', 'dat-cho.js'])));
  assert.ok(html.includes('khoiChayTrangDatCho()'));
});

test('xac-nhan.html: noindex, o xac nhan da nhan tien, khong co lien ket tu trang khac', () => {
  const html = doc('xac-nhan.html');
  assert.ok(html.includes('<meta name="robots" content="noindex, nofollow">'));
  assert.ok(html.includes('name="daNhanTien"') && html.includes('html2canvas') && html.includes('khoiChayTrangXacNhan()'));
  for (const f of TAT_CA.filter((f) => f !== 'xac-nhan.html')) assert.ok(!doc(f).includes('xac-nhan.html'), f);
});

test('footer moi trang: dai ly chinh thuc, gioi thieu cong ty, MST, hotline Ms Nguyen', () => {
  for (const f of TAT_CA) {
    const html = doc(f);
    for (const s of [CONG_TY.ten, CONG_TY.vaiTro, 'MST: ' + CONG_TY.mst, 'Hotline: Ms Nguyên', CAU_HINH.gioiThieuCongTy]) {
      assert.ok(html.includes(s), f + ' thieu ' + s);
    }
  }
});

test('JS khong dung XHR/module; fetch( chi o dat-cho.js; email FormSubmit chi 1 noi', () => {
  for (const f of ['cau-hinh.js', 'du-lieu-tau.js', 'hien-thi.js', 'dat-cho.js']) {
    const js = doc('js/' + f);
    assert.ok(!/XMLHttpRequest|^\s*(import|export)\s/m.test(js), f);
    if (f !== 'dat-cho.js') assert.ok(!/\bfetch\(/.test(js), f);
  }
  const lanXuatHien = TAT_CA.concat(['js/cau-hinh.js', 'js/du-lieu-tau.js', 'js/hien-thi.js', 'js/dat-cho.js'])
    .reduce((n, f) => n + (doc(f).match(/bookingindochinaqueen@gmail\.com/g) || []).length, 0);
  assert.strictEqual(lanXuatHien, 1);
});

test('npm test dung node --test; hien-thi.js khong doi document.title', () => {
  assert.strictEqual(JSON.parse(doc('package.json')).scripts.test, 'node --test');
  assert.ok(!/document\.title/.test(doc('js/hien-thi.js')));
});


test('ten mon trong cau-hinh.js khop bang gia (khong co mon la)', () => {
  for (const [slug, theoBang] of Object.entries(CAU_HINH.anhThucDon)) {
    const tau = DANH_SACH_TAU.find((t) => t.slug === slug);
    assert.ok(tau, slug);
    for (const [tieuDe, theoMon] of Object.entries(theoBang)) {
      const bang = tau.bangGia.find((b) => b.tieuDe === tieuDe);
      assert.ok(bang, slug + ' / ' + tieuDe);
      for (const ten of Object.keys(theoMon)) assert.ok(bang.dong.some((d) => d.ten === ten), slug + ' / ' + tieuDe + ' / ' + ten);
    }
  }
});

test('khoiChayTrangTau: data-tau sai hien "Khong tim thay tau" khong loi', () => {
  const out = {};
  const el = (id) => (out[id] = out[id] || { id, innerHTML: '' });
  const ctx = {
    document: { body: { getAttribute: () => 'tau-ma' }, getElementById: el, querySelectorAll: () => [], querySelector: () => null },
    console
  };
  vm.createContext(ctx);
  for (const f of ['cau-hinh.js', 'du-lieu-tau.js', 'hien-thi.js']) vm.runInContext(doc('js/' + f), ctx);
  assert.doesNotThrow(() => ctx.khoiChayTrangTau());
  assert.ok(out['noi-dung-tau'].innerHTML.includes('Không tìm thấy tàu'));
});

test('chinh-sach.html: du 5 muc theo update.docx, footer moi trang co link chinh sach va ban do', () => {
  const { CHINH_SACH_CHUNG } = require('../js/du-lieu-tau.js');
  const html = doc('chinh-sach.html');
  for (const m of CHINH_SACH_CHUNG) {
    assert.ok(html.includes('<details id="' + m.id + '" open>'), m.id);
    for (const n of m.nhom) for (const d of n.dong) assert.ok(html.includes(d.replace(/“/g, '“')), d);
  }
  for (const f of TAT_CA) {
    assert.ok(doc(f).includes('chinh-sach.html#doi-tra'), f);
    assert.ok(doc(f).includes('google.com/maps'), f);
  }
});

test('dat-cho.html: email nhan ve va o dong y dieu kien ve', () => {
  const html = doc('dat-cho.html');
  assert.ok(html.includes('name="dongY"') && html.includes('data-loi="dongY"') && html.includes('href="chinh-sach.html"'));
  assert.ok(html.includes('nhận vé điện tử PDF') && html.includes('24 giờ'));
});

test('logo Nguyen Nguyen Travel nen trong suot: canh chu Ve Tau Sai Gon o header va o footer; khong con logo goc phai', () => {
  assert.strictEqual(CAU_HINH.logo.header, 'anh/logo/logo-nguyen-nguyen-trong-suot.png');
  assert.strictEqual(CAU_HINH.logo.footer, CAU_HINH.logo.header);
  const p = path.join(GOC, CAU_HINH.logo.header);
  assert.ok(fs.existsSync(p) && fs.statSync(p).size < 512000);
  assert.strictEqual(fs.readFileSync(p).slice(1, 4).toString(), 'PNG', 'logo la PNG (co nen trong suot)');
  for (const f of TAT_CA) {
    const html = doc(f);
    assert.ok(html.indexOf('data-logo="header"') > 0 && html.indexOf('data-logo="header"') < html.indexOf('</header>'), f);
    assert.ok(!html.includes('logo-goc-phai') && !html.includes('gocPhai'), f + ' con logo goc phai');
  }
});

test('bo 4 the o trang chu va 5 huy hieu o footer; nut VI/EN o header nam giua logo va menu', () => {
  assert.ok(!doc('index.html').includes('class="diem-manh"'));
  for (const f of TAT_CA) {
    const html = doc(f);
    assert.ok(!html.includes('class="dai-uy-tin"'), f + ' con huy hieu footer');
    const logo = html.indexOf('class="logo"');
    const nn = html.indexOf('class="chon-ngon-ngu"');
    const menu = html.indexOf('class="menu-chinh"');
    assert.ok(logo > 0 && logo < nn && nn < menu, f + ' VI/EN nam giua logo va menu');
    assert.ok(html.includes('data-ngon-ngu="vi"') && html.includes('data-ngon-ngu="en"'), f);
  }
});

test('footer co nut Facebook, Zalo, TikTok; link trong cau-hinh, trong thi an', () => {
  const mxh = CAU_HINH.mangXaHoi;
  assert.ok(mxh && 'facebook' in mxh && 'zalo' in mxh && 'tiktok' in mxh);
  for (const f of TAT_CA) {
    const html = doc(f);
    for (const k of ['facebook', 'zalo', 'tiktok']) {
      const m = new RegExp('<a class="nut-mxh nut-mxh-' + k + '[^"]*" href="([^"]*)"([^>]*)>').exec(html);
      assert.ok(m, f + ' thieu nut ' + k);
      if (mxh[k]) assert.ok(m[1] === mxh[k] && !/hidden/.test(m[2]), f + ' ' + k + ' phai hien voi dung link');
      else assert.ok(/data-mxh-trong hidden/.test(m[2]), f + ' ' + k + ' chua co link thi an');
    }
  }
});

test('css: phan tu co thuoc tinh hidden luon an (nut mang xa hoi chua co link khong hien ra cho khach)', () => {
  const css = require('node:fs').readFileSync(require('node:path').join(__dirname, '..', 'css', 'style.css'), 'utf8');
  assert.ok(/\[hidden\]\s*\{\s*display:\s*none\s*!important;\s*\}/.test(css));
});

// ---------- Đợt góp ý 18/10: header, FAQ, nút liên hệ nổi, bỏ mục so sánh ----------
const TAT_CA_TRANG = ['index.html', 'dat-cho.html', 'chinh-sach.html', 'faq.html', 'kiem-tra-ve.html', 'xac-nhan.html']
  .concat(DANH_SACH_TAU.map((t) => 'tau/' + t.slug + '.html'));

test('header: menu co FAQ, khong con nut so dien thoai; nut VI/EN co co', () => {
  for (const f of TAT_CA_TRANG) {
    const html = doc(f);
    const h = html.slice(html.indexOf('<header'), html.indexOf('</header>'));
    const tt = f.startsWith('tau/') ? '../' : '';
    assert.ok(h.includes('<a href="' + tt + 'faq.html">FAQ</a>'), f + ' FAQ');
    assert.ok(!h.includes('tel:'), f + ' header khong co so dien thoai');
    assert.strictEqual((h.match(/<svg class="co"/g) || []).length, 2, f + ' 2 la co');
  }
});

test('nut lien he noi goc phai co tren moi trang cho khach (goi + Zalo), trang noi bo thi khong; thanh duoi an san', () => {
  for (const f of ['xac-nhan.html', 'kiem-tra-ve.html']) assert.ok(!doc(f).includes('class="lien-he-noi"'), f + ' trang noi bo');
  for (const f of TAT_CA_TRANG) {
    const html = doc(f);
    assert.ok(html.includes('<div class="thanh-lien-he" id="thanh-lien-he" hidden></div>'), f + ' thanh duoi');
    if (f === 'xac-nhan.html' || f === 'kiem-tra-ve.html') continue;
    const i = html.indexOf('<div class="lien-he-noi" id="lien-he-noi">');
    assert.ok(i > 0, f + ' co nut noi');
    const noi = html.slice(i, html.indexOf('<script', i));
    // Gom 1 nút: Gọi, Messenger, Zalo nằm trong danh sách; nút mở có aria-expanded.
    assert.ok(noi.includes('href="tel:0948170036"') && noi.includes('href="https://zalo.me/0948170036"'), f);
    assert.ok(noi.includes('href="https://m.me/antoitrenduthuyensaigon"'), f + ' messenger');
    assert.ok(noi.includes('<button type="button" class="lh-mo" aria-expanded="false" aria-controls="lh-ds"'), f + ' nut mo');
    assert.ok(html.includes('<div class="thanh-lien-he" id="thanh-lien-he" hidden></div>'), f + ' thanh duoi');
  }
});

test('trang chu: anh tau tran man hinh voi nut Dat cho ngay; khong con muc so sanh, hoi dap chuyen sang faq.html', () => {
  const html = doc('index.html');
  assert.ok(/<section class="hero hero-toan-man">[\s\S]*<a class="nut nut-hero" href="#dat-ngay">Đặt chỗ ngay<\/a>/.test(html));
  assert.ok(html.indexOf('id="dat-ngay"') < html.indexOf('id="form-tim"'));
  for (const f of TAT_CA_TRANG) assert.ok(!/so sánh|so-sanh/i.test(doc(f)), f + ' khong co chu so sanh');
  assert.ok(!html.includes('id="hoi-dap"'));
  const faq = doc('faq.html');
  assert.strictEqual((faq.match(/<details/g) || []).length, 13);
  assert.ok(faq.includes('Nếu tàu hết chỗ ngày tôi chọn thì sao?'), 'FAQ hoan tien khi tau het cho');
  // Trẻ em: mỗi tàu một dòng, lấy từ GIA_TRE_EM.
  const { GIA_TRE_EM } = require('../js/du-lieu-tau.js');
  for (const t of DANH_SACH_TAU) {
    assert.ok(faq.includes('<a href="tau/' + t.slug + '.html"><b>'), t.slug);
    for (const loai of Object.keys(GIA_TRE_EM[t.slug] || {})) assert.ok(faq.includes(GIA_TRE_EM[t.slug][loai].mienPhi.replace(/&/g, '&amp;')), t.slug + ' ' + loai);
  }
});

test('mang xa hoi: Facebook va TikTok da co link, khong kem ma theo doi', () => {
  assert.strictEqual(CAU_HINH.mangXaHoi.facebook, 'https://www.facebook.com/share/19dfPzqptZ/');
  assert.strictEqual(CAU_HINH.mangXaHoi.tiktok, 'https://www.tiktok.com/@nguyennguyentravel');
  const html = doc('index.html');
  assert.ok(html.includes('href="https://www.tiktok.com/@nguyennguyentravel" target="_blank" rel="noopener"'));
  assert.ok(!html.includes('data-mxh-trong'));
});

test('css: mot kieu bo goc cho toan web (chi con var(--bo-goc), hinh tron 50% va cham nho)', () => {
  const css = doc('css/style.css');
  const cacGiaTri = [...css.matchAll(/border-radius:\s*([^;}]+)/g)].map((m) => m[1].trim());
  const la = cacGiaTri.filter((v) => !/^(var\(--bo-goc\)|calc\(var\(--bo-goc\) - 3px\)|50%|0|4px|3px)$/.test(v));
  assert.deepStrictEqual(la, []);
});

test('chinh sach tre em: khong ghi mot quy dinh chung cho moi tau; chinh-sach.html liet ke tung tau', () => {
  const { CHINH_SACH_CHUNG, GIA_TRE_EM } = require('../js/du-lieu-tau.js');
  const chung = CHINH_SACH_CHUNG.find((m) => m.id === 'tre-em-chung').nhom[0].dong.join(' ');
  assert.ok(!/\d+\s*[–-]\s*\d+ tuổi|\d+(,\d+)?\s*m\b/.test(chung), 'muc chung khong ghi do tuoi/chieu cao cu the: ' + chung);
  const html = doc('chinh-sach.html');
  const muc = html.slice(html.indexOf('id="tre-em-chung"'), html.indexOf('</details>', html.indexOf('id="tre-em-chung"')));
  for (const t of DANH_SACH_TAU) {
    assert.ok(muc.includes('<a href="tau/' + t.slug + '.html"><b>'), t.slug);
    for (const loai of Object.keys(GIA_TRE_EM[t.slug] || {})) assert.ok(muc.includes(GIA_TRE_EM[t.slug][loai].mienPhi), t.slug + ' ' + loai);
  }
});
