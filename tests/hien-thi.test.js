const test = require('node:test');
const assert = require('node:assert');
global.CAU_HINH = require('../js/cau-hinh.js').CAU_HINH;
const ht = require('../js/hien-thi.js');
const { DANH_SACH_TAU, LIEN_HE } = require('../js/du-lieu-tau.js');

const tau = (slug) => DANH_SACH_TAU.find((t) => t.slug === slug);

test('dinhDangGia: duong chay thuan loi va gia tri khong hop le', () => {
  assert.strictEqual(ht.dinhDangGia(615600), '615.600 VND');
  assert.strictEqual(ht.dinhDangGia(1047600), '1.047.600 VND');
  for (const x of [0, -1, 1.5, NaN, null, '615600']) assert.strictEqual(ht.dinhDangGia(x), '');
});

test('escapeHtml', () => {
  assert.strictEqual(ht.escapeHtml('<a href="x">\'&'), '&lt;a href=&quot;x&quot;&gt;&#39;&amp;');
  assert.strictEqual(ht.escapeHtml(null), '');
});

test('giaThapNhat: bo bang phu thu va suat tre em', () => {
  assert.strictEqual(ht.giaThapNhat(tau('indochina-queen')), 561600);
  assert.strictEqual(ht.giaThapNhat(tau('saigon-princess')), 950000, 'khong lay 850.000 cua menu tre em');
  assert.strictEqual(ht.giaThapNhat(tau('elite-of-saigon')), 1969000, 'khong lay Menu Tre em 1.749.000 hay phu thu 490.000');
});

test('layLoaiBang va layThucDonTheoLoai tach Buffet / Set menu', () => {
  assert.strictEqual(ht.layLoaiBang('Buffet – Tầng 1'), 'buffet');
  assert.strictEqual(ht.layLoaiBang('Set menu – Tầng 2'), 'setMenu');
  assert.strictEqual(ht.layLoaiBang('Set chill – Tầng 3 (sân thượng)'), 'khac');
  const q = ht.layThucDonTheoLoai(tau('indochina-queen'));
  assert.strictEqual(q.buffet[0].dong.length, 3);
  assert.strictEqual(q.setMenu[0].dong.length, 11);
  const p = ht.layThucDonTheoLoai(tau('saigon-princess'));
  assert.strictEqual(p.buffet.length, 0);
  assert.strictEqual(p.setMenu[0].dong.length, 20);
  const e = ht.layThucDonTheoLoai(tau('elite-of-saigon'));
  assert.deepStrictEqual([e.buffet.length, e.setMenu.length], [1, 1], 'set chill rong va phu thu khong vao danh sach chon');
});

test('layAnhMon: doc anh tung mon tu CAU_HINH.anhThucDon', () => {
  const cu = CAU_HINH.anhThucDon['indochina-queen']['Set menu'].INDO7;
  CAU_HINH.anhThucDon['indochina-queen']['Set menu'].INDO7 = ['anh/indochina-queen/menu-05.jpg', ''];
  try {
    const anh = ht.layAnhMon(tau('indochina-queen'), 'Set menu', 'INDO7');
    assert.deepStrictEqual(anh.map((a) => a.src), ['anh/indochina-queen/menu-05.jpg'], 'bo duong dan rong');
    const html = ht.taoTrangTau(tau('indochina-queen'), LIEN_HE, '../');
    assert.ok(html.includes('src="../anh/indochina-queen/menu-05.jpg"'), 'anh nho canh ten mon');
  } finally {
    CAU_HINH.anhThucDon['indochina-queen']['Set menu'].INDO7 = cu;
  }
  assert.deepStrictEqual(ht.layAnhMon(tau('indochina-queen'), 'Set menu', 'KHONG-CO'), []);
});

test('taoTrangTau: hai tab Buffet / Set menu, moi mon co Xem menu va nut Dat dung loai', () => {
  const html = ht.taoTrangTau(tau('indochina-queen'), LIEN_HE, '../');
  assert.ok(html.includes('data-tab-loai="buffet"') && html.includes('data-tab-loai="setMenu"'));
  assert.strictEqual((html.match(/class="nut-xem-menu"/g) || []).length, 14);
  assert.ok(html.includes('href="../dat-cho.html?tau=indochina-queen&amp;loai=buffet&amp;menu=0%3A0"'));
  assert.ok(html.includes('href="../dat-cho.html?tau=indochina-queen&amp;loai=setMenu&amp;menu=1%3A0"'));
});

