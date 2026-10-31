// Đợt 31/10/2026: FAQ mới, Nguyên Nguyên Travel, đổi trả chỉ Queen/Star, giao diện tối, GSAP, trang tao-phieu.html.
const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
global.CAU_HINH = require('../js/cau-hinh.js').CAU_HINH;
const ht = require('../js/hien-thi.js');
const dc = require('../js/dat-cho.js');
const { DANH_SACH_TAU, LIEN_HE, GIA_TRE_EM } = require('../js/du-lieu-tau.js');
const { TU_DIEN_EN, MAU_DICH_EN } = require('../js/tu-dien-en.js');
global.TU_DIEN_EN = TU_DIEN_EN;
global.MAU_DICH_EN = MAU_DICH_EN;
const nn = require('../js/ngon-ngu.js');

const doc = (rel) => fs.readFileSync(path.join(__dirname, '..', rel), 'utf8');
const tau = (slug) => DANH_SACH_TAU.find((t) => t.slug === slug);

test('FAQ: du cau moi, gia dung va co ban tieng Anh', () => {
  const faq = doc('faq.html');
  for (const chu of ['đến trễ', 'đổi tên', 'đoàn đông', 'suất ăn đặc biệt', 'vị trí ngồi', '100.000 VND/lít', '250.000 VND/chai', '350.000 VND/chai', 'ngang 4 m, cao 2,5 m', '3.240.000 VND/con']) {
    assert.ok(faq.includes(chu), chu);
  }
  assert.strictEqual(nn.dichChuoi('Có. Heo sữa quay (2,8–3,2 kg) giá 3.240.000 VND/con.', 'en'), 'Yes. A roast suckling pig (2.8–3.2 kg) costs 3,240,000 VND.');
});

test('Nguyen Nguyen: cau cam ket dung ten thuong hieu Travel; ten phap ly cong ty giu nguyen', () => {
  assert.ok(doc('faq.html').includes('Nguyên Nguyên Travel hoàn 100%'));
  assert.ok(doc('js/dat-cho.js').includes('Nguyên Nguyên Travel <b>hoàn'));
  const { CONG_TY } = require('../js/du-lieu-tau.js');
  assert.strictEqual(CONG_TY.ten, 'Công ty TNHH Nguyên Nguyên Global');
  assert.strictEqual(CAU_HINH.thanhToan.congTy.chuTaiKhoan, 'Công Ty TNHH Nguyên Nguyên Global');
});

test('doi tra: chi Queen va Star co muc nay tren trang tau; trang chinh sach ghi ro pham vi', () => {
  for (const t of DANH_SACH_TAU) {
    const html = ht.taoTrangTau(t, LIEN_HE, '../');
    const co = t.slug === 'indochina-queen' || t.slug === 'indochina-star';
    assert.strictEqual(html.includes('id="doi-tra"'), co, t.slug);
    assert.strictEqual(html.includes('Hoàn/Hủy vé'), co, t.slug);
    assert.strictEqual(html.includes('Đổi ngày sử dụng'), co, t.slug);
    assert.ok(html.includes('id="dieu-kien-ve"'), t.slug + ' van co dieu kien ve');
  }
  assert.ok(doc('chinh-sach.html').includes('Áp dụng khi khách muốn hoàn/hủy hoặc đổi ngày: chỉ có ở Indochina Queen và Indochina Star. Trường hợp tàu hết chỗ xem mục Điều kiện vé.'));
  assert.ok(doc('faq.html').includes('Các tàu khác không hỗ trợ hoàn/hủy vé hoặc đổi ngày theo yêu cầu của khách. Riêng trường hợp tàu báo hết chỗ ngày đã chọn, quý khách vẫn được hoàn 100% hoặc đổi ngày.'));
});

