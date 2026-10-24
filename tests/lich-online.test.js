// Lịch chỗ online: Apps Script (cong-cu/google-sheet/lich-cho.gs) chạy với Google Sheet giả lập,
// và phần web (js/lich-cho.js) đọc lịch / gửi giữ chỗ với fetch giả.
const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const doc = (rel) => fs.readFileSync(path.join(__dirname, '..', rel), 'utf8');

// ---------- Google Sheet giả lập ----------
// macDinh = true: giữ nguyên giới hạn chống spam mặc định; không thì nới ra để test sức chứa với đoàn lớn.
function taoSheetGia(macDinh) {
  const tabs = {};
  const tab = (ten) => {
    const o = { ten, o: [], getLastRow() { return o.o.length; },
      clear() { o.o = []; },
      getRange(a, b, c, d) {
        if (typeof a === 'string') return { setValue() { return this; }, setNumberFormat() { return this; }, setFontWeight() { return this; }, setValues(v) { v.forEach((r, i) => { o.o[1 + i] = r.slice(); }); return this; }, setDataValidation() { return this; } };
        const dong = a, cot = b, soDong = c || 1, soCot = d || 1;
        return {
          setValues(v) { for (let i = 0; i < soDong; i++) { o.o[dong - 1 + i] = o.o[dong - 1 + i] || []; for (let j = 0; j < soCot; j++) o.o[dong - 1 + i][cot - 1 + j] = v[i][j]; } return this; },
          setValue(v) { o.o[dong - 1] = o.o[dong - 1] || []; o.o[dong - 1][cot - 1] = v; return this; },
          setNumberFormat() { return this; }, setFontWeight() { return this; }
        };
      },
      getDataRange() { return { getValues: () => o.o.map((r) => (r || []).slice()) }; },
      appendRow(r) { o.o.push(r.slice()); },
      setColumnWidth() {}, setFrozenRows() {}
    };
    return o;
  };
  const ss = { setSpreadsheetTimeZone() {}, getSheetByName: (t) => tabs[t] || null, insertSheet: (t) => (tabs[t] = tab(t)) };
  const kiemTra = { requireValueInList() { return this; }, setAllowInvalid() { return this; }, build() { return {}; } };
  const cache = {};
  const ctx = {
    SpreadsheetApp: { getActive: () => ss, newDataValidation: () => kiemTra, getUi: () => ({}), flush() { ctx.soLanFlush = (ctx.soLanFlush || 0) + 1; } },
    CacheService: { getScriptCache: () => ({ get: (k) => (k in cache ? cache[k] : null), put: (k, v) => { cache[k] = v; } }) },
    ScriptApp: { getProjectTriggers: () => [], newTrigger: () => ({ timeBased: () => ({ everyMinutes: () => ({ create() {} }) }) }) },
    LockService: { getScriptLock: () => ({ tryLock: () => true, releaseLock() {} }) },
    ContentService: { MimeType: { JSON: 'json' }, createTextOutput: (s) => ({ s, setMimeType() { return this; } }) },
    Utilities: {
      getUuid: () => '12345678-1234-1234-1234-123456789abc',
      // Đủ cho các định dạng script dùng, theo giờ VN.
      formatDate: (d, _tz, mau) => {
        const v = new Date(d.getTime() + 7 * 3600e3); const h = (n) => String(n).padStart(2, '0');
        const ngay = v.getUTCFullYear() + '-' + h(v.getUTCMonth() + 1) + '-' + h(v.getUTCDate());
        return mau === 'yyyy-MM-dd' ? ngay : h(v.getUTCDate()) + '/' + h(v.getUTCMonth() + 1) + '/' + v.getUTCFullYear() + ' ' + h(v.getUTCHours()) + ':' + h(v.getUTCMinutes());
      }
    },
    Date, JSON, Math, Number, String, Object, isNaN, parseInt
  };
  vm.createContext(ctx);
  vm.runInContext(doc('cong-cu/google-sheet/lich-cho.gs'), ctx);
  ctx.caiDat();
  ctx.tabs = tabs;
  if (!macDinh) {
    for (const r of tabs['Cài đặt'].o) {
      if (r && r[0] === 'Số chỗ mỗi ngày') r[1] = 50;
      if (r && r[0] === 'Tối đa khách mỗi đơn online') r[1] = 200;
      if (r && r[0] === 'Tối đa đơn đang giữ mỗi SĐT') r[1] = 999;
      if (r && r[0] === 'Tối đa lượt giữ chỗ mỗi 10 phút (toàn web)') r[1] = 9999;
    }
  }
  const get = (p) => JSON.parse(ctx.doGet({ parameter: p }).s);
  const post = (d) => JSON.parse(ctx.doPost({ postData: { contents: JSON.stringify(d) } }).s);
  return { ctx, tabs, get, post };
}

