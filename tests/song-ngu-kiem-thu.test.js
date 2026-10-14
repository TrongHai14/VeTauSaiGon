// Kiem thu song ngu VI/EN (doc lap voi tests/ngon-ngu.test.js): chay js/ngon-ngu.js trong vm voi DOM gia lap.
const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const GOC = path.join(__dirname, '..');
const doc = (rel) => fs.readFileSync(path.join(GOC, rel), 'utf8');

// ---------- DOM gia lap toi thieu ----------
function chu(giaTri) { return { nodeType: 3, nodeValue: giaTri, parentNode: null }; }
function the(tagName, thuocTinh, con) {
  const el = {
    nodeType: 1, tagName, parentNode: null, childNodes: [], _tt: Object.assign({}, thuocTinh || {}),
    hasAttribute(t) { return Object.prototype.hasOwnProperty.call(this._tt, t); },
    getAttribute(t) { return this.hasAttribute(t) ? this._tt[t] : null; },
    setAttribute(t, v) { this._tt[t] = String(v); }
  };
  for (const c of con || []) { c.parentNode = el; el.childNodes.push(c); }
  return el;
}

// ---------- Nap js/tu-dien-en.js + js/ngon-ngu.js vao vm ----------
function taoNgucCanh(opts) {
  opts = opts || {};
  const luu = Object.assign({}, opts.luu || {});
  const ghiLai = [];
  const ctx = {
    location: { search: opts.search || '', pathname: opts.pathname || '/dat-cho.html', hash: opts.hash || '', href: '' },
    localStorage: opts.localStorageLoi
      ? { getItem() { throw new Error('bi chan'); }, setItem() { throw new Error('bi chan'); } }
      : { getItem(k) { return Object.prototype.hasOwnProperty.call(luu, k) ? luu[k] : null; }, setItem(k, v) { luu[k] = String(v); ghiLai.push([k, String(v)]); } },
    setTimeout: () => 0
  };
  if (opts.document) ctx.document = opts.document;
  if (opts.MutationObserver) ctx.MutationObserver = opts.MutationObserver;
  vm.createContext(ctx);
  vm.runInContext(doc('js/tu-dien-en.js'), ctx);
  vm.runInContext(doc('js/ngon-ngu.js'), ctx);
  ctx.__luu = luu; ctx.__ghiLai = ghiLai;
  return ctx;
}
const goi = (ctx, bt) => vm.runInContext(bt, ctx);

// ---------- 1. dichVung ----------
test('dichVung: ngon ngu vi khong doi gi', () => {
  const ctx = taoNgucCanh();
  const nut = chu('Đặt chỗ');
  const goc = the('DIV', { title: 'Liên hệ' }, [nut]);
  ctx.__goc = goc;
  goi(ctx, "dichVung(__goc, 'vi')");
  assert.strictEqual(nut.nodeValue, 'Đặt chỗ');
  assert.strictEqual(goc.getAttribute('title'), 'Liên hệ');
});

test('dichVung: en dich nut chu va giu khoang trang dau/cuoi', () => {
  const ctx = taoNgucCanh();
  const nut = chu('\n   Đặt chỗ \t ');
  ctx.__goc = the('DIV', {}, [the('A', {}, [nut])]);
  goi(ctx, "dichVung(__goc, 'en')");
  assert.strictEqual(nut.nodeValue, '\n   Book \t ');
});

test('dichVung: bo qua data-khong-dich, SCRIPT, TEXTAREA (ke ca long nhau)', () => {
  const ctx = taoNgucCanh();
  const a = chu('Đặt chỗ'), b = chu('Đặt chỗ'), c = chu('Đặt chỗ'), d = chu('Đặt chỗ'), ok = chu('Đặt chỗ');
  const khongDich = the('DIV', { 'data-khong-dich': '' }, [a, the('P', { title: 'Liên hệ' }, [d])]);
  ctx.__goc = the('BODY', {}, [khongDich, the('SCRIPT', {}, [b]), the('TEXTAREA', { placeholder: 'Liên hệ' }, [c]), the('SPAN', {}, [ok])]);
  goi(ctx, "dichVung(__goc, 'en')");
  assert.strictEqual(a.nodeValue, 'Đặt chỗ');
  assert.strictEqual(d.nodeValue, 'Đặt chỗ');
  assert.strictEqual(khongDich.childNodes[1].getAttribute('title'), 'Liên hệ');
  assert.strictEqual(b.nodeValue, 'Đặt chỗ');
  assert.strictEqual(c.nodeValue, 'Đặt chỗ');
  assert.strictEqual(ctx.__goc.childNodes[2].getAttribute('placeholder'), 'Liên hệ');
  assert.strictEqual(ok.nodeValue, 'Book');
});