test('giao dien toi: moi trang co nut, doc lua chon truoc khi nap CSS; phieu giu nen trang', () => {
  for (const f of ['index.html', 'dat-cho.html', 'faq.html', 'xac-nhan.html', 'tao-phieu.html', 'tau/ben-nghe.html']) {
    const h = doc(f);
    assert.ok(h.includes('id="nut-giao-dien"'), f);
    assert.ok(h.indexOf("localStorage.getItem('veTauSaiGon.giaoDien')") < h.indexOf('css/style.css'), f + ' tranh nhay nen');
  }
  const css = doc('css/style.css');
  assert.ok(css.includes('html[data-giao-dien="toi"] {') && css.includes('color-scheme: dark'));
  assert.ok(/\.phieu[^{]*\{[^}]*background: #fff/.test(css) || /width: 760px; background: #fff/.test(css));
  // Nút bấm đổi trạng thái và lưu lại.
  const luu = {};
  let bam = null;
  const nut = { setAttribute(k, v) { this[k] = v; }, addEventListener(_, f) { bam = f; } };
  const goc = { tt: null, getAttribute() { return this.tt; }, setAttribute(_, v) { this.tt = v; }, removeAttribute() { this.tt = null; } };
  const ctx = { document: { getElementById: () => nut, documentElement: goc }, localStorage: { setItem: (k, v) => { luu[k] = v; } }, String };
  vm.createContext(ctx);
  const ma = doc('js/hien-thi.js');
  vm.runInContext(ma.slice(ma.indexOf('function ganNutGiaoDien'), ma.indexOf('function apDungCauHinhChung')) + '\nganNutGiaoDien();', ctx);
  bam();
  assert.strictEqual(goc.tt, 'toi');
  assert.strictEqual(luu['veTauSaiGon.giaoDien'], 'toi');
  assert.strictEqual(nut['aria-pressed'], 'true');
  bam();
  assert.strictEqual(goc.tt, null);
  assert.strictEqual(luu['veTauSaiGon.giaoDien'], 'sang');
});

test('GSAP: chi nap o trang chu va trang tau, co kiem tra toan ven; loi tai hoac giam chuyen dong thi bo qua', () => {
  for (const f of ['index.html', 'tau/indochina-queen.html']) {
    assert.ok(/gsap\/3\.12\.5\/gsap\.min\.js" integrity="sha512-/.test(doc(f)), f);
    assert.ok(doc(f).indexOf('gsap.min.js') < doc(f).indexOf('hieu-ung.js'), f);
  }
  for (const f of ['dat-cho.html', 'xac-nhan.html', 'tao-phieu.html', 'kiem-tra-ve.html']) assert.ok(!doc(f).includes('gsap'), f);
  const ma = doc('js/hieu-ung.js');
  assert.doesNotThrow(() => vm.runInNewContext(ma, { document: {} }), 'khong co gsap');
  let goi = 0;
  vm.runInNewContext(ma, { gsap: { from() { goi++; } }, document: {}, window: { matchMedia: () => ({ matches: true }) } });
  assert.strictEqual(goi, 0, 'giam chuyen dong');
});

test('tao-phieu: trang noi bo, khong dich, khong co lien ket tu trang khach, khong vao sitemap', () => {
  const h = doc('tao-phieu.html');
  assert.ok(h.includes('<meta name="robots" content="noindex, nofollow">') && h.includes('id="tao-phieu" data-khong-dich'));
  assert.ok(h.indexOf('js/dat-cho.js') < h.indexOf('js/tao-phieu.js'));
  // Chỉ điền thông tin: không khoá ký, không mã QR chữ ký số.
  for (const chu of ['xac-thuc.js', 'khung-khoa', 'qrcode', 'link-kiem-tra']) assert.ok(!h.includes(chu), chu);
  const ma = doc('js/tao-phieu.js');
  for (const chu of ['docKhoaBiMat', 'kyPhieuAnToan', 'ganQuanLyKhoa']) assert.ok(!ma.replace(/^\/\/.*$/gm, '').includes(chu), chu);
  assert.ok(ma.includes('xacThuc: null'));
  assert.ok(doc('robots.txt').includes('Disallow: /tao-phieu.html'));
  assert.ok(!doc('sitemap.xml').includes('tao-phieu'));
  for (const f of ['index.html', 'faq.html', 'dat-cho.html', 'chinh-sach.html', 'tau/ben-nghe.html']) assert.ok(!doc(f).includes('tao-phieu.html'), f);
  assert.ok(!h.includes('class="lien-he-noi"'));
});

function napTaoPhieu() {
  const ctx = { laNgayCoThat: dc.laNgayCoThat || ((s) => /^\d{4}-\d{2}-\d{2}$/.test(s)), chuanHoaSoDienThoai: dc.chuanHoaSoDienThoai, soNguyen: (x) => { const n = parseInt(x, 10); return isNaN(n) || n < 0 ? 0 : n; }, tomTatDon: dc.tomTatDon, escapeHtmlDatCho: ht.escapeHtml, hamHienThi: ht };
  vm.createContext(ctx);
  vm.runInContext(doc('js/tao-phieu.js'), ctx);
  return ctx;
}
const donTay = (them) => Object.assign({ slugTau: 'indochina-queen', ngay: '2099-03-10', loai: 'buffet', buffetMa: '0:0', nguoiLon: 2, treEm50: 0, treEmMienPhi: 0, mon: {}, hoTen: 'Khách A', soDienThoai: '0912345678', vat: false, taiKhoan: 'caNhan' }, them);

test('tao-phieu: kiem tra don nhap tay bao dung tung o', () => {
  const ctx = napTaoPhieu();
  const k = (d, t) => Object.keys(ctx.kiemTraDonTay(d, t === undefined ? tau('indochina-queen') : t, GIA_TRE_EM, '2026-10-31'));
  assert.deepStrictEqual(k(donTay()), []);
  assert.deepStrictEqual(k(donTay({ hoTen: '  ' })), ['hoTen']);
  assert.deepStrictEqual(k(donTay({ soDienThoai: '123' })), ['soDienThoai']);
  assert.deepStrictEqual(k(donTay({ ngay: '2020-01-01' })), ['ngay']);
  assert.deepStrictEqual(k(donTay({ buffetMa: '', nguoiLon: 0 })), ['mon']);
  assert.ok(k(donTay(), null).includes('tau'));
  assert.deepStrictEqual(k(donTay({ loai: 'setMenu', mon: { '1:0': 2 } })), []);
});

test('tao-phieu: o chon mon dung voi tung tau va loai; chu duoc thoat HTML', () => {
  const ctx = napTaoPhieu();
  const buffet = ctx.taoOChonMonTay(tau('indochina-queen'), 'buffet');
  assert.ok(buffet.includes('name="buffetMa"') && buffet.includes('name="nguoiLon"') && buffet.includes('561.600 VND'));
  const set = ctx.taoOChonMonTay(tau('ben-nghe'), 'setMenu');
  assert.strictEqual((set.match(/name="mon:/g) || []).length, 8);
  assert.ok(set.includes('Menu Bến Nghé 1') && set.includes('name="treEmMienPhi"'));
});

test('o dong y: dong nhac doi tra chi hien cho Queen va Star', () => {
  assert.match(dc.loiNhacDoiTra('indochina-queen'), /Đổi ngày cần báo trước/);
  assert.match(dc.loiNhacDoiTra('indochina-star'), /Không hoàn/);
  for (const s of ['ben-nghe', 'elite-of-saigon', 'saigon-princess', 'ben-thanh-princess', '']) assert.strictEqual(dc.loiNhacDoiTra(s), '', s);
  assert.ok(doc('dat-cho.html').includes('<small id="dong-y-doi-tra" hidden></small>'));
});
