// Kiem thu doc lap dot 19/10/2026 (tester): lich cho, dat cho, Queen = Star, thong so, nut lien he, song ngu.
const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
global.CAU_HINH = require('../js/cau-hinh.js').CAU_HINH;
const lc = require('../js/lich-cho.js');
const ht = require('../js/hien-thi.js');
const dc = require('../js/dat-cho.js');
const nn = require('../js/ngon-ngu.js');
const { TU_DIEN_EN, MAU_DICH_EN } = require('../js/tu-dien-en.js');
global.TU_DIEN_EN = TU_DIEN_EN; global.MAU_DICH_EN = MAU_DICH_EN;
const { DANH_SACH_TAU, LIEN_HE, GIA_TRE_EM } = require('../js/du-lieu-tau.js');

const GOC = path.join(__dirname, '..');
const doc = (rel) => fs.readFileSync(path.join(GOC, rel), 'utf8');
const tau = (slug) => DANH_SACH_TAU.find((t) => t.slug === slug);
const ngayLich = (html) => (html.match(/data-ngay="[^"]+"/g) || []);
const demTrong = (html) => (html.match(/lich-trong/g) || []).length;
// Bo the HTML de lay chu khach nhin thay.
const chuHienThi = (html) => html
  .replace(/<script[\s\S]*?<\/script>/g, '').replace(/<style[\s\S]*?<\/style>/g, '')
  .replace(/<!--[\s\S]*?-->/g, '').replace(/<[^>]+>/g, ' ');

// ---------- Lich: ngay trong tuan, thang 2 ----------
test('lich: so ngay va so o trong dau thang dung (tuan bat dau thu Hai)', () => {
  // [nam, thang, soNgay, soOTrong]
  const ca = [
    [2026, 10, 31, 3],  // 01/10/2026 thu Nam
    [2026, 11, 30, 6],  // 01/11/2026 Chu nhat
    [2026, 6, 30, 0],   // 01/06/2026 thu Hai
    [2024, 2, 29, 3],   // nam nhuan, 01/02/2024 thu Nam
    [2028, 2, 29, 1],   // nam nhuan, 01/02/2028 thu Ba
    [2027, 2, 28, 0],   // nam thuong, 01/02/2027 thu Hai
    [2026, 2, 28, 6],   // nam thuong, 01/02/2026 Chu nhat
    [2100, 2, 28, 0]    // 2100 khong nhuan, 01/02/2100 thu Hai
  ];
  for (const [n, t, sn, ot] of ca) {
    const html = lc.taoLichThang('indochina-star', n, t, '2000-01-01', '');
    assert.strictEqual(ngayLich(html).length, sn, n + '-' + t + ' so ngay');
    assert.strictEqual(demTrong(html), ot, n + '-' + t + ' o trong');
  }
  // Dung thu: tieu de cot T2 dau tien.
  const html = lc.taoLichThang('', 2026, 10, '2026-10-19', '');
  assert.ok(html.indexOf('>T2<') < html.indexOf('>T3<') && html.indexOf('>T7<') < html.indexOf('>CN<'));
  assert.ok(/aria-label="Thứ Hai, 19\/10\/2026/.test(html));
  assert.ok(/aria-label="Chủ nhật, 04\/10\/2026/.test(html));
});

test('lich: ngay 29/02 chi co o nam nhuan', () => {
  assert.ok(lc.taoLichThang('', 2028, 2, '2000-01-01', '').includes('data-ngay="2028-02-29"'));
  assert.ok(!lc.taoLichThang('', 2027, 2, '2000-01-01', '').includes('data-ngay="2027-02-29"'));
  assert.ok(/aria-label="Thứ Ba, 29\/02\/2028/.test(lc.taoLichThang('', 2028, 2, '2000-01-01', '')));
});

test('lich: khong lui duoc ve thang da qua, thang hien tai thi nut lui bi khoa, thang sau thi mo', () => {
  assert.ok(/data-lich-thang="-1"[^>]*disabled/.test(lc.taoLichThang('x', 2026, 10, '2026-10-19', '')));
  assert.ok(!/data-lich-thang="-1"[^>]*disabled/.test(lc.taoLichThang('x', 2026, 11, '2026-10-19', '')));
  assert.ok(!/data-lich-thang="1"[^>]*disabled/.test(lc.taoLichThang('x', 2026, 10, '2026-10-19', '')));
  // Qua ranh gioi nam: thang 1 nam sau voi hom nay thang 12.
  assert.ok(/data-lich-thang="-1"[^>]*disabled/.test(lc.taoLichThang('x', 2026, 12, '2026-12-20', '')));
  assert.ok(!/data-lich-thang="-1"[^>]*disabled/.test(lc.taoLichThang('x', 2027, 1, '2026-12-20', '')));
  // So sanh dung khi nam khac nhau: thang 1/2026 truoc thang 12/2025? (hom nay 2026-01-05)
  assert.ok(/data-lich-thang="-1"[^>]*disabled/.test(lc.taoLichThang('x', 2026, 1, '2026-01-05', '')));
});

test('lich: ngay hom nay chon duoc, ngay hom qua bi khoa, ngay het khoa, it van chon duoc', () => {
  const lich = { a: { '2026-10-21': 'het', '2026-10-22': 'it' } };
  const html = lc.taoLichThang('a', 2026, 10, '2026-10-19', '', lich);
  const nut = (n) => new RegExp('<button[^>]*data-ngay="' + n + '"[^>]*>').exec(html)[0];
  assert.ok(/disabled/.test(nut('2026-10-18')));
  assert.ok(!/disabled/.test(nut('2026-10-19')) && /hom-nay/.test(nut('2026-10-19')));
  assert.ok(/disabled/.test(nut('2026-10-21')));
  assert.ok(!/disabled/.test(nut('2026-10-22')));
  assert.ok(!/disabled/.test(nut('2026-10-23')));
  // Chua chon tau: ngay 'het' cua tau khac khong anh huong.
  const khong = lc.taoLichThang('', 2026, 10, '2026-10-19', '', lich);
  assert.ok(!/<button[^>]*data-ngay="2026-10-21"[^>]*disabled/.test(khong));
});

test('lich: gia tri la, null, undefined, chuoi rong trong LICH_CHO coi la con cho; HET/ het  duoc chuan hoa', () => {
  // Chữ hoa, khoảng trắng thừa được chuẩn hoá (Ms Nguyên gõ tay): 'HET' = hết chỗ.
  assert.strictEqual(lc.trangThaiNgay('a', '2099-01-02', '2099-01-01', { a: { '2099-01-02': 'HET' } }), 'het');
  assert.strictEqual(lc.trangThaiNgay('a', '2099-01-02', '2099-01-01', { a: { ' 2099-01-02 ': ' It ' } }), 'it');
  // Sai định dạng ngày thì bỏ qua (báo ở Console), coi như còn chỗ.
  assert.strictEqual(lc.trangThaiNgay('a', '2099-01-02', '2099-01-01', { a: { '02/01/2099': 'het', '2099-1-2': 'het' } }), 'con');
  const lich = { a: { '2099-01-02': 'khong-ro', '2099-01-03': null, '2099-01-04': undefined, '2099-01-05': '', '2099-01-06': 0, '2099-01-07': true, '2099-01-08': 'toString' } };
  for (let d = 2; d <= 8; d++) assert.strictEqual(lc.trangThaiNgay('a', '2099-01-0' + d, '2099-01-01', lich), 'con', 'ngay ' + d);
  // Khoa slug kieu prototype khong lam vo.
  assert.strictEqual(lc.trangThaiNgay('constructor', '2099-01-02', '2099-01-01', lich), 'con');
  assert.strictEqual(lc.trangThaiNgay('a', '', '2099-01-01', lich), 'qua');
  assert.strictEqual(lc.trangThaiNgay('a', '2099-01-02', '2099-01-01', {}), 'con');
});

test('lich: du lieu LICH_CHO that chi co gia tri hop le va ngay dung dinh dang, du 6 tau', () => {
  for (const t of DANH_SACH_TAU) assert.ok(lc.LICH_CHO[t.slug], t.slug + ' co trong LICH_CHO');
  for (const slug of Object.keys(lc.LICH_CHO)) {
    assert.ok(tau(slug), slug + ' la tau co that');
    for (const [ngay, tt] of Object.entries(lc.LICH_CHO[slug])) {
      assert.match(ngay, /^\d{4}-\d{2}-\d{2}$/);
      assert.ok(['het', 'it'].includes(tt), slug + ' ' + ngay);
    }
  }
});

// ---------- ganLichCho voi DOM gia ----------
function taoKhung() {
  const nghe = {};
  return {
    innerHTML: '',
    addEventListener(ten, fn) { nghe[ten] = fn; },
    bam(thuoc, gtri, khoa) {
      const nut = {
        disabled: !!khoa,
        getAttribute: (t) => (t === 'data-lich-thang' || t === 'data-ngay' ? gtri : null)
      };
      nghe.click({ target: { closest: (sel) => (sel === '[' + thuoc + ']' ? nut : null) } });
    }
  };
}
const thangHienTai = (khung) => /Tháng (\d+)\/(\d+)/.exec(khung.innerHTML).slice(1, 3).map(Number);

test('ganLichCho: chuyen thang 12 -> 1 tang nam, 1 -> 12 giam nam, khong lui qua thang hien tai', () => {
  const khung = taoKhung();
  lc.ganLichCho(khung, '2026-11-10', () => 'indochina-star', () => {});
  assert.deepStrictEqual(thangHienTai(khung), [11, 2026]);
  khung.bam('data-lich-thang', '1'); assert.deepStrictEqual(thangHienTai(khung), [12, 2026]);
  khung.bam('data-lich-thang', '1'); assert.deepStrictEqual(thangHienTai(khung), [1, 2027]);
  khung.bam('data-lich-thang', '-1'); assert.deepStrictEqual(thangHienTai(khung), [12, 2026]);
  khung.bam('data-lich-thang', '-1'); assert.deepStrictEqual(thangHienTai(khung), [11, 2026]);
  // Nut lui dang khoa: bam (bi bo qua) thi khong lui.
  khung.bam('data-lich-thang', '-1', true); assert.deepStrictEqual(thangHienTai(khung), [11, 2026]);
  assert.ok(/data-lich-thang="-1"[^>]*disabled/.test(khung.innerHTML));
  // Di nhieu nam roi ve lai.
  for (let i = 0; i < 14; i++) khung.bam('data-lich-thang', '1');
  assert.deepStrictEqual(thangHienTai(khung), [1, 2028]);
});

test('ganLichCho: bam ngay con cho goi chonNgay; ngay bi khoa khong goi; ngayDau mo dung thang', () => {
  const khung = taoKhung();
  const chon = [];
  lc.ganLichCho(khung, '2026-10-19', () => 'indochina-star', (n) => chon.push(n), '2027-01-15');
  assert.deepStrictEqual(thangHienTai(khung), [1, 2027]);
  assert.ok(/class="[^"]*chon[^"]*"[^>]*data-ngay="2027-01-15"/.test(khung.innerHTML));
  khung.bam('data-ngay', '2027-01-20'); assert.deepStrictEqual(chon, ['2027-01-20']);
  khung.bam('data-ngay', '2027-01-21', true); assert.deepStrictEqual(chon, ['2027-01-20']);
  // ngayDau trong qua khu: mo o thang hom nay, khong danh dau chon la hop le nhung thang hom nay.
  const k2 = taoKhung();
  lc.ganLichCho(k2, '2026-10-19', () => '', () => {}, '2020-01-01');
  assert.deepStrictEqual(thangHienTai(k2), [10, 2026]);
  // khung null khong loi.
  // khung null: khong loi, tra null (trang dat cho doi o ngay ve input date).
  assert.strictEqual(lc.ganLichCho(null, '2026-10-19', () => '', () => {}), null);
});

test('ganLichCho: ve(ngayMoi) cap nhat ngay chon, doi tau thi ve lai theo tau moi', () => {
  const khung = taoKhung();
  let slug = 'indochina-star';
  lc.LICH_CHO['indochina-queen']['2999-05-05'] = 'het';
  try {
    const l = lc.ganLichCho(khung, '2999-05-01', () => slug, () => {});
    l.ve('2999-05-05');
    assert.ok(!/<button[^>]*data-ngay="2999-05-05"[^>]*disabled/.test(khung.innerHTML));
    slug = 'indochina-queen'; l.ve('');
    assert.ok(/<button[^>]*data-ngay="2999-05-05"[^>]*disabled/.test(khung.innerHTML));
  } finally { delete lc.LICH_CHO['indochina-queen']['2999-05-05']; }
});

// ---------- Dat cho ----------
test('dat cho: kiemTraBuoc1 tu choi het cho, chap nhan it cho va ngay con cho, ngay qua van bi tu choi', () => {
  const nh = { 'indochina-queen': { '2999-06-15': 'het', '2999-06-16': 'it' } };
  Object.assign(lc.LICH_CHO['indochina-queen'], nh['indochina-queen']);
  try {
    const don = { slugTau: 'indochina-queen', ngay: '2999-06-16', loai: 'buffet', buffetMa: '0:0', nguoiLon: 2, treEm50: 0, treEmMienPhi: 0, mon: {} };
    assert.strictEqual(dc.kiemTraBuoc1(don, DANH_SACH_TAU, '2026-10-19').loi.ngay, undefined, 'it cho van dat duoc');
    assert.strictEqual(dc.kiemTraBuoc1(Object.assign({}, don, { ngay: '2999-06-17' }), DANH_SACH_TAU, '2026-10-19').loi.ngay, undefined);
    assert.ok(dc.kiemTraBuoc1(Object.assign({}, don, { ngay: '2999-06-15' }), DANH_SACH_TAU, '2026-10-19').loi.ngay);
    assert.ok(dc.kiemTraBuoc1(Object.assign({}, don, { ngay: '2026-10-18' }), DANH_SACH_TAU, '2026-10-19').loi.ngay);
    assert.ok(dc.kiemTraBuoc1(Object.assign({}, don, { ngay: '' }), DANH_SACH_TAU, '2026-10-19').loi.ngay);
  } finally {
    delete lc.LICH_CHO['indochina-queen']['2999-06-15']; delete lc.LICH_CHO['indochina-queen']['2999-06-16'];
  }
});

test('dat cho: duong chay thuan loi (ngay con cho) khong co loi ngay o ca 6 tau', () => {
  for (const t of DANH_SACH_TAU) {
    const don = { slugTau: t.slug, ngay: '2999-06-20', loai: 'buffet', buffetMa: '0:0', nguoiLon: 2, treEm50: 0, treEmMienPhi: 0, mon: {} };
    assert.strictEqual(dc.kiemTraBuoc1(don, DANH_SACH_TAU, '2026-10-19').loi.ngay, undefined, t.slug);
  }
});

test('dat cho: docThamSoUrl lay ?ngay= va ?tau=', () => {
  const p = dc.docThamSoUrl('?tau=indochina-queen&ngay=2026-12-24');
  assert.strictEqual(p.ngay, '2026-12-24');
  assert.strictEqual(p.tau, 'indochina-queen');
});

test('dat cho: trang khong nap lich-cho.js van chay (phuong an du phong, chay trong vm)', () => {
  const vm = require('node:vm');
  const ma = doc('js/dat-cho.js');
  const ctx = { console, module: undefined, require: undefined };
  vm.createContext(ctx);
  // Khong co module, require, trangThaiNgay: phai roi vao nhanh du phong, khong nem loi.
  vm.runInContext(ma.slice(ma.indexOf('var hamLichCho'), ma.indexOf('if (typeof kyVe')), ctx);
  assert.strictEqual(ctx.hamLichCho.trangThaiNgay('x', '2999-01-01', '2026-01-01'), 'con');
  // Không có lịch: ganLichCho trả null, trang đặt chỗ đổi ô ngày về <input type="date"> để khách vẫn chọn được ngày.
  assert.strictEqual(ctx.hamLichCho.ganLichCho({}, '2026-01-01', () => '', () => {}), null);
  assert.ok(ma.includes("el.ngay.type = 'date';") && ma.includes('el.ngay.min = hamLichCho.ngayHomNayVN();'));
});

test('dat cho: trang dat-cho.js co doi tau thi bo chon ngay het cho (hanh vi trong ma) va dung ?ngay= dien san', () => {
  const ma = doc('js/dat-cho.js');
  assert.ok(/thamSo\.ngay && laNgayCoThat\(thamSo\.ngay\)\) don\.ngay = thamSo\.ngay/.test(ma));
  assert.ok(/=== 'het'\) \{ don\.ngay = ''; el\.ngay\.value = ''/.test(ma));
});

// ---------- Queen = Star ----------
test('Queen: chinh sach tre em tren trang tau, o dem, tinh tien giong Star', () => {
  const q = tau('indochina-queen'); const s = tau('indochina-star');
  assert.deepStrictEqual(q.chinhSachTreEm, s.chinhSachTreEm);
  assert.deepStrictEqual(GIA_TRE_EM['indochina-queen'].buffet, GIA_TRE_EM['indochina-star'].buffet);
  const mucTre = (t) => { const h = ht.taoTrangTau(t, LIEN_HE, '../'); const i = h.indexOf('id="tre-em"'); return h.slice(i, h.indexOf('</section>', i)).replace(/\s+/g, ' '); };
  assert.strictEqual(mucTre(q).replace(/Queen/g, 'X'), mucTre(s).replace(/Star/g, 'X'));
  // Tinh tien buffet: cung so luong tre cho cung ket qua tre em (chi gia ve khac).
  const don = (slug) => ({ slugTau: slug, ngay: '2999-06-20', loai: 'buffet', buffetMa: '0:0', nguoiLon: 2, treEm50: 1, treEmMienPhi: 1, mon: {} });
  const tq = dc.tomTatDon(don('indochina-queen'), q, GIA_TRE_EM);
  const ts = dc.tomTatDon(don('indochina-star'), s, GIA_TRE_EM);
  assert.deepStrictEqual(Object.keys(tq), Object.keys(ts));
  assert.strictEqual(dc.canhBaoTreEm(don('indochina-queen'), q, GIA_TRE_EM), dc.canhBaoTreEm(don('indochina-star'), s, GIA_TRE_EM));
  // 2 nguoi lon + 5 tre 50%: khong co canh bao tong tre (Queen giong Star).
  const nhieu = Object.assign(don('indochina-queen'), { treEm50: 5, treEmMienPhi: 0 });
  assert.strictEqual(dc.canhBaoTreEm(nhieu, q, GIA_TRE_EM), dc.canhBaoTreEm(Object.assign({}, nhieu, { slugTau: 'indochina-star' }), s, GIA_TRE_EM));
  assert.ok(!GIA_TRE_EM['indochina-queen'].buffet.canhBaoTongTre && !GIA_TRE_EM['indochina-queen'].canhBaoTongTre);
});

test('Queen: khach khong thay chu nam sinh, 01-03, 04-09, 70%, canh bao tong tre o bat ky trang nao', () => {
  const trang = ['index.html', 'faq.html', 'chinh-sach.html', 'dat-cho.html', 'tau/indochina-queen.html'];
  for (const f of trang) {
    const chu = chuHienThi(doc(f));
    assert.ok(!/năm sinh/i.test(chu), f + ' nam sinh');
    assert.ok(!/01\s*[–-]\s*03/.test(chu) && !/04\s*[–-]\s*09/.test(chu), f + ' moc cu');
    assert.ok(!/70\s*%/.test(chu), f + ' 70%');
    assert.ok(!/2 người lớn chỉ được kèm 1 trẻ em/.test(chu), f + ' canh bao tong tre');
  }
  // Trang sinh ra tu ma nguon
  const h = ht.taoTrangTau(tau('indochina-queen'), LIEN_HE, '../');
  assert.ok(!/năm sinh|01–03|04–09|70%/.test(chuHienThi(h)));
  // Tin nhan / canh bao cho don Queen khong nhac nam sinh
  const q = tau('indochina-queen');
  const g = JSON.stringify(GIA_TRE_EM['indochina-queen']);
  assert.ok(!/năm sinh|01–03|04–09|70%|canhBaoTongTre/.test(g));
  assert.ok(!/năm sinh|01–03|04–09|70%/.test(JSON.stringify(q.chinhSachTreEm)));
});

test('Queen: FAQ va trang chinh sach co muc tre em Queen trung noi dung voi Star', () => {
  for (const f of ['faq.html', 'chinh-sach.html']) {
    const chu = chuHienThi(doc(f)).replace(/\s+/g, ' ');
    const q = chu.indexOf('Indochina Queen', chu.indexOf('Trẻ em'));
    assert.ok(chu.includes('0–4 tuổi (dưới 1m)'), f);
    assert.ok(q > 0, f);
  }
});

// ---------- thong so ----------
test('thong so: so lieu khop README va thay-doi.md; ban tieng Anh day du', () => {
  const readme = doc('README.md');
  for (const t of DANH_SACH_TAU) {
    for (const x of t.thongSo) {
      const en = nn.dichChuoi(x.giaTri, 'en');
      assert.ok(en, t.slug + ' chua dich gia tri: ' + x.giaTri);
      assert.ok(!/[À-ỹđĐ]/.test(en.replace(/Bến Nghé|Bến Thành|Nguyên/g, '')), t.slug + ' con chu Viet: ' + en);
      const nhanEn = nn.dichChuoi(x.nhan, 'en');
      assert.ok(nhanEn, t.slug + ' chua dich nhan: ' + x.nhan);
    }
  }
  assert.ok(/## Thông số tàu/.test(readme) && /thongSo/.test(readme), 'README mo ta thongSo');
});

test('thong so: README nhac 6 tau co thong so; moi so lieu trong README khop du-lieu-tau', () => {
  const readme = doc('README.md');
  const dong = readme.split('\n').filter((l) => /thongSo|thông số/i.test(l));
  assert.ok(dong.length > 0, 'README co nhac thong so');
});

// ---------- Nut lien he noi: DOM gia ----------
function napHienThiVoiDom() {
  const luu = {};
  const ds = (ten) => (luu[ten] = luu[ten] || []);
  const lop = new Set();
  const nut = {
    _tt: {}, setAttribute(t, v) { this._tt[t] = v; }, getAttribute(t) { return this._tt[t]; },
    addEventListener(ten, fn) { ds('nut-' + ten).push(fn); }, focus() { nut.coFocus = true; }
  };
  const hop = {
    classList: { add: (c) => lop.add(c), contains: (c) => lop.has(c), toggle: (c, b) => { if (b) lop.add(c); else lop.delete(c); } },
    querySelector: (s) => (s === '.lh-mo' ? nut : null),
    contains: (n) => n === hop || n === nut || n === hop.con
  };
  hop.con = { id: 'goi' };
  const document = {
    getElementById: (id) => (id === 'lien-he-noi' ? hop : null),
    addEventListener: (ten, fn) => ds('doc-' + ten).push(fn)
  };
  return { document, hop, nut, lop, luu, khac: { id: 'khac' } };
}

test('nut lien he noi: mo/dong, aria-expanded, Esc, bam ra ngoai, bam ben trong khong dong', () => {
  const vm = require('node:vm');
  const m = napHienThiVoiDom();
  const ma = doc('js/hien-thi.js');
  const i = ma.indexOf('function ganLienHeNoi'); const j = ma.indexOf('function apDungCauHinhChung');
  const ctx = { document: m.document };
  vm.createContext(ctx); vm.runInContext(ma.slice(i, j) + '\nganLienHeNoi(); ganLienHeNoi();', ctx);
  assert.ok(m.lop.has('thu-gon') && !m.lop.has('mo'));
  assert.strictEqual(m.luu['nut-click'].length, 1, 'gan 1 lan du goi 2 lan');
  const clickNut = () => m.luu['nut-click'][0]({ stopPropagation() {} });
  clickNut(); assert.ok(m.lop.has('mo')); assert.strictEqual(m.nut._tt['aria-expanded'], 'true');
  clickNut(); assert.ok(!m.lop.has('mo')); assert.strictEqual(m.nut._tt['aria-expanded'], 'false');
  clickNut();
  m.luu['doc-click'][0]({ target: m.hop.con }); assert.ok(m.lop.has('mo'), 'bam trong hop khong dong');
  m.luu['doc-click'][0]({ target: m.khac }); assert.ok(!m.lop.has('mo')); assert.strictEqual(m.nut._tt['aria-expanded'], 'false');
  clickNut();
  m.luu['doc-keydown'][0]({ key: 'Enter' }); assert.ok(m.lop.has('mo'), 'phim khac khong dong');
  m.luu['doc-keydown'][0]({ key: 'Escape' }); assert.ok(!m.lop.has('mo')); assert.strictEqual(m.nut._tt['aria-expanded'], 'false');
  assert.ok(m.nut.coFocus, 'Esc tra focus ve nut');
});

test('nut lien he noi: co o moi trang khach, khong co o trang noi bo; ban dau aria-expanded=false', () => {
  for (const f of ['index.html', 'faq.html', 'chinh-sach.html', 'dat-cho.html', 'tau/indochina-queen.html', 'tau/ben-nghe.html']) {
    const h = doc(f);
    assert.ok(h.includes('id="lien-he-noi"'), f);
    assert.ok(/class="lh-mo"[^>]*aria-expanded="false"|aria-expanded="false"[^>]*class="lh-mo"/.test(h), f + ' aria-expanded ban dau');
    for (const href of ['tel:0948170036', 'https://m.me/antoitrenduthuyensaigon', 'https://zalo.me/0948170036']) assert.ok(h.includes('href="' + href + '"'), f + ' ' + href);
  }
  for (const f of ['xac-nhan.html', 'kiem-tra-ve.html']) assert.ok(!doc(f).includes('lien-he-noi'), f + ' khong co nut noi');
});

// ---------- Trang chu, trang tau ----------
test('trang chu: khong con muc 3 buoc / can tu van o ban sinh ra va ban nguon JS', () => {
  const chu = chuHienThi(doc('index.html'));
  assert.ok(!/Đặt chỗ chỉ 3 bước|Cần tư vấn/.test(chu));
  assert.ok(!/Đặt chỗ chỉ 3 bước|Cần tư vấn chọn tàu/.test(doc('cong-cu/tao-trang.js')), 'tao-trang.js con sinh muc cu');
});

test('trang tau da sinh: dung voi ban sinh ra tu ma nguon (khong bi sua tay lech)', () => {
  for (const t of DANH_SACH_TAU) {
    const f = doc('tau/' + t.slug + '.html');
    assert.ok(!f.includes('id="tre-em-chung"') && !f.includes('Liên hệ đặt chỗ'), t.slug);
    assert.ok(f.includes('js/lich-cho.js') && f.indexOf('js/lich-cho.js') < f.indexOf('js/hien-thi.js'), t.slug + ' nap lich-cho.js truoc hien-thi.js');
  }
});

// ---------- Song ngu EN ----------
test('EN: lich co ten thang, thu, trang thai va aria-label bang tieng Anh, khong nua Anh nua Viet', () => {
  const html = lc.taoLichThang('indochina-star', 2026, 12, '2026-10-19', '2026-12-24', { 'indochina-star': { '2026-12-25': 'het', '2026-12-26': 'it' } });
  // Gom moi chuoi hien thi: noi dung the + aria-label.
  const chuoi = new Set();
  html.replace(/aria-label="([^"]+)"/g, (_, s) => chuoi.add(s));
  html.replace(/>([^<>]+)</g, (_, s) => { if (s.trim()) chuoi.add(s.trim()); });
  assert.ok(chuoi.size > 10);
  for (const s of chuoi) {
    if (/^[\d‹›]+$/.test(s)) continue;
    const en = nn.dichChuoi(s, 'en');
    assert.ok(en !== null, 'chua dich: ' + s);
    assert.ok(!/[À-ỹđĐ]/.test(en), 'con chu Viet: ' + en);
  }
  assert.strictEqual(nn.dichChuoi('Tháng 12/2026', 'en'), 'December 2026');
  assert.strictEqual(nn.dichChuoi('Tháng 2/2028', 'en'), 'February 2028');
  assert.strictEqual(nn.dichChuoi('Thứ Sáu, 25/12/2026 – Hết chỗ', 'en'), 'Friday, 25 Dec 2026 – ' + TU_DIEN_EN['Hết chỗ']);
  for (const t of ['Còn chỗ', 'Còn ít chỗ', 'Hết chỗ', 'Đã qua', 'Tháng trước', 'Tháng sau', 'CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7']) {
    assert.ok(nn.dichChuoi(t, 'en'), t);
  }
  assert.strictEqual(nn.dichChuoi('Chủ nhật, 04/10/2026 – Còn chỗ', 'en').startsWith('Sunday, 04 Oct 2026'), true);
});

test('EN: moi ten thang 1..12 va moi thu deu dich duoc', () => {
  const ten = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  for (let m = 1; m <= 12; m++) assert.strictEqual(nn.dichChuoi('Tháng ' + m + '/2027', 'en'), ten[m - 1] + ' 2027');
  const thu = { 'Chủ nhật': 'Sunday', 'Thứ Hai': 'Monday', 'Thứ Ba': 'Tuesday', 'Thứ Tư': 'Wednesday', 'Thứ Năm': 'Thursday', 'Thứ Sáu': 'Friday', 'Thứ Bảy': 'Saturday' };
  for (const [vi, en] of Object.entries(thu)) assert.ok(nn.dichChuoi(vi + ', 05/01/2027 – Còn chỗ', 'en').startsWith(en + ', 05 Jan 2027'), vi);
});

test('EN: thong bao het cho khi dat cho va chu thich/tieu de lich co ban dich', () => {
  const loi = 'Ngày này tàu đã hết chỗ, vui lòng chọn ngày khác.';
  assert.ok(nn.dichChuoi(loi, 'en'), 'loi het cho chua dich');
  assert.ok(!/[À-ỹ]/.test(nn.dichChuoi(loi, 'en')));
  assert.ok(nn.dichChuoi('Lịch còn chỗ', 'en'));
  assert.ok(nn.dichChuoi('Xem lịch còn chỗ', 'en'));
});

test('EN: moi chuoi tieng Viet khach thay tren trang tau Queen sau khi dich khong con chu Viet (tru ten rieng)', () => {
  const h = chuHienThi(ht.taoTrangTau(tau('indochina-queen'), LIEN_HE, '../'));
  const thieu = [];
  for (const dong of h.replace(/&amp;/g, '&').split(/\s{2,}/)) {
    const s = dong.trim();
    if (!s || !/[À-ỹđĐ]/.test(s) || /^[^\p{L}]*$/u.test(s)) continue;
    if (s === 'Chính sách & điều kiện vé .') continue; // dau cham sau the <a> do cach tach chu cua test
    const en = nn.dichChuoi(s, 'en');
    if (en === null) thieu.push(s);
  }
  assert.deepStrictEqual(thieu.slice(0, 5), [], 'chua dich: ' + JSON.stringify(thieu.slice(0, 8)));
});