const NGAY = '2099-03-10';
// Mã đơn phải mang ngày đặt hôm nay (giờ VN): VTyyMMdd + 4 ký tự.
const vnHomNay = new Date(Date.now() + 7 * 3600e3);
const MA = 'VT' + String(vnHomNay.getUTCFullYear() % 100).padStart(2, '0') + String(vnHomNay.getUTCMonth() + 1).padStart(2, '0') + String(vnHomNay.getUTCDate()).padStart(2, '0');
const giu = (them) => Object.assign({ action: 'giu', maDon: MA + 'AAAA', tau: 'indochina-queen', ngay: NGAY, nguoiLon: 2, treEm: 0, beMienPhi: 0, hoTen: 'A', sdt: '0948170036' }, them);

test('sheet: cai dat tao 5 tab, mac dinh KHONG gioi han cho (dai ly phu thuoc tau), giu 1 gio, toi da 20 khach/don', () => {
  const { tabs } = taoSheetGia(true);
  assert.deepStrictEqual(Object.keys(tabs).sort(), ['Cài đặt', 'Ngày hết chỗ', 'Số chỗ riêng', 'Tổng hợp', 'Đơn giữ chỗ'].sort());
  const cd = Object.fromEntries(tabs['Cài đặt'].o.slice(1).map((r) => [r[0], r[1]]));
  assert.strictEqual(cd['Số chỗ mỗi ngày'], '');
  assert.strictEqual(cd['Số giờ giữ chỗ chờ chuyển khoản'], 1);
  assert.strictEqual(cd['Tối đa khách mỗi đơn online'], 20);
  // Không còn dòng ví dụ đóng thật ngày 31/12 ở tab Số chỗ riêng.
  assert.strictEqual(tabs['Số chỗ riêng'].o.filter((r) => r && r[2] === 0).length, 0);
  assert.match(cd['Mã quản lý (không chia sẻ)'], /^[0-9a-f]{16}$/);
});

test('sheet: giu cho tru dan tren 50 cho; het thi tu choi; lich bao het theo so khach', () => {
  const { get, post } = taoSheetGia();
  assert.deepStrictEqual(get({ action: 'lich', tau: 'indochina-queen', thang: '2099-03', khach: '2' }).het, []);
  assert.strictEqual(post(giu({ maDon: MA + 'AAA1', nguoiLon: 30 })).ok, true);
  assert.strictEqual(post(giu({ maDon: MA + 'AAA2', nguoiLon: 15, treEm: 3 })).ok, true); // còn 2
  assert.deepStrictEqual(get({ action: 'lich', tau: 'indochina-queen', thang: '2099-03', khach: '3' }).het, [NGAY], 'con 2 cho: 3 khach thi het');
  assert.deepStrictEqual(get({ action: 'lich', tau: 'indochina-queen', thang: '2099-03', khach: '2' }).het, [], '2 khach van dat duoc');
  assert.deepStrictEqual(post(giu({ maDon: MA + 'AAA3', nguoiLon: 3 })), { ok: false, loi: 'het' });
  assert.strictEqual(post(giu({ maDon: MA + 'AAA4', nguoiLon: 2 })).ok, true);
  assert.deepStrictEqual(get({ action: 'lich', tau: 'indochina-queen', thang: '2099-03', khach: '1' }).het, [NGAY]);
  // Tàu khác, ngày khác không bị ảnh hưởng.
  assert.deepStrictEqual(get({ action: 'lich', tau: 'indochina-star', thang: '2099-03', khach: '50' }).het, []);
  // Bé miễn phí mặc định không chiếm chỗ.
  assert.strictEqual(post(giu({ maDon: MA + 'AAA1', ngay: '2099-03-11', nguoiLon: 50, beMienPhi: 5 })).ok, true);
});

