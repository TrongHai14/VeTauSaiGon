// SEO: nội dung có sẵn trong HTML, tiêu đề, canonical, dữ liệu có cấu trúc.
const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const { DANH_SACH_TAU } = require('../js/du-lieu-tau.js');
const doc = (rel) => fs.readFileSync(path.join(__dirname, '..', rel), 'utf8');
const jsonLd = (h) => [...h.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/g)].map((m) => JSON.parse(m[1]));

test('noi dung co san trong HTML (khong can chay JavaScript)', () => {
  const trangChu = doc('index.html');
  for (const t of DANH_SACH_TAU) {
    assert.ok(trangChu.includes('href="tau/' + t.slug + '.html"') && trangChu.includes('class="the-tau"'), t.slug);
    const h = doc('tau/' + t.slug + '.html');
    const than = h.slice(h.indexOf('id="noi-dung-tau"'));
    assert.ok(than.includes('<h1') && than.includes('id="gioi-thieu"') && than.includes('id="thuc-don"') && than.includes('thong-so-tau'), t.slug);
    for (const x of t.thongSo) assert.ok(than.includes(x.giaTri.replace(/&/g, '&amp;')), x.giaTri);
  }
});

test('moi trang cong khai co tieu de rieng, mo ta toi da 160 ky tu, canonical; trang noi bo thi khong', () => {
  const ds = ['index.html', 'dat-cho.html', 'faq.html', 'chinh-sach.html'].concat(DANH_SACH_TAU.map((t) => 'tau/' + t.slug + '.html'));
  const tieuDe = new Set();
  for (const f of ds) {
    const h = doc(f);
    tieuDe.add(/<title>([^<]*)/.exec(h)[1]);
    assert.ok(/<link rel="canonical" href="https:\/\/vetausaigon\.vn\//.test(h), f);
    const mt = /<meta name="description" content="([^"]*)"/.exec(h)[1];
    assert.ok(mt.length >= 50 && mt.length <= 160, f + ' ' + mt.length);
  }
  assert.strictEqual(tieuDe.size, ds.length);
  for (const f of ['xac-nhan.html', 'tao-phieu.html', 'kiem-tra-ve.html', '404.html']) assert.ok(!doc(f).includes('rel="canonical"'), f);
});

test('du lieu co cau truc dung va khong co diem danh gia', () => {
  const home = jsonLd(doc('index.html'));
  const dn = home.find((x) => x['@type'] === 'TravelAgency');
  assert.strictEqual(dn.telephone, '+84948170036');
  assert.strictEqual(dn.taxID, '0319143429');
  assert.ok(dn.sameAs.length === 2);
  const ht = require('../js/hien-thi.js');
  for (const t of DANH_SACH_TAU) {
    const raw = doc('tau/' + t.slug + '.html');
    assert.ok(!raw.includes('aggregateRating'), t.slug);
    const sp = jsonLd(raw).find((x) => x['@type'] === 'Product');
    assert.strictEqual(sp.offers.lowPrice, ht.giaThapNhat(t), t.slug);
    assert.strictEqual(sp.offers.priceCurrency, 'VND');
  }
  const faq = jsonLd(doc('faq.html'))[0];
  assert.strictEqual(faq['@type'], 'FAQPage');
  assert.strictEqual(faq.mainEntity.length, (doc('faq.html').match(/<details/g) || []).length);
});
