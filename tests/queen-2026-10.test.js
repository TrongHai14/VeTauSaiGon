// Chính sách trẻ em Indochina Queen: từ 19/10/2026 dùng chung với Indochina Star (cùng chủ tàu).
const test = require('node:test');
const assert = require('node:assert');
global.CAU_HINH = require('../js/cau-hinh.js').CAU_HINH;
const dc = require('../js/dat-cho.js');
const { DANH_SACH_TAU, GIA_TRE_EM } = require('../js/du-lieu-tau.js');

const tau = (slug) => DANH_SACH_TAU.find((t) => t.slug === slug);
const queen = tau('indochina-queen');
const star = tau('indochina-star');
const don = (slug, them) => Object.assign({ slugTau: slug, loai: 'buffet', buffetMa: '0:0', nguoiLon: 2, treEm50: 0, treEmMienPhi: 0, mon: {} }, them);

test('Queen va Star: cung chinh sach tre em tren trang tau', () => {
  assert.deepStrictEqual(queen.chinhSachTreEm, star.chinhSachTreEm);
  assert.ok(queen.chinhSachTreEm.some((d) => /0-4 tuổi/.test(d)) && queen.chinhSachTreEm.some((d) => /5-9 tuổi/.test(d)));
  assert.ok(!queen.chinhSachTreEm.some((d) => /năm sinh|01–03|04–09/.test(d)), 'bo chinh sach cu cua Queen');
});

test('Queen va Star: o dem tre em buffet giong nhau (0-4 mien phi, 5-9 tinh 50%, tu 10 tuoi nguoi lon)', () => {
  assert.deepStrictEqual(GIA_TRE_EM['indochina-queen'].buffet, GIA_TRE_EM['indochina-star'].buffet);
  assert.match(GIA_TRE_EM['indochina-queen'].setMenu.mienPhi, /0–4 tuổi/);
  assert.match(GIA_TRE_EM['indochina-queen'].setMenu.ghiChu, /5–9 tuổi/);
});

test('Queen: khong con canh bao tong tre; tinh tien giong Star', () => {
  for (const [slug, cs] of Object.entries(GIA_TRE_EM)) {
    for (const [loai, v] of Object.entries(cs)) assert.ok(!v.canhBaoTongTre, slug + '/' + loai);
  }
  for (const them of [{ treEm50: 1, treEmMienPhi: 1 }, { treEmMienPhi: 2 }, { treEm50: 2, treEmMienPhi: 3 }]) {
    const q = dc.tomTatDon(don('indochina-queen', them), queen, GIA_TRE_EM).khach;
    const s = dc.tomTatDon(don('indochina-star', them), star, GIA_TRE_EM).khach;
    assert.deepStrictEqual(q, s, JSON.stringify(them));
    assert.strictEqual(dc.canhBaoTreEm(don('indochina-queen', them), queen, GIA_TRE_EM), dc.canhBaoTreEm(don('indochina-star', them), star, GIA_TRE_EM));
  }
});

test('Queen: 2 NL + 2 be mien phi -> be thu 2 tinh 50% (giong Star)', () => {
  const d = don('indochina-queen', { buffetMa: '0:1', treEmMienPhi: 2 });
  assert.deepStrictEqual(dc.demKhach(d, queen, GIA_TRE_EM), { nguoiLon: 2, treEm50: 1, treEmMienPhi: 1 });
  assert.strictEqual(dc.tomTatDon(d, queen, GIA_TRE_EM).tong, 615600 * 2 + 307800);
});

test('Cac tau khac khong bi anh huong', () => {
  const elite = tau('elite-of-saigon');
  assert.ok(dc.canhBaoTreEm({ slugTau: elite.slug, loai: 'setMenu', nguoiLon: 2, treEm50: 0, treEmMienPhi: 3, mon: { '1:0': 2 } }, elite, GIA_TRE_EM));
  assert.strictEqual(GIA_TRE_EM['saigon-princess'].setMenu.phuThuBeVuot, 100000);
});
