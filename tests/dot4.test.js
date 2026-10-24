// Đợt góp ý 19/10/2026: thông số tàu, lịch còn chỗ / hết chỗ, gom nút liên hệ, bỏ mục thừa trang chủ và trang tàu.
const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
global.CAU_HINH = require('../js/cau-hinh.js').CAU_HINH;
const lc = require('../js/lich-cho.js');
const ht = require('../js/hien-thi.js');
const dc = require('../js/dat-cho.js');
const { DANH_SACH_TAU, LIEN_HE } = require('../js/du-lieu-tau.js');

const doc = (rel) => fs.readFileSync(path.join(__dirname, '..', rel), 'utf8');
const tau = (slug) => DANH_SACH_TAU.find((t) => t.slug === slug);

test('thong so: 6 tau deu co Suc chua va So tang, hien o muc Gioi thieu va the tau', () => {
  for (const t of DANH_SACH_TAU) {
    const nhan = (t.thongSo || []).map((x) => x.nhan);
    assert.ok(nhan.includes('Sức chứa') && nhan.includes('Số tầng'), t.slug);
    const trang = ht.taoTrangTau(t, LIEN_HE, '../');
    const gt = trang.slice(trang.indexOf('id="gioi-thieu"'), trang.indexOf('id="thuc-don"'));
    assert.ok(gt.includes('<dl class="thong-so-tau">'), t.slug + ' bang thong so');
    for (const x of t.thongSo) assert.ok(gt.includes(ht.escapeHtml(x.giaTri)), t.slug + ' ' + x.nhan);
    assert.ok(ht.taoTheTau(t, '').includes(ht.escapeHtml(t.thongSo.find((x) => x.nhan === 'Sức chứa').giaTri)), t.slug + ' the tau');
  }
  // Số liệu từ trang chính thức của tàu.
  assert.match(tau('elite-of-saigon').thongSo.map((x) => x.giaTri).join(' '), /500 khách.*Dài 75 m/);
  assert.match(tau('ben-thanh-princess').thongSo[0].giaTri, /350 khách/);
  assert.match(tau('indochina-queen').thongSo[0].giaTri, /600 khách/);
});

test('lich cho: trang thai ngay theo tung tau; ngay qua khoa; khong ghi = con cho', () => {
  const lich = { 'indochina-queen': { '2099-01-02': 'het', '2099-01-03': 'it', '2099-01-04': 'la' } };
  const t = (slug, ngay) => lc.trangThaiNgay(slug, ngay, '2099-01-01', lich);
  assert.strictEqual(t('indochina-queen', '2098-12-31'), 'qua');
  assert.strictEqual(t('indochina-queen', '2099-01-01'), 'con');
  assert.strictEqual(t('indochina-queen', '2099-01-02'), 'het');
  assert.strictEqual(t('indochina-queen', '2099-01-03'), 'it');
  assert.strictEqual(t('indochina-queen', '2099-01-04'), 'con', 'gia tri la coi nhu con cho');
  assert.strictEqual(t('indochina-star', '2099-01-02'), 'con', 'tau khac khong bi anh huong');
  assert.strictEqual(t('khong-co', '2099-01-02'), 'con');
});

test('lich cho: lich thang khoa ngay het cho va ngay da qua, danh dau ngay chon, tuan bat dau thu Hai', () => {
  const lich = { 'indochina-queen': { '2099-01-02': 'het', '2099-01-03': 'it' } };
  const html = lc.taoLichThang('indochina-queen', 2099, 1, '2099-01-01', '2099-01-05', lich);
  const nut = (ngay) => new RegExp('<button[^>]*data-ngay="' + ngay + '"[^>]*>').exec(html)[0];
  assert.ok(/disabled/.test(nut('2099-01-02')) && /lich-het/.test(nut('2099-01-02')));
  assert.ok(!/disabled/.test(nut('2099-01-03')) && /lich-it/.test(nut('2099-01-03')));
  assert.ok(/ chon/.test(nut('2099-01-05')) && /aria-pressed="true"/.test(nut('2099-01-05')));
  assert.ok(/aria-label="Thứ Sáu, 02\/01\/2099 – Hết chỗ"/.test(nut('2099-01-02')));
  assert.strictEqual((html.match(/data-ngay=/g) || []).length, 31);
  // 01/01/2099 là thứ Năm: 3 ô trống trước (T2, T3, T4).
  assert.strictEqual((html.match(/lich-trong/g) || []).length, 3);
  assert.ok(/data-lich-thang="-1" aria-label="Tháng trước" disabled/.test(html), 'khong lui ve thang da qua');
  const qua = lc.taoLichThang('indochina-queen', 2099, 2, '2099-02-10', '', lich);
  assert.ok(/data-ngay="2099-02-09"[^>]*disabled/.test(qua), 'ngay da qua bi khoa');
  assert.ok(!/lich-chu-thich/.test(lc.taoLichThang('', 2099, 1, '2099-01-01', '', lich)), 'chua chon tau: khong chu thich');
});

