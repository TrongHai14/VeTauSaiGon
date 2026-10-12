const test = require('node:test');
const assert = require('node:assert');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');
const { execSync } = require('node:child_process');
global.CAU_HINH = require('../js/cau-hinh.js').CAU_HINH;
const xt = require('../js/xac-thuc.js');
const dc = require('../js/dat-cho.js');
const { DANH_SACH_TAU, GIA_TRE_EM, CONG_TY, LIEN_HE } = require('../js/du-lieu-tau.js');

const GOC = path.join(__dirname, '..');
const doc = (f) => fs.readFileSync(path.join(GOC, f), 'utf8');
const VE = {
  m: 'VT261012ABCD', t: 'indochina-queen', tt: 'Indochina Queen', n: '2026-10-20', h: 'Nguyễn Thị Hiền',
  s: '0948170036', nl: 2, te: 1, mp: 1, g: 1539000, c: 'AB12', x: '2026-10-12'
};
const b64 = (o) => Buffer.from(JSON.stringify(o), 'utf8').toString('base64url');
const giaiGoi = (chuoi) => JSON.parse(Buffer.from(chuoi, 'base64url').toString('utf8'));
let cap, capKhac, chuoi;
test.before(async () => {
  cap = await xt.taoCapKhoa();
  capKhac = await xt.taoCapKhoa();
  chuoi = await xt.kyVe(cap.biMat, VE);
});
const doiKyTu = (s, i) => s.slice(0, i) + (s[i] === 'A' ? 'B' : 'A') + s.slice(i + 1);

test('duong thuan loi: taoCapKhoa -> kyVe -> kiemTraVe hop le', async () => {
  const kq = await xt.kiemTraVe(cap.congKhai, chuoi);
  assert.strictEqual(kq.hopLe, true);
  assert.deepStrictEqual(kq.ve, VE);
  assert.strictEqual(kq.lyDo, '');
  assert.strictEqual((await xt.kiemTraVe(cap.congKhai, '#' + chuoi)).hopLe, true, 'chap nhan dau # o dau');
});

test('khoa cong khai khong chua d', () => {
  assert.strictEqual(cap.congKhai.d, undefined);
  assert.ok(xt.laKhoaBiMat(cap.biMat) && xt.laKhoaCongKhai(cap.congKhai));
});

test('sua tung truong cua ve thi khong hop le', async () => {
  const goi = giaiGoi(chuoi);
  const doi = { m: 'VT261012ZZZZ', t: 'indochina-star', tt: 'Khac', n: '2026-10-21', h: 'Nguyễn Thị Hiên', s: '0948170037', nl: 3, te: 0, mp: 0, g: 1, c: 'ZZ99', x: '2026-10-13' };
  for (const k of Object.keys(VE)) {
    const hong = { v: Object.assign({}, goi.v, { [k]: doi[k] }), k: goi.k };
    const kq = await xt.kiemTraVe(cap.congKhai, b64(hong));
    assert.strictEqual(kq.hopLe, false, 'truong ' + k);
  }
});

test('khoa khac, chu ky cat / doi ky tu, chuoi rac, thieu v hoac k: khong hop le, khong nem loi', async () => {
  const goi = giaiGoi(chuoi);
  const cacCa = [
    [capKhac.congKhai, chuoi],
    [cap.congKhai, b64({ v: goi.v, k: goi.k.slice(0, 40) })],
    [cap.congKhai, b64({ v: goi.v, k: doiKyTu(goi.k, 5) })],
    [cap.congKhai, b64({ v: goi.v })],
    [cap.congKhai, b64({ k: goi.k })],
    [cap.congKhai, b64({ v: 'chuoi', k: goi.k })],
    [cap.congKhai, b64({ v: goi.v, k: 123 })],
    [cap.congKhai, b64({ v: goi.v, k: '!!!' })],
    [cap.congKhai, b64(null)], [cap.congKhai, b64([1, 2])], [cap.congKhai, b64('x')],
    [cap.congKhai, ''], [cap.congKhai, '#'], [cap.congKhai, null], [cap.congKhai, undefined],
    [cap.congKhai, '!!!@@@'], [cap.congKhai, 'abc'], [cap.congKhai, 'x'.repeat(500)],
    [cap.congKhai, Buffer.from('khong phai json').toString('base64url')]
  ];
  for (const [kh, c] of cacCa) {
    const kq = await xt.kiemTraVe(kh, c);
    assert.strictEqual(kq.hopLe, false, String(c).slice(0, 30));
    assert.ok(kq.lyDo.length > 0);
  }
});

