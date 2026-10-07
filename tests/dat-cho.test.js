const test = require('node:test');
const assert = require('node:assert');
global.CAU_HINH = require('../js/cau-hinh.js').CAU_HINH;
const dc = require('../js/dat-cho.js');
const { DANH_SACH_TAU, LIEN_HE, CONG_TY, GIA_TRE_EM } = require('../js/du-lieu-tau.js');

const tau = (slug) => DANH_SACH_TAU.find((t) => t.slug === slug);
const TT = CAU_HINH.thanhToan;
const donBuffet = (them) => Object.assign({
  slugTau: 'indochina-queen', ngay: '2999-12-24', loai: 'buffet', buffetMa: '0:1',
  nguoiLon: 2, treEm50: 1, treEmMienPhi: 1, mon: {},
  hoTen: ' Vũ Thị Hiền ', soDienThoai: '0392 082 288', email: 'hien@example.com', ghiChu: '', vat: false, dongY: true,
  congTy: { ten: '', mst: '', diaChi: '', email: '' }, taiKhoan: 'caNhan', maDon: 'VT261007ABCD', ngayDat: '2026-10-07'
}, them);

test('chuanHoaSoDienThoai: hop le / khong hop le', () => {
  assert.strictEqual(dc.chuanHoaSoDienThoai('0948 170 036'), '0948170036');
  assert.strictEqual(dc.chuanHoaSoDienThoai('+84948170036'), '0948170036');
  assert.strictEqual(dc.chuanHoaSoDienThoai('84948.170.036'), '0948170036');
  for (const x of ['', '12345', '+840948170036', null, '09481700361']) assert.strictEqual(dc.chuanHoaSoDienThoai(x), null, String(x));
});

test('laMaSoThue va laEmail', () => {
  assert.ok(dc.laMaSoThue('0312345678') && dc.laMaSoThue('0312345678-001'));
  assert.ok(!dc.laMaSoThue('031234567') && !dc.laMaSoThue('abc'));
  assert.ok(dc.laEmail('a@b.vn') && !dc.laEmail('a@b') && !dc.laEmail(''));
});

test('buffet: nguoi lon gia du, tre 50% lam tron, tre mien phi 0d', () => {
  const tt = dc.tomTatDon(donBuffet(), tau('indochina-queen'), GIA_TRE_EM);
  assert.deepStrictEqual(tt.dong.map((d) => [d.gia, d.soLuong, d.thanhTien]), [[615600, 2, 1231200], [307800, 1, 307800]]);
  assert.strictEqual(tt.tong, 1539000);
  assert.deepStrictEqual(tt.khach, { nguoiLon: 2, treEm50: 1, treEmMienPhi: 1 });
});

test('buffet: tau khong co chinh sach 50% thi bo qua so tre 50%', () => {
  const khong50 = { 'indochina-queen': { buffet: { mienPhi: 'x', nuaGia: null } } };
  const tt = dc.tomTatDon(donBuffet(), tau('indochina-queen'), khong50);
  assert.strictEqual(tt.tong, 1231200);
});

test('set menu: moi mon x so suat, suat Tre em dem vao tre em', () => {
  const don = donBuffet({ slugTau: 'saigon-princess', loai: 'setMenu', mon: { '0:0': 2, '0:18': 1, '0:4': 0 }, treEm50: 5 });
  const tt = dc.tomTatDon(don, tau('saigon-princess'), GIA_TRE_EM);
  assert.strictEqual(tt.tong, 980000 * 2 + 850000);
  assert.deepStrictEqual(tt.khach, { nguoiLon: 2, treEm50: 1, treEmMienPhi: 1 });
});

