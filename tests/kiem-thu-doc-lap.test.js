// Kiem thu doc lap (hanh vi) toan bo web: tinh tien, kiem tra form, phieu, ma hoa don, anh, trang tao ra.
const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { execFileSync } = require('node:child_process');
global.CAU_HINH = require('../js/cau-hinh.js').CAU_HINH;
const dc = require('../js/dat-cho.js');
const ht = require('../js/hien-thi.js');
const { DANH_SACH_TAU, GIA_TRE_EM, LIEN_HE, CONG_TY } = require('../js/du-lieu-tau.js');

const GOC = path.join(__dirname, '..');
const doc = (rel) => fs.readFileSync(path.join(GOC, rel), 'utf8');
const tau = (slug) => DANH_SACH_TAU.find((t) => t.slug === slug);
const HOM_NAY = '2026-10-10';
const don = (them) => Object.assign({
  slugTau: 'indochina-queen', ngay: '2999-01-01', loai: 'buffet', buffetMa: '0:1', nguoiLon: 2, treEm50: 0, treEmMienPhi: 0, mon: {},
  hoTen: 'Nguyễn Văn A', soDienThoai: '0948170036', email: 'a@b.vn', ghiChu: '', vat: false, dongY: true,
  congTy: { ten: '', mst: '', diaChi: '', email: '' }, taiKhoan: 'caNhan', maDon: 'VT261010ABCD', ngayDat: '2026-10-10'
}, them);
const tong = (d, slug) => dc.tomTatDon(d, tau(slug || d.slugTau), GIA_TRE_EM);

// ---------- 1. Tinh tien ----------
test('buffet 1 nguoi lon + 1 be mien phi: be khong tinh tien', () => {
  const d = don({ nguoiLon: 1, treEmMienPhi: 1 });
  const tt = tong(d);
  assert.strictEqual(tt.tong, 615600);
  assert.deepStrictEqual(tt.khach, { nguoiLon: 1, treEm50: 0, treEmMienPhi: 1 });
  assert.strictEqual(dc.soBeMienPhiVuot(d), 0);
  assert.strictEqual(dc.canhBaoTreEm(d, tau('indochina-queen')), null);
});

test('buffet 3 nguoi lon + 3 be mien phi: chi 1 be mien phi, 2 be con lai tinh 50%', () => {
  const d = don({ nguoiLon: 3, treEmMienPhi: 3 });
  assert.strictEqual(dc.soTreToiDa(3), 1);
  assert.strictEqual(dc.soBeMienPhiVuot(d), 2);
  const tt = tong(d);
  assert.strictEqual(tt.tong, 3 * 615600 + 2 * 307800);
  assert.deepStrictEqual(tt.khach, { nguoiLon: 3, treEm50: 2, treEmMienPhi: 1 });
  assert.match(dc.canhBaoTreEm(d, tau('indochina-queen')), /2 người lớn chỉ được kèm 1 trẻ em/, 'Queen: 3 tre cho 3 nguoi lon vuot quy dinh (giai-dap.md muc 7)');
  assert.strictEqual(dc.canhBaoTreEm(Object.assign({}, d, { slugTau: 'indochina-star', buffetMa: '0:0' }), tau('indochina-star')), null, 'Star: be vuot da tu tinh 50%');
});

test('buffet 4 nguoi lon: toi da 2 be mien phi', () => {
  assert.strictEqual(dc.soBeMienPhiVuot(don({ nguoiLon: 4, treEmMienPhi: 2 })), 0);
  assert.strictEqual(dc.soBeMienPhiVuot(don({ nguoiLon: 4, treEmMienPhi: 3 })), 1);
});

test('be mien phi khong co nguoi lon: khong co dong tien am', () => {
  const tt = tong(don({ nguoiLon: 0, treEmMienPhi: 2 }));
  assert.ok(tt.dong.every((x) => x.thanhTien >= 0));
  assert.ok(tt.tong >= 0);
});