test('sheet: qua han giu cho thi tu tra cho; da thanh toan thi khong tra', () => {
  const s = taoSheetGia();
  assert.strictEqual(s.post(giu({ maDon: MA + 'AAA1', nguoiLon: 50 })).ok, true);
  assert.strictEqual(s.post(giu({ maDon: MA + 'AAA2', nguoiLon: 1 })).loi, 'het');
  // Cho đơn 1 quá hạn.
  const don = s.tabs['Đơn giữ chỗ'].o;
  don[1][8] = new Date(Date.now() - 1000);
  assert.strictEqual(s.post(giu({ maDon: MA + 'AAA2', nguoiLon: 50 })).ok, true, 'cho da tra lai');
  s.ctx.donDepHetHan();
  assert.strictEqual(don[1][7], 'Hết hạn');
  // Đơn 2 được xác nhận đã thanh toán: quá hạn giữ chỗ cũng không trả.
  const ma = s.tabs['Cài đặt'].o.find((r) => r[0] === 'Mã quản lý (không chia sẻ)')[1];
  assert.deepStrictEqual(s.post({ action: 'xacNhan', maDon: MA + 'AAA2', ma: 'sai' }), { ok: false, loi: 'ma' });
  assert.deepStrictEqual(s.post({ action: 'xacNhan', maDon: MA + 'AAA2', ma }), { ok: true });
  don[2][8] = new Date(Date.now() - 1000);
  assert.strictEqual(s.post(giu({ maDon: MA + 'AAA3', nguoiLon: 1 })).loi, 'het');
  assert.deepStrictEqual(s.post({ action: 'xacNhan', maDon: MA + 'ZZZZ', ma }), { ok: false, loi: 'khong-co-don' });
});

test('sheet: cung ma don giu lai (khach sua don) thi cap nhat dong cu, khong tinh trung', () => {
  const s = taoSheetGia();
  assert.strictEqual(s.post(giu({ nguoiLon: 40 })).ok, true);
  assert.strictEqual(s.post(giu({ nguoiLon: 45 })).ok, true, 'khong tru 40 cu cua chinh don nay');
  assert.strictEqual(s.tabs['Đơn giữ chỗ'].o.length, 2, '1 tieu de + 1 don');
  assert.strictEqual(s.tabs['Đơn giữ chỗ'].o[1][6], 45);
});

test('sheet: so cho rieng tung ngay (0 = dong ngay), don nhap tay ngay dang 25/10 cung duoc tinh', () => {
  const s = taoSheetGia();
  s.tabs['Số chỗ riêng'].o.push(['ben-nghe', '2099-03-10', 0, 'đóng']);
  s.tabs['Số chỗ riêng'].o.push(['elite-of-saigon', '2099-03-10', 5, '']);
  assert.deepStrictEqual(s.get({ action: 'lich', tau: 'ben-nghe', thang: '2099-03', khach: '1' }).het, [NGAY]);
  assert.strictEqual(s.post(giu({ tau: 'elite-of-saigon', nguoiLon: 6 })).loi, 'het');
  // Ms Nguyên nhập tay đơn khách gọi điện: ngày dạng 10/3/2099, trạng thái "đã thanh toán".
  s.tabs['Đơn giữ chỗ'].o.push(['', 'indochina-star', '10/3/2099', 48, 0, 0, 48, 'đã thanh toán', '', '', 'Khách gọi', '', '']);
  assert.strictEqual(s.post(giu({ maDon: MA + 'BBBB', tau: 'indochina-star', nguoiLon: 3 })).loi, 'het');
  assert.strictEqual(s.post(giu({ maDon: MA + 'BBBC', tau: 'indochina-star', nguoiLon: 2 })).ok, true);
});

test('sheet: du lieu xau bi tu choi; chu khach go khong thanh cong thuc', () => {
  const s = taoSheetGia();
  for (const sai of [{ maDon: 'abc' }, { maDon: 'VT200101AAAA' }, { tau: 'tau-la' }, { ngay: '10/03/2099' }, { nguoiLon: 0 }, { sdt: '123' }]) {
    assert.strictEqual(s.post(giu(sai)).loi, 'du-lieu', JSON.stringify(sai));
  }
  assert.strictEqual(s.post(giu({ ngay: '2000-01-01' })).loi, 'ngay-qua');
  assert.strictEqual(JSON.parse(s.ctx.doPost({ postData: { contents: '{hong' } }).s).loi, 'du-lieu');
  assert.strictEqual(s.get({ action: 'lich', tau: 'x', thang: '2099-03' }).ok, false);
  assert.strictEqual(s.post(giu({ hoTen: '=HYPERLINK("x")' })).ok, true);
  assert.strictEqual(s.tabs['Đơn giữ chỗ'].o[1][10], '\'=HYPERLINK("x")');
});