test('khoa cong khai sai dinh dang hoac null: khong hop le', async () => {
  const sai = [null, undefined, {}, 'abc', { kty: 'EC', crv: 'P-256' }, { kty: 'RSA', x: 'a', y: 'b' }, { kty: 'EC', crv: 'P-384', x: 'a', y: 'b' }];
  for (const kh of sai) assert.strictEqual((await xt.kiemTraVe(kh, chuoi)).hopLe, false, JSON.stringify(kh));
  const kq = await xt.kiemTraVe({ kty: 'EC', crv: 'P-256', x: 'aaaa', y: 'bbbb' }, chuoi);
  assert.strictEqual(kq.hopLe, false, 'toa do khong nam tren duong cong');
});

test('kyVe tu choi khoa bi mat khong hop le', async () => {
  for (const k of [null, {}, cap.congKhai, 'x']) await assert.rejects(() => xt.kyVe(k, VE));
});

test('chuoiCanKy khong bi lua bang | va xuong dong', () => {
  const a = xt.chuoiCanKy(Object.assign({}, VE, { h: 'A', s: 'B' }));
  const b = xt.chuoiCanKy(Object.assign({}, VE, { h: 'A|s=B', s: '' }));
  const c = xt.chuoiCanKy(Object.assign({}, VE, { h: 'A\ns=B', s: '' }));
  assert.notStrictEqual(a, b);
  assert.notStrictEqual(a, c);
  assert.ok(!xt.chuoiCanKy(Object.assign({}, VE, { h: 'x|y\nz' })).includes('\n'));
  // Mã hoá 1-1: dấu cách, '|', xuống dòng là các nội dung khác nhau.
  const h = (ten) => xt.chuoiCanKy(Object.assign({}, VE, { h: ten }));
  assert.notStrictEqual(h('Nguyen Van A'), h('Nguyen|Van\nA'));
  assert.notStrictEqual(h('A B'), h('A|B'));
  assert.notStrictEqual(h('A B'), h('A\nB'));
});

test('ho ten co | hoac xuong dong: ky xong van kiem tra duoc', async () => {
  const ve = Object.assign({}, VE, { h: 'A|B\nC' });
  const kq = await xt.kiemTraVe(cap.congKhai, await xt.kyVe(cap.biMat, ve));
  assert.strictEqual(kq.hopLe, true);
});

test('tieng Viet va emoji trong ho ten', async () => {
  for (const h of ['Trần Thị Thùy Dương', 'Đặng Văn Ứng 🚢', '👨‍👩‍👧 <b>"&\'']) {
    const ve = Object.assign({}, VE, { h });
    const kq = await xt.kiemTraVe(cap.congKhai, await xt.kyVe(cap.biMat, ve));
    assert.strictEqual(kq.hopLe, true, h);
    assert.strictEqual(kq.ve.h, h);
  }
});

test('laKhoaBiMat / laKhoaCongKhai / khoaKhop', () => {
  assert.ok(xt.laKhoaBiMat(cap.biMat) && !xt.laKhoaBiMat(cap.congKhai));
  assert.ok(xt.laKhoaCongKhai(cap.congKhai) && xt.laKhoaCongKhai(cap.biMat));
  for (const x of [null, undefined, {}, 'x', 5, { kty: 'EC', crv: 'P-256', d: 1, x: 'a', y: 'b' }]) assert.ok(!xt.laKhoaBiMat(x));
  for (const x of [null, undefined, {}, 'x', { kty: 'RSA', x: 'a', y: 'b' }]) assert.ok(!xt.laKhoaCongKhai(x));
  assert.strictEqual(xt.khoaKhop(cap.congKhai, cap.biMat), true);
  assert.strictEqual(xt.khoaKhop(capKhac.congKhai, cap.biMat), false);
  assert.strictEqual(xt.khoaKhop(null, cap.biMat), false);
  assert.strictEqual(xt.khoaKhop(cap.congKhai, null), false);
});