test('moi hang buffet cua moi tau: nguoi lon x gia, tre 50% lam tron neu tau co chinh sach', () => {
  let dem = 0;
  for (const t of DANH_SACH_TAU) {
    for (const g of ht.layThucDonTheoLoai(t).buffet) for (const h of g.dong) {
      const d = don({ slugTau: t.slug, buffetMa: h.ma, nguoiLon: 2, treEm50: 1, treEmMienPhi: 1 });
      const tt = tong(d);
      const coNuaGia = !!(GIA_TRE_EM[t.slug].buffet && GIA_TRE_EM[t.slug].buffet.nuaGia);
      assert.strictEqual(tt.tong, 2 * h.gia + (coNuaGia ? Math.round(h.gia / 2) : 0), t.slug + ' ' + h.ma);
      assert.strictEqual(tt.tong, tt.dong.reduce((a, x) => a + x.thanhTien, 0));
      dem++;
    }
  }
  assert.ok(dem >= 7);
});

test('tau khong co buffet (Princess x2) hoac khong co set menu (Star, Ben Nghe): khong tinh tien, khong cho dat', () => {
  for (const s of ['saigon-princess', 'ben-thanh-princess']) {
    assert.strictEqual(tong(don({ slugTau: s, loai: 'buffet', buffetMa: '0:0' })).tong, 0);
    assert.ok(dc.kiemTraBuoc1(don({ slugTau: s, loai: 'buffet' }), DANH_SACH_TAU, HOM_NAY).loi.loai, s);
  }
  for (const s of ['indochina-star', 'ben-nghe']) {
    assert.strictEqual(tong(don({ slugTau: s, loai: 'setMenu', mon: { '0:0': 2 } })).tong, 0);
    assert.ok(dc.kiemTraBuoc1(don({ slugTau: s, loai: 'setMenu', mon: { '0:0': 2 } }), DANH_SACH_TAU, HOM_NAY).loi.loai, s);
  }
});

test('set menu Princess (khong co chinh sach 50%): tre em khong bi tinh them, chi canh bao', () => {
  for (const s of ['saigon-princess', 'ben-thanh-princess']) {
    const d = don({ slugTau: s, loai: 'setMenu', mon: { '0:0': 2 }, treEm50: 4, treEmMienPhi: 3 });
    assert.strictEqual(tong(d).tong, 2 * 980000, s);
    assert.strictEqual(dc.soBeMienPhiVuot(d), 0, 'chi buffet moi co be vuot');
    assert.ok(dc.canhBaoTreEm(d, tau(s)), s);
  }
});

test('set menu Elite: Menu Tre em dem la tre em, Menu Au la nguoi lon', () => {
  const d = don({ slugTau: 'elite-of-saigon', loai: 'setMenu', mon: { '1:0': 2, '1:5': 1 }, treEmMienPhi: 1 });
  const tt = tong(d);
  assert.strictEqual(tt.tong, 2 * 2519000 + 1749000);
  assert.deepStrictEqual(tt.khach, { nguoiLon: 2, treEm50: 1, treEmMienPhi: 1 });
});

test('set menu Queen: tong theo tung mon x so suat', () => {
  assert.strictEqual(tong(don({ loai: 'setMenu', mon: { '1:0': 2, '1:10': 1, '1:3': 0 } })).tong, 2 * 723600 + 1641600);
});

test('Elite buffet: 1 hang duy nhat', () => {
  const tt = tong(don({ slugTau: 'elite-of-saigon', buffetMa: '0:0', nguoiLon: 2, treEm50: 2 }));
  assert.strictEqual(tt.tong, 2 * 2189000 + 2 * Math.round(2189000 / 2));
});