test('dichVung: goi thang tren nut chu nam trong vung data-khong-dich thi khong dich', () => {
  const ctx = taoNgucCanh();
  const nut = chu('Đặt chỗ');
  the('DIV', { 'data-khong-dich': '' }, [the('B', {}, [nut])]);
  ctx.__nut = nut;
  goi(ctx, "dichVung(__nut, 'en')");
  assert.strictEqual(nut.nodeValue, 'Đặt chỗ');
});

test('dichVung: khong dich lai chu vua dich (__daDich), chay nhieu lan van on dinh', () => {
  const ctx = taoNgucCanh();
  const nut = chu('Liên hệ');
  ctx.__goc = the('DIV', {}, [nut]);
  goi(ctx, "dichVung(__goc, 'en')");
  assert.strictEqual(nut.nodeValue, 'Contact');
  assert.strictEqual(nut.__daDich, 'Contact');
  for (let i = 0; i < 3; i++) goi(ctx, "dichVung(__goc, 'en')");
  assert.strictEqual(nut.nodeValue, 'Contact');
});

test('dichVung: dich placeholder, alt, aria-label, title', () => {
  const ctx = taoNgucCanh();
  const el = the('INPUT', { placeholder: 'Họ và tên', alt: 'Đặt chỗ', 'aria-label': 'Liên hệ', title: 'Du thuyền', id: 'Đặt chỗ' });
  ctx.__el = el;
  goi(ctx, "dichVung(__el, 'en')");
  assert.strictEqual(el.getAttribute('placeholder'), 'Full name');
  assert.strictEqual(el.getAttribute('alt'), 'Book');
  assert.strictEqual(el.getAttribute('aria-label'), 'Contact');
  assert.strictEqual(el.getAttribute('title'), 'Cruises');
  assert.strictEqual(el.getAttribute('id'), 'Đặt chỗ', 'thuoc tinh khac khong bi dich');
});

test('dichVung: cau thieu ban dich giu nguyen tieng Viet, khong loi; null/undefined khong sap', () => {
  const ctx = taoNgucCanh();
  const nut = chu('Câu này chắc chắn không có trong từ điển xyz');
  ctx.__goc = the('P', {}, [nut]);
  goi(ctx, "dichVung(__goc, 'en')");
  assert.strictEqual(nut.nodeValue, 'Câu này chắc chắn không có trong từ điển xyz');
  assert.doesNotThrow(() => goi(ctx, "dichVung(null, 'en'); dichVung(undefined, 'en')"));
  assert.strictEqual(goi(ctx, "dichChuoi('Đặt chỗ', 'vi')"), null);
});

test('khoiChayNgonNgu + MutationObserver gia: dich chu moi them, khong dich lai chu minh vua doi', () => {
  const nutCu = chu('Đặt chỗ');
  const body = the('BODY', {}, [the('P', {}, [nutCu])]);
  const html = the('HTML', {});
  html.className = '';
  let goiLai = null, soLanQuanSat = 0;
  const document = { body, documentElement: html, title: 'Liên hệ', querySelectorAll: () => [] };
  const ctx = taoNgucCanh({
    search: '?lang=en', document,
    MutationObserver: function (cb) { goiLai = cb; this.observe = () => { soLanQuanSat++; }; }
  });
  goi(ctx, 'khoiChayNgonNgu()');
  assert.strictEqual(soLanQuanSat, 1);
  assert.strictEqual(nutCu.nodeValue, 'Book');
  assert.strictEqual(document.title, 'Contact');
  goiLai([{ type: 'characterData', target: nutCu }]);
  assert.strictEqual(nutCu.nodeValue, 'Book');
  const moi = chu('Liên hệ');
  const khoi = the('DIV', {}, [moi]);
  body.childNodes.push(khoi); khoi.parentNode = body;
  goiLai([{ type: 'childList', addedNodes: [khoi] }]);
  assert.strictEqual(moi.nodeValue, 'Contact');
  const o = the('INPUT', { placeholder: 'Họ và tên' }); o.parentNode = body;
  goiLai([{ type: 'attributes', target: o }]);
  assert.strictEqual(o.getAttribute('placeholder'), 'Full name');
  const kd = the('DIV', { 'data-khong-dich': '' }, [chu('Đặt chỗ')]);
  goiLai([{ type: 'childList', addedNodes: [kd] }]);
  assert.strictEqual(kd.childNodes[0].nodeValue, 'Đặt chỗ');
});

