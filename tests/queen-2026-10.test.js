const test = require('node:test');
const assert = require('node:assert');
global.CAU_HINH = require('../js/cau-hinh.js').CAU_HINH;
const dc = require('../js/dat-cho.js');
const { DANH_SACH_TAU, GIA_TRE_EM } = require('../js/du-lieu-tau.js');

const queen = DANH_SACH_TAU.find((t) => t.slug === 'indochina-queen');
const don = (them) => Object.assign({ slugTau: 'indochina-queen', loai: 'buffet', buffetMa: '0:1', nguoiLon: 2, treEm50: 0, treEmMienPhi: 0, mon: {} }, them);
const cb = (d) => dc.canhBaoTreEm(d, queen, GIA_TRE_EM);
const setMenu = (them) => don(Object.assign({ loai: 'setMenu', mon: { '1:0': 2 } }, them));

test('Queen: 2 NL + 1 be mien phi hop le', () => assert.strictEqual(cb(don({ treEmMienPhi: 1 })), null));

test('Queen buffet: canh bao khi tong tre (mua ve + mien phi) vuot gioi han', () => {
  const t = cb(don({ treEm50: 1, treEmMienPhi: 1 }));
  assert.ok(t && /phụ phí/.test(t) && /2 trẻ em/.test(t));
  assert.ok(cb(don({ treEm50: 2 })));
  assert.strictEqual(cb(don({ treEm50: 1 })), null);
});

test('Queen set menu: canh bao khi tong tre vuot gioi han', () => {
  assert.ok(cb(setMenu({ treEmMienPhi: 2 })));
  assert.strictEqual(cb(setMenu({ treEmMienPhi: 1 })), null);
});

test('Queen: 2 NL + 2 be mien phi -> be thu 2 tinh 50% va van canh bao', () => {
  const d = don({ treEmMienPhi: 2 });
  assert.deepStrictEqual(dc.demKhach(d, queen, GIA_TRE_EM), { nguoiLon: 2, treEm50: 1, treEmMienPhi: 1 });
  assert.strictEqual(dc.tomTatDon(d, queen, GIA_TRE_EM).tong, 615600 * 2 + 307800);
  assert.ok(cb(d));
});

test('Queen: 4 NL + 2 tre khong canh bao; 4 NL + 3 tre canh bao', () => {
  assert.strictEqual(cb(don({ nguoiLon: 4, treEm50: 1, treEmMienPhi: 1 })), null);
  assert.strictEqual(cb(don({ nguoiLon: 4, treEm50: 2 })), null);
  assert.ok(cb(don({ nguoiLon: 4, treEm50: 2, treEmMienPhi: 1 })));
});

test('Queen: khong con tinh tre vuot thanh gia nguoi lon', () => {
  const khach = dc.tomTatDon(don({ treEm50: 2 }), queen, GIA_TRE_EM).khach;
  assert.strictEqual(khach.nguoiLon, 2);
  assert.strictEqual(khach.treEm50, 2);
});

test('Queen: nhan 01-03 va 04-09 tuoi', () => {
  assert.match(GIA_TRE_EM['indochina-queen'].buffet.mienPhi, /01–03/);
  assert.match(GIA_TRE_EM['indochina-queen'].setMenu.mienPhi, /01–03/);
  assert.match(GIA_TRE_EM['indochina-queen'].buffet.nuaGia, /04–09/);
});

test('Cac tau khac khong bi anh huong', () => {
  for (const [slug, cs] of Object.entries(GIA_TRE_EM)) {
    for (const [loai, v] of Object.entries(cs)) assert.strictEqual(!!v.canhBaoTongTre, slug === 'indochina-queen', slug + '/' + loai);
  }
  for (const slug of ['indochina-star', 'ben-nghe']) {
    const t = DANH_SACH_TAU.find((x) => x.slug === slug);
    assert.strictEqual(dc.canhBaoTreEm({ slugTau: slug, loai: 'buffet', buffetMa: '0:1', nguoiLon: 2, treEm50: 1, treEmMienPhi: 1, mon: {} }, t, GIA_TRE_EM), null, slug);
  }
  const elite = DANH_SACH_TAU.find((x) => x.slug === 'elite-of-saigon');
  assert.ok(dc.canhBaoTreEm({ slugTau: elite.slug, loai: 'setMenu', nguoiLon: 2, treEm50: 0, treEmMienPhi: 3, mon: { '1:0': 2 } }, elite, GIA_TRE_EM));
});