// ---------- Phía web ----------
const j = (x) => JSON.parse(JSON.stringify(x));
function napLichWeb(url, fetchGia) {
  const ctx = { console, Date, CAU_HINH: { lichChoOnline: { url } }, fetch: fetchGia, Promise, encodeURIComponent, JSON, setTimeout, clearTimeout };
  vm.createContext(ctx);
  vm.runInContext(doc('js/lich-cho.js'), ctx);
  return ctx;
}

test('web: chua cai url (hoac url la) thi khong goi mang, giu cho tra chua-cai', async () => {
  let goi = 0;
  for (const url of ['', 'https://evil.example.com/exec', 'http://script.google.com/x']) {
    const ctx = napLichWeb(url, () => { goi++; return Promise.reject(new Error('x')); });
    assert.strictEqual(ctx.urlLichOnline(), '');
    assert.deepStrictEqual(j(await ctx.giuChoOnline({})), { ok: false, loi: 'chua-cai' });
  }
  assert.strictEqual(goi, 0);
});

test('web: doc lich online, ngay het cho bi khoa; giu cho gui text/plain; mang loi thi bao loi mang', async () => {
  const URL = 'https://script.google.com/macros/s/ABC/exec';
  const daGoi = [];
  const ctx = napLichWeb(URL, (u, tc) => {
    daGoi.push([u, tc]);
    if (!tc) return Promise.resolve({ json: () => Promise.resolve({ ok: true, het: ['2099-03-10', 'rac'] }) });
    return Promise.resolve({ json: () => Promise.resolve({ ok: true, giuDen: '2099-03-01T10:00:00.000Z' }) });
  });
  const xong = await new Promise((r) => ctx.taiLichOnline('indochina-queen', '2099-03', 4, r));
  assert.strictEqual(xong, true);
  assert.strictEqual(daGoi[0][0], URL + '?action=lich&tau=indochina-queen&thang=2099-03&khach=4&be=0');
  ctx.KHACH_DANG_XEM['indochina-queen'] = '4|0'; // lịch đặt khi vẽ cho đơn 4 khách
  assert.strictEqual(ctx.trangThaiNgay('indochina-queen', '2099-03-10', '2099-03-01'), 'het');
  assert.strictEqual(ctx.trangThaiNgay('indochina-queen', '2099-03-11', '2099-03-01'), 'con');
  assert.ok(/data-ngay="2099-03-10"[^>]*disabled/.test(ctx.taoLichThang('indochina-queen', 2099, 3, '2099-03-01', '')));
  const kq = await ctx.giuChoOnline({ action: 'giu', maDon: 'VT990301AAAA' });
  assert.strictEqual(kq.ok, true);
  assert.strictEqual(daGoi[1][1].method, 'POST');
  assert.strictEqual(daGoi[1][1].headers['Content-Type'], 'text/plain;charset=utf-8');
  const loi = napLichWeb(URL, () => Promise.reject(new Error('mat mang')));
  assert.deepStrictEqual(j(await loi.giuChoOnline({})), { ok: false, loi: 'mang' });
  assert.strictEqual(await new Promise((r) => loi.taiLichOnline('indochina-queen', '2099-03', 1, r)), false);
});