test('so luong rac / am / thap phan khong tao ra tong NaN hay am', () => {
  const rac = [-5, '-3', 'abc', '', null, undefined, NaN, Infinity, '1.9', {}, [], true];
  for (const x of rac) {
    for (const loai of ['buffet', 'setMenu']) {
      const d = don({ nguoiLon: x, treEm50: x, treEmMienPhi: x, mon: { '1:0': x }, loai });
      const tt = dc.tomTatDon(d, tau('indochina-queen'), GIA_TRE_EM);
      assert.ok(Number.isFinite(tt.tong) && tt.tong >= 0, String(x) + ' ' + loai + ' -> ' + tt.tong);
      for (const k of Object.values(tt.khach)) assert.ok(Number.isInteger(k) && k >= 0, String(x) + ' khach ' + JSON.stringify(tt.khach));
      assert.doesNotThrow(() => dc.canhBaoTreEm(d, tau('indochina-queen')));
    }
  }
  assert.strictEqual(tong(don({ nguoiLon: '-3' })).tong, 0);
  assert.strictEqual(tong(don({ nguoiLon: '1.9' })).tong, 0, 'so le khong duoc lam tron thanh 1 nguoi');
  assert.strictEqual(tong(don({ nguoiLon: '2abc' })).tong, 0, 'chuoi co ky tu la tinh la 0');
});

test('kiemTraBuoc1: so khach am/rac, chua chon mon, loai la', () => {
  const loi = (d) => dc.kiemTraBuoc1(d, DANH_SACH_TAU, HOM_NAY).loi;
  assert.ok(loi(don({ nguoiLon: -2 })).mon);
  assert.ok(loi(don({ nguoiLon: 'abc' })).mon);
  assert.ok(loi(don({ nguoiLon: 0, treEmMienPhi: 3 })).mon);
  assert.ok(loi(don({ loai: 'setMenu', mon: { '1:0': -1 } })).mon);
  assert.ok(loi(don({ loai: 'setMenu', mon: { '1:0': 'abc' } })).mon);
  assert.ok(loi(don({ loai: 'khac' })).loai);
  assert.ok(loi(don({ buffetMa: '9:9' })).mon);
});

// ---------- 2. Kiem tra buoc 1 / buoc 2 ----------
test('kiemTraBuoc1: ngay', () => {
  const ngay = (n) => dc.kiemTraBuoc1(don({ ngay: n }), DANH_SACH_TAU, HOM_NAY);
  assert.ok(ngay('2026-10-09').loi.ngay, 'hom qua');
  assert.ok(ngay(HOM_NAY).hopLe, 'hom nay hop le');
  assert.ok(ngay('2026-10-11').hopLe);
  assert.ok(ngay('2027-02-29').loi.ngay, '29/02 nam khong nhuan');
  assert.ok(ngay('2100-02-29').loi.ngay, '2100 khong nhuan');
  assert.ok(ngay('2028-02-29').hopLe, '2028 nhuan');
  for (const x of ['', null, undefined, 20261231, '2026-13-01', '2026-00-10', '2026-04-31', '31/12/2026', '2026-1-5', 'abc']) {
    assert.ok(ngay(x).loi.ngay, String(x));
  }
});

test('kiemTraBuoc2: tung truong', () => {
  const loi = (them) => Object.keys(dc.kiemTraBuoc2(don(them)).loi);
  assert.deepStrictEqual(loi({}), []);
  assert.deepStrictEqual(loi({ dongY: false }), ['dongY']);
  assert.deepStrictEqual(loi({ dongY: undefined }), ['dongY']);
  assert.deepStrictEqual(loi({ hoTen: '   ' }), ['hoTen']);
  assert.deepStrictEqual(loi({ hoTen: 'a'.repeat(101) }), ['hoTen']);
  assert.deepStrictEqual(loi({ hoTen: null }), ['hoTen']);
  assert.deepStrictEqual(loi({ soDienThoai: '12345' }), ['soDienThoai']);
  for (const e of ['', 'abc', 'a@b', 'a b@c.vn', '@c.vn', 'a@.vn', null, undefined]) assert.deepStrictEqual(loi({ email: e }), ['email'], String(e));
  assert.deepStrictEqual(loi({ hoTen: '', email: '', dongY: false }).sort(), ['dongY', 'email', 'hoTen']);
});

