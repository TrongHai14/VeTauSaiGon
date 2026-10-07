const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const ht = require('../js/hien-thi.js');
const { DANH_SACH_TAU } = require('../js/du-lieu-tau.js');

const GOC = path.join(__dirname, '..');
const queen = DANH_SACH_TAU.find((t) => t.slug === 'indochina-queen');
const tenFile = (i) => 'tau-' + (i < 10 ? '0' : '') + i + '.jpg';

// Doc kich thuoc JPEG; tra null neu khong phai JPEG hop le.
function kichThuocJpeg(buf) {
  if (buf.length < 4 || buf[0] !== 0xff || buf[1] !== 0xd8) return null;
  if (buf[buf.length - 2] !== 0xff || buf[buf.length - 1] !== 0xd9) return null;
  let p = 2;
  while (p + 9 < buf.length) {
    if (buf[p] !== 0xff) { p++; continue; }
    const m = buf[p + 1];
    if (m === 0xff) { p++; continue; }
    if (m >= 0xc0 && m <= 0xcf && m !== 0xc4 && m !== 0xc8 && m !== 0xcc) {
      return { cao: buf.readUInt16BE(p + 5), rong: buf.readUInt16BE(p + 7) };
    }
    p += 2 + buf.readUInt16BE(p + 2);
  }
  return null;
}

test('kichThuocJpeg tu kiem: du lieu rac bi tu choi', () => {
  assert.strictEqual(kichThuocJpeg(Buffer.from('khong phai anh')), null);
  assert.strictEqual(kichThuocJpeg(Buffer.alloc(0)), null);
});

test('12 file tau-01..12.jpg ton tai, < 512000 byte, JPEG hop le, canh dai <= 1600', () => {
  for (let i = 1; i <= 12; i++) {
    const f = path.join(GOC, 'anh', 'indochina-queen', tenFile(i));
    assert.ok(fs.existsSync(f), 'thieu ' + tenFile(i));
    const buf = fs.readFileSync(f);
    assert.ok(buf.length < 512000, tenFile(i) + ' qua nang: ' + buf.length);
    const kt = kichThuocJpeg(buf);
    assert.ok(kt, tenFile(i) + ' khong phai JPEG hop le');
    assert.ok(kt.rong > 0 && kt.cao > 0);
    assert.ok(Math.max(kt.rong, kt.cao) <= 1600, tenFile(i) + ' canh dai ' + Math.max(kt.rong, kt.cao));
  }
});

test('du lieu Queen: anhTau dung 12 anh, file co that, alt tieng Viet, khong trung', () => {
  assert.strictEqual(queen.anhTau.length, 12);
  const daGap = new Set();
  queen.anhTau.forEach((a, i) => {
    assert.strictEqual(a.src, 'anh/indochina-queen/' + tenFile(i + 1));
    assert.ok(fs.existsSync(path.join(GOC, a.src)), 'thieu ' + a.src);
    assert.ok(/Du thuyền Indochina Queen/.test(a.alt), a.alt);
    assert.ok(!daGap.has(a.alt));
    daGap.add(a.alt);
  });
});

test('anhDaiDien Queen la tau-01.jpg va file co that', () => {
  assert.strictEqual(queen.anhDaiDien, 'anh/indochina-queen/tau-01.jpg');
  assert.ok(fs.existsSync(path.join(GOC, queen.anhDaiDien)));
});

test('og:image trang Queen tro toi tau-01.jpg that', () => {
  const html = fs.readFileSync(path.join(GOC, 'tau', 'indochina-queen.html'), 'utf8');
  const m = html.match(/<meta property="og:image" content="([^"]+)"/);
  assert.ok(m, 'khong co og:image');
  assert.strictEqual(m[1], 'https://vetausaigon.vn/anh/indochina-queen/tau-01.jpg');
  assert.ok(fs.existsSync(path.join(GOC, m[1].replace('https://vetausaigon.vn/', ''))));
});

test('trang Queen co muc "Anh tau (12)", anh co tien to ../', () => {
  const out = ht.taoTrangTau(queen, require('../js/du-lieu-tau.js').LIEN_HE, '../');
  assert.ok(out.includes('id="hinh-anh"'), 'khong co muc hinh-anh');
  assert.ok(out.includes('Ảnh tàu (12)'));
  for (let k = 1; k <= 8; k++) {
    assert.ok(out.includes('src="../anh/indochina-queen/' + tenFile(k) + '"'), tenFile(k));
  }
  assert.ok(out.includes('+4 ảnh'), 'o cuoi bao con 4 anh');
});

test('the Queen tren trang chu dung anh dai dien moi (tien to rong)', () => {
  const the = ht.taoTheTau(queen, '');
  assert.ok(the.includes('src="anh/indochina-queen/tau-01.jpg"'));
});

test('truong hop that bai: tau khong co anhTau thi khong render muc Anh tau', () => {
  const tau = Object.assign({}, queen, { anhTau: [], anhKhac: [] });
  const out = ht.taoTrangTau(tau, require('../js/du-lieu-tau.js').LIEN_HE, '../');
  assert.ok(!out.includes('id="hinh-anh"'));
});

test('khong con file anh tau mo coi trong anh/indochina-queen', () => {
  const tonTai = fs.readdirSync(path.join(GOC, 'anh', 'indochina-queen')).filter((n) => /^tau-\d+\.jpg$/.test(n)).sort();
  const trongDuLieu = queen.anhTau.map((a) => path.basename(a.src)).sort();
  assert.deepStrictEqual(tonTai, trongDuLieu);
});