test('maXacThucNgan co dang XXXX-XXXX; chuoi hong tra rong', () => {
  assert.match(xt.maXacThucNgan(chuoi), /^[A-Z0-9]{4}-[A-Z0-9]{4}$/);
  for (const x of ['', 'abc', '!!!', undefined]) assert.strictEqual(xt.maXacThucNgan(x), '');
});

const e = (t) => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
test('taoKetQuaKiemTra: escape HTML, che SDT, bao lech ngay', () => {
  const ve = Object.assign({}, VE, { h: '<script>alert(1)</script>' });
  const html = xt.taoKetQuaKiemTra({ hopLe: true, ve, lyDo: '' }, '2026-10-20', e);
  assert.ok(html.includes('VÉ HỢP LỆ'));
  assert.ok(!html.includes('<script>'));
  assert.ok(html.includes('&lt;script&gt;'));
  assert.ok(html.includes('0948***036') && !html.includes('0948170036'));
  assert.ok(!html.includes('ve-ngay-lech'), 'dung ngay thi khong luu y');
  const lech = xt.taoKetQuaKiemTra({ hopLe: true, ve: VE, lyDo: '' }, '2026-10-21', e);
  assert.ok(lech.includes('ve-ngay-lech') && lech.includes('20/10/2026'));
  const sai = xt.taoKetQuaKiemTra({ hopLe: false, ve: null, lyDo: '<b>x</b>' }, '2026-10-20', e);
  assert.ok(sai.includes('VÉ KHÔNG HỢP LỆ') && sai.includes('&lt;b&gt;') && !sai.includes('VÉ HỢP LỆ'));
  assert.strictEqual(xt.anSoDienThoai('123'), '123');
  assert.strictEqual(xt.anSoDienThoai(null), '');
});

/* ---- Trang kiem tra ve chay trong vm ---- */
function chayTrangKiemTra(hash, khoaCongKhai) {
  const phanTu = {};
  const lay = (id) => (phanTu[id] = phanTu[id] || { id, innerHTML: '' });
  const ctx = {
    console, TextEncoder, TextDecoder, atob, btoa, crypto: globalThis.crypto,
    location: { hash, search: '', hostname: 'x.github.io', protocol: 'https:' },
    document: { getElementById: lay, querySelectorAll: () => [], querySelector: () => null },
    window: { addEventListener() {} }, localStorage: { getItem: () => null, setItem() {} }
  };
  vm.createContext(ctx);
  for (const f of ['cau-hinh.js', 'du-lieu-tau.js', 'hien-thi.js', 'xac-thuc.js']) vm.runInContext(doc('js/' + f), ctx);
  vm.runInContext('CAU_HINH.khoaCongKhai = ' + JSON.stringify(khoaCongKhai) + ';', ctx);
  ctx.khoiChayTrangKiemTraVe();
  return new Promise((xong) => setTimeout(() => xong(lay('kiem-tra-ve').innerHTML), 200));
}

test('trang kiem tra ve: hash rong, hop le, bi sua, rac, chua cai khoa', async () => {
  const rong = await chayTrangKiemTra('', cap.congKhai);
  assert.ok(rong.includes('Kiểm tra vé') && rong.includes('quét mã QR'));
  const ok = await chayTrangKiemTra('#' + chuoi, cap.congKhai);
  assert.ok(ok.includes('VÉ HỢP LỆ'), ok.slice(0, 200));
  assert.ok(ok.includes('Nguyễn Thị Hiền'));
  assert.ok(ok.includes('ve-ngay-lech'), 'ngay di 20/10/2026 khong phai hom nay');
  const goi = giaiGoi(chuoi);
  const sua = await chayTrangKiemTra('#' + b64({ v: Object.assign({}, goi.v, { nl: 9 }), k: goi.k }), cap.congKhai);
  assert.ok(sua.includes('VÉ KHÔNG HỢP LỆ') && !sua.includes('VÉ HỢP LỆ'));
  const hong = await chayTrangKiemTra('#!!!rac', cap.congKhai);
  assert.ok(hong.includes('VÉ KHÔNG HỢP LỆ'));
  const chuaCai = await chayTrangKiemTra('#' + chuoi, null);
  assert.ok(chuaCai.includes('VÉ KHÔNG HỢP LỆ') && chuaCai.includes('chưa cài khoá công khai'));
});