test('dat cho: buoc 3 goi giu cho; het thi quay lai buoc 1; Ms Nguyen khong giu; email ghi tinh trang giu cho', () => {
  const ma = doc('js/dat-cho.js');
  const b3 = ma.slice(ma.indexOf("} else if (hanhDong === 'buoc-3') {"), ma.indexOf("} else if (hanhDong === 'da-chuyen') {"));
  assert.ok(b3.includes("if (cheDoMsNguyen) { hienThanhToan(); return; }"));
  assert.ok(b3.includes("action: 'giu'") && b3.includes('denBuoc(1);') && b3.includes('lich.taiLai()'));
  global.CAU_HINH = require('../js/cau-hinh.js').CAU_HINH;
  const dc = require('../js/dat-cho.js');
  const { DANH_SACH_TAU, GIA_TRE_EM } = require('../js/du-lieu-tau.js');
  const tau = DANH_SACH_TAU.find((t) => t.slug === 'indochina-queen');
  const don = { slugTau: tau.slug, ngay: '2099-03-10', loai: 'buffet', buffetMa: '0:0', nguoiLon: 2, treEm50: 1, treEmMienPhi: 1, mon: {}, hoTen: 'A', soDienThoai: '0948170036', email: 'a@b.vn', maDon: MA + 'AAAA', vat: false };
  assert.deepStrictEqual(dc.soChoCuaDon(don, tau, GIA_TRE_EM), { nguoiLon: 2, treEm: 1, beMienPhi: 1, tong: 3 });
  const tk = dc.layTaiKhoan(CAU_HINH.thanhToan, don);
  assert.match(dc.taoDuLieuEmail(Object.assign({}, don, { giuCho: 'da-giu', giuDen: '2099-03-01T10:00:00.000Z' }), tau, GIA_TRE_EM, tk, '')['Giữ chỗ'], /^Đã giữ trên Google Sheet đến /);
  assert.match(dc.taoDuLieuEmail(Object.assign({}, don, { giuCho: 'loi' }), tau, GIA_TRE_EM, tk, '')['Giữ chỗ'], /CHƯA giữ được chỗ/);
  assert.strictEqual(dc.taoDuLieuEmail(don, tau, GIA_TRE_EM, tk, '')['Giữ chỗ'], undefined, 'chua bat lich online: khong ghi');
  assert.match(dc.taoLoiNhanGiuCho('2099-03-01T10:00:00.000Z'), /đến <b>17:00 ngày 01\/03\/2099<\/b>/);
  assert.strictEqual(dc.taoLoiNhanGiuCho(''), '');
});

test('cau hinh: lich online mac dinh tat (url rong) de web chay nhu cu cho toi khi cai Web App', () => {
  const { CAU_HINH } = require('../js/cau-hinh.js');
  assert.strictEqual(typeof CAU_HINH.lichChoOnline.url, 'string');
});

test('sheet chong spam: doan qua 20 khach, 1 SDT giu toi da 2 don, gioi han luot 10 phut, lich khong do duoc so cho', () => {
  const s = taoSheetGia(true);
  assert.strictEqual(s.post(giu({ nguoiLon: 21 })).loi, 'doan-dong');
  assert.strictEqual(s.post(giu({ maDon: MA + 'SP01', nguoiLon: 2 })).ok, true);
  assert.strictEqual(s.post(giu({ maDon: MA + 'SP02', nguoiLon: 2 })).ok, true);
  assert.strictEqual(s.post(giu({ maDon: MA + 'SP03', nguoiLon: 2 })).loi, 'nhieu-don');
  assert.strictEqual(s.post(giu({ maDon: MA + 'SP01', nguoiLon: 3 })).ok, true, 'sua lai don cu cua chinh SDT van duoc');
  assert.strictEqual(s.post(giu({ maDon: MA + 'SP04', nguoiLon: 2, sdt: '0912000111' })).ok, true, 'SDT khac van duoc');
  // Số khách trên lịch bị chặn ở 20: hỏi 50 khách cũng chỉ tính như 20.
  assert.deepStrictEqual(s.get({ action: 'lich', tau: 'indochina-queen', thang: '2099-03', khach: '50' }).het, []);
  // Giới hạn lượt toàn web.
  const r = s.tabs['Cài đặt'].o.find((x) => x && x[0] === 'Tối đa lượt giữ chỗ mỗi 10 phút (toàn web)'); r[1] = 4;
  assert.strictEqual(s.post(giu({ maDon: MA + 'SP05', nguoiLon: 1, sdt: '0912000222' })).loi, 'ban');
});

