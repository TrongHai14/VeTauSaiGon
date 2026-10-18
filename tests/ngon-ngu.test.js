// Song ngữ: mọi chữ tiếng Việt khách nhìn thấy đều phải có bản tiếng Anh trong js/tu-dien-en.js.
// Test này rớt thì nó in ra đúng câu còn thiếu: thêm câu đó vào TU_DIEN_EN (hoặc MAU_DICH_EN).
const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const { TU_DIEN_EN, MAU_DICH_EN } = require('../js/tu-dien-en.js');
global.TU_DIEN_EN = TU_DIEN_EN;
global.MAU_DICH_EN = MAU_DICH_EN;
global.CAU_HINH = require('../js/cau-hinh.js').CAU_HINH;
const nn = require('../js/ngon-ngu.js');
const ht = require('../js/hien-thi.js');
const dc = require('../js/dat-cho.js');
const xt = require('../js/xac-thuc.js');
const { DANH_SACH_TAU, LIEN_HE, GIA_TRE_EM } = require('../js/du-lieu-tau.js');

const GOC = path.join(__dirname, '..');
const doc = (rel) => fs.readFileSync(path.join(GOC, rel), 'utf8');
const unesc = (s) => s.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#39;/g, "'");

// Tách chữ hiển thị (từng đoạn giữa các thẻ) và các thuộc tính được dịch từ một đoạn HTML.
function layChu(html) {
  const sach = html
    .replace(/<script[\s\S]*?<\/script>/g, '').replace(/<style[\s\S]*?<\/style>/g, '')
    .replace(/<noscript[\s\S]*?<\/noscript>/g, '').replace(/<textarea[\s\S]*?<\/textarea>/g, '')
    .replace(/<([a-z]+)[^>]*data-khong-dich[^>]*>[\s\S]*?<\/\1>/g, '');
  const ra = [];
  for (const m of sach.matchAll(/\b(?:placeholder|title|aria-label|alt)="([^"]*)"/g)) ra.push(unesc(m[1]));
  for (const doan of sach.replace(/<[^>]+>/g, '\u0000').split('\u0000')) ra.push(unesc(doan));
  return ra.map(nn.chuanHoaChuoi).filter((s) => s && nn.coChuViet(s));
}

function thieuBanDich(dsChu) {
  return [...new Set(dsChu)].filter((s) => nn.dichChuoi(s, 'en') === null);
}

const tau = (slug) => DANH_SACH_TAU.find((t) => t.slug === slug);
const donMau = (them) => Object.assign({
  slugTau: 'indochina-queen', ngay: '2999-12-24', loai: 'buffet', buffetMa: '0:0', nguoiLon: 2, treEm50: 1, treEmMienPhi: 1, mon: {},
  hoTen: 'A', soDienThoai: '0392082288', email: 'a@b.vn', ghiChu: '', vat: false, dongY: true,
  congTy: { ten: '', mst: '', diaChi: '', email: '' }, taiKhoan: 'caNhan', maDon: 'VT261014ABCD'
}, them);

test('dichChuoi: tu dien, mau cau, dinh dang gio va gia; vi thi khong dich', () => {
  assert.strictEqual(nn.dichChuoi('Đặt chỗ', 'en'), 'Book');
  assert.strictEqual(nn.dichChuoi('Đặt chỗ', 'vi'), null);
  assert.strictEqual(nn.dichChuoi('  Đặt   chỗ ', 'en'), 'Book', 'gop khoang trang');
  assert.strictEqual(nn.dichChuoi('Ngày 24/12/2026 · Đón 17h15', 'en'), '24 Dec 2026 · Pick-up 17:15');
  assert.strictEqual(nn.dichChuoi('561.600 VND', 'en'), '561,600 VND');
  assert.strictEqual(nn.dichChuoi('Set menu từ 469.000đ · Buffet 733.320đ', 'en'), 'Set menus from 469,000 VND · Buffet 733,320 VND');
  assert.strictEqual(nn.dichChuoi('Câu này chưa có trong từ điển', 'en'), null);
  assert.strictEqual(nn.dichChuoi('0948170036', 'en'), null, 'so dien thoai giu nguyen');
});