/* ---- js/dat-cho.js ---- */
const tau = (slug) => DANH_SACH_TAU.find((t) => t.slug === slug);
const donQueen = (them) => Object.assign({
  slugTau: 'indochina-queen', ngay: '2999-12-24', loai: 'buffet', buffetMa: '0:1', nguoiLon: 2, treEm50: 1, treEmMienPhi: 1, mon: {},
  hoTen: ' Vũ Thị Hiền ', soDienThoai: '0392 082 288', email: 'h@example.com', ghiChu: '', vat: false, dongY: true,
  congTy: { ten: '', mst: '', diaChi: '', email: '' }, taiKhoan: 'caNhan', maDon: 'VT261012ABCD', ngayDat: '2026-10-12'
}, them);

test('taoNoiDungVe lay dung tong va so khach tu tomTatDon', () => {
  const don = donQueen();
  const tt = dc.tomTatDon(don, tau('indochina-queen'), GIA_TRE_EM);
  const ve = dc.taoNoiDungVe(don, tau('indochina-queen'), GIA_TRE_EM, 'CODE1', new Date(2026, 9, 12));
  assert.strictEqual(ve.g, tt.tong);
  assert.strictEqual(ve.nl, tt.khach.nguoiLon);
  assert.strictEqual(ve.te, tt.khach.treEm50);
  assert.strictEqual(ve.mp, tt.khach.treEmMienPhi);
  assert.strictEqual(ve.h, 'Vũ Thị Hiền');
  assert.strictEqual(ve.s, '0392082288');
  assert.strictEqual(ve.c, 'CODE1');
  assert.strictEqual(ve.x, '2026-10-12');
  assert.strictEqual(ve.m, 'VT261012ABCD');
  assert.strictEqual(ve.t, 'indochina-queen');
  assert.strictEqual(dc.taoNoiDungVe(don, tau('indochina-queen'), GIA_TRE_EM, '', new Date(2026, 9, 12)).c, '');
});

test('taoLinkKiemTraVe dung tenMien va bo dau / thua', () => {
  assert.strictEqual(dc.taoLinkKiemTraVe('https://a.vn/web', 'XYZ'), 'https://a.vn/web/kiem-tra-ve.html#XYZ');
  assert.strictEqual(dc.taoLinkKiemTraVe('https://a.vn/web///', 'XYZ'), 'https://a.vn/web/kiem-tra-ve.html#XYZ');
  assert.strictEqual(dc.taoLinkKiemTraVe(CAU_HINH.tenMien, 'Q'), CAU_HINH.tenMien.replace(/\/+$/, '') + '/kiem-tra-ve.html#Q');
});

test('phieu co khoi .phieu-xac-thuc khi co xacThuc, khong co khi khong; QR va ma ngan duoc escape', () => {
  const tk = dc.layTaiKhoan(CAU_HINH.thanhToan, donQueen());
  const tt = { trangThai: 'Đã thanh toán', codeVe: 'C1', ngayXacNhan: new Date(2026, 9, 12) };
  const khong = dc.taoPhieuHtml(donQueen(), tau('indochina-queen'), CONG_TY, LIEN_HE, GIA_TRE_EM, tk, tt);
  assert.ok(!khong.includes('phieu-xac-thuc'));
  const co = dc.taoPhieuHtml(donQueen(), tau('indochina-queen'), CONG_TY, LIEN_HE, GIA_TRE_EM, tk,
    Object.assign({ xacThuc: { qr: 'data:image/gif;base64,AA"><script>x</script>', maNgan: 'AB<i>-1234' } }, tt));
  assert.ok(co.includes('class="phieu-xac-thuc"'));
  assert.ok(!co.includes('<script>x') && !co.includes('<i>'));
  assert.ok(co.includes('AB&lt;i&gt;-1234'));
  const ok = dc.taoPhieuHtml(donQueen(), tau('indochina-queen'), CONG_TY, LIEN_HE, GIA_TRE_EM, tk,
    Object.assign({ xacThuc: { qr: 'data:image/gif;base64,AA', maNgan: 'ABCD-1234' } }, tt));
  assert.ok(ok.includes('ABCD-1234') && ok.includes('src="data:image/gif;base64,AA"'));
});

