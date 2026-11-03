// Mô phỏng 100 khách đặt trong 10 phút trên Sheet giả lập (không đụng Google Sheet thật).
const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function taoSheet(toiDaLan) {
  const tabs = {};
  const tab = () => {
    const o = { o: [], getLastRow() { return o.o.length; }, clear() { o.o = []; },
      getRange(a, b, c, d) {
        if (typeof a === 'string') return { setValue() { return this; }, setNumberFormat() { return this; }, setFontWeight() { return this; }, setValues(v) { v.forEach((r, i) => { o.o[1 + i] = r.slice(); }); return this; }, setDataValidation() { return this; } };
        const dong = a, cot = b, soDong = c || 1, soCot = d || 1;
        return {
          setValues(v) { for (let i = 0; i < soDong; i++) { o.o[dong - 1 + i] = o.o[dong - 1 + i] || []; for (let j = 0; j < soCot; j++) o.o[dong - 1 + i][cot - 1 + j] = v[i][j]; } return this; },
          setValue(v) { o.o[dong - 1] = o.o[dong - 1] || []; o.o[dong - 1][cot - 1] = v; return this; },
          setNumberFormat() { return this; }, setFontWeight() { return this; },
          getValues() { const ra = []; for (let i = 0; i < soDong; i++) ra.push((o.o[dong - 1 + i] || []).slice(cot - 1, cot - 1 + soCot)); return ra; }
        };
      },
      getDataRange() { return { getValues: () => o.o.map((r) => (r || []).slice()) }; },
      appendRow(r) { o.o.push(r.slice()); }, setColumnWidth() {}, setFrozenRows() {}
    };
    return o;
  };
  const ss = { setSpreadsheetTimeZone() {}, getSheetByName: (t) => tabs[t] || null, insertSheet: (t) => (tabs[t] = tab(t)) };
  const kt = { requireValueInList() { return this; }, setAllowInvalid() { return this; }, build() { return {}; } };
  const cache = {};
  const ctx = {
    SpreadsheetApp: { getActive: () => ss, newDataValidation: () => kt, getUi: () => ({}), flush() {} },
    CacheService: { getScriptCache: () => ({ get: (k) => (k in cache ? cache[k] : null), put: (k, v) => { cache[k] = v; }, remove: (k) => { delete cache[k]; } }) },
    ScriptApp: { getProjectTriggers: () => [], newTrigger: () => ({ timeBased: () => ({ everyMinutes: () => ({ create() {} }) }) }) },
    LockService: { getScriptLock: () => ({ tryLock: () => true, releaseLock() {} }) },
    ContentService: { MimeType: { JSON: 'json' }, createTextOutput: (s) => ({ s, setMimeType() { return this; } }) },
    MailApp: { sendEmail(o) { (ctx.thu = ctx.thu || []).push(o); } },
    Utilities: {
      getUuid: () => '12345678-1234-1234-1234-123456789abc',
      formatDate: (d, _tz, mau) => {
        const v = new Date(d.getTime() + 7 * 3600e3); const h = (n) => String(n).padStart(2, '0');
        const ngay = v.getUTCFullYear() + '-' + h(v.getUTCMonth() + 1) + '-' + h(v.getUTCDate());
        return mau === 'yyyy-MM-dd' ? ngay : h(v.getUTCDate()) + '/' + h(v.getUTCMonth() + 1) + '/' + v.getUTCFullYear() + ' ' + h(v.getUTCHours()) + ':' + h(v.getUTCMinutes());
      }
    },
    Date, JSON, Math, Number, String, Object, isNaN, parseInt
  };
  vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'cong-cu/google-sheet/lich-cho.gs'), 'utf8'), ctx);
  ctx.caiDat();
  if (toiDaLan) for (const r of tabs['Cài đặt'].o) if (r && r[0] === 'Tối đa lượt giữ chỗ mỗi 10 phút (toàn web)') r[1] = toiDaLan;
  return {
    ctx, tabs,
    post: (d) => JSON.parse(ctx.doPost({ postData: { contents: JSON.stringify(d) } }).s),
    get: (p) => JSON.parse(ctx.doGet({ parameter: p }).s)
  };
}
const vn = new Date(Date.now() + 7 * 3600e3);
const MA = 'VT' + String(vn.getUTCFullYear() % 100).padStart(2, '0') + String(vn.getUTCMonth() + 1).padStart(2, '0') + String(vn.getUTCDate()).padStart(2, '0');
const TAU = ['indochina-star', 'ben-nghe', 'indochina-queen', 'elite-of-saigon', 'saigon-princess', 'ben-thanh-princess'];
const ma = (i) => MA + 'L' + String(i).padStart(3, '0');
const sdt = (i) => '09' + String(10000000 + i);

function chay100(s) {
  const kq = { giu: 0, ban: 0, khac: 0, email: 0 };
  for (let i = 0; i < 100; i++) {
    const r = s.post({ action: 'giu', maDon: ma(i), tau: TAU[i % 6], ngay: '2099-03-10', nguoiLon: 2, treEm: 0, beMienPhi: 0, hoTen: 'Khach ' + i, sdt: sdt(i) });
    if (r.ok) { kq.giu++; s.post({ action: 'daChuyen', maDon: ma(i), sdt: sdt(i) }); } else if (r.loi === 'ban') kq.ban++; else kq.khac++;
    if (s.post({ action: 'email', maDon: ma(i), duLieu: { 'Mã đơn': ma(i) } }).ok) kq.email++;
  }
  return kq;
}

test('100 don trong 10 phut, cai dat mac dinh (30 luot): 30 don giu cho tu dong, 70 don bao chua giu duoc; email du phong toi da 50', () => {
  const s = taoSheet();
  const kq = chay100(s);
  assert.deepStrictEqual(kq, { giu: 30, ban: 70, khac: 0, email: 50 }, JSON.stringify(kq));
});

test('100 don trong 10 phut, tang gioi han len 200 luot va 100 email: ca 100 don vao Sheet, trang thai dung', () => {
  const s = taoSheet(200);
  vm.runInContext('TOI_DA_EMAIL_10_PHUT = 100;', s.ctx);
  const kq = chay100(s);
  assert.deepStrictEqual(kq, { giu: 100, ban: 0, khac: 0, email: 100 });
  assert.strictEqual(s.tabs['Đơn giữ chỗ'].o.length - 1, 100);
  for (let i = 0; i < 100; i += 17) assert.deepStrictEqual(s.get({ action: 'trangThai', maDon: ma(i) }), { ok: true, trangThai: 'cho' });
  s.ctx.capNhatTongHop();
  const tong = s.tabs['Tổng hợp'].o;
  assert.deepStrictEqual(tong[0].slice(0, 7), ['Ngày', 'Indochina Star', 'Bến Nghé', 'Indochina Queen', 'Elite of Saigon', 'Saigon Princess', 'Bến Thành Princess']);
  assert.strictEqual(tong.length - 1, 45);
});
