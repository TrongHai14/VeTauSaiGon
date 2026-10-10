# Hướng dẫn đưa ảnh, logo, mã QR vào web

Ngắn gọn: **chép ảnh vào `anh/` đúng tên file là web tự hiện.** Danh sách tên file của từng thư mục có trong [anh/README.md](../anh/README.md).

## 1. Cách làm

1. Mở dự án bằng VS Code, xem web bằng Live Server. Cách làm có trong [README.md](../README.md).
2. Ô nào chưa có ảnh thì hiện khung xanh, trên đó ghi **"Đưa ảnh vào: anh/…/….jpg"**. Dòng này chỉ hiện khi xem trên máy. Trên web thật, khung chỉ ghi "Hình ảnh đang cập nhật".
3. Đổi tên ảnh cho đúng tên ghi trên khung, chép vào đúng thư mục, rồi lưu. Live Server tự tải lại, ảnh hiện ngay.
4. Chạy **Terminal → Run Task… → Kiểm tra ảnh còn thiếu** để xem còn thiếu ảnh nào, có ảnh nào quá nặng.

Quy ước:
- Tên file viết thường, không dấu, không khoảng trắng. `set-indo7.jpg` là đúng, `Set INDO 7.JPG` là sai.
- Ảnh JPG, mỗi ảnh nhỏ hơn **500KB**, rộng tối đa 1600px. Có thể nén ảnh bằng https://squoosh.app.
- Logo dùng PNG nền trong suốt.

## 2. Từng loại ảnh

| Ảnh | Tên file | Gợi ý chọn ảnh |
|---|---|---|
| Logo header | `anh/logo/logo.png` | Logo màu, cao khoảng 120–160px. Hiện cao 40px. |
| Logo footer | `anh/logo/logo-trang.png` | Logo màu trắng cho nền xanh đậm. Không có thì web dùng logo header. |
| Ảnh bìa | `anh/bia/bia-01.jpg` … `bia-04.jpg` | Ảnh ngang ≥ 1600px, tàu ban đêm, chủ thể nằm phía trên hoặc hai bên (chữ và ô tìm kiếm che phần giữa và phía dưới). Tự chuyển mỗi 6 giây. |
| Ảnh đại diện tàu | `anh/<tàu>/dai-dien.jpg` | Ảnh **ngoài tàu** đẹp nhất. Dùng cho thẻ trang chủ, ảnh lớn trang tàu và ảnh xem trước khi chia sẻ link. |
| Thư viện ảnh | `anh/<tàu>/tau-01.jpg` … `tau-08.jpg` | Sảnh, boong, quầy buffet, biểu diễn… Không bắt buộc đủ 8 ảnh. |
| Ảnh menu từng món | `anh/<tàu>/menu/<món>.jpg` | Ảnh thực đơn đúng của món đó. Hiện khi khách bấm "Xem menu". |
| Khuyến mãi | `anh/elite-of-saigon/khuyen-mai-mid-week-chill.jpg` | Poster Mid-week Chill. Số điện thoại trên poster phải đổi thành 0948170036. |

`<tàu>` là một trong: `indochina-star`, `ben-nghe`, `indochina-queen`, `elite-of-saigon`, `saigon-princess`, `ben-thanh-princess`.

Một món muốn có **nhiều ảnh** thì sửa trong `js/cau-hinh.js`, mục `anhThucDon`:

```js
'INDO8': ['anh/indochina-queen/menu/set-indo8.jpg', 'anh/indochina-queen/menu/set-indo8-2.jpg'],
```

Thư viện ảnh muốn nhiều hơn 8 ảnh thì thêm dòng `'anh/<tàu>/tau-09.jpg'` vào `thuVien` của tàu đó.

## 3. Video bìa (không bắt buộc)

Điền `videoBia: 'anh/bia/video-bia.mp4'` trong `js/cau-hinh.js`. File .mp4 dài 10–20 giây, nhỏ hơn 5MB, không cần tiếng. Khi có video thì video thay cho ảnh bìa.

## 4. Mã QR thanh toán

Mặc định web **tự tạo mã VietQR** có sẵn số tiền và nội dung chuyển khoản cho từng đơn, nên không cần ảnh QR.
Chỉ khi muốn dùng ảnh QR của ngân hàng thì điền `anhQR` trong `thanhToan`, ví dụ `'anh/qr/qr-ca-nhan.png'`. Ảnh QR tĩnh không chứa số tiền, nên khách sẽ phải tự nhập số tiền.

## 5. Sau khi thêm ảnh đại diện

Chạy **Tạo lại các trang HTML** (`node cong-cu/tao-trang.js`), để link chia sẻ Zalo hoặc Facebook có ảnh xem trước. Sau đó chạy `npm test` rồi push lên GitHub.

## 6. Còn thiếu dữ liệu (không phải ảnh)

- **Bến Nghé – Set menu**: cần tên từng set và giá mỗi khách. Có rồi thì thêm vào `bangGia` của Bến Nghé trong `js/du-lieu-tau.js`, theo cách ghi của Indochina Queen, và thêm ô ảnh món trong `js/cau-hinh.js`.

## 7. Sửa nội dung chính sách

Nội dung chính sách nằm trong `CHINH_SACH_CHUNG` ở cuối `js/du-lieu-tau.js`. Có 3 chỗ dùng nội dung này: trang `chinh-sach.html`, mục "Điều kiện vé & chính sách" trên trang từng tàu, và phiếu xác nhận. Sửa xong chạy `node cong-cu/tao-trang.js`.
