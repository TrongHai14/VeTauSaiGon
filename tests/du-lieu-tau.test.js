const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const { THONG_TIN_WEB, LIEN_HE, DIA_CHI_MAC_DINH, DANH_SACH_TAU } = require('../js/du-lieu-tau.js');

const GOC = path.join(__dirname, '..');
const SLUGS = ['indochina-queen', 'indochina-star', 'ben-nghe', 'elite-of-saigon', 'saigon-princess', 'ben-thanh-princess'];
const tau = (s) => DANH_SACH_TAU.find((t) => t.slug === s);
const bang = (t, tieuDe) => t.bangGia.find((b) => b.tieuDe === tieuDe);

test('thong tin chung', () => {
  assert.strictEqual(THONG_TIN_WEB.ten, 'Vé Tàu Sài Gòn');
  assert.strictEqual(LIEN_HE.soDienThoai, '0948170036');
  assert.strictEqual(LIEN_HE.linkZalo, 'https://zalo.me/0948170036');
  assert.strictEqual(LIEN_HE.linkGoi, 'tel:0948170036');
  assert.strictEqual(DIA_CHI_MAC_DINH, '5 Nguyễn Tất Thành, Phường Xóm Chiếu, Hồ Chí Minh');
});
test('du 6 tau dung slug va thu tu, dia chi mac dinh, moTaNgan <= 160', () => {
  assert.deepStrictEqual(DANH_SACH_TAU.map((t) => t.slug), SLUGS);
  for (const t of DANH_SACH_TAU) {
    assert.strictEqual(t.diaChi, DIA_CHI_MAC_DINH, t.slug);
    assert.ok(t.moTaNgan.length > 0 && t.moTaNgan.length <= 160, t.slug + ' ' + t.moTaNgan.length);
    for (const b of t.bangGia) for (const d of b.dong) assert.ok(Number.isInteger(d.gia) && d.gia > 0, t.slug);
  }
});
test('gio chay', () => {
  for (const s of ['indochina-star', 'indochina-queen']) {
    assert.deepStrictEqual([tau(s).gioChay.donKhach, tau(s).gioChay.khoiHanh, tau(s).gioChay.capBen], ['18h00', '19h45', '21h15']);
  }
  const bn = tau('ben-nghe').gioChay;
  assert.deepStrictEqual([bn.donKhach, bn.khoiHanh, bn.capBen], ['17h15', '20h00', '21h30']);
  assert.strictEqual(bn.ghiChu, 'Quý khách chỉ cần có mặt trước 20h00. Từ 19h00 đến 20h00 quý khách đã có thể dùng dịch vụ trên tàu (ăn uống, nghe nhạc…) trong lúc tàu chưa khởi hành.');
});
test('gia khop giai-dap.md: Star, Queen, Ben Nghe', () => {
  assert.deepStrictEqual(tau('indochina-star').bangGia.map((b) => b.tieuDe), ['Buffet']);
  assert.deepStrictEqual(bang(tau('indochina-star'), 'Buffet').dong.map((d) => d.gia), [615600, 669600]);
  assert.deepStrictEqual(bang(tau('indochina-queen'), 'Buffet').dong.map((d) => d.gia), [561600, 615600, 669600]);
  const sm = bang(tau('indochina-queen'), 'Set menu');
  assert.deepStrictEqual(sm.dong.map((d) => d.ten), ['INDO7', 'INDO8', 'INDO9', 'INDO10', 'INDO11', 'INDO12', 'INDO13', 'INDO14', 'INDO15', 'INDO16', 'INDO17']);
  assert.deepStrictEqual(sm.dong.map((d) => d.gia), [723600, 723600, 831600, 831600, 939600, 939600, 1047600, 1047600, 1209600, 1425600, 1641600]);
  assert.strictEqual(sm.ghiChu, 'Set menu chỉ phục vụ ở tầng 3 (sảnh VIP).');
  // Queen dùng chung chính sách trẻ em với Star (yêu cầu 19/10/2026).
  assert.deepStrictEqual(tau('indochina-queen').chinhSachTreEm, tau('indochina-star').chinhSachTreEm);
  assert.deepStrictEqual(bang(tau('ben-nghe'), 'Buffet').dong.map((d) => d.gia), [733320]);
  assert.ok(bang(tau('ben-nghe'), 'Buffet').ghiChu.includes('Đã bao gồm VAT và vé lên tàu, chưa bao gồm nước uống.'));
});
test('gia khop giai-dap.md: Princess', () => {
  const sp = [980000, 980000, 1200000, 980000, 1350000, 1350000, 1350000, 1350000, 1880000, 1880000, 1880000, 1880000, 1880000, 1880000, 1650000, 1650000, 1250000, 950000, 850000, 850000];
  assert.deepStrictEqual(bang(tau('saigon-princess'), 'Set menu').dong.map((d) => d.gia), sp);
  const bt = [980000, 980000, 1200000, 980000, 1350000, 1350000, 1350000, 1350000, 1880000, 1880000, 1880000, 1880000, 1650000, 1880000, 1650000, 1880000, 1250000, 950000, 850000, 850000];
  assert.deepStrictEqual(bang(tau('ben-thanh-princess'), 'Set menu').dong.map((d) => d.gia), bt);
  for (const s of ['saigon-princess', 'ben-thanh-princess']) {
    assert.ok(bang(tau(s), 'Set menu').ghiChu.startsWith('Giá đã bao gồm thuế, phí phục vụ và vé lên tàu.'), s);
  }
  assert.strictEqual(bang(tau('saigon-princess'), 'Set menu').dong[0].ten, '3 món – Việt Nam');
  assert.strictEqual(bang(tau('saigon-princess'), 'Set menu').dong[0].tenPhu, 'Vietnamese');
});
test('Elite: bang va phu thu', () => {
  const e = tau('elite-of-saigon');
  assert.ok(bang(e, 'Buffet – Tầng 1') && bang(e, 'Set menu – Tầng 2') && bang(e, 'Set chill – Tầng 3 (sân thượng)'));
  assert.strictEqual(bang(e, 'Set menu – Tầng 2').dong.length, 6);
  const pt = bang(e, 'Phụ thu dùng set menu trên tầng 3').dong;
  assert.deepStrictEqual(pt.map((d) => [d.ten, d.gia, d.tenPhu]), [
    ['Thứ 2 – Thứ 4', 490000, 'Không tặng set chill'],
    ['Thứ 5 – Chủ nhật', 988000, 'Tặng set chill']]);
  assert.strictEqual(e.khuyenMai[0].tieuDe, 'Mid-week Chill');
});
test('moi file trong anh/ < 512000 byte', () => {
  const duyet = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? duyet(path.join(d, e.name)) : [path.join(d, e.name)]));
  for (const f of duyet(path.join(GOC, 'anh'))) assert.ok(fs.statSync(f).size < 512000, f);
});
// MST cong ty (10 so bat dau bang 0) khong phai SDT.
const MST_CONG_TY = '0319143429';
// Tra ve danh sach SDT la (khac 0948170036) trong mot doan van ban; bat ca dang "+84...".
function timSdtLa(txt) {
  const la = [];
  for (const m of txt.match(/(?:\+?84|0)[\d .\-]{8,}\d/g) || []) {
    const so = m.replace(/[\s.\-]/g, '');
    if (/^(\+?84|0)\d{8,10}$/.test(so) && so.replace(/^\+?84/, '0') !== '0948170036' && so !== MST_CONG_TY) la.push(m);
  }
  return la;
}
test('timSdtLa: bat duoc SDT la dang +84 va dang 0, bo qua SDT dung', () => {
  assert.deepStrictEqual(timSdtLa('Goi +84 912 345 678 ngay'), ['+84 912 345 678']);
  assert.deepStrictEqual(timSdtLa('Zalo +84912345678.'), ['+84912345678']);
  assert.deepStrictEqual(timSdtLa('SDT 0912.345.678'), ['0912.345.678']);
  assert.deepStrictEqual(timSdtLa('84912345678'), ['84912345678']);
  assert.deepStrictEqual(timSdtLa('0948 170 036 va +84948170036 va 84948170036'), []);
  assert.deepStrictEqual(timSdtLa('MST: 0319143429'), []);
});
test('quet chu HTML/JS: khong SDT khac, khong dia chi cu', () => {
  const duyet = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? duyet(path.join(d, e.name)) : [path.join(d, e.name)]));
  const files = ['index.html', 'dat-cho.html', 'xac-nhan.html', 'chinh-sach.html'].map((f) => path.join(GOC, f))
    .concat(duyet(path.join(GOC, 'tau')), duyet(path.join(GOC, 'js')))
    .filter((f) => /\.(html|js)$/.test(f));
  assert.ok(files.length >= 10);
  for (const f of files) {
    // Bỏ dữ liệu đường vẽ SVG (d="..."): dãy số toạ độ dễ bị nhầm là SĐT.
    const txt = fs.readFileSync(f, 'utf8').replace(/\bd="[^"]*"/g, '');
    const rel = path.relative(GOC, f);
    assert.deepStrictEqual(timSdtLa(txt), [], rel);
    for (const x of ['Quận 4', 'Q4', 'Phường 13', 'P.13']) assert.ok(!txt.includes(x), rel + ' chua ' + x);
  }
});