// ---------- 2. layNgonNgu ----------
test('layNgonNgu: ?lang=en|vi uu tien hon gia tri da luu va duoc luu lai', () => {
  let ctx = taoNgucCanh({ search: '?tau=x&lang=en', luu: { 'veTauSaiGon.ngonNgu': 'vi' } });
  assert.strictEqual(goi(ctx, 'layNgonNgu()'), 'en');
  assert.strictEqual(ctx.__luu['veTauSaiGon.ngonNgu'], 'en');
  ctx = taoNgucCanh({ search: '?lang=vi', luu: { 'veTauSaiGon.ngonNgu': 'en' } });
  assert.strictEqual(goi(ctx, 'layNgonNgu()'), 'vi');
  assert.strictEqual(ctx.__luu['veTauSaiGon.ngonNgu'], 'vi');
});

test('layNgonNgu: khong co ?lang thi dung gia tri da luu, mac dinh vi', () => {
  assert.strictEqual(goi(taoNgucCanh({ luu: { 'veTauSaiGon.ngonNgu': 'en' } }), 'layNgonNgu()'), 'en');
  assert.strictEqual(goi(taoNgucCanh(), 'layNgonNgu()'), 'vi');
});

test('layNgonNgu: gia tri la bi bo qua (?lang=fr, luu rac)', () => {
  let ctx = taoNgucCanh({ search: '?lang=fr' });
  assert.strictEqual(goi(ctx, 'layNgonNgu()'), 'vi');
  assert.deepStrictEqual(ctx.__ghiLai, [], 'khong luu gia tri la');
  ctx = taoNgucCanh({ search: '?lang=fr', luu: { 'veTauSaiGon.ngonNgu': 'en' } });
  assert.strictEqual(goi(ctx, 'layNgonNgu()'), 'en', 'bo qua fr, dung gia tri da luu');
  ctx = taoNgucCanh({ luu: { 'veTauSaiGon.ngonNgu': 'de' } });
  assert.strictEqual(goi(ctx, 'layNgonNgu()'), 'vi');
  ctx = taoNgucCanh({ search: '?lang=english' });
  assert.strictEqual(goi(ctx, 'layNgonNgu()'), 'vi', 'lang=english khong phai en');
  ctx = taoNgucCanh({ search: '?xlang=en' });
  assert.strictEqual(goi(ctx, 'layNgonNgu()'), 'vi', 'xlang khong phai lang');
});

test('layNgonNgu: localStorage nem loi thi khong sap, tra vi (co ?lang=en thi van tra en)', () => {
  assert.strictEqual(goi(taoNgucCanh({ localStorageLoi: true }), 'layNgonNgu()'), 'vi');
  assert.strictEqual(goi(taoNgucCanh({ localStorageLoi: true, search: '?lang=en' }), 'layNgonNgu()'), 'en');
});