test('cac trang HTML: moi chu tieng Viet (header, footer, noi dung tinh) deu co ban dich', () => {
  const trang = ['index.html', 'dat-cho.html', 'chinh-sach.html', 'faq.html', 'kiem-tra-ve.html', 'xac-nhan.html']
    .concat(DANH_SACH_TAU.map((t) => 'tau/' + t.slug + '.html'));
  for (const f of trang) {
    const html = doc(f);
    const tieuDe = unesc(/<title>([^<]*)<\/title>/.exec(html)[1]);
    assert.notStrictEqual(nn.dichChuoi(tieuDe, 'en'), null, f + ' tieu de: ' + tieuDe);
    assert.deepStrictEqual(thieuBanDich(layChu(html.slice(html.indexOf('<body')))), [], f);
  }
});

test('trang tau va the tau (6 tau): moi chu deu co ban dich', () => {
  for (const t of DANH_SACH_TAU) {
    assert.deepStrictEqual(thieuBanDich(layChu(ht.taoTrangTau(t, LIEN_HE, '../'))), [], t.slug);
    assert.deepStrictEqual(thieuBanDich(layChu(ht.taoTheTau(t, ''))), [], t.slug + ' the');
  }
});

test('trang dat cho: chon mon, tom tat, thanh toan, canh bao, bao loi deu co ban dich', () => {
  const chu = [];
  for (const t of DANH_SACH_TAU) {
    for (const loai of ['buffet', 'setMenu']) {
      const nhom = ht.layThucDonTheoLoai(t)[loai];
      const ma = nhom.length ? nhom[0].dong[0].ma : '';
      const don = donMau({ slugTau: t.slug, loai, buffetMa: ma, mon: ma ? { [ma]: 2 } : {}, treEm50: 2, treEmMienPhi: 3 });
      chu.push(...layChu(dc.taoKhoiChonMon(t, don, GIA_TRE_EM, LIEN_HE)));
      chu.push(...layChu(dc.taoTomTatDon(don, t, GIA_TRE_EM, '')));
      const canh = dc.canhBaoTreEm(don, t, GIA_TRE_EM);
      if (canh) chu.push(nn.chuanHoaChuoi(canh));
    }
  }
  chu.push(...layChu(dc.taoKhoiChonMon(null, donMau(), GIA_TRE_EM, LIEN_HE)));
  chu.push(...layChu(dc.taoTomTatDon(donMau(), null, GIA_TRE_EM, '')));
  for (const vat of [false, true]) chu.push(...layChu(dc.taoKhoiThanhToan(donMau({ vat }), tau('indochina-queen'), GIA_TRE_EM, CAU_HINH.thanhToan)));
  chu.push(...layChu(dc.taoKhoiMsNguyen(true, donMau())));
  // Mọi thông báo lỗi của bước 1 và bước 2.
  const loi1 = [donMau({ slugTau: 'x' }), donMau({ ngay: '2000-01-01' }), donMau({ loai: 'x' }), donMau({ buffetMa: '' }), donMau({ nguoiLon: 0 }),
    donMau({ loai: 'setMenu', mon: {} }), donMau({ slugTau: 'saigon-princess' }), donMau({ slugTau: 'ben-nghe', loai: 'setMenu' })];
  for (const d of loi1) chu.push(...Object.values(dc.kiemTraBuoc1(d, DANH_SACH_TAU, '2026-10-14').loi));
  const loi2 = dc.kiemTraBuoc2(donMau({ hoTen: '', soDienThoai: '1', email: '', dongY: false, vat: true }));
  chu.push(...Object.values(loi2.loi));
  assert.deepStrictEqual(thieuBanDich(chu.map(nn.chuanHoaChuoi).filter(nn.coChuViet)), []);
});