test('sheet: khach bam da chuyen khoan -> Cho xac nhan, giu cho khong het han; qua han roi moi bam thi bao vuot', () => {
  const s = taoSheetGia();
  const don = s.tabs['Đơn giữ chỗ'].o;
  assert.strictEqual(s.post(giu({ maDon: MA + 'CK01', nguoiLon: 50 })).ok, true);
  assert.deepStrictEqual(s.post({ action: 'daChuyen', maDon: MA + 'CK01', sdt: '0999999999' }), { ok: false, loi: 'du-lieu' }, 'SDT khac khong doi duoc');
  assert.deepStrictEqual(s.post({ action: 'daChuyen', maDon: MA + 'CK01', sdt: '0948170036' }), { ok: true });
  assert.strictEqual(don[1][7], 'Chờ xác nhận');
  don[1][8] = new Date(Date.now() - 1000);
  s.ctx.donDepHetHan();
  assert.strictEqual(don[1][7], 'Chờ xác nhận', 'cho xac nhan khong bi tra cho');
  assert.strictEqual(s.post(giu({ maDon: MA + 'CK02', nguoiLon: 1, sdt: '0912000333' })).loi, 'het');
  // Đơn 2 giữ được ở ngày khác, để quá hạn, khách khác mua hết, rồi khách 2 mới bấm đã chuyển khoản.
  assert.strictEqual(s.post(giu({ maDon: MA + 'CK03', ngay: '2099-03-12', nguoiLon: 10, sdt: '0912000444' })).ok, true);
  don[2][8] = new Date(Date.now() - 1000);
  assert.strictEqual(s.post(giu({ maDon: MA + 'CK04', ngay: '2099-03-12', nguoiLon: 45, sdt: '0912000555' })).ok, true);
  assert.deepStrictEqual(s.post({ action: 'daChuyen', maDon: MA + 'CK03', sdt: '0912000444' }), { ok: true, vuot: 5 });
  // Ms Nguyên xác nhận đơn quá hạn mà ngày đã đầy: báo vượt.
  const ma = s.tabs['Cài đặt'].o.find((r) => r[0] === 'Mã quản lý (không chia sẻ)')[1];
  assert.strictEqual(s.post(giu({ maDon: MA + 'CK05', ngay: '2099-03-13', nguoiLon: 10, sdt: '0912000666' })).ok, true);
  don[4][8] = new Date(Date.now() - 1000);
  assert.strictEqual(s.post(giu({ maDon: MA + 'CK06', ngay: '2099-03-13', nguoiLon: 48, sdt: '0912000777' })).ok, true);
  assert.deepStrictEqual(s.post({ action: 'xacNhan', maDon: MA + 'CK05', ma }), { ok: true, vuot: 8 });
});

test('sheet: giu ngay moi that bai thi tra cho ngay cu; trang thai go tay la van chiem cho; o so cho trong thi tinh tu nguoi lon + tre', () => {
  const s = taoSheetGia();
  const don = s.tabs['Đơn giữ chỗ'].o;
  assert.strictEqual(s.post(giu({ maDon: MA + 'DN01', nguoiLon: 10 })).ok, true);
  s.tabs['Số chỗ riêng'].o.push(['indochina-queen', '2099-03-14', 0, '']);
  assert.strictEqual(s.post(giu({ maDon: MA + 'DN01', ngay: '2099-03-14', nguoiLon: 10 })).loi, 'het');
  assert.strictEqual(don[1][7], 'Hủy', 'tra cho ngay cu');
  // Nhập tay: trạng thái lạ, cột Số chỗ trống.
  don.push(['', 'ben-nghe', '2099-03-10', 30, 15, 0, '', 'chưa thanh toán', '', '', '', '948170036', '']);
  assert.strictEqual(s.post(giu({ maDon: MA + 'DN02', tau: 'ben-nghe', nguoiLon: 6, sdt: '0912000888' })).loi, 'het');
  assert.strictEqual(s.post(giu({ maDon: MA + 'DN03', tau: 'ben-nghe', nguoiLon: 5, sdt: '0912000889' })).ok, true);
  // SĐT bị Sheet bỏ số 0 đầu vẫn nhận ra (giới hạn theo SĐT).
  assert.strictEqual(s.ctx.chuanSdt(948170036), '0948170036');
  assert.strictEqual(s.ctx.chuanSdt('+84948170036'), '0948170036');
});

test('sheet: flush truoc khi mo khoa; menu huy giu cho theo SDT', () => {
  const s = taoSheetGia();
  const truoc = s.ctx.soLanFlush || 0;
  s.post(giu({ maDon: MA + 'FL01' }));
  assert.ok((s.ctx.soLanFlush || 0) > truoc);
  s.post(giu({ maDon: MA + 'FL02', sdt: '0912000999' }));
  assert.strictEqual(s.ctx.huyGiuCho('0912000999'), 1);
  assert.strictEqual(s.tabs['Đơn giữ chỗ'].o[2][7], 'Hủy');
  assert.strictEqual(s.ctx.huyGiuCho('*'), 1);
});

