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
| Logo header / footer | `anh/logo/logo.png`, `anh/logo/logo-trang.png` |
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
| Giá, thực đơn, giờ chạy, lộ trình, chính sách trẻ em của từng tàu | `js/du-lieu-tau.js` (mảng `DANH_SACH_TAU`) |
| Mốc tuổi ở ô đếm trẻ em | `js/du-lieu-tau.js` (`GIA_TRE_EM`) |
| Chính sách chung: điều kiện vé, đổi trả, hướng dẫn, lưu ý | `js/du-lieu-tau.js` (`CHINH_SACH_CHUNG`) |
| Header, footer, nội dung cố định của các trang | `cong-cu/tao-trang.js`, sửa xong chạy **Tạo lại các trang HTML** |
| Giao diện, màu sắc | `css/style.css` (màu chính khai ở đầu file, trong `:root`) |

Thêm món vào bảng giá thì cũng thêm ô ảnh của món đó vào `anhThucDon` trong `js/cau-hinh.js`. Tên món phải khớp đúng với bảng giá.

## Cấu trúc

```
index.html            Trang chủ
tau/*.html            Trang từng tàu (thực đơn Buffet / Set menu, lịch trình, chính sách)
dat-cho.html          Đặt chỗ 3 bước: dịch vụ → liên hệ (VAT) → thanh toán chuyển khoản
xac-nhan.html         Trang của Ms Nguyên: kiểm tra tiền rồi tạo phiếu "Đã thanh toán"
chinh-sach.html       Chính sách trẻ em, điều kiện vé, đổi trả, hướng dẫn sử dụng vé
js/cau-hinh.js        Ảnh, logo, tài khoản, tên miền
js/du-lieu-tau.js     Dữ liệu 6 tàu và chính sách
js/hien-thi.js        Dựng trang chủ, trang tàu, xem ảnh, ảnh thay thế
js/dat-cho.js         Đặt chỗ, tính tiền, mã QR, email, phiếu xác nhận
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

**Lưu ý an toàn:** web tĩnh không có máy chủ, nên phiếu "Đã thanh toán" chỉ để khách lưu lại, **không phải bằng chứng thanh toán**.
Ai biết cách vẫn có thể tự tạo ra một phiếu giống thật. Khi lên tàu, chỉ tin **code vé điện tử** do Ms Nguyên gửi, và luôn đối chiếu tiền trong tài khoản ngân hàng.
Muốn tự động xác nhận khi tiền vào thì cần nối thêm cổng thanh toán có máy chủ (SePay, PayOS).

## Kiểm thử

```
npm test
```

Cần cài Node.js. Nên chạy test trước mỗi lần đưa code lên GitHub.

## Đưa lên mạng (GitHub Pages)

Kho code: https://github.com/TrongHai14/VeTauSaiGon. Bật GitHub Pages ở **Settings → Pages**: chọn nhánh `master`, thư mục `/ (root)`.
Web sẽ chạy ở https://tronghai14.github.io/VeTauSaiGon/. Mỗi lần push lên `master`, web tự cập nhật.

Trước khi cho khách dùng, phải kích hoạt FormSubmit: gửi thử một đơn trên web thật, rồi bấm **Activate** trong email FormSubmit gửi tới bookingindochinaqueen@gmail.com.

## Dây chuyền 4 agent (Claude Code)

`.claude/agents/` có planner, coder, tester và reviewer. Lệnh `/ship <yêu cầu>` chạy lần lượt cả 4. Lệnh này không chạy trên nhánh `master`, nên phải tạo nhánh mới trước, ví dụ `git checkout -b tinh-nang-moi`.