test('VAT: MST, email cong ty, ten, dia chi', () => {
  const ct = (o) => ({ vat: true, congTy: Object.assign({ ten: 'Cty ABC', mst: '0319143429', diaChi: '5 Nguyễn Tất Thành', email: 'kt@abc.vn' }, o) });
  const loi = (o) => Object.keys(dc.kiemTraBuoc2(don(ct(o))).loi);
  assert.deepStrictEqual(loi({}), []);
  assert.deepStrictEqual(loi({ mst: '0319143429-001' }), []);
  assert.deepStrictEqual(loi({ mst: ' 0319143429 ' }), []);
  for (const m of ['', '031914342', '03191434291', '0319143429-00', '0319143429-0001', '0319143429001', 'ABCDEFGHIJ', '0319143429-abc', null, undefined, 319143429]) {
    assert.deepStrictEqual(loi({ mst: m }), ['congTyMst'], String(m));
  }
  assert.deepStrictEqual(loi({ ten: ' ' }), ['congTyTen']);
  assert.deepStrictEqual(loi({ diaChi: '' }), ['congTyDiaChi']);
  assert.deepStrictEqual(loi({ email: 'sai' }), ['congTyEmail']);
  assert.ok(dc.kiemTraBuoc2(don({ vat: false, congTy: { ten: '', mst: 'x', diaChi: '', email: '' } })).hopLe, 'VAT tat thi bo qua cong ty');
  let r;
  assert.doesNotThrow(() => { r = dc.kiemTraBuoc2(don({ vat: true, congTy: undefined })); });
  assert.strictEqual(r.hopLe, false);
});

// ---------- 6. Truong hop that bai: VAT phai vao tai khoan cong ty ----------
test('don VAT nhung chon tai khoan ca nhan: bi doi sang tai khoan cong ty', () => {
  const TT = CAU_HINH.thanhToan;
  assert.strictEqual(dc.layTaiKhoan(TT, don({ vat: true, taiKhoan: 'caNhan' })).soTaiKhoan, '4988888666');
  assert.strictEqual(dc.layTaiKhoan(TT, don({ vat: true, taiKhoan: undefined })).soTaiKhoan, '4988888666');
  assert.strictEqual(dc.layTaiKhoan(TT, don({ vat: false, taiKhoan: 'caNhan' })).soTaiKhoan, '25960437');
  assert.strictEqual(dc.layTaiKhoan(TT, don({ vat: false, taiKhoan: 'rac' })).soTaiKhoan, '25960437');
  const link = dc.taoLinkVietQR(TT.congTy, 1234000, 'VT261010ABCD');
  assert.ok(link.includes('amount=1234000') && link.includes('4988888666') && link.includes('addInfo=VT261010ABCD'));
});

