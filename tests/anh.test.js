// Ảnh: mọi đường dẫn nằm ở js/cau-hinh.js theo quy ước tên file; thiếu file thì hiện khung thay thế.
const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
global.CAU_HINH = require('../js/cau-hinh.js').CAU_HINH;
const ht = require('../js/hien-thi.js');
const { DANH_SACH_TAU, LIEN_HE } = require('../js/du-lieu-tau.js');

const GOC = path.join(__dirname, '..');
const doc = (rel) => fs.readFileSync(path.join(GOC, rel), 'utf8');
const tau = (slug) => DANH_SACH_TAU.find((t) => t.slug === slug);

// Mọi đường dẫn ảnh khai trong cau-hinh.js.
function tatCaAnh() {
  const ds = [CAU_HINH.logo.header, CAU_HINH.logo.footer, CAU_HINH.videoBia, CAU_HINH.thanhToan.caNhan.anhQR, CAU_HINH.thanhToan.congTy.anhQR]
    .concat(CAU_HINH.anhBia);
  for (const a of Object.values(CAU_HINH.anhTau)) ds.push(a.daiDien, ...a.thuVien, ...Object.values(a.khuyenMai));
  for (const theoBang of Object.values(CAU_HINH.anhThucDon)) {
    for (const theoMon of Object.values(theoBang)) for (const anh of Object.values(theoMon)) ds.push(...[].concat(anh));
  }
  return ds.filter(Boolean);
}

test('du-lieu-tau.js khong con duong dan anh (anh chi nam o cau-hinh.js)', () => {
  const js = doc('js/du-lieu-tau.js');
  assert.ok(!/anhDaiDien|anhTau|anhMenu|anhKhac|'anh\//.test(js));
  for (const f of ['js/hien-thi.js', 'js/dat-cho.js', 'cong-cu/tao-trang.js']) assert.ok(!doc(f).includes('anh-cu/'), f + ' khong dung anh cu');
});

test('moi tau co o anh dai dien, thu vien, anh menu cho TUNG mon chon duoc', () => {
  for (const t of DANH_SACH_TAU) {
    const a = CAU_HINH.anhTau[t.slug];
    assert.ok(a, t.slug);
    assert.strictEqual(a.daiDien, 'anh/' + t.slug + '/dai-dien.jpg');
    assert.ok(a.thuVien.length >= 4, t.slug + ' it nhat 4 o thu vien');
    for (const nhom of ht.layNhomThucDon(t)) {
      for (const mon of nhom.dong) {
        assert.ok(mon.anh.length >= 1, t.slug + ' / ' + nhom.tieuDe + ' / ' + mon.ten + ' chua co o anh');
        for (const anh of mon.anh) assert.ok(anh.src.startsWith('anh/' + t.slug + '/menu/'), anh.src);
      }
    }
  }
});

test('ten file anh: khong dau, khong khoang trang, .jpg/.png/.mp4, khong trung', () => {
  const ds = tatCaAnh();
  for (const f of ds) assert.match(f, /^anh\/[a-z0-9\-\/]+\.(jpg|jpeg|png|webp|mp4)$/, f);
  assert.strictEqual(new Set(ds).size, ds.length, 'co duong dan bi trung');
});

test('anh da co trong thu muc anh/ deu < 512000 byte', () => {
  const duyet = (d) => (fs.existsSync(d) ? fs.readdirSync(d, { withFileTypes: true }) : [])
    .flatMap((e) => (e.isDirectory() ? duyet(path.join(d, e.name)) : [path.join(d, e.name)]));
  for (const f of duyet(path.join(GOC, 'anh')).filter((f) => /\.(jpe?g|png|webp)$/i.test(f))) {
    assert.ok(fs.statSync(f).size < 512000, path.relative(GOC, f) + ' qua 500KB');
  }
});

test('taoAnh: co onerror va data-tep de doi sang khung thay the', () => {
  const html = ht.taoAnh('anh/x/dai-dien.jpg', 'Du thuyền X', '../', true, 'X');
  assert.ok(html.includes('src="../anh/x/dai-dien.jpg"') && html.includes('loading="lazy"'));
  assert.ok(html.includes('data-tep="anh/x/dai-dien.jpg"') && html.includes('data-nhan="X"') && html.includes('onerror="anhLoi(this)"'));
});

test('layAnhTau: anh dai dien dung dau, roi thu vien; khuyen mai lay theo tieu de', () => {
  const q = tau('indochina-queen');
  const anh = ht.layAnhTau(q);
  assert.strictEqual(anh[0].src, 'anh/indochina-queen/dai-dien.jpg');
  assert.strictEqual(anh.length, 1 + CAU_HINH.anhTau['indochina-queen'].thuVien.length);
  assert.strictEqual(ht.layAnhKhuyenMai(tau('elite-of-saigon'), 'Mid-week Chill').src, 'anh/elite-of-saigon/khuyen-mai-mid-week-chill.jpg');
  assert.strictEqual(ht.layAnhKhuyenMai(tau('indochina-queen'), 'Khong co'), null);
});

test('trang tau: luoi anh dau trang dung anh tu cau hinh, khong con muc anh rieng', () => {
  const html = ht.taoTrangTau(tau('indochina-queen'), LIEN_HE, '../');
  assert.ok(html.includes('src="../anh/indochina-queen/dai-dien.jpg"'));
  assert.ok(html.includes('src="../anh/indochina-queen/menu/set-indo7.jpg"'), 'anh mon INDO7');
  assert.ok(!html.includes('id="hinh-anh"'));
  const the = ht.taoTheTau(tau('ben-nghe'), '');
  assert.ok(the.includes('src="anh/ben-nghe/dai-dien.jpg"') && the.includes('data-nhan="Bến Nghé"'));
});

test('anhLoi: tren may ghi ten file can dua vao, tren mang chi ghi "Hinh anh dang cap nhat"', () => {
  const chay = (hostname) => {
    const img = { attrs: { 'data-tep': 'anh/x/dai-dien.jpg', 'data-nhan': 'Indochina Queen' }, classList: { add() {} },
      getAttribute(k) { return this.attrs[k]; }, src: '' };
    const ctx = { location: { protocol: 'https:', hostname }, console };
    vm.createContext(ctx);
    vm.runInContext(doc('js/hien-thi.js'), ctx);
    ctx.anhLoi(img);
    assert.strictEqual(img.onerror, null);
    return decodeURIComponent(img.src);
  };
  const may = chay('localhost');
  assert.ok(may.startsWith('data:image/svg+xml') && may.includes('anh/x/dai-dien.jpg') && may.includes('Indochina Queen'));
  const mang = chay('tronghai14.github.io');
  assert.ok(mang.includes('Hình ảnh đang cập nhật') && !mang.includes('anh/x/dai-dien.jpg'));
});

test('thu muc anh/ co du thu muc con cho tung tau va README huong dan', () => {
  for (const t of DANH_SACH_TAU) assert.ok(fs.existsSync(path.join(GOC, 'anh', t.slug, 'menu')), t.slug);
  for (const d of ['bia', 'logo']) assert.ok(fs.existsSync(path.join(GOC, 'anh', d)), d);
  assert.ok(fs.existsSync(path.join(GOC, 'anh', 'README.md')));
});