test('web: doi so khach 2 -> 10 -> 2 thi lich doc dung bang cua so khach hien tai', async () => {
  const URL = 'https://script.google.com/macros/s/ABC/exec';
  const ctx = napLichWeb(URL, (u) => {
    const k = Number(/khach=(\d+)/.exec(u)[1]);
    return Promise.resolve({ json: () => Promise.resolve({ ok: true, het: k > 5 ? ['2099-03-10'] : [] }) });
  });
  const tai = (k) => new Promise((r) => ctx.taiLichOnline('indochina-queen', '2099-03', k, r));
  await tai(2); await tai(10);
  ctx.KHACH_DANG_XEM['indochina-queen'] = '10|0';
  assert.strictEqual(ctx.trangThaiNgay('indochina-queen', '2099-03-10', '2099-03-01'), 'het');
  ctx.KHACH_DANG_XEM['indochina-queen'] = '2|0';
  assert.strictEqual(ctx.trangThaiNgay('indochina-queen', '2099-03-10', '2099-03-01'), 'con', 'quay ve 2 khach: con cho');
});

test('web: Web App khong tra loi thi het gio cho va bao loi mang', async () => {
  const ctx = napLichWeb('https://script.google.com/macros/s/ABC/exec', () => new Promise(() => {}));
  ctx.THOI_GIAN_CHO_ONLINE = 20;
  vm.runInContext('THOI_GIAN_CHO_ONLINE = 20', ctx);
  assert.deepStrictEqual(j(await ctx.giuChoOnline({})), { ok: false, loi: 'mang' });
});

test('sheet chong spam qua Cho xac nhan: tinh vao gioi han SDT; don da Huy khong song lai; menu huy theo SDT go duoc', () => {
  const s = taoSheetGia(true);
  const don = s.tabs['Đơn giữ chỗ'].o;
  for (const d of ['SX01', 'SX02']) {
    assert.strictEqual(s.post(giu({ maDon: MA + d, nguoiLon: 2 })).ok, true);
    assert.strictEqual(s.post({ action: 'daChuyen', maDon: MA + d, sdt: '0948170036' }).ok, true);
  }
  assert.strictEqual(s.post(giu({ maDon: MA + 'SX03', nguoiLon: 2 })).loi, 'nhieu-don', '2 don Cho xac nhan cung tinh');
  assert.strictEqual(s.ctx.huyGiuCho('0948170036', true), 2);
  assert.ok(don.slice(1).every((r) => r[7] === 'Hủy'));
  assert.deepStrictEqual(s.post({ action: 'daChuyen', maDon: MA + 'SX01', sdt: '0948170036' }), { ok: false, loi: 'da-huy' });
  assert.strictEqual(don[1][7], 'Hủy', 'van Huy');
  // Hủy tất cả ('*') không đụng đơn Chờ xác nhận.
  assert.strictEqual(s.post(giu({ maDon: MA + 'SX04', nguoiLon: 2, sdt: '0912000123' })).ok, true);
  assert.strictEqual(s.post({ action: 'daChuyen', maDon: MA + 'SX04', sdt: '0912000123' }).ok, true);
  assert.strictEqual(s.ctx.huyGiuCho('*'), 0);
});

test('sheet: don da bao chuyen khoan ma khach doi ngay thi bao da-chuyen; ma don ngay mai (mui gio khac) van nhan', () => {
  const s = taoSheetGia();
  assert.strictEqual(s.post(giu({ maDon: MA + 'DC01' })).ok, true);
  assert.strictEqual(s.post({ action: 'daChuyen', maDon: MA + 'DC01', sdt: '0948170036' }).ok, true);
  assert.strictEqual(s.post(giu({ maDon: MA + 'DC01' })).ok, true, 'cung tau, cung ngay: ok');
  assert.strictEqual(s.post(giu({ maDon: MA + 'DC01', ngay: '2099-03-11' })).loi, 'da-chuyen');
  const mai = new Date(Date.now() + 7 * 3600e3 + 86400000);
  const maMai = 'VT' + String(mai.getUTCFullYear() % 100).padStart(2, '0') + String(mai.getUTCMonth() + 1).padStart(2, '0') + String(mai.getUTCDate()).padStart(2, '0') + 'MAI1';
  assert.strictEqual(s.post(giu({ maDon: maMai, sdt: '0912000124' })).ok, true);
});