// ---------- 3. datNgonNgu ----------
test('datNgonNgu: bo ?lang cu, giu tham so khac va #hash', () => {
  const cac = [
    ['?tau=x&lang=en&menu=1', '#a', 'en', '/dat-cho.html?tau=x&menu=1&lang=en#a'],
    ['?tau=x&lang=en&menu=1', '', 'vi', '/dat-cho.html?tau=x&menu=1'],
    ['?lang=en', '#gia', 'vi', '/dat-cho.html#gia'],
    ['?lang=vi&tau=x', '', 'vi', '/dat-cho.html?tau=x'],
    ['?tau=x&lang=vi', '', 'en', '/dat-cho.html?tau=x&lang=en'],
    ['', '#lien-he', 'en', '/dat-cho.html?lang=en#lien-he'],
    ['?tau=x', '', 'vi', '/dat-cho.html?tau=x']
  ];
  for (const [search, hash, ma, mongDoi] of cac) {
    const ctx = taoNgucCanh({ search, hash });
    goi(ctx, `datNgonNgu('${ma}')`);
    assert.strictEqual(ctx.location.href, mongDoi, `${search}${hash} -> ${ma}`);
    assert.strictEqual(ctx.__luu['veTauSaiGon.ngonNgu'], ma);
  }
});

test('datNgonNgu: ma la (fr) khong tai lai trang va khong luu; localStorage loi van doi URL', () => {
  const ctx = taoNgucCanh({ search: '?a=1' });
  goi(ctx, "datNgonNgu('fr')");
  assert.strictEqual(ctx.location.href, '');
  assert.deepStrictEqual(ctx.__ghiLai, []);
  const loi = taoNgucCanh({ search: '?a=1', localStorageLoi: true });
  goi(loi, "datNgonNgu('en')");
  assert.strictEqual(loi.location.href, '/dat-cho.html?a=1&lang=en');
});

// ---------- 4. dinhDangSoAnh ----------
test('dinhDangSoAnh: gio, gia tien', () => {
  const ctx = taoNgucCanh();
  const f = (s) => { ctx.__s = s; return goi(ctx, 'dinhDangSoAnh(__s)'); };
  assert.strictEqual(f('18h00'), '18:00');
  assert.strictEqual(f('Đón 18h30, khởi hành 19h00'), 'Đón 18:30, khởi hành 19:00');
  assert.strictEqual(f('1.404.000 VND'), '1,404,000 VND');
  assert.strictEqual(f('469.000đ'), '469,000 VND');
  assert.strictEqual(f('1.404.000đ'), '1,404,000 VND');
  assert.strictEqual(f('2.340.000 VND x 2'), '2,340,000 VND x 2');
});

test('dinhDangSoAnh: SDT, MST, ngay, ma don khong bi doi', () => {
  const ctx = taoNgucCanh();
  const f = (s) => { ctx.__s = s; return goi(ctx, 'dinhDangSoAnh(__s)'); };
  for (const s of ['0948170036', '0312345678', '0312345678-001', '24/12/2026', 'VT261014ABCD', '2026-12-24', 'Mã đơn VT261014ABCD – 24/12/2026', 'SĐT 0948170036']) {
    assert.strictEqual(f(s), s);
  }
  assert.strictEqual(f('Gọi 0948170036 – 469.000đ'), 'Gọi 0948170036 – 469,000 VND');
  assert.strictEqual(f('Số 1.234.567 không có đơn vị'), 'Số 1.234.567 không có đơn vị', 'khong co don vi tien thi giu nguyen');
});

test('dichChuoi (qua vm): chuoi khong co chu Viet chi doi dinh dang so; ngon ngu vi tra null', () => {
  const ctx = taoNgucCanh();
  const d = (s, l) => { ctx.__s = s; return goi(ctx, `dichChuoi(__s, '${l || 'en'}')`); };
  assert.strictEqual(d('1.404.000 VND'), '1,404,000 VND');
  assert.strictEqual(d('0948170036'), null);
  assert.strictEqual(d('   '), null);
  assert.strictEqual(d('469.000đ', 'vi'), null);
});

