# Vé Tàu Sài Gòn

Web đặt vé du thuyền ăn tối trên sông Sài Gòn của **Công ty TNHH Nguyên Nguyên Global** (Đại lý chính thức).
Gồm 6 tàu: Indochina Star, Bến Nghé, Indochina Queen, Elite of Saigon, Saigon Princess và Bến Thành Princess.

Web tĩnh, chỉ dùng HTML, CSS và JavaScript thuần. Không cần cài thư viện và không cần build.

## Mở bằng VS Code

1. Mở VS Code, chọn **File → Open Folder…**, rồi chọn thư mục `WebTau`.
2. VS Code sẽ gợi ý cài tiện ích **Live Server**. Bấm **Install**.
3. Mở file `index.html`, bấm **Go Live** ở góc dưới bên phải. Web mở ở `http://127.0.0.1:5500`.
   Live Server tự tải lại trang mỗi khi lưu file.

Chưa cài Live Server thì có thể dùng menu **Terminal → Run Task… → Mở web trên máy**, rồi vào `http://localhost:8080`.

> Nên xem web qua Live Server hoặc localhost thay vì bấm đúp mở file HTML. Khi xem trên máy như vậy, mọi ô ảnh còn thiếu sẽ ghi rõ **tên file cần đưa vào**.

## Đưa ảnh vào

Chép ảnh vào thư mục `anh/` theo **đúng tên file**. Web tự hiện ảnh, không cần sửa code.

| Ảnh | Đặt vào |
|---|---|
| Logo bên trái header | `anh/logo/logo.png` (chưa có thì dùng biểu tượng con tàu) |
| Logo Nguyên Nguyên Travel (góc phải header + chân trang) | `anh/logo/logo-nguyen-nguyen.jpg` (đã có) |
| Ảnh bìa trang chủ (tự chuyển) | `anh/bia/bia-01.jpg` … `bia-04.jpg` |
| Ảnh đại diện từng tàu | `anh/<tàu>/dai-dien.jpg` |
| Thư viện ảnh tàu | `anh/<tàu>/tau-01.jpg` … `tau-08.jpg` |
| Ảnh menu từng món | `anh/<tàu>/menu/<món>.jpg`, ví dụ `anh/indochina-queen/menu/set-indo7.jpg` |
| Ảnh khuyến mãi | `anh/elite-of-saigon/khuyen-mai-mid-week-chill.jpg` |

- Danh sách đầy đủ tên file của từng thư mục: [anh/README.md](anh/README.md).
- Xem ảnh nào đã có, ảnh nào còn thiếu, ảnh nào quá nặng: **Terminal → Run Task… → Kiểm tra ảnh còn thiếu**. Hoặc chạy lệnh `node cong-cu/kiem-tra-anh.js`.
- Ảnh dùng JPG, mỗi ảnh nhỏ hơn 500KB, rộng tối đa 1600px.
- Muốn dùng tên file khác, hoặc thêm hay bớt ảnh thì sửa trong `js/cau-hinh.js`.
- Thêm `dai-dien.jpg` xong thì chạy **Tạo lại các trang HTML**, để link chia sẻ Zalo hoặc Facebook có ảnh xem trước.
- Ảnh cũ (đã bị gán sai tàu) nằm trong `anh-cu/` để tham khảo. Web không dùng các ảnh này.

## Sửa nội dung

| Muốn sửa | File |
|---|---|
| Ảnh, logo, tài khoản ngân hàng, giới thiệu công ty, tên miền | `js/cau-hinh.js` |
| Giới thiệu ngắn, điểm nổi bật, giá, thực đơn, giờ chạy, lộ trình, chính sách trẻ em của từng tàu | `js/du-lieu-tau.js` (mảng `DANH_SACH_TAU`, trường `gioiThieu` và `noiBat`) |
| Mốc tuổi ở ô đếm trẻ em | `js/du-lieu-tau.js` (`GIA_TRE_EM`) |
| Chính sách chung: điều kiện vé, đổi trả, hướng dẫn, lưu ý | `js/du-lieu-tau.js` (`CHINH_SACH_CHUNG`) |
| Header, footer, nội dung cố định của các trang | `cong-cu/tao-trang.js`, sửa xong chạy **Tạo lại các trang HTML** |
| Giao diện, màu sắc | `css/style.css` (màu chính khai ở đầu file, trong `:root`) |