test('kiemTraBuoc1: thieu tau / ngay qua khu / loai khong co / chua chon mon', () => {
  const homNay = '2026-10-07';
  assert.ok(dc.kiemTraBuoc1(donBuffet(), DANH_SACH_TAU, homNay).hopLe);
  const loi = (d) => Object.keys(dc.kiemTraBuoc1(d, DANH_SACH_TAU, homNay).loi);
  assert.deepStrictEqual(loi(donBuffet({ slugTau: 'khong-co' })), ['slugTau']);
  assert.deepStrictEqual(loi(donBuffet({ ngay: '2026-10-06' })), ['ngay']);
  assert.deepStrictEqual(loi(donBuffet({ ngay: '2026-02-30' })), ['ngay']);
  assert.deepStrictEqual(loi(donBuffet({ buffetMa: '' })), ['mon']);
  assert.deepStrictEqual(loi(donBuffet({ nguoiLon: 0 })), ['mon']);
  assert.deepStrictEqual(loi(donBuffet({ slugTau: 'saigon-princess' })), ['loai'], 'Princess khong co buffet');
  assert.deepStrictEqual(loi(donBuffet({ slugTau: 'ben-nghe', loai: 'setMenu' })), ['loai'], 'Ben Nghe chua co danh sach set menu');
  assert.deepStrictEqual(loi(donBuffet({ loai: 'setMenu', mon: {} })), ['mon']);
  assert.ok(dc.kiemTraBuoc1(donBuffet({ loai: 'setMenu', mon: { '1:0': 1 } }), DANH_SACH_TAU, homNay).hopLe);
});

test('kiemTraBuoc2: lien he bat buoc, VAT bat buoc du thong tin cong ty', () => {
  assert.ok(dc.kiemTraBuoc2(donBuffet()).hopLe);
  assert.deepStrictEqual(Object.keys(dc.kiemTraBuoc2(donBuffet({ hoTen: ' ', soDienThoai: '123', email: 'sai' })).loi), ['hoTen', 'soDienThoai', 'email']);
  assert.deepStrictEqual(Object.keys(dc.kiemTraBuoc2(donBuffet({ vat: true })).loi), ['congTyTen', 'congTyMst', 'congTyDiaChi', 'congTyEmail']);
  const coVat = donBuffet({ vat: true, congTy: { ten: 'ABC', mst: '0312345678', diaChi: '1 Lê Lợi', email: 'kt@abc.vn' } });
  assert.ok(dc.kiemTraBuoc2(coVat).hopLe);
});

test('taoMaDon: VT + yymmdd + 4 ky tu khong de nham', () => {
  const ma = dc.taoMaDon(new Date(2026, 9, 7), () => 0.999);
  assert.match(ma, /^VT261007[A-Z2-9]{4}$/);
  assert.ok(!/[01OI]/.test(ma.slice(8)));
});

test('tai khoan nhan: VAT luon vao tai khoan cong ty', () => {
  assert.strictEqual(dc.layTaiKhoan(TT, donBuffet()).soTaiKhoan, '25960437');
  assert.strictEqual(dc.layTaiKhoan(TT, donBuffet({ taiKhoan: 'congTy' })).soTaiKhoan, '4988888666');
  assert.strictEqual(dc.layTaiKhoan(TT, donBuffet({ vat: true, taiKhoan: 'caNhan' })).soTaiKhoan, '4988888666');
});

test('VietQR: dung ngan hang, so tai khoan, so tien, noi dung', () => {
  const noiDung = dc.taoNoiDungChuyenKhoan(donBuffet());
  assert.strictEqual(noiDung, 'VT261007ABCD 0392082288');
  const url = dc.taoLinkVietQR(TT.caNhan, 1539000, noiDung);
  assert.ok(url.startsWith('https://img.vietqr.io/image/970416-25960437-compact2.png?amount=1539000&addInfo=VT261007ABCD%200392082288'));
  assert.ok(url.includes('accountName=' + encodeURIComponent('Lê Hoàng Thảo Nguyên')));
});

test('khoi thanh toan: co QR tu tao, co 2 lua chon tai khoan; VAT chi con tai khoan cong ty', () => {
  const html = dc.taoKhoiThanhToan(donBuffet(), tau('indochina-queen'), GIA_TRE_EM, TT);
  assert.ok(html.includes('img.vietqr.io') && html.includes('value="caNhan"') && html.includes('value="congTy"'));
  assert.ok(html.includes('1.539.000 VND'));
  const vat = dc.taoKhoiThanhToan(donBuffet({ vat: true }), tau('indochina-queen'), GIA_TRE_EM, TT);
  assert.ok(!vat.includes('value="caNhan"') && vat.includes('4988888666'));
  const coAnh = Object.assign({}, TT, { caNhan: Object.assign({}, TT.caNhan, { anhQR: 'anh/qr/qr.png' }) });
  assert.ok(dc.taoKhoiThanhToan(donBuffet(), tau('indochina-queen'), GIA_TRE_EM, coAnh).includes('src="anh/qr/qr.png"'));
});