// ---------- 5. Mau cau ----------
test('mau cau: so 2 chu so, ten mon co dau ngoac, ten tau ngoai danh sach', () => {
  const ctx = taoNgucCanh();
  const d = (s) => { ctx.__s = s; return goi(ctx, 'dichChuoi(__s, "en")'); };
  assert.strictEqual(d('12 lựa chọn'), '12 options');
  assert.strictEqual(d('Xem tất cả 24 ảnh'), 'View all 24 photos');
  assert.strictEqual(d('Chay (10)'), 'Vegetarian (10)');
  assert.strictEqual(d('Trẻ em (12)'), 'Kids (12)');
  assert.strictEqual(d('Đón khách 18h00'), 'Pick-up 18:00');
  assert.strictEqual(d('Ngày 24/12/2026 · Đón 18h00'), '24/12/2026 · Pick-up 18:00');
  assert.strictEqual(d('Du thuyền Indochina Queen'), 'Indochina Queen cruise');
  assert.strictEqual(d('Du thuyền Bến Thành Princess – ảnh 12'), 'Bến Thành Princess cruise – photo 12');
  // Ten mon co dau ngoac: khong sap, so o cuoi giu nguyen, phan ngoac khong bi mat
  const ngoac = d('Buffet Hải Sản (Đặc Biệt) (12)');
  assert.ok(ngoac !== null && ngoac.endsWith('(12)') && ngoac.includes('(Đặc Biệt)'), String(ngoac));
  const xem = d('Xem menu Món (A) (B)');
  assert.ok(xem === null || xem.includes('(A) (B)'), String(xem));
  // Ten tau ngoai danh sach: giu tieng Viet (null), khong sap
  assert.strictEqual(d('Du thuyền Tàu Lạ'), null);
  assert.strictEqual(d('Giới thiệu tàu Tàu Lạ'), null);
  assert.strictEqual(d('Tàu Tàu Lạ chỉ phục vụ'), null);
});

test('mau cau: canh bao tre em voi so 2 chu so', () => {
  const ctx = taoNgucCanh();
  ctx.__s = 'Theo quy định của tàu, 12 người lớn chỉ được kèm tối đa 10 bé miễn phí. Đơn có 11 bé, Ms Nguyên sẽ thông báo lại phụ phí bổ sung (nếu có).';
  const ra = goi(ctx, 'dichChuoi(__s, "en")');
  assert.ok(ra && ra.includes('12 adults') && ra.includes('at most 10') && ra.includes('11'), String(ra));
  ctx.__s = 'Theo quy định của tàu, 2 người lớn chỉ được kèm 1 trẻ em. Đơn có 12 trẻ em cho 10 người lớn, Ms Nguyên sẽ thông báo lại phụ phí bổ sung (nếu có).';
  const ra2 = goi(ctx, 'dichChuoi(__s, "en")');
  assert.ok(ra2 && ra2.includes('12 children for 10 adults'), String(ra2));
});

// ---------- 6. Email va Zalo ----------
function napDatCho(ngonNgu) {
  global.CAU_HINH = require('../js/cau-hinh.js').CAU_HINH;
  if (ngonNgu === undefined) delete global.layNgonNgu; else global.layNgonNgu = () => ngonNgu;
  delete require.cache[require.resolve('../js/dat-cho.js')];
  return require('../js/dat-cho.js');
}
const { DANH_SACH_TAU, GIA_TRE_EM } = require('../js/du-lieu-tau.js');
const tauQ = DANH_SACH_TAU.find((t) => t.slug === 'indochina-queen');
const don = {
  slugTau: 'indochina-queen', ngay: '2999-12-24', loai: 'buffet', buffetMa: '0:0', nguoiLon: 2, treEm50: 1, treEmMienPhi: 1, mon: {},
  hoTen: 'Anna Smith', soDienThoai: '0392082288', email: 'a@b.vn', ghiChu: '', vat: false, dongY: true,
  congTy: { ten: '', mst: '', diaChi: '', email: '' }, taiKhoan: 'caNhan', maDon: 'VT261014ABCD'
};

test('email: co truong "Ngon ngu khach" dung cho en va vi', () => {
  try {
    const en = napDatCho('en').taoDuLieuEmail(don, tauQ, GIA_TRE_EM, null, '');
    assert.ok(/English/.test(en['Ngôn ngữ khách']), en['Ngôn ngữ khách']);
    const vi = napDatCho('vi').taoDuLieuEmail(don, tauQ, GIA_TRE_EM, null, '');
    assert.strictEqual(vi['Ngôn ngữ khách'], 'Tiếng Việt');
    const khong = napDatCho(undefined).taoDuLieuEmail(don, tauQ, GIA_TRE_EM, null, '');
    assert.strictEqual(khong['Ngôn ngữ khách'], 'Tiếng Việt');
    assert.strictEqual(en['Mã đơn'], 'VT261014ABCD');
    assert.ok(en._subject.startsWith('Đặt chỗ mới'), 'email van tieng Viet');
  } finally { delete global.layNgonNgu; }
});