Sửa xong bất kỳ file nào trong `js/` hoặc `css/`, chạy **Tạo lại các trang HTML** để web gắn mã phiên bản mới. Nếu không, trình duyệt của khách có thể vẫn dùng bản cũ trong bộ nhớ đệm, và `npm test` sẽ nhắc.

**Set menu Bến Nghé:** có sẵn khung mẫu (đang để dạng chú thích) trong `js/du-lieu-tau.js`, ngay dưới bảng Buffet của Bến Nghé. Bỏ dấu `//`, điền tên và giá.

Thêm món vào bảng giá thì cũng thêm ô ảnh của món đó vào `anhThucDon` trong `js/cau-hinh.js`. Tên món phải khớp đúng với bảng giá.

## Cấu trúc

```
index.html            Trang chủ
tau/*.html            Trang từng tàu (thực đơn Buffet / Set menu, lịch trình, chính sách)
dat-cho.html          Đặt chỗ 3 bước: dịch vụ → liên hệ (VAT) → thanh toán chuyển khoản
xac-nhan.html         Trang của Ms Nguyên: kiểm tra tiền, ký số và tạo phiếu "Đã thanh toán"
kiem-tra-ve.html      Nhân viên quét QR trên phiếu: báo vé hợp lệ / không hợp lệ
chinh-sach.html       Chính sách trẻ em, điều kiện vé, đổi trả, hướng dẫn sử dụng vé
js/cau-hinh.js        Ảnh, logo, tài khoản, tên miền
js/du-lieu-tau.js     Dữ liệu 6 tàu và chính sách
js/hien-thi.js        Dựng trang chủ, trang tàu, xem ảnh, ảnh thay thế
js/dat-cho.js         Đặt chỗ, tính tiền, mã QR, email, phiếu xác nhận
js/xac-thuc.js        Chữ ký số (ECDSA P-256) cho phiếu và trang kiểm tra vé
css/style.css         Giao diện
cong-cu/              tao-trang.js (tạo lại HTML), kiem-tra-anh.js (kiểm tra ảnh)
tests/                Kiểm thử tự động (npm test)
anh/                  Ảnh của web, theo quy ước tên file ở trên
```

## Quy trình đặt vé

1. Khách chọn tàu, chọn Buffet hoặc Set menu, chọn món và số khách. Tiền trẻ em được tính theo chính sách của từng tàu.
2. Khách điền liên hệ và email nhận vé. Cần hóa đơn VAT thì điền thông tin công ty.
3. Web hiện mã VietQR có sẵn số tiền và nội dung chuyển khoản. Không VAT thì chuyển vào tài khoản cá nhân, có VAT thì chuyển vào tài khoản công ty.
4. Khách bấm "Tôi đã chuyển khoản". Đơn được gửi email tới Ms Nguyên qua FormSubmit, **khách không thấy phiếu**.
5. Ms Nguyên mở link trong email (`xac-nhan.html#…`), kiểm tra tiền đã vào, rồi tạo phiếu "Đã thanh toán". Tải phiếu dạng ảnh hoặc PDF, gửi cho khách kèm code vé điện tử.

**Email đơn không tới** (FormSubmit lỗi hoặc chưa kích hoạt): mở `dat-cho.html?ms=1` (chế độ Ms Nguyên), nhập lại đơn theo tin nhắn Zalo của khách,
tới bước thanh toán, điền **mã đơn của khách** rồi bấm "Mở trang xác nhận đơn này".

## Chống làm giả phiếu (chữ ký số + mã QR)

Mỗi phiếu "Đã thanh toán" được **ký số** bằng khoá bí mật chỉ có trên máy Ms Nguyên, và in kèm **mã QR**.
Nhân viên tàu quét mã QR bằng camera điện thoại sẽ mở trang `kiem-tra-ve.html`. Trang này báo:
- **VÉ HỢP LỆ**: kèm tàu, ngày, họ tên, số khách, mã đơn, code vé để đối chiếu.
- **KHÔNG HỢP LỆ**: phiếu bị sửa bất kỳ chi tiết nào, hoặc phiếu tự làm.

Không có khoá bí mật thì không ai tạo được chữ ký hợp lệ.

**Cài khoá (làm một lần, trên máy Ms Nguyên):**
1. Mở trang xác nhận **trên web thật**: https://vetausaigon.vn/xac-nhan.html. Không làm trên localhost, vì khoá lưu theo từng địa chỉ web.
2. Ở mục **Khoá ký phiếu**, bấm **Tạo khoá ký phiếu**. Web tải về file `khoa-bi-mat-ms-nguyen.json`.
   **Cất kỹ file này** (USB hoặc Google Drive riêng). Không gửi cho ai, không đưa lên GitHub. File đã được chặn trong `.gitignore`.