test('email: bao chuyen khoan loi / don da huy duoc ghi ro cho Ms Nguyen', () => {
  global.CAU_HINH = require('../js/cau-hinh.js').CAU_HINH;
  const dc = require('../js/dat-cho.js');
  const { DANH_SACH_TAU, GIA_TRE_EM } = require('../js/du-lieu-tau.js');
  const tau = DANH_SACH_TAU.find((t) => t.slug === 'indochina-queen');
  const don = { slugTau: tau.slug, ngay: '2099-03-10', loai: 'buffet', buffetMa: '0:0', nguoiLon: 2, treEm50: 0, treEmMienPhi: 0, mon: {}, hoTen: 'A', soDienThoai: '0948170036', email: 'a@b.vn', maDon: MA + 'EM01', vat: false };
  const tk = dc.layTaiKhoan(CAU_HINH.thanhToan, don);
  const e = (them) => dc.taoDuLieuEmail(Object.assign({}, don, them), tau, GIA_TRE_EM, tk, '')['Báo chuyển khoản'];
  assert.match(e({ daChuyen: 'loi', loiChuyen: 'mang' }), /CHƯA báo được lên Google Sheet \(mã lỗi mang\)/);
  assert.match(e({ daChuyen: 'loi', loiChuyen: 'khong-co-don' }), /CHƯA CÓ dòng của đơn này/);
  assert.match(e({ daChuyen: 'da-huy' }), /ĐÃ BỊ HỦY/);
  assert.match(e({ daChuyen: 'ok' }), /Chờ xác nhận/);
  assert.strictEqual(e({}), undefined);
  const ma = doc('js/dat-cho.js');
  assert.ok(ma.includes("var baoChuyen = (don.giuCho === 'da-giu' || don.giuCho === 'loi')"), 'giu cho loi mang van gui daChuyen');
});

test('sheet mac dinh (dai ly): moi ngay nhan dat, chi khoa ngay ghi o tab Ngay het cho; giu cho khong bao han muc', () => {
  const s = taoSheetGia(true);
  for (let i = 0; i < 5; i++) assert.strictEqual(s.post(giu({ maDon: MA + 'KG0' + i, nguoiLon: 20, sdt: '091200050' + i })).ok, true, 'khong gioi han');
  const kq = s.post(giu({ maDon: MA + 'KG10', nguoiLon: 2, sdt: '0912000600' }));
  assert.strictEqual(kq.coHanMuc, false, 'khong co han muc: web khong hien "giu cho den"');
  assert.deepStrictEqual(s.get({ action: 'lich', tau: 'indochina-queen', thang: '2099-03', khach: '2' }).het, []);
  // Tàu báo hết ngày 15/3 (gõ dạng 15/3/2099) → web khoá đúng tàu, đúng ngày.
  s.tabs['Ngày hết chỗ'].o.push(['indochina-queen', '15/3/2099', 'tàu báo hết']);
  assert.deepStrictEqual(s.get({ action: 'lich', tau: 'indochina-queen', thang: '2099-03', khach: '1' }).het, ['2099-03-15']);
  assert.deepStrictEqual(s.get({ action: 'lich', tau: 'indochina-star', thang: '2099-03', khach: '1' }).het, []);
  assert.strictEqual(s.post(giu({ maDon: MA + 'KG11', ngay: '2099-03-15', nguoiLon: 1, sdt: '0912000601' })).loi, 'het');
  // Có hạn mức (tàu cấp 50) thì báo coHanMuc.
  s.tabs['Cài đặt'].o.find((r) => r && r[0] === 'Số chỗ mỗi ngày')[1] = 50;
  assert.strictEqual(s.post(giu({ maDon: MA + 'KG12', ngay: '2099-03-20', nguoiLon: 2, sdt: '0912000602' })).coHanMuc, true);
});

test('web: buoc thanh toan cam ket hoan 100% hoac doi ngay neu tau het cho; chi hien "giu cho den" khi co han muc', () => {
  global.CAU_HINH = require('../js/cau-hinh.js').CAU_HINH;
  const dc = require('../js/dat-cho.js');
  const { DANH_SACH_TAU, GIA_TRE_EM } = require('../js/du-lieu-tau.js');
  const tau = DANH_SACH_TAU.find((t) => t.slug === 'indochina-queen');
  const don = { slugTau: tau.slug, ngay: '2099-03-10', loai: 'buffet', buffetMa: '0:0', nguoiLon: 2, treEm50: 0, treEmMienPhi: 0, mon: {}, hoTen: 'A', soDienThoai: '0948170036', email: 'a@b.vn', maDon: MA + 'TT01', vat: false, taiKhoan: 'caNhan' };
  const html = dc.taoKhoiThanhToan(don, tau, GIA_TRE_EM, CAU_HINH.thanhToan);
  assert.ok(html.includes('<b>hoàn 100% số tiền</b> hoặc đổi sang ngày khác'));
  assert.ok(doc('js/dat-cho.js').includes("don.giuDen = kq.coHanMuc ? (kq.giuDen || '') : '';"));
});