test('zalo: dong English-speaking guest chi co khi khach dung en, o dau tin nhan', () => {
  try {
    const en = napDatCho('en').soanTinNhanDatCho(don, tauQ, GIA_TRE_EM, null);
    assert.ok(en.split('\n')[0].startsWith('[English-speaking guest'), en.split('\n')[0]);
    assert.ok(en.includes('Xin chào Ms Nguyên'), 'noi dung van tieng Viet');
    const vi = napDatCho('vi').soanTinNhanDatCho(don, tauQ, GIA_TRE_EM, null);
    assert.ok(!vi.includes('English-speaking'));
    assert.ok(vi.startsWith('Xin chào Ms Nguyên'));
    const khong = napDatCho(undefined).soanTinNhanDatCho(don, tauQ, GIA_TRE_EM, null);
    assert.ok(!khong.includes('English-speaking'));
  } finally { delete global.layNgonNgu; }
});

// ---------- 7. Giao dien ----------
const CAC_TRANG = ['index.html', 'dat-cho.html', 'chinh-sach.html', 'kiem-tra-ve.html', 'xac-nhan.html']
  .concat(fs.readdirSync(path.join(GOC, 'tau')).filter((f) => f.endsWith('.html')).map((f) => 'tau/' + f));

test('giao dien: khong con .diem-manh va .dai-uy-tin trong HTML, CSS, JS', () => {
  for (const t of CAC_TRANG) assert.ok(!/diem-manh|dai-uy-tin/.test(doc(t)), t);
  assert.ok(!/diem-manh|dai-uy-tin/.test(doc('css/style.css')), 'css/style.css');
  for (const f of ['js/hien-thi.js', 'js/dat-cho.js', 'cong-cu/tao-trang.js']) assert.ok(!/diem-manh|dai-uy-tin/.test(doc(f)), f);
});

test('giao dien: nut VI/EN nam giua logo va menu o moi trang', () => {
  for (const t of CAC_TRANG) {
    const h = doc(t);
    const logo = h.indexOf('data-logo="header"');
    const ngon = h.indexOf('class="chon-ngon-ngu"');
    const menu = h.indexOf('class="menu-chinh"');
    assert.ok(logo > -1 && ngon > -1 && menu > -1, t);
    assert.ok(logo < ngon && ngon < menu, t + ': thu tu logo < VI/EN < menu');
    assert.ok(h.includes('data-ngon-ngu="vi"') && h.includes('data-ngon-ngu="en"'), t);
    assert.strictEqual(h.split('class="chon-ngon-ngu"').length - 1, 1, t + ': chi 1 cum nut');
  }
});

test('giao dien: logo header la PNG ton tai that va trong suot', () => {
  const ch = require('../js/cau-hinh.js').CAU_HINH;
  assert.ok(/\.png$/i.test(ch.logo.header), ch.logo.header);
  assert.ok(/\.png$/i.test(ch.logo.footer), ch.logo.footer);
  const file = path.join(GOC, ch.logo.header);
  assert.ok(fs.existsSync(file), 'file logo ton tai');
  const buf = fs.readFileSync(file);
  assert.strictEqual(buf.slice(1, 4).toString(), 'PNG');
  const loaiMau = buf[25];
  assert.ok(loaiMau === 6 || loaiMau === 4 || buf.includes('tRNS'), 'PNG co kenh trong suot, colour type=' + loaiMau);
});