3. Web hiện một dòng `khoaCongKhai: {...},`. Mở `js/cau-hinh.js` trong VS Code, thay dòng `khoaCongKhai: null,` bằng dòng đó.
4. Chạy **Tạo lại các trang HTML**, rồi chạy `npm test` và push lên GitHub.

**Dùng hằng ngày:** tích "đã nhận đủ tiền" rồi bấm "Tạo phiếu", phiếu tự được ký. Dùng máy khác thì bấm **Nạp khoá từ file** và chọn file sao lưu.

**Mất hoặc lộ file khoá:**
1. Ở mục "Khoá ký phiếu", bấm **Tạo khoá mới (khi mất/lộ khoá)** rồi xác nhận. Web tải về file khoá mới.
2. Web hiện dòng `khoaCongKhai` mới. Dán dòng đó thay dòng cũ trong `js/cau-hinh.js`, tạo lại trang rồi push lên GitHub.
3. Trong lúc chờ push xong, web chặn không cho ký phiếu, vì khoá trên máy chưa khớp với web.
4. Từ khi đổi khoá, các phiếu ký bằng khoá cũ sẽ báo không hợp lệ. Cần gửi lại phiếu mới cho khách sắp đi.

**Khoá lưu trên máy thế nào:** trình duyệt giữ khoá ở dạng **không đọc ra được** (CryptoKey trong IndexedDB): chỉ dùng được để ký, kể cả trang khác trên cùng github.io cũng không đọc được nội dung khoá. Vì vậy hãy cất file sao lưu cẩn thận, vì đó là bản duy nhất đọc ra được. Không nên dùng máy chung, cũng không nên cài tiện ích trình duyệt lạ trên máy ký phiếu.

**Giới hạn:** web tĩnh không chặn được việc một phiếu thật bị chụp lại và dùng hai lần. Khi khách **đổi ngày**, phiếu cũ vẫn báo hợp lệ cho ngày cũ (trang kiểm tra hiện rõ ngày đi, và báo khi ngày đó không phải hôm nay).
Vì vậy nhân viên vẫn đối chiếu tên, ngày đi, và code vé điện tử của tàu.
Muốn web tự xác nhận ngay khi tiền vào tài khoản thì cần nối thêm cổng thanh toán có máy chủ (SePay, PayOS).

## Kiểm thử

```
npm test
```

Cần cài Node.js. Nên chạy test trước mỗi lần đưa code lên GitHub.

## Đưa lên mạng (GitHub Pages)

Kho code: https://github.com/TrongHai14/VeTauSaiGon. Bật GitHub Pages ở **Settings → Pages**: chọn nhánh `master`, thư mục `/ (root)`.
Web sẽ chạy ở https://vetausaigon.vn/. Mỗi lần push lên `master`, web tự cập nhật.

Trước khi cho khách dùng, phải kích hoạt FormSubmit: gửi thử một đơn trên web thật, rồi bấm **Activate** trong email FormSubmit gửi tới bookingindochinaqueen@gmail.com.

## Dây chuyền 4 agent (Claude Code)

`.claude/agents/` có planner, coder, tester và reviewer. Lệnh `/ship <yêu cầu>` chạy lần lượt cả 4. Lệnh này không chạy trên nhánh `master`, nên phải tạo nhánh mới trước, ví dụ `git checkout -b tinh-nang-moi`.

## Tên miền vetausaigon.vn

- File `CNAME` ở thư mục gốc chứa `vetausaigon.vn`. File này báo cho GitHub Pages biết web chạy ở tên miền đó, đừng xoá.
- DNS của tên miền đang quản lý ở **Cloudflare**. Cần có các bản ghi sau, tất cả để **DNS only** (đám mây màu xám):

| Loại | Tên | Giá trị |
|---|---|---|
| A | `@` | `185.199.108.153` |
| A | `@` | `185.199.109.153` |
| A | `@` | `185.199.110.153` |
| A | `@` | `185.199.111.153` |
| CNAME | `www` | `tronghai14.github.io` |

- Trên GitHub, vào **Settings → Pages**: mục Custom domain phải là `vetausaigon.vn`. Khi GitHub cấp chứng chỉ xong (vài phút đến vài giờ), tích **Enforce HTTPS**.
- Đổi tên miền thì sửa `tenMien` trong `js/cau-hinh.js` và file `CNAME`, chạy **Tạo lại các trang HTML** rồi push.