test('thong bao hien ra trong luc dat cho (thongBao, textContent) deu co ban dich', () => {
  const js = doc('js/dat-cho.js');
  const dau = js.indexOf('function ganSuKienDatCho(');
  const than = js.slice(dau, js.indexOf('\nfunction khoiChayTrangDatCho(', dau));
  const chu = [];
  for (const m of than.matchAll(/(?:thongBao\(|textContent = )'([^']+)'/g)) chu.push(m[1]);
  for (const m of js.matchAll(/hop\.textContent = '([^']+)'/g)) chu.push(m[1]);
  assert.ok(chu.length >= 5, 'tim thay cac thong bao');
  assert.deepStrictEqual(thieuBanDich(chu.map(nn.chuanHoaChuoi).filter(nn.coChuViet)), []);
});

test('trang kiem tra ve (hop le, khong hop le) deu co ban dich', async () => {
  const cap = await xt.taoCapKhoa();
  const ve = { m: 'VT261014ABCD', t: 'indochina-queen', tt: 'Indochina Queen', n: '2999-01-01', h: 'A', s: '0392082288', nl: 2, te: 1, mp: 1, g: 1, c: 'X', x: '2026-10-14' };
  const hopLe = await xt.kiemTraVe(cap.congKhai, await xt.kyVe(cap.biMat, ve));
  const chu = layChu(xt.taoKetQuaKiemTra(hopLe, '2026-10-14', ht.escapeHtml));
  for (const chuoi of ['abc', '']) chu.push(...layChu(xt.taoKetQuaKiemTra(await xt.kiemTraVe(cap.congKhai, chuoi), '2026-10-14', ht.escapeHtml)));
  chu.push(...layChu(xt.taoKetQuaKiemTra(await xt.kiemTraVe(null, 'abc'), '2026-10-14', ht.escapeHtml)));
  assert.deepStrictEqual(thieuBanDich(chu), []);
});

test('phieu xac nhan va trang xac nhan noi bo giu tieng Viet (data-khong-dich)', () => {
  const html = dc.taoPhieuHtml(donMau(), tau('indochina-queen'), require('../js/du-lieu-tau.js').CONG_TY, LIEN_HE, GIA_TRE_EM,
    dc.layTaiKhoan(CAU_HINH.thanhToan, donMau()), { trangThai: 'Đã thanh toán.', codeVe: '', ngayXacNhan: new Date() });
  assert.ok(/^<div class="phieu" id="phieu" data-khong-dich>/.test(html));
  assert.ok(doc('xac-nhan.html').includes('<main class="khung" id="xac-nhan" data-khong-dich>'));
});

test('mau cau: phan ben trong chua co ban dich thi tra null (khong ra cau nua Anh nua Viet)', () => {
  assert.strictEqual(nn.dichChuoi('Xem menu Món lạ chưa dịch', 'en'), null);
  assert.strictEqual(nn.dichChuoi('Set menu Món lạ chưa dịch', 'en'), null);
  assert.notStrictEqual(nn.dichChuoi('Du thuyền Bến Nghé', 'en'), null, 'ten tau giu nguyen van dich duoc');
});

test('canh bao tre em theo tung tau: Princess bao phu thu 100.000 VND/be, Queen tinh tong tre, Star tu tinh ve tre em', () => {
  const pr = dc.canhBaoTreEm(donMau({ slugTau: 'saigon-princess', loai: 'setMenu', mon: {}, nguoiLon: 0, treEmMienPhi: 3 }), tau('saigon-princess'), GIA_TRE_EM);
  // Set menu đếm người lớn theo suất đã chọn: chọn 2 suất người lớn.
  const nhom = ht.layThucDonTheoLoai(tau('saigon-princess')).setMenu;
  const maNL = nhom[0].dong.find((d) => !/Trẻ em/.test(d.ten)).ma;
  const canh = dc.canhBaoTreEm(donMau({ slugTau: 'saigon-princess', loai: 'setMenu', mon: { [maNL]: 2 }, treEm50: 0, treEmMienPhi: 3 }), tau('saigon-princess'), GIA_TRE_EM);
  assert.strictEqual(pr, null, 'chua chon suat nao thi chua canh bao');
  assert.match(canh, /2 người lớn chỉ được kèm tối đa 2 bé miễn phí\. Đơn có 3 bé, 1 bé vượt phụ thu 100\.000 VND\/bé\./);
  assert.match(nn.dichChuoi(canh, 'en'), /each extra child \(1\) is charged 100,000 VND\./);
  const qu = dc.canhBaoTreEm(donMau({ treEm50: 1, treEmMienPhi: 1 }), tau('indochina-queen'), GIA_TRE_EM);
  assert.match(qu, /2 người lớn chỉ được kèm 1 trẻ em\. Đơn có 2 trẻ em/);
  const st = dc.canhBaoTreEm(donMau({ slugTau: 'indochina-star', treEm50: 0, treEmMienPhi: 2 }), tau('indochina-star'), GIA_TRE_EM);
  assert.strictEqual(st, null, 'Indochina Star buffet: be mien phi thu 2 tu tinh ve tre em, khong can canh bao');
  for (const c of [canh, qu]) assert.notStrictEqual(nn.dichChuoi(c, 'en'), null, c);
});