test('dat cho: ngay het cho bi tu choi o buoc 1', () => {
  const ngay = '2999-06-15';
  lc.LICH_CHO['indochina-queen'][ngay] = 'het';
  try {
    const don = { slugTau: 'indochina-queen', ngay, loai: 'buffet', buffetMa: '0:0', nguoiLon: 2, treEm50: 0, treEmMienPhi: 0, mon: {} };
    assert.strictEqual(dc.kiemTraBuoc1(don, DANH_SACH_TAU, '2026-10-19').loi.ngay, 'Ngày này tàu đã hết chỗ, vui lòng chọn ngày khác.');
    assert.strictEqual(dc.kiemTraBuoc1(Object.assign({}, don, { slugTau: 'indochina-star' }), DANH_SACH_TAU, '2026-10-19').loi.ngay, undefined);
  } finally {
    delete lc.LICH_CHO['indochina-queen'][ngay];
  }
});

test('trang dat cho: o ngay la lich (o an + khung lich), co nap lich-cho.js', () => {
  const html = doc('dat-cho.html');
  assert.ok(html.includes('<input type="hidden" id="dat-cho-ngay" name="ngay"><div class="lich-cho" id="lich-dat-cho"'));
  assert.ok(/<script src="js\/lich-cho\.js\?v=[0-9a-f]{8}"><\/script>/.test(html));
  assert.ok(html.indexOf('js/lich-cho.js') < html.indexOf('js/dat-cho.js'));
});

test('trang tau: co muc Lich con cho; Dieu kien ve khong lap chinh sach tre em chung; khong con muc Lien he dat cho', () => {
  for (const t of DANH_SACH_TAU) {
    const html = ht.taoTrangTau(t, LIEN_HE, '../');
    assert.ok(html.includes('<a href="#lich-cho">Lịch còn chỗ</a>') && html.includes('id="lich-tau"'), t.slug);
    const dk = html.slice(html.indexOf('id="dieu-kien"'));
    assert.ok(!dk.includes('id="tre-em-chung"'), t.slug + ' khong lap tre em');
    assert.ok(dk.includes('id="dieu-kien-ve"') && dk.includes('id="doi-tra"'), t.slug + ' van giu dieu kien ve, doi tra');
    assert.ok(!html.includes('id="lien-he"'), t.slug + ' bo muc lien he (da gom vao nut noi)');
    assert.ok(html.indexOf('id="tre-em"') > 0, t.slug + ' muc tre em rieng cua tau van con');
  }
});

test('trang chu: bo muc Dat cho chi 3 buoc va Can tu van chon tau', () => {
  const html = doc('index.html');
  assert.ok(!html.includes('Đặt chỗ chỉ 3 bước') && !html.includes('class="cac-buoc"'));
  assert.ok(!html.includes('Cần tư vấn chọn tàu?') && !html.includes('class="bang-lien-he"'));
});

test('nut lien he noi: 1 nut mo/dong, ben trong Goi, Messenger, Zalo theo thu tu', () => {
  const html = doc('index.html');
  const i = html.indexOf('<div class="lien-he-noi" id="lien-he-noi">');
  const khoi = html.slice(i, html.indexOf('<script', i));
  const vt = ['tel:0948170036', 'https://m.me/antoitrenduthuyensaigon', 'https://zalo.me/0948170036'].map((h) => khoi.indexOf('href="' + h + '"'));
  assert.ok(vt.every((x) => x > 0) && vt[0] < vt[1] && vt[1] < vt[2], JSON.stringify(vt));
  assert.strictEqual(CAU_HINH.mangXaHoi.messenger, 'https://m.me/antoitrenduthuyensaigon');
  const css = doc('css/style.css');
  assert.ok(css.includes('.lien-he-noi:not(.thu-gon) .lh-mo { display: none; }'), 'khong JS thi hien san 3 nut');
});

test('lich: file du lieu LICH_CHO bi loi (Ms Nguyen go sai) thi lich van chay, coi moi ngay con cho', () => {
  const vm = require('node:vm');
  const canhBao = [];
  for (const duLieu of ["var LICH_CHO = { 'indochina-queen': { '2099-01-02': het } };", "var LICH_CHO = { 'indochina-queen': { '2099-01-02': 'het' }", '']) {
    const ctx = { console: { warn: (m) => canhBao.push(m) }, Date, String, Number, Object, RegExp };
    vm.createContext(ctx);
    // Mô phỏng trình duyệt: mỗi file là một <script> riêng, file dữ liệu lỗi không làm dừng file lich-cho.js.
    try { vm.runInContext(duLieu, ctx); } catch (loi) { /* file dữ liệu lỗi */ }
    vm.runInContext(doc('js/lich-cho.js'), ctx);
    assert.strictEqual(ctx.trangThaiNgay('indochina-queen', '2099-01-02', '2099-01-01'), 'con', duLieu);
    assert.ok(/data-ngay="2099-01-31"/.test(ctx.taoLichThang('indochina-queen', 2099, 1, '2099-01-01', '')), duLieu);
  }
  // Ghi sai định dạng ngày thì có cảnh báo ở Console.
  const ctx = { console: { warn: (m) => canhBao.push(m) }, Date, String, Number, Object, RegExp };
  vm.createContext(ctx);
  vm.runInContext("var LICH_CHO = { 'ben-nghe': { '24/12/2099': 'het' } };" + doc('js/lich-cho.js'), ctx);
  assert.strictEqual(ctx.trangThaiNgay('ben-nghe', '2099-12-24', '2099-01-01'), 'con');
  assert.ok(canhBao.some((m) => m.includes('24/12/2099')));
});