// ---------- 3. Phieu chi o xac-nhan ----------
test('dat-cho.html khong bao gio chua phieu', () => {
  const html = doc('dat-cho.html');
  // Cau thong bao "se gui phieu Da thanh toan" la van ban mo ta, khong phai phieu; chi cam cac phan tu/ma tao phieu.
  assert.ok(!/id="phieu"|class="phieu|khung-phieu|khu-vuc-phieu|html2canvas|khoiChayTrangXacNhan|name="daNhanTien"|Tạo phiếu/.test(html));
  assert.ok(html.includes('khoiChayTrangDatCho()'));
});

test('phieu chi duoc sinh trong khoiChayTrangXacNhan, khong nam trong luong dat cho cua khach', () => {
  const js = doc('js/dat-cho.js');
  assert.strictEqual(js.split('taoPhieuHtml(').length - 1, 2, 'chi dinh nghia + 1 noi goi');
  const thanDatCho = js.slice(js.indexOf('function ganSuKienDatCho'), js.indexOf('function khoiChayTrangDatCho'));
  assert.ok(!thanDatCho.includes('taoPhieuHtml') && !thanDatCho.includes('xuatAnhPhieu'));
  const xacNhan = js.slice(js.indexOf('function khoiChayTrangXacNhan'));
  assert.ok(xacNhan.includes('taoPhieuHtml('));
});

// Chạy trang xác nhận trong vm; trả toàn bộ HTML đã ghi (trang + các ô con như #tom-tat-xac-nhan) và các ô bị ẩn.
function chayXacNhan(hash) {
  const phanTu = {};
  const con = {};
  const lay = (id) => (phanTu[id] = phanTu[id] || {
    id, innerHTML: '', addEventListener() {},
    querySelector: (sel) => (con[sel] = con[sel] || { innerHTML: '', hidden: false, addEventListener() {}, elements: {} })
  });
  const ctx = {
    console,
    location: { hash, search: '', hostname: 'x.github.io', protocol: 'https:', href: 'https://x.github.io/xac-nhan.html' + hash },
    document: { getElementById: lay, querySelectorAll: () => [], querySelector: () => null },
    window: { addEventListener() {} }
  };
  vm.createContext(ctx);
  for (const f of ['cau-hinh.js', 'du-lieu-tau.js', 'hien-thi.js', 'dat-cho.js']) vm.runInContext(doc('js/' + f), ctx);
  ctx.khoiChayTrangXacNhan();
  const html = phanTu['xac-nhan'].innerHTML + Object.values(con).map((o) => o.innerHTML).join('');
  return Object.assign(new String(html), { formAn: !!(con['#form-xac-nhan'] && con['#form-xac-nhan'].hidden) });
}

test('xac-nhan voi hash hong: hien "Khong doc duoc don", khong nem loi, khong co phieu', () => {
  const b64 = (s) => '#' + Buffer.from(s).toString('base64');
  const hong = ['', '#', '#!!!', '#abc', b64('khong phai json'), '#' + dc.maHoaDon({ slugTau: 'khong-co', maDon: 'X' }),
    '#' + dc.maHoaDon({ slugTau: 'indochina-queen' }), b64('null'), b64('"chuoi"'), b64('[1,2]'), '#%E0%A4%A'];
  for (const h of hong) {
    let html;
    assert.doesNotThrow(() => { html = chayXacNhan(h); }, h);
    const mongDoi = h.length > 1 ? 'Không đọc được đơn' : 'Chưa mở đơn nào';
    assert.ok(html.includes(mongDoi), h + ' -> ' + html.slice(0, 80));
    assert.ok(!html.includes('id="phieu"'));
    assert.ok(html.formAn, h + ': an form tao phieu khi khong co don');
  }
});

test('giaiMaDon voi dau vao rac khong nem loi', () => {
  for (const x of [undefined, null, '', '###', '@@@@', 12345, {}, '%', 'e30=x']) assert.doesNotThrow(() => dc.giaiMaDon(x));
  assert.strictEqual(dc.giaiMaDon('@@@@'), null);
  assert.strictEqual(dc.giaiMaDon(Buffer.from('null').toString('base64')), null);
});

test('tin nhan Zalo cua khach khong chua link xac-nhan, chi email gui Ms Nguyen moi co', () => {
  const d = don({ nguoiLon: 3, treEmMienPhi: 3, ghiChu: 'Mừng sinh nhật 🎂' });
  const tk = CAU_HINH.thanhToan.caNhan;
  const zalo = dc.soanTinNhanDatCho(d, tau('indochina-queen'), GIA_TRE_EM, tk);
  assert.ok(!zalo.includes('xac-nhan'));
  assert.ok(!zalo.includes('Đã thanh toán'));
  assert.ok(zalo.includes(d.maDon) && zalo.includes('Mừng sinh nhật 🎂') && zalo.includes('0948170036'));
  const link = 'https://x.github.io/xac-nhan.html#' + dc.maHoaDon(d);
  const email = dc.taoDuLieuEmail(d, tau('indochina-queen'), GIA_TRE_EM, tk, link);
  assert.ok(JSON.stringify(email).includes('xac-nhan.html#'), 'email co link');
  assert.strictEqual(email._captcha, 'false');
});

test('moi tau: tin nhan Zalo khong co link xac nhan', () => {
  for (const t of DANH_SACH_TAU) {
    const loai = ht.layThucDonTheoLoai(t).buffet.length ? 'buffet' : 'setMenu';
    const d = don({ slugTau: t.slug, loai, buffetMa: '0:0', mon: { '0:0': 1 } });
    assert.ok(!dc.soanTinNhanDatCho(d, t, GIA_TRE_EM, CAU_HINH.thanhToan.caNhan).includes('xac-nhan'), t.slug);
  }
});

test('taoPhieuHtml: escape HTML trong ghi chu / ho ten', () => {
  const d = don({ hoTen: '<script>alert(1)</script>', ghiChu: '"><img src=x onerror=alert(1)>' });
  const html = dc.taoPhieuHtml(d, tau('indochina-queen'), CONG_TY, LIEN_HE, GIA_TRE_EM, CAU_HINH.thanhToan.caNhan,
    { trangThai: 'Đã thanh toán.', codeVe: '', ngayXacNhan: new Date(2026, 9, 10) });
  assert.ok(!html.includes('<script>alert(1)') && !html.includes('<img src=x'));
  assert.ok(html.includes('Đã thanh toán'));
});

// ---------- 4. maHoaDon / giaiMaDon ----------
test('maHoaDon/giaiMaDon: tieng Viet, emoji, ky tu dac biet', () => {
  const ghiChu = [
    'Tiếng Việt: ăâêôơư đĐ ạảãàá ỳỷỹ',
    'Emoji 🎉🚢👨‍👩‍👧‍👦 🇻🇳 \u{1F600}',
    '<b>"nháy kép" \'đơn\' & \\ / + = ? # % \n\t xuống dòng</b>',
    'Ký tự lạ ~!@#$%^&*()_+{}|:"<>?`-=[]\\;\',./ \u0000   ',
    'x'.repeat(5000), ''
  ];
  for (const g of ghiChu) {
    const d = don({ ghiChu: g, hoTen: 'Lê Hoàng Thảo Nguyên 🚢' });
    const ma = dc.maHoaDon(d);
    assert.match(ma, /^[A-Za-z0-9_-]+$/, 'base64url an toan trong URL');
    assert.deepStrictEqual(dc.giaiMaDon(ma), d);
    assert.deepStrictEqual(dc.giaiMaDon('#' + ma), d, 'chap nhan dau #');
  }
});

test('maHoaDon/giaiMaDon qua nhanh trinh duyet (btoa/atob) voi emoji cho cung ket qua voi node', () => {
  const ctx = { console, btoa: (s) => Buffer.from(s, 'binary').toString('base64'), atob: (s) => Buffer.from(s, 'base64').toString('binary') };
  vm.createContext(ctx);
  // Gia lap trinh duyet: khong co Buffer
  for (const f of ['cau-hinh.js', 'du-lieu-tau.js', 'hien-thi.js', 'dat-cho.js']) vm.runInContext(doc('js/' + f), ctx);
  const d = don({ ghiChu: 'Chúc mừng 🎂 đặc biệt <&>' });
  const ma = ctx.maHoaDon(d);
  assert.strictEqual(ma, dc.maHoaDon(d));
  assert.deepStrictEqual(JSON.parse(JSON.stringify(ctx.giaiMaDon(ma))), d);
});

// ---------- 5. Anh ----------
test('moi mon chon duoc deu co it nhat 1 o anh trong cau-hinh', () => {
  for (const t of DANH_SACH_TAU) {
    for (const loai of ['buffet', 'setMenu']) {
      for (const nhom of ht.layThucDonTheoLoai(t)[loai]) for (const mon of nhom.dong) {
        assert.ok(ht.layAnhMon(t, nhom.tieuDe, mon.ten).length >= 1, [t.slug, loai, nhom.tieuDe, mon.ten].join(' / '));
      }
    }
  }
});

test('khong file code nao (js, cong-cu, *.html, css) tham chieu anh-cu/', () => {
  const ds = [];
  const bo = ['node_modules', '.git', 'anh', 'anh-cu', 'tests', 'tai-lieu'];
  const duyet = (d) => {
    for (const e of fs.readdirSync(path.join(GOC, d), { withFileTypes: true })) {
      if (e.isDirectory()) { if (!bo.includes(e.name)) duyet(path.join(d, e.name)); }
      else if (/\.(js|html|css)$/.test(e.name)) ds.push(path.join(d, e.name));
    }
  };
  duyet('.');
  assert.ok(ds.length > 10);
  // kiem-tra-anh.js chi nhac ten thu muc trong doan van ban README ("web khong dung"), khong dung lam duong dan anh.
  for (const f of ds) {
    const dong = doc(f).split(/\r?\n/).filter((l) => l.includes('anh-cu') && !/web không dùng/.test(l));
    assert.deepStrictEqual(dong, [], f);
  }
});

test('anhLoi: localhost / 127.0.0.1 / file ghi ten file; github.io va ten mien khac thi khong', () => {
  const chay = (loc, nhan) => {
    const img = { attrs: { 'data-tep': 'anh/q/menu/set-indo7.jpg' }, classList: { add() {} }, getAttribute(k) { return this.attrs[k]; }, src: '' };
    if (nhan) img.attrs['data-nhan'] = nhan;
    const ctx = { location: loc, console };
    vm.createContext(ctx);
    vm.runInContext(doc('js/hien-thi.js'), ctx);
    ctx.anhLoi(img);
    return decodeURIComponent(img.src);
  };
  for (const loc of [{ protocol: 'http:', hostname: 'localhost' }, { protocol: 'http:', hostname: '127.0.0.1' }, { protocol: 'file:', hostname: '' }]) {
    assert.ok(chay(loc).includes('anh/q/menu/set-indo7.jpg'), JSON.stringify(loc));
  }
  for (const loc of [{ protocol: 'https:', hostname: 'tronghai14.github.io' }, { protocol: 'https:', hostname: 'localhost.evil.com' }, { protocol: 'https:', hostname: 'example.com' }]) {
    assert.ok(!chay(loc).includes('set-indo7.jpg'), JSON.stringify(loc));
    assert.ok(!chay(loc, 'INDO7').includes('set-indo7.jpg'));
  }
});

test('taoAnhCho escape ky tu HTML trong nhan', () => {
  const svg = decodeURIComponent(ht.taoAnhCho('<script>x</script>', 'a&b'));
  assert.ok(!svg.includes('<script>') && svg.includes('&lt;script&gt;'));
});

// ---------- 7. Sinh trang ----------
test('node cong-cu/tao-trang.js --ra <tam>: chay duoc, HTML trong repo khop ban sinh ra, rang buoc SDT/dia chi giu nguyen', () => {
  const tam = fs.mkdtempSync(path.join(require('node:os').tmpdir(), 'tao-trang-'));
  execFileSync(process.execPath, [path.join(GOC, 'cong-cu', 'tao-trang.js'), '--ra', tam], { cwd: GOC, stdio: 'pipe' });
  const docTam = (f) => fs.readFileSync(path.join(tam, f), 'utf8');
  const chuan = (t) => t.split('\r\n').join('\n').replace(/© \d{4}/, '©');
  const trang = ['index.html', 'dat-cho.html', 'xac-nhan.html', 'chinh-sach.html', 'kiem-tra-ve.html'].concat(DANH_SACH_TAU.map((t) => 'tau/' + t.slug + '.html'));
  for (const f of trang) {
    const h = docTam(f);
    assert.strictEqual(chuan(doc(f)), chuan(h), f + ' trong repo chua duoc tao lai (chay node cong-cu/tao-trang.js)');
    assert.ok(!h.includes('vetausaigon.vn'), f + ' con vetausaigon.vn');
    assert.ok(!/Quận 4|\bQ4\b|Phường 13|P\.\s?13/.test(h), f + ' dia chi cu');
    const sdt = (h.replace(/<path[^>]*>/g, '').replace(/0319143429/g, '').match(/(?:\+84|0)[\s.\-]?\d(?:[\s.\-]?\d){8}\b/g) || [])
      .map((s) => s.replace(/\D/g, '').replace(/^84/, '0'));
    for (const s of sdt) assert.strictEqual(s, '0948170036', f + ' SDT la: ' + s);
    assert.ok(h.includes('0948170036'), f);
  }
  assert.ok(docTam('index.html').includes('5 Nguyễn Tất Thành, Phường Xóm Chiếu'), 'dia chi dung o trang chu');
  fs.rmSync(tam, { recursive: true, force: true });
  assert.ok(doc('xac-nhan.html').includes('noindex'));
  assert.ok(!doc('dat-cho.html').includes('noindex'));
});