test('giao dien: footer co 3 nut MXH (Facebook, Zalo, TikTok); link rong thi an', () => {
  const ch = require('../js/cau-hinh.js').CAU_HINH;
  for (const t of CAC_TRANG) {
    const h = doc(t);
    const khoi = h.slice(h.indexOf('class="mang-xa-hoi"'), h.indexOf('</footer>'));
    const nut = [...khoi.matchAll(/<a class="nut-mxh nut-mxh-(\w+)([^>]*)>/g)];
    assert.deepStrictEqual(nut.map((m) => m[1]), ['facebook', 'zalo', 'tiktok'], t);
    for (const m of nut) {
      const coLink = !!ch.mangXaHoi[m[1]];
      const bi = /\bhidden\b/.test(m[2]);
      assert.strictEqual(bi, !coLink, `${t}: ${m[1]} ${coLink ? 'co link phai hien' : 'link rong phai an'}`);
      if (coLink) assert.ok(m[2].includes(`href="${ch.mangXaHoi[m[1]]}"`), t + ': href ' + m[1]);
      else assert.ok(m[2].includes('href="#"') && m[2].includes('data-mxh-trong'), t);
    }
  }
});

test('giao dien: script tu-dien-en.js roi ngon-ngu.js nap truoc cac script js/ khac o moi trang', () => {
  for (const t of CAC_TRANG) {
    const h = doc(t);
    const dsScript = [...h.matchAll(/<script[^>]*\ssrc="([^"]+)"/g)].map((m) => m[1]);
    const cuaMinh = dsScript.filter((s) => /(^|\/)js\//.test(s));
    assert.ok(cuaMinh[0].includes('tu-dien-en.js') && cuaMinh[1].includes('ngon-ngu.js'), t + ': ' + cuaMinh.join(','));
  }
});

// ---------- 8. xoaLoiKhiSua ----------
// Khong dung duoc DOM that cho ganSuKienDatCho (phu thuoc qua nhieu), nen cat nguyen van hai ham xoaLoiTruong + xoaLoiKhiSua
// tu js/dat-cho.js (cung laNgayCoThat, ngayHomNayDiaPhuong) va CHAY trong vm voi DOM gia: kiem hanh vi, khong chi doc ma.
function taoXoaLoi() {
  const js = doc('js/dat-cho.js');
  const dau = js.indexOf('  function xoaLoiTruong(ten)');
  const cuoi = js.indexOf("form.addEventListener('input', xoaLoiKhiSua);");
  assert.ok(dau > -1 && cuoi > dau, 'tim thay xoaLoiKhiSua trong dat-cho.js');
  const maHam = js.slice(dau, cuoi);
  const oLoi = {};
  const goc = {
    querySelector(sel) {
      const m = /data-loi="([^"]+)"/.exec(sel);
      return m ? oLoi[m[1]] || null : null;
    }
  };
  for (const ten of ['ngay', 'mon', 'dongY', 'hoTen', 'soDienThoai', 'email', 'slugTau']) {
    const cha = { classList: { daXoa: false, remove(c) { if (c === 'co-loi') this.daXoa = true; } } };
    oLoi[ten] = { textContent: 'Có lỗi ' + ten, parentNode: cha };
  }
  const ctx = vm.createContext({ goc, Date, String });
  const nguon = (ten) => { const i = js.indexOf('function ' + ten + '('); return js.slice(i, js.indexOf('\n}\n', i) + 3); };
  vm.runInContext(nguon('laNgayCoThat') + nguon('ngayHomNayDiaPhuong') + maHam + '\nthis.xoaLoiKhiSua = xoaLoiKhiSua;', ctx);
  return { ctx, oLoi };
}
const sk = (name, value, checked) => ({ target: { name, value, checked } });
const daTat = (o) => o.textContent === '' && o.parentNode.classList.daXoa;

test('xoaLoiKhiSua: chon ngay hop le (tu hom nay tro di) thi tat loi ngay', () => {
  const { ctx, oLoi } = taoXoaLoi();
  const homNay = vm.runInContext('ngayHomNayDiaPhuong(new Date())', ctx);
  ctx.xoaLoiKhiSua(sk('ngay', homNay));
  assert.ok(daTat(oLoi.ngay), 'hom nay hop le');
  const b = taoXoaLoi();
  b.ctx.xoaLoiKhiSua(sk('ngay', '2999-12-24'));
  assert.ok(daTat(b.oLoi.ngay), 'ngay tuong lai hop le');
  assert.ok(!daTat(b.oLoi.hoTen) && !daTat(b.oLoi.mon), 'loi o khac con nguyen');
});

test('xoaLoiKhiSua: ngay qua khu / rong / khong ton tai thi KHONG tat loi ngay', () => {
  for (const v of ['2000-01-01', '', '2999-02-30', 'abc', '2999-13-01']) {
    const { ctx, oLoi } = taoXoaLoi();
    ctx.xoaLoiKhiSua(sk('ngay', v));
    assert.strictEqual(oLoi.ngay.textContent, 'Có lỗi ngay', JSON.stringify(v));
    assert.ok(!oLoi.ngay.parentNode.classList.daXoa, JSON.stringify(v));
  }
});

test('xoaLoiKhiSua: go vao o nao thi loi o do tat; o trong thi giu loi', () => {
  const { ctx, oLoi } = taoXoaLoi();
  ctx.xoaLoiKhiSua(sk('hoTen', 'An'));
  assert.ok(daTat(oLoi.hoTen));
  assert.ok(!daTat(oLoi.soDienThoai) && !daTat(oLoi.email) && !daTat(oLoi.ngay));
  ctx.xoaLoiKhiSua(sk('email', '   '));
  assert.ok(!daTat(oLoi.email), 'chi co khoang trang thi chua tat');
  ctx.xoaLoiKhiSua(sk('email', 'a@b.vn'));
  assert.ok(daTat(oLoi.email));
  ctx.xoaLoiKhiSua(sk('slugTau', 'indochina-queen'));
  assert.ok(daTat(oLoi.slugTau));
});

test('xoaLoiKhiSua: bo tich dongY khong duoc tat loi dongY (checkbox value luon la on)', () => {
  const { ctx, oLoi } = taoXoaLoi();
  ctx.xoaLoiKhiSua(sk('dongY', 'on', false));
  assert.ok(!daTat(oLoi.dongY), 'bo tich thi chua tat');
});

test('xoaLoiKhiSua: dongY tat khi tich; chon mon/nguoi lon tat loi "mon"; vat, ten rong, o la khong lam gi', () => {
  const { ctx, oLoi } = taoXoaLoi();
  ctx.xoaLoiKhiSua(sk('dongY', 'on', true));
  assert.ok(daTat(oLoi.dongY));
  ctx.xoaLoiKhiSua(sk('buffetMa', '0:1'));
  assert.ok(daTat(oLoi.mon));
  const b = taoXoaLoi();
  b.ctx.xoaLoiKhiSua(sk('mon:0:1', '2'));
  assert.ok(daTat(b.oLoi.mon));
  const c = taoXoaLoi();
  c.ctx.xoaLoiKhiSua(sk('nguoiLon', '3'));
  assert.ok(daTat(c.oLoi.mon));
  const d = taoXoaLoi();
  d.ctx.xoaLoiKhiSua(sk('vat', 'on', true));
  d.ctx.xoaLoiKhiSua({ target: {} });
  d.ctx.xoaLoiKhiSua({});
  d.ctx.xoaLoiKhiSua(sk('khongCoO', 'x'));
  for (const k of Object.keys(d.oLoi)) assert.ok(!daTat(d.oLoi[k]), k);
});

// ---------- 9. Truong hop that bai (duong loi) ----------
test('that bai: nut chu rong / khoang trang / null, ngon ngu la khong lam hong du lieu', () => {
  const ctx = taoNgucCanh();
  const a = chu('   '), b = chu(''), c = chu(null);
  ctx.__goc = the('P', {}, [a, b, c]);
  assert.doesNotThrow(() => goi(ctx, "dichVung(__goc, 'en')"));
  assert.strictEqual(a.nodeValue, '   ');
  assert.strictEqual(b.nodeValue, '');
  assert.strictEqual(c.nodeValue, null);
  const nut = chu('Đặt chỗ');
  ctx.__goc2 = the('P', {}, [nut]);
  goi(ctx, "dichVung(__goc2, 'fr')");
  assert.strictEqual(nut.nodeValue, 'Đặt chỗ', 'ngon ngu khong ho tro thi giu nguyen');
});