/* ---- Repo ---- */
test('khong co khoa-bi-mat*.json trong repo, .gitignore chan mau do', () => {
  const ds = execSync('git ls-files', { cwd: GOC, encoding: 'utf8' }).split(/\r?\n/);
  assert.ok(!ds.some((f) => /khoa-bi-mat[^/]*\.json$/.test(f)));
  assert.ok(doc('.gitignore').split(/\r?\n/).map((s) => s.trim()).includes('khoa-bi-mat*.json'));
});

test('kiem-tra-ve.html co noindex; script qrcode co integrity va crossorigin', () => {
  assert.match(doc('kiem-tra-ve.html'), /<meta name="robots" content="[^"]*noindex/);
  const m = doc('xac-nhan.html').match(/<script[^>]*qrcode[^>]*>/);
  assert.ok(m);
  assert.match(m[0], /integrity="sha512-[^"]+"/);
  assert.match(m[0], /crossorigin="anonymous"/);
});

test('PHAI THAT BAI: ve tu che (chu ky khong phai do khoa that) bi tu choi', async () => {
  const gia = b64({ v: VE, k: Buffer.alloc(64, 1).toString('base64url') });
  assert.strictEqual((await xt.kiemTraVe(cap.congKhai, gia)).hopLe, false);
});

test('B1: ve ky voi "Nguyen Van A" bi sua thanh "Nguyen|Van\nA" phai KHONG hop le', async () => {
  const chuoi = await xt.kyVe(cap.biMat, Object.assign({}, VE, { h: 'Nguyen Van A' }));
  const goi = JSON.parse(Buffer.from(chuoi, 'base64url').toString('utf8'));
  goi.v.h = 'Nguyen|Van\nA';
  const kq = await xt.kiemTraVe(cap.congKhai, Buffer.from(JSON.stringify(goi)).toString('base64url'));
  assert.strictEqual(kq.hopLe, false);
});

test('B2: ve co truong sai kieu (so dang chuoi, so le, so am, null) bi tu choi', async () => {
  const chuoi = await xt.kyVe(cap.biMat, VE);
  const goi = JSON.parse(Buffer.from(chuoi, 'base64url').toString('utf8'));
  for (const [k, gt] of [['nl', '2'], ['nl', 2.5], ['te', -1], ['g', 'abc'], ['h', 5], ['n', null]]) {
    const sua = JSON.parse(JSON.stringify(goi));
    sua.v[k] = gt;
    const kq = await xt.kiemTraVe(cap.congKhai, Buffer.from(JSON.stringify(sua)).toString('base64url'));
    assert.strictEqual(kq.hopLe, false, k + '=' + JSON.stringify(gt));
  }
  assert.ok(xt.laVeDungKieu(xt.chuanHoaVe(VE)));
});

test('A1: chi ky khi khoa tren may khop khoa cong khai cua web', async () => {
  const khac = await xt.taoCapKhoa();
  assert.match(xt.kiemTraKhoaTruocKhiKy(cap.congKhai, null), /Chưa có khoá/);
  assert.match(xt.kiemTraKhoaTruocKhiKy(null, cap.biMat), /chưa cài khoá công khai/);
  assert.match(xt.kiemTraKhoaTruocKhiKy(cap.congKhai, khac.biMat), /KHÔNG khớp/);
  assert.strictEqual(xt.kiemTraKhoaTruocKhiKy(cap.congKhai, cap.biMat), null);
  assert.strictEqual(xt.kiemTraKhoaTruocKhiKy(cap.congKhai, { x: cap.biMat.x, y: cap.biMat.y }), null, 'ban ghi tren may chi co x, y');
});