test('taoTrangTau: tau khong phuc vu mot loai thi bao ro, Ben Nghe set menu bao lien he', () => {
  assert.ok(ht.taoTrangTau(tau('indochina-star'), LIEN_HE, '../').includes('chỉ phục vụ <strong>buffet</strong>'));
  assert.ok(ht.taoTrangTau(tau('saigon-princess'), LIEN_HE, '../').includes('chỉ phục vụ <strong>set menu</strong>'));
  const benNghe = ht.taoTrangTau(tau('ben-nghe'), LIEN_HE, '../');
  assert.ok(benNghe.includes('Set menu từ 469.000đ'));
  assert.ok(benNghe.includes('Nhắn Zalo hỏi set menu'));
});

test('taoTrangTau: Elite co hop phu thu va Mid-week Chill, Ben Nghe 733.320 VND', () => {
  const elite = ht.taoTrangTau(tau('elite-of-saigon'), LIEN_HE, '../');
  assert.ok(elite.includes('Phụ thu dùng set menu trên tầng 3'));
  assert.ok(elite.includes('Mid-week Chill'));
  const benNghe = ht.taoTrangTau(tau('ben-nghe'), LIEN_HE, '../');
  assert.ok(benNghe.includes('733.320 VND') && !benNghe.includes('733.320k'));
});

test('taoTrangTau: muc rong bi an, du lieu bi escape', () => {
  const t = Object.assign({}, tau('indochina-star'), { ten: '<b>X</b>', khuyenMai: [], giaiTri: [], chinhSachTreEm: [] });
  const html = ht.taoTrangTau(t, LIEN_HE, '../');
  assert.ok(!html.includes('<b>X</b>') && html.includes('&lt;b&gt;X&lt;/b&gt;'));
  assert.ok(!html.includes('id="khuyen-mai"') && !html.includes('id="giai-tri"') && !html.includes('id="tre-em"'));
});

test('taoTrangTau chay duoc cho ca 6 tau', () => {
  for (const t of DANH_SACH_TAU) assert.doesNotThrow(() => ht.taoTrangTau(t, LIEN_HE, '../'), t.slug);
});

test('taoTheTau: nhan loai, gia, Ben Nghe ghi 2 muc gia', () => {
  const the = ht.taoTheTau(tau('indochina-queen'), '');
  assert.ok(the.includes('data-loai="Buffet|Set menu"'));
  assert.ok(the.includes('561.600 VND'));
  assert.ok(ht.taoTheTau(tau('ben-nghe'), '').includes('Set menu từ 469.000đ · Buffet 733.320đ'));
});

test('taoNutLienHe', () => {
  const html = ht.taoNutLienHe(LIEN_HE);
  assert.ok(html.includes('href="tel:0948170036"') && html.includes('href="https://zalo.me/0948170036"'));
});

test('gioi thieu tung tau: du 6 tau co doan gioi thieu va 3 diem noi bat, hien o dau trang tau', () => {
  for (const t of DANH_SACH_TAU) {
    assert.ok(t.gioiThieu && t.gioiThieu.length > 80 && t.gioiThieu.length < 700, t.slug + ' gioi thieu');
    assert.ok(Array.isArray(t.noiBat) && t.noiBat.length === 3, t.slug + ' noi bat');
    const html = ht.taoTrangTau(t, LIEN_HE, '../');
    assert.ok(html.includes('id="gioi-thieu"') && html.includes(ht.escapeHtml(t.gioiThieu)), t.slug);
    assert.ok(html.indexOf('id="gioi-thieu"') < html.indexOf('id="thuc-don"'), t.slug + ' gioi thieu truoc thuc don');
    assert.ok(html.includes('<a href="#gioi-thieu">Giới thiệu</a>'), t.slug + ' co tab');
  }
  const khong = Object.assign({}, DANH_SACH_TAU[0], { gioiThieu: '', noiBat: [] });
  assert.ok(!ht.taoTrangTau(khong, LIEN_HE, '../').includes('id="gioi-thieu"'), 'khong co noi dung thi an muc');
});