test('khoi chon mon: nhan tre em theo tung tau', () => {
  const queen = dc.taoKhoiChonMon(tau('indochina-queen'), donBuffet(), GIA_TRE_EM, LIEN_HE);
  assert.ok(queen.includes('1–4 tuổi (dưới 1m)') && queen.includes('5–9 tuổi (1m – dưới 1,3m) – tính 50% giá vé'));
  const star = dc.taoKhoiChonMon(tau('indochina-star'), donBuffet({ slugTau: 'indochina-star', buffetMa: '0:0' }), GIA_TRE_EM, LIEN_HE);
  assert.ok(star.includes('0–4 tuổi (dưới 1m)'));
  const princess = dc.taoKhoiChonMon(tau('saigon-princess'), donBuffet({ slugTau: 'saigon-princess', loai: 'setMenu' }), GIA_TRE_EM, LIEN_HE);
  assert.ok(!princess.includes('name="treEm50"'), 'Princess khong co o tre 50%');
  assert.ok(princess.includes('Dưới 6 tuổi'));
  assert.strictEqual((princess.match(/name="mon:/g) || []).length, 20);
});

test('tin nhan Zalo va email gom ma don, tong tien, tai khoan, VAT', () => {
  const don = donBuffet({ vat: true, congTy: { ten: 'ABC', mst: '0312345678', diaChi: '1 Lê Lợi', email: 'kt@abc.vn' } });
  const tk = dc.layTaiKhoan(TT, don);
  const tin = dc.soanTinNhanDatCho(don, tau('indochina-queen'), GIA_TRE_EM, tk);
  assert.ok(tin.includes('- Mã đơn: VT261007ABCD') && tin.includes('- Tổng cộng: 1.539.000 VND') && tin.includes('MST 0312345678'));
  assert.ok(!tin.includes('xac-nhan.html'), 'khach khong nhan link tao phieu');
  const email = dc.taoDuLieuEmail(don, tau('indochina-queen'), GIA_TRE_EM, tk, 'https://x/xac-nhan.html#abc');
  assert.strictEqual(email._subject, 'Đặt chỗ mới - Indochina Queen - 24/12/2999 - VT261007ABCD');
  assert.strictEqual(email['Tổng cộng'], '1.539.000 VND');
  assert.strictEqual(email['Link tạo phiếu sau khi kiểm tra tiền'], 'https://x/xac-nhan.html#abc');
});

test('maHoaDon / giaiMaDon: giu nguyen tieng Viet, chuoi hong tra null', () => {
  const don = donBuffet();
  const ma = dc.maHoaDon(don);
  assert.match(ma, /^[A-Za-z0-9_-]+$/);
  assert.deepStrictEqual(dc.giaiMaDon('#' + ma), don);
  assert.strictEqual(dc.giaiMaDon('#khong-phai-json'), null);
  assert.strictEqual(dc.giaiMaDon(''), null);
});

test('phieu xac nhan: trang thai, ma don, code ve, ngay dat cua khach', () => {
  const don = donBuffet();
  const html = dc.taoPhieuHtml(don, tau('indochina-queen'), CONG_TY, LIEN_HE, GIA_TRE_EM, dc.layTaiKhoan(TT, don),
    { trangThai: 'Đã thanh toán.', codeVe: 'QN-1', ngayXacNhan: new Date(2026, 11, 1) });
  for (const s of ['Đã thanh toán.', 'VT261007ABCD', 'QN-1', 'VŨ THỊ HIỀN', '24.12.2999', '0319143429', '0948170036', '1.539.000 vnd']) {
    assert.ok(html.includes(s), s);
  }
  assert.ok(html.includes('Ngày đặt <b>07</b> tháng <b>10</b>'), 'lay ngay khach dat, khong lay ngay xac nhan');
  assert.ok(!html.includes('Quận 4') && !html.includes('0909'));
});

test('guiEmailDatCho: POST JSON dung URL; loi mang / JSON loi / success=false tra false', async () => {
  let goi;
  const ok = await dc.guiEmailDatCho({ a: 1 }, (url, opt) => { goi = [url, opt]; return Promise.resolve({ ok: true, json: () => ({ success: 'true' }) }); });
  assert.strictEqual(ok, true);
  assert.strictEqual(goi[0], 'https://formsubmit.co/ajax/bookingindochinaqueen@gmail.com');
  assert.strictEqual(goi[1].method, 'POST');
  assert.deepStrictEqual(JSON.parse(goi[1].body), { a: 1 });
  assert.strictEqual(await dc.guiEmailDatCho({}, () => Promise.reject(new Error('mang'))), false);
  assert.strictEqual(await dc.guiEmailDatCho({}, () => { throw new Error('dong bo'); }), false);
  assert.strictEqual(await dc.guiEmailDatCho({}, () => Promise.resolve({ ok: false })), false);
  assert.strictEqual(await dc.guiEmailDatCho({}, () => Promise.resolve({ ok: true, json: () => { throw new Error('x'); } })), false);
  assert.strictEqual(await dc.guiEmailDatCho({}, () => Promise.resolve({ ok: true, json: () => ({ success: 'false' }) })), false);
  assert.strictEqual(await dc.guiEmailDatCho({}, null), false);
});

test('docThamSoUrl va ngayHomNayDiaPhuong', () => {
  assert.deepStrictEqual(dc.docThamSoUrl('?tau=indochina-queen&loai=setMenu&menu=1%3A0'), { tau: 'indochina-queen', loai: 'setMenu', menu: '1:0' });
  assert.deepStrictEqual(dc.docThamSoUrl('?x=%E0%A4%A'), {});
  assert.strictEqual(dc.ngayHomNayDiaPhuong(new Date(2026, 0, 5, 23, 59)), '2026-01-05');
});

test('kiemTraBuoc2: email nhan ve va dong y dieu kien ve la bat buoc', () => {
  assert.deepStrictEqual(Object.keys(dc.kiemTraBuoc2(donBuffet({ email: '' })).loi), ['email']);
  assert.deepStrictEqual(Object.keys(dc.kiemTraBuoc2(donBuffet({ dongY: false })).loi), ['dongY']);
});

test('quy dinh tre em chung: 2 nguoi lon kem 1 be mien phi, be thu 2 tinh ve tre em 50%', () => {
  assert.deepStrictEqual([0, 1, 2, 3, 4, 5].map(dc.soTreToiDa), [0, 1, 1, 1, 2, 2]);
  const q = tau('indochina-queen');
  const don = donBuffet({ buffetMa: '0:0', nguoiLon: 2, treEm50: 0, treEmMienPhi: 2 });
  assert.strictEqual(dc.soBeMienPhiVuot(don), 1);
  const tt = dc.tomTatDon(don, q, GIA_TRE_EM);
  assert.strictEqual(tt.tong, 561600 * 2 + 280800);
  assert.deepStrictEqual(tt.khach, { nguoiLon: 2, treEm50: 1, treEmMienPhi: 1 });
  assert.match(dc.canhBaoTreEm(don, q), /2 người lớn chỉ được kèm 1 trẻ em/);
  assert.strictEqual(dc.canhBaoTreEm(donBuffet({ treEm50: 1, treEmMienPhi: 0 }), q), null);
  assert.strictEqual(dc.canhBaoTreEm(donBuffet({ nguoiLon: 4, treEm50: 1, treEmMienPhi: 1 }), q), null);
  const email = dc.taoDuLieuEmail(don, q, GIA_TRE_EM, dc.layTaiKhoan(TT, don), null);
  assert.ok(email['Cần báo phụ phí trẻ em'], 'email bao Ms Nguyen can bao phu phi');
});

test('khoi chon mon buffet: ghi chu be thu 2 va canh bao vuot', () => {
  const html = dc.taoKhoiChonMon(tau('indochina-queen'), donBuffet({ treEm50: 2, treEmMienPhi: 1 }), GIA_TRE_EM, LIEN_HE);
  assert.ok(html.includes('bé thứ 2 trở đi tính vé trẻ em (50%)'));
  assert.ok(/data-canh-bao-tre>Theo quy định/.test(html));
});

test('phieu: gia bao gom / chua bao gom theo chinh sach chung', () => {
  const don = donBuffet();
  const html = dc.taoPhieuHtml(don, tau('indochina-queen'), CONG_TY, LIEN_HE, GIA_TRE_EM, dc.layTaiKhoan(TT, don),
    { trangThai: 'Đã thanh toán.', codeVe: '', ngayXacNhan: new Date() });
  for (const s of ['Thuế, phí vào cảng.', 'Nước uống (khách mua và thanh toán trực tiếp tại tàu).', 'Vé chỉ có giá trị vào đúng ngày đăng ký.']) {
    assert.ok(html.includes(s), s);
  }
});