test('A2: file khoa khong khop khoa cong khai bi tu choi, file rac bi tu choi', async () => {
  const khac = await xt.taoCapKhoa();
  assert.match(xt.kiemTraFileKhoa(cap.congKhai, khac.biMat), /KHÔNG khớp/);
  assert.match(xt.kiemTraFileKhoa(cap.congKhai, { kty: 'EC' }), /không phải khoá/);
  assert.match(xt.kiemTraFileKhoa(cap.congKhai, cap.congKhai), /không phải khoá/, 'khoa cong khai khong co d');
  assert.strictEqual(xt.kiemTraFileKhoa(cap.congKhai, cap.biMat), null);
  assert.strictEqual(xt.kiemTraFileKhoa(null, khac.biMat), null, 'web chua cai khoa cong khai: nhan file');
});

// ---------- C2: cách ký thật khi chạy (bản ghi CryptoKey không xuất được) ----------
const THUAT_TOAN = { name: 'ECDSA', namedCurve: 'P-256' };
const banGhiTuJwk = async (jwk) => ({
  khoa: await crypto.subtle.importKey('jwk', jwk, THUAT_TOAN, false, ['sign']), x: jwk.x, y: jwk.y, crv: jwk.crv
});

test('C2: kyVe voi ban ghi { khoa: CryptoKey extractable:false } ky duoc va kiem tra hop le', async () => {
  const banGhi = await banGhiTuJwk(cap.biMat);
  assert.strictEqual(banGhi.khoa.extractable, false);
  const kq = await xt.kiemTraVe(cap.congKhai, await xt.kyVe(banGhi, VE));
  assert.strictEqual(kq.hopLe, true);
});

test('C2: kyVe voi CryptoKey cong khai (khong ky duoc) hoac ban ghi rac thi bao loi', async () => {
  const congKhaiKey = await crypto.subtle.importKey('jwk', cap.congKhai, THUAT_TOAN, false, ['verify']);
  await assert.rejects(xt.kyVe({ khoa: congKhaiKey, x: cap.congKhai.x, y: cap.congKhai.y }, VE));
  await assert.rejects(xt.kyVe({ khoa: 'khong-phai-khoa' }, VE), /không hợp lệ/);
  await assert.rejects(xt.kyVe(null, VE), /không hợp lệ/);
});

test('kyPhieuAnToan: khoa khong khop thi tu choi va KHONG ky; khop thi ky va tu kiem lai', async () => {
  global.CAU_HINH = require('../js/cau-hinh.js').CAU_HINH;
  const dc = require('../js/dat-cho.js');
  const khac = await xt.taoCapKhoa();
  let daDoc = 0;
  await assert.rejects(dc.kyPhieuAnToan(cap.congKhai, async () => { daDoc++; return banGhiTuJwk(khac.biMat); }, VE), /KHÔNG khớp/);
  assert.strictEqual(daDoc, 1);
  await assert.rejects(dc.kyPhieuAnToan(cap.congKhai, async () => null, VE), /Chưa có khoá/);
  await assert.rejects(dc.kyPhieuAnToan(null, async () => banGhiTuJwk(cap.biMat), VE), /chưa cài khoá công khai/);
  await assert.rejects(dc.kyPhieuAnToan(cap.congKhai, async () => { throw new Error('kho loi'); }, VE), /kho loi/, 'loi kho khoa duoc bao ra, khong ket');
  // Bản ghi có x, y khớp nhưng CryptoKey là của khoá khác: bước tự kiểm lại phải chặn (D3).
  const lech = Object.assign(await banGhiTuJwk(khac.biMat), { x: cap.congKhai.x, y: cap.congKhai.y });
  await assert.rejects(dc.kyPhieuAnToan(cap.congKhai, async () => lech, VE), /tự kiểm tra/);
  const chuoi = await dc.kyPhieuAnToan(cap.congKhai, async () => banGhiTuJwk(cap.biMat), VE);
  assert.strictEqual((await xt.kiemTraVe(cap.congKhai, chuoi)).hopLe, true);
});
