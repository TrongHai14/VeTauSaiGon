// Bổ sung đợt 31/10/2026 (kiểm thử độc lập): chạy thật khoiChayTrangTaoPhieu trên DOM giả, đổi trả, giao diện tối, hiệu ứng, FAQ, tên thương hiệu.
const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const doc = (rel) => fs.readFileSync(path.join(__dirname, '..', rel), 'utf8');
const NGAY_XA = '2099-03-10';

/* ---------- DOM giả tối thiểu cho trang tao-phieu ---------- */
function oChon() {
  const o = {
    value: '', _html: '', listeners: {}, addEventListener(t, f) { this.listeners[t] = f; },
    querySelector(sel) { const m = /option\[value="([^"]*)"\]/.exec(sel); return m && this._html.includes('value="' + m[1] + '"') ? {} : null; }
  };
  Object.defineProperty(o, 'innerHTML', { get() { return this._html; }, set(h) { this._html = h; const m = /<option value="([^"]*)"/.exec(h); this.value = m ? m[1] : ''; } });
  return o;
}
function khungMonGia() {
  const k = { _html: '', fields: [] };
  Object.defineProperty(k, 'innerHTML', {
    get() { return this._html; },
    set(h) {
      this._html = h; this.fields = [];
      const reIn = /<input[^>]*name="([^"]*)"[^>]*value="([^"]*)"/g; let m;
      while ((m = reIn.exec(h))) this.fields.push({ name: m[1], value: m[2] });
      const reSel = /<select name="([^"]*)">\s*<option value="([^"]*)"/g;
      while ((m = reSel.exec(h))) this.fields.push({ name: m[1], value: m[2] });
    }
  });
  k.querySelectorAll = () => k.fields;
  return k;
}
function dungTrang(tuyChon) {
  tuyChon = tuyChon || {};
  const el = {
    tau: oChon(), loai: oChon(), ngay: { value: NGAY_XA }, hoTen: { value: 'Khách A' }, soDienThoai: { value: '0912345678' }, email: { value: '' },
    taiKhoan: { value: 'caNhan' }, codeVe: { value: '' }, daNhanTien: { checked: true }
  };
  const form = { elements: el, listeners: {}, addEventListener(t, f) { this.listeners[t] = f; } };
  const khungMon = khungMonGia();
  const phanTu = {
    '#form-tao-phieu': form, '#khung-mon-tay': khungMon, '#tong-tay': { textContent: '' }, '#thong-bao': { textContent: '', className: '' },
    '#khung-phieu': { innerHTML: '' }, '#khu-vuc-phieu': { hidden: true, scrollIntoView() {} }, '#link-kiem-tra': { href: '', hidden: true }
  };
  const cacLoi = ['tau', 'ngay', 'hoTen', 'soDienThoai', 'mon', 'loai'].map((t) => ({ textContent: '', getAttribute: () => t, scrollIntoView() {} }));
  const goc = { querySelector: (s) => phanTu[s], querySelectorAll: () => cacLoi, addEventListener() {} };
  const ctx = {
    console, Promise, Date, Math, Uint32Array, String, Number, Object, Array, JSON, parseInt, isNaN, encodeURIComponent, setTimeout, Blob: function () {},
    window: { addEventListener() {}, print() {}, matchMedia: () => ({ matches: false }) }, location: { reload() {}, search: '', hash: '' },
    document: { getElementById: (id) => (id === 'tao-phieu' ? goc : null), querySelectorAll: () => [], querySelector: () => null, documentElement: {} },
    localStorage: { getItem: () => null, setItem() {} },
    crypto: { getRandomValues: (m) => { for (let i = 0; i < m.length; i++) m[i] = Math.floor(Math.random() * 4294967296); return m; } }
  };
  vm.createContext(ctx);
  for (const f of ['tu-dien-en', 'ngon-ngu', 'cau-hinh', 'du-lieu-tau', 'lich-cho-du-lieu', 'lich-cho', 'hien-thi', 'xac-thuc', 'dat-cho', 'tao-phieu']) {
    vm.runInContext(doc('js/' + f + '.js'), ctx, { filename: f + '.js' });
  }
  // Ghi lại mỗi lần tạo phiếu (bản hiện tại của tao-phieu.js không còn ký số, chỉ dựng HTML).
  vm.runInContext(`
    var _noiDungDaKy = [];
    var _taoPhieuGoc = taoPhieuHtml;
    taoPhieuHtml = function (don, tau, ct, lh, bte, tk, tt) {
      var s = tomTatDon(don, tau, bte);
      _noiDungDaKy.push({ t: tau.slug, nl: s.khach.nguoiLon, te: s.khach.treEm50, mp: s.khach.treEmMienPhi, g: s.tong, c: tt.codeVe });
      return _taoPhieuGoc.apply(this, arguments);
    };
    canhPhieuVuaKhung = function () {};
    hamLichCho.ngayHomNayVN = function () { return '2026-10-31'; };
    khoiChayTrangTaoPhieu(${JSON.stringify(tuyChon.cheDo || '')});`, ctx);
  return {
    ctx, el, form, khungMon, phanTu, cacLoi,
    chonTau(slug, loai) { el.tau.value = slug; el.tau.listeners.change(); if (loai) { el.loai.value = loai; el.loai.listeners.change(); } },
    truong(ten) { return khungMon.fields.find((x) => x.name === ten); },
    daKy() { return vm.runInContext('_noiDungDaKy', ctx); },
    async nop() { form.listeners.submit({ preventDefault() {} }); await new Promise((r) => setTimeout(r, 20)); },
    thongBao() { return phanTu['#thong-bao'].textContent; },
    loi(ten) { return cacLoi.find((c) => c.getAttribute() === ten).textContent; }
  };
}

test('tao-phieu chay that: so am, so thap phan, chu, so mu nhap vao o so deu bi coi la 0 -> bao thieu mon, khong ky', async () => {
  for (const xau of ['-3', '2.5', 'abc', '', '1e3']) {
    const t = dungTrang();
    t.chonTau('indochina-queen', 'buffet');
    t.truong('nguoiLon').value = xau;
    await t.nop();
    assert.ok(t.loi('mon'), 'nhap "' + xau + '" phai bao loi mon');
    assert.strictEqual(t.daKy().length, 0, 'khong duoc ky khi nhap "' + xau + '"');
  }
});

test('tao-phieu chay that: tre em tinh ve va be mien phi nhap am khong lam tong tien am', async () => {
  const t = dungTrang();
  t.chonTau('indochina-queen', 'buffet');
  t.truong('nguoiLon').value = '2';
  t.truong('treEm50').value = '-5';
  t.truong('treEmMienPhi').value = '-1';
  await t.nop();
  const nd = t.daKy()[0];
  assert.ok(nd, 'don hop le van duoc ky');
  assert.strictEqual(nd.nl, 2); assert.strictEqual(nd.te, 0); assert.strictEqual(nd.mp, 0);
  assert.ok(nd.g > 0);
});

test('tao-phieu chay that: set menu nhieu mon cong dung tien, bo mon so 0 / am / chu', async () => {
  const t = dungTrang();
  t.chonTau('ben-nghe', 'setMenu');
  const ten = t.khungMon.fields.filter((f) => f.name.startsWith('mon:')).map((f) => f.name);
  assert.strictEqual(ten.length, 8);
  t.truong(ten[0]).value = '2'; t.truong(ten[1]).value = '3'; t.truong(ten[2]).value = '-4'; t.truong(ten[3]).value = 'x';
  await t.nop();
  const nd = t.daKy()[0];
  assert.ok(nd, 'da ky: ' + t.thongBao());
  const ht = require('../js/hien-thi.js');
  const { DANH_SACH_TAU } = require('../js/du-lieu-tau.js');
  const gia = {};
  for (const nhom of ht.layThucDonTheoLoai(DANH_SACH_TAU.find((x) => x.slug === 'ben-nghe')).setMenu) for (const d of nhom.dong) gia['mon:' + d.ma] = d.gia;
  assert.strictEqual(nd.g, 2 * gia[ten[0]] + 3 * gia[ten[1]]);
  assert.ok(/Menu Bến Nghé/i.test(t.phanTu['#khung-phieu'].innerHTML));
});

test('tao-phieu chay that: doi tau/loai roi tao lai, o mon duoc ve lai, khong giu so luong cua tau cu', async () => {
  const t = dungTrang();
  t.chonTau('indochina-queen', 'buffet');
  t.truong('nguoiLon').value = '7';
  t.chonTau('ben-nghe', 'setMenu');
  assert.strictEqual(t.truong('nguoiLon'), undefined, 'o nguoi lon cua buffet khong con khi o set menu');
  t.truong(t.khungMon.fields.find((f) => f.name.startsWith('mon:')).name).value = '1';
  await t.nop();
  const nd = t.daKy()[0];
  assert.ok(nd, t.thongBao());
  assert.strictEqual(nd.t, "ben-nghe"); assert.strictEqual(nd.nl, 1, "set menu 1 mon = 1 khach");
  t.chonTau('indochina-queen', 'buffet');
  assert.strictEqual(t.truong('nguoiLon').value, '2', 've lai o mac dinh, khong giu 7');
});

test('tao-phieu chay that: code tu tao duoc tao lai khi doi tau / ngay; code go tay duoc giu', async () => {
  const t = dungTrang();
  t.chonTau('indochina-queen', 'buffet');
  await t.nop();
  const c1 = t.el.codeVe.value;
  assert.ok(c1, 'code tu tao');
  assert.strictEqual(t.daKy()[0].c, c1);
  t.el.ngay.value = '2099-04-05';
  await t.nop();
  const c2 = t.el.codeVe.value;
  assert.notStrictEqual(c2, c1);
  assert.ok(c2.includes('0504'), 'code theo ngay moi: ' + c2);
  t.chonTau('indochina-star', 'buffet');
  await t.nop();
  const c3 = t.el.codeVe.value;
  assert.notStrictEqual(c3.split('-')[0], c2.split('-')[0], 'tien to code theo tau moi: ' + c2 + ' -> ' + c3);
  t.el.codeVe.value = 'ABC-9999-TAY1';
  t.el.ngay.value = '2099-05-06';
  await t.nop(); await t.nop();
  assert.strictEqual(t.el.codeVe.value, 'ABC-9999-TAY1');
  assert.strictEqual(t.daKy().pop().c, 'ABC-9999-TAY1');
  t.el.codeVe.value = '';
  await t.nop();
  assert.ok(/-0605-/.test(t.el.codeVe.value));
});

test('tao-phieu chay that: ten khach, code, email co ky tu HTML khong chen duoc vao phieu', async () => {
  const t = dungTrang();
  t.chonTau('indochina-queen', 'buffet');
  t.el.hoTen.value = '<img src=x onerror=alert(1)>"\'&';
  t.el.codeVe.value = '<script>alert(2)</script>';
  t.el.email.value = '<b>x@y.vn</b>';
  await t.nop();
  const html = t.phanTu['#khung-phieu'].innerHTML;
  assert.ok(html.length > 0, 'phieu da tao: ' + t.thongBao());
  assert.ok(!/<img src=x/i.test(html), 'img chen duoc');
  assert.ok(!/<script>alert/i.test(html), 'script chen duoc');
  assert.ok(!html.includes('<b>x@y.vn'), 'email chen duoc');
  assert.ok(/&lt;img/i.test(html), 'ten van hien dang chu');
});

test('tao-phieu chay that: moi o loi duoc bao, khong ky khi sai; sua xong thi loi cu bi xoa', async () => {
  const t = dungTrang();
  t.chonTau('indochina-queen', 'buffet');
  t.el.hoTen.value = ''; t.el.soDienThoai.value = '12'; t.el.ngay.value = '2026-10-30';
  await t.nop();
  assert.ok(t.loi('hoTen') && t.loi('soDienThoai') && t.loi('ngay'));
  assert.strictEqual(t.daKy().length, 0);
  t.el.hoTen.value = 'A'; t.el.soDienThoai.value = '0912345678'; t.el.ngay.value = NGAY_XA;
  await t.nop();
  assert.strictEqual(t.loi('hoTen') + t.loi('soDienThoai') + t.loi('ngay') + t.loi('mon'), '');
  assert.strictEqual(t.daKy().length, 1);
});

test('tao-phieu chay that: ngay rong / khong co that / sai dinh dang bi tu choi', async () => {
  for (const ngay of ['', '2099-02-30', '31/12/2099', '2099-13-01']) {
    const t = dungTrang();
    t.chonTau('indochina-queen', 'buffet');
    t.el.ngay.value = ngay;
    await t.nop();
    assert.ok(t.loi('ngay'), 'ngay "' + ngay + '" phai bi chan');
    assert.strictEqual(t.daKy().length, 0);
  }
});

test('tao-phieu chay that: chua tick da nhan tien thi khong tao phieu', async () => {
  const a = dungTrang();
  a.chonTau('indochina-queen', 'buffet'); a.el.daNhanTien.checked = false;
  await a.nop();
  assert.match(a.thongBao(), /tiền/); assert.strictEqual(a.daKy().length, 0);
  assert.strictEqual(a.phanTu['#khu-vuc-phieu'].hidden, true);
});

/* ---------- Đổi trả ---------- */
test('doi tra: trang cac tau khac Queen/Star khong co noi dung hoan/huy/doi ngay', () => {
  const { DANH_SACH_TAU, LIEN_HE } = require('../js/du-lieu-tau.js');
  const ht = require('../js/hien-thi.js');
  const re = /Hoàn\/Hủy vé|Đổi ngày sử dụng|đổi sang ngày khác nếu|báo trước 2–3 ngày|Đổi ngày cần báo trước/;
  for (const t of DANH_SACH_TAU) {
    if (t.slug === 'indochina-queen' || t.slug === 'indochina-star') continue;
    assert.ok(!re.test(ht.taoTrangTau(t, LIEN_HE, '../')), 'trang tau ' + t.slug);
    assert.ok(!re.test(doc('tau/' + t.slug + '.html').replace(/<script[\s\S]*?<\/script>/g, '')), 'file tau/' + t.slug + '.html');
  }
});

test('doi tra: o tick dong y tren trang dat cho (dung chung 6 tau) khong noi doi ngay/hoan huy ma khong gioi han Queen/Star', () => {
  const m = /id="dat-cho-dong-y".*?<\/small>/s.exec(doc('dat-cho.html'))[0].replace(/<[^>]*>/g, '');
  if (/Đổi ngày|hoàn\/hủy/i.test(m)) assert.ok(/Queen/.test(m) && /Star/.test(m), 'dat-cho.html noi doi ngay/hoan huy cho moi tau: ' + m);
});

test('doi tra: phieu va tin nhan cua tau khac Queen/Star khong nhac hoan/huy/doi ngay', () => {
  const dc = require('../js/dat-cho.js');
  const { DANH_SACH_TAU, LIEN_HE, CONG_TY, GIA_TRE_EM } = require('../js/du-lieu-tau.js');
  const CH = require('../js/cau-hinh.js').CAU_HINH;
  global.CAU_HINH = global.CAU_HINH || CH;
  const re = /hoàn\/hủy|đổi ngày|hủy vé|đổi sang ngày/i;
  for (const t of DANH_SACH_TAU) {
    if (/queen|star/.test(t.slug)) continue;
    const don = { slugTau: t.slug, ngay: NGAY_XA, loai: 'buffet', buffetMa: '0:0', nguoiLon: 2, treEm50: 0, treEmMienPhi: 0, mon: {}, hoTen: 'A', soDienThoai: '0912345678', maDon: 'VT2610AAAA', vat: false, taiKhoan: 'caNhan', congTy: {}, ngayDat: '2026-10-31' };
    const tk = dc.layTaiKhoan(CH.thanhToan, don);
    const phieu = dc.taoPhieuHtml(don, t, CONG_TY, LIEN_HE, GIA_TRE_EM, tk, { trangThai: 'Đã thanh toán.', codeVe: 'X', ngayXacNhan: new Date(), xacThuc: null });
    assert.ok(!re.test(phieu.replace(/<[^>]*>/g, ' ')), 'phieu ' + t.slug);
    assert.ok(!re.test(dc.soanTinNhanDatCho(don, t, GIA_TRE_EM, tk)), 'tin nhan ' + t.slug);
  }
});

/* ---------- Giao diện tối ---------- */
function chayNutGiaoDien(kieu) {
  const nut = { setAttribute(k, v) { this[k] = v; }, addEventListener(_, f) { this.bam = f; } };
  const goc = { tt: null, getAttribute() { return this.tt; }, setAttribute(_, v) { this.tt = v; }, removeAttribute() { this.tt = null; } };
  const ctx = { document: { getElementById: () => nut, documentElement: goc }, String };
  if (kieu === 'nem') Object.defineProperty(ctx, 'localStorage', { get() { throw new Error('SecurityError'); } });
  else if (kieu === 'setNem') ctx.localStorage = { setItem() { throw new Error('QuotaExceeded'); } };
  vm.createContext(ctx);
  const ma = doc('js/hien-thi.js');
  vm.runInContext(ma.slice(ma.indexOf('function ganNutGiaoDien'), ma.indexOf('function apDungCauHinhChung')) + '\nganNutGiaoDien();', ctx);
  return { nut, goc };
}
test('giao dien toi: nut van doi duoc khi localStorage bi chan (truy cap nem loi, setItem nem loi, khong co)', () => {
  for (const kieu of ['nem', 'setNem', 'khongCo']) {
    const { nut, goc } = chayNutGiaoDien(kieu);
    assert.doesNotThrow(() => nut.bam(), kieu);
    assert.strictEqual(goc.tt, 'toi', kieu);
    assert.strictEqual(nut['aria-pressed'], 'true', kieu);
    nut.bam();
    assert.strictEqual(goc.tt, null, kieu);
  }
});
test('giao dien toi: script dau trang khong nem loi khi localStorage bi chan, doc dung lua chon da luu', () => {
  const dau = /<script>(try\{if\(localStorage[^<]*)<\/script>/.exec(doc('index.html'))[1];
  const goc = { tt: null, setAttribute(_, v) { this.tt = v; } };
  const ctx = { document: { documentElement: goc } };
  Object.defineProperty(ctx, 'localStorage', { get() { throw new Error('SecurityError'); } });
  assert.doesNotThrow(() => vm.runInNewContext(dau, ctx));
  assert.strictEqual(goc.tt, null);
  vm.runInNewContext(dau, { document: { documentElement: goc }, localStorage: { getItem: () => 'toi' } });
  assert.strictEqual(goc.tt, 'toi');
});
test('giao dien toi: phieu va anh xuat phieu khong doi mau', () => {
  const css = doc('css/style.css');
  const m = /\.phieu\s*\{[^}]*\}/.exec(css);
  assert.ok(m && /background:\s*#fff/.test(m[0]), '.phieu nen trang tuong minh: ' + (m && m[0]));
  assert.ok(/[^-]color:\s*#[0-9a-f]{3,6}/i.test(m[0]), '.phieu phai dat color tuong minh vi --chu doi theo giao dien: ' + m[0]);
  const xuat = doc('js/dat-cho.js');
  const i = xuat.indexOf('function xuatAnhPhieu');
  assert.ok(/backgroundColor:\s*'#fff/i.test(xuat.slice(i, i + 1500)), 'html2canvas phai dat backgroundColor trang');
});
test('giao dien toi: css .phieu* khong dung bien mau doi theo giao dien', () => {
  const css = doc('css/style.css');
  const sai = [];
  const re = /(^|\n)([^{}\n]*\.phieu[^{}\n]*)\{([^}]*)\}/g; let m;
  while ((m = re.exec(css))) if (/var\(--(chu|nen|vien|chu-phu|nen-phu|xam)[^)]*\)/.test(m[3]) && !/data-giao-dien/.test(m[2])) sai.push(m[2].trim());
  assert.deepStrictEqual(sai, [], 'quy tac .phieu dung bien doi theo giao dien');
});

/* ---------- hieu-ung.js ---------- */
test('hieu-ung: gsap co nhung khong IntersectionObserver -> van chay phan hero, moi from co clearProps', () => {
  const ma = doc('js/hieu-ung.js');
  const goi = [];
  assert.doesNotThrow(() => vm.runInNewContext(ma, { gsap: { from(t, o) { goi.push(o); } }, document: { querySelector: () => ({}), querySelectorAll: () => [] }, window: {} }));
  assert.ok(goi.length >= 1);
  for (const o of goi) assert.strictEqual(o.clearProps, 'all');
});
test('hieu-ung: gsap.from nem loi thi script khong nem tiep (khong lam hong trang)', () => {
  let loi = null;
  try { vm.runInNewContext(doc('js/hieu-ung.js'), { gsap: { from() { throw new Error('gsap hong'); } }, document: { querySelectorAll: () => [] }, window: {} }); } catch (e) { loi = e; }
  assert.strictEqual(loi, null, 'gsap.from nem loi thi hieu-ung.js khong nen nem tiep');
});
test('hieu-ung: khong an san bang css; khoi chi chay khi vao man hinh', () => {
  const css = doc('css/style.css');
  assert.ok(!/\.the-tau\s*\{[^}]*opacity:\s*0/.test(css) && !/\.muc\s*\{[^}]*opacity:\s*0/.test(css));
  let cb; const da = []; const goi = [];
  const IO = function (f) { cb = f; this.observe = (x) => da.push(x); this.unobserve = () => {}; };
  vm.runInNewContext(doc('js/hieu-ung.js'), { gsap: { from(t, o) { goi.push(o); } }, IntersectionObserver: IO, document: { querySelectorAll: () => [{ style: {} }, { style: {} }] }, window: { matchMedia: () => ({ matches: false }) } });
  assert.strictEqual(da.length, 2);
  const truoc = goi.length;
  cb([{ isIntersecting: false, target: {} }]);
  assert.strictEqual(goi.length, truoc);
  cb([{ isIntersecting: true, target: da[0] }]);
  assert.strictEqual(goi.length, truoc + 1);
});

/* ---------- FAQ ---------- */
function cauFaq() {
  return [...doc('faq.html').matchAll(/<details[^>]*><summary>(.*?)<\/summary><p>(.*?)<\/p>/gs)]
    .map((m) => [m[1], m[2]].map((s) => s.replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').trim()));
}
test('FAQ: so do backdrop dung yeu cau', () => {
  const t = doc('faq.html').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ');
  for (const s of ['ngang 4 m', 'cao 2,5 m']) assert.ok(t.includes(s), s);
  assert.ok(cauFaq().length >= 13);
});
test('FAQ EN: moi cau hoi va tra loi co ban dich; so doi dung dinh dang (dau phay ngan, dau cham thap phan)', () => {
  const nn = require('../js/ngon-ngu.js');
  const tu = require('../js/tu-dien-en.js');
  global.TU_DIEN_EN = tu.TU_DIEN_EN; global.MAU_DICH_EN = tu.MAU_DICH_EN;
  const thieu = [];
  for (const [h, d] of cauFaq()) {
    for (const v of [h, d]) {
      const e = nn.dichChuoi(v, 'en');
      if (e === v && nn.coChuViet(v)) thieu.push(v.slice(0, 70));
    }
    const ed = nn.dichChuoi(d, 'en');
    if (/rượu|backdrop|heo sữa/i.test(h + d)) {
      assert.ok(!/\d\.\d{3}\b/.test(ed), 'EN con dau cham ngan: ' + ed);
      assert.ok(!/\d,\d\b(?! \d)/.test(ed.replace(/\d{1,3}(,\d{3})+/g, '')), 'EN con dau phay thap phan: ' + ed);
      assert.ok(!/VND\/(lít|chai|con)/.test(ed), 'EN con don vi tieng Viet: ' + ed);
    }
  }
  assert.deepStrictEqual(thieu, []);
});

/* ---------- Ten thuong hieu ---------- */
test('Nguyen Nguyen: moi cho goi thuong hieu trong chu khach thay deu co Travel; ten phap ly Global khong bi doi', () => {
  const kq = [];
  const duyet = (rel) => {
    const nd = doc(rel);
    for (const m of nd.matchAll(/Nguyên Nguyên(?! Travel| Global)/g)) kq.push(rel + ': ' + nd.slice(Math.max(0, m.index - 30), m.index + 30).replace(/\s+/g, ' '));
  };
  const goc = path.join(__dirname, '..');
  fs.readdirSync(goc).filter((f) => /\.html$/.test(f)).forEach(duyet);
  fs.readdirSync(path.join(goc, 'tau')).forEach((f) => duyet('tau/' + f));
  ['js/dat-cho.js', 'js/du-lieu-tau.js', 'js/hien-thi.js', 'js/cau-hinh.js', 'cong-cu/tao-trang.js', 'js/tao-phieu.js'].forEach(duyet);
  assert.deepStrictEqual(kq, []);
  // Ban EN thuc te (qua dichChuoi) cua cac doan chu tren web khong duoc goi "Nguyen Nguyen" thieu Travel/Global.
  const nn = require('../js/ngon-ngu.js');
  const tu = require('../js/tu-dien-en.js');
  global.TU_DIEN_EN = tu.TU_DIEN_EN; global.MAU_DICH_EN = tu.MAU_DICH_EN;
  const doan = [];
  for (const f of ['faq.html', 'chinh-sach.html', 'dat-cho.html', 'index.html']) for (const m of doc(f).matchAll(/>([^<>]{12,})</g)) doan.push(m[1].replace(/&amp;/g, '&').trim());
  for (const [h, d] of cauFaq()) doan.push(h, d);
  const loiEn = [...new Set(doan.map((v) => nn.dichChuoi(v, 'en')).filter((e) => /Nguyen Nguyen(?! Travel| Global)/.test(e) || /Nguyên Nguyên(?! Travel| Global)/.test(e)))].map((e) => e.slice(0, 90));
  assert.deepStrictEqual(loiEn, [], 'ban dich EN con goi "Nguyen Nguyen" thieu Travel');
  const { CONG_TY } = require('../js/du-lieu-tau.js');
  assert.ok(CONG_TY.ten.includes('Nguyên Nguyên Global') && !/Travel/.test(CONG_TY.ten));
});

test('phieu chuyen khoan: khong can da nhan tien, khong co code ve; dung tong, tai khoan, noi dung; ten khach khong chen HTML', async () => {
  const t = dungTrang({ cheDo: 'chuyen-khoan' });
  t.chonTau('indochina-queen', 'buffet');
  t.el.daNhanTien.checked = false;
  t.el.hoTen.value = '<img src=x onerror=alert(1)>';
  await t.nop();
  const html = t.phanTu['#khung-phieu'].innerHTML;
  assert.ok(html.includes('PHIẾU XÁC NHẬN THÔNG TIN ĐẶT VÉ'), t.thongBao());
  for (const chu of ['Họ và tên', 'Du thuyền', 'Indochina Queen', 'Ngày lên tàu', '10/03/2099', 'Số lượng khách', 'Người lớn', 'Trẻ em (50%)', 'Trẻ em miễn phí', 'Thực đơn']) assert.ok(html.includes(chu), chu);
  for (const chu of ['VND', 'ACB', 'Số tài khoản', 'Nội dung', 'vietqr', 'Mã đơn', 'MST']) assert.ok(!html.includes(chu), chu);
  assert.ok(!html.includes('Code vé điện tử') && !html.includes('Đã thanh toán') && !/<img src=x/i.test(html));
  const { tk, tong, noiDung, tin } = vm.runInContext(`(function () {
    var d = { slugTau: 'indochina-queen', ngay: '2099-03-10', loai: 'buffet', buffetMa: DANH_SACH_TAU[0] && hamHienThi.layThucDonTheoLoai(timTauTheoSlug(DANH_SACH_TAU, 'indochina-queen')).buffet[0].dong[0].ma, nguoiLon: 2, treEm50: 0, treEmMienPhi: 0, mon: {}, hoTen: 'A', soDienThoai: '0912345678', taiKhoan: 'congTy', maDon: 'VT261031ABCD' };
    var tau = timTauTheoSlug(DANH_SACH_TAU, 'indochina-queen');
    var tk = layTaiKhoan(CAU_HINH.thanhToan, d);
    return { tk: tk, tong: tomTatDon(d, tau, GIA_TRE_EM).tong, noiDung: taoNoiDungChuyenKhoan(d), tin: soanTinChuyenKhoan(d, tau, GIA_TRE_EM, tk) };
  })()`, t.ctx);
  assert.strictEqual(tk.chuTaiKhoan, vm.runInContext('CAU_HINH.thanhToan.congTy.chuTaiKhoan', t.ctx));
  for (const chu of [tk.soTaiKhoan, tk.chuTaiKhoan, 'Số tiền: ' + tong, 'Nội dung: ' + noiDung]) assert.ok(tin.includes(chu), chu);
});

test('phieu chuyen khoan: van bat loi nhap; trang tao-phieu cu van bat buoc da nhan tien; trang an khoi Google va khong co lien ket', async () => {
  const t = dungTrang({ cheDo: 'chuyen-khoan' });
  t.chonTau('indochina-queen', 'buffet');
  t.el.hoTen.value = '';
  await t.nop();
  assert.ok(t.loi('hoTen'));
  assert.strictEqual(t.phanTu['#khung-phieu'].innerHTML, '');
  const cu = dungTrang();
  cu.chonTau('indochina-queen', 'buffet');
  cu.el.daNhanTien.checked = false;
  await cu.nop();
  assert.strictEqual(cu.phanTu['#khung-phieu'].innerHTML, '');
  const html = doc('phieu-chuyen-khoan.html');
  assert.ok(html.includes('noindex') && !html.includes('rel="canonical"') && !html.includes('name="daNhanTien"') && !html.includes('name="codeVe"'));
  assert.ok(doc('robots.txt').includes('Disallow: /phieu-chuyen-khoan.html') && !doc('sitemap.xml').includes('phieu-chuyen-khoan'));
  for (const f of ['index.html', 'dat-cho.html', 'faq.html', 'chinh-sach.html']) assert.ok(!doc(f).includes('phieu-chuyen-khoan'), f);
});