test('lich: hom nay theo gio Viet Nam (UTC+7)', () => {
  // 18/10/2026 20:00 giờ New York (UTC-4) = 19/10/2026 00:00 UTC = 19/10/2026 07:00 giờ VN.
  assert.strictEqual(lc.ngayHomNayVN(Date.UTC(2026, 9, 19, 0, 0)), '2026-10-19');
  // 19/10/2026 16:59 UTC = 23:59 giờ VN (vẫn 19/10); 17:00 UTC = 00:00 ngày 20/10 giờ VN.
  assert.strictEqual(lc.ngayHomNayVN(Date.UTC(2026, 9, 19, 16, 59)), '2026-10-19');
  assert.strictEqual(lc.ngayHomNayVN(Date.UTC(2026, 9, 19, 17, 0)), '2026-10-20');
  assert.strictEqual(lc.ngayHomNayVN(Date.UTC(2026, 11, 31, 17, 0)), '2027-01-01');
});

test('lich: ban phim - sau khi chuyen thang hoac chon ngay, focus nam lai dung nut', () => {
  let nghe = null; let daFocus = null; let html = '';
  const nut = (chon) => ({ disabled: false, focus() { daFocus = chon; } });
  const khung = {
    set innerHTML(v) { html = v; }, get innerHTML() { return html; },
    addEventListener(_, f) { nghe = f; },
    querySelector: (chon) => nut(chon)
  };
  const chon = [];
  lc.ganLichCho(khung, '2099-01-01', () => 'ben-nghe', (n) => chon.push(n), '');
  const bam = (ten, gt) => nghe({ target: { closest: (s) => (s === '[' + ten + ']' ? { disabled: false, getAttribute: () => gt } : null) } });
  bam('data-lich-thang', '1');
  assert.strictEqual(daFocus, '[data-lich-thang="1"]');
  bam('data-ngay', '2099-02-10');
  assert.strictEqual(daFocus, '[data-ngay="2099-02-10"]');
  assert.deepStrictEqual(chon, ['2099-02-10']);
});

test('dat cho: o ngay noi voi nhan va dong loi (aria); lich-cho-du-lieu.js nap truoc lich-cho.js', () => {
  const html = doc('dat-cho.html');
  assert.ok(html.includes('<div class="lich-cho" id="lich-dat-cho" role="group" aria-labelledby="nhan-ngay-len-tau" aria-describedby="loi-ngay"></div>'));
  assert.ok(html.includes('<span id="nhan-ngay-len-tau">Ngày lên tàu</span>') && html.includes('id="loi-ngay" data-loi="ngay"'));
  assert.ok(html.indexOf('js/lich-cho-du-lieu.js') > 0 && html.indexOf('js/lich-cho-du-lieu.js') < html.indexOf('js/lich-cho.js?'));
  assert.ok(!doc('js/lich-cho.js').includes("'2026-12-24': 'het',\n"), 'du lieu khong nam trong lich-cho.js');
});

test('code ve: tu tao khi Ms Nguyen xac nhan da nhan tien (o code de trong); dang MA-ddMM-XXXX, khong ky tu de nham', () => {
  const ma = tau('indochina-queen');
  for (let i = 0; i < 200; i++) assert.match(dc.taoCodeVe(ma, '2026-10-24'), /^QUEEN-2410-[2-9A-HJKMNP-Z]{4}$/);
  const khac = new Set(Array.from({ length: 50 }, () => dc.taoCodeVe(ma, '2026-10-24')));
  assert.ok(khac.size > 45, 'ngau nhien');
  assert.strictEqual(dc.taoCodeVe(tau('ben-thanh-princess'), '2026-12-31', () => 0), 'BTPRN-3112-2222');
  for (const t of DANH_SACH_TAU) assert.match(dc.taoCodeVe(t, '2026-01-05'), /^[A-Z]{4,5}-0501-/, t.slug);
  // Chỉ tạo sau khi đã tích "đã nhận đủ tiền": đoạn tự tạo code nằm sau bước kiểm tra ô này.
  const js = doc('js/dat-cho.js');
  const kiem = js.indexOf("if (!form.elements.daNhanTien.checked) {");
  const tao = js.indexOf('codeVe = taoCodeVe(tau, don.ngay);');
  assert.ok(kiem > 0 && tao > kiem);
  assert.ok(doc('xac-nhan.html').includes('để trống: web tự tạo code khi tạo phiếu'));
});
