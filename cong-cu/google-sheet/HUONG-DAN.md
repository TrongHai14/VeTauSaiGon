# Lịch còn chỗ bằng Google Sheet

Nguyên Nguyên là đại lý, nên còn chỗ hay không là do **tàu** quyết định. Web hoạt động như sau:

- **Mặc định mọi ngày đều nhận đặt chỗ.** Khi tàu báo hết chỗ ngày nào, Ms Nguyên mở tab **"Ngày hết chỗ"** và thêm 1 dòng gồm tàu và ngày. Web khoá ngày đó ngay, khách không bấm đặt được nữa.
- **Khách trả trước.** Sau đó Ms Nguyên xác nhận chỗ với tàu. Nếu tàu hết chỗ, Nguyên Nguyên **hoàn 100%** hoặc đổi sang ngày khác. Câu này đã ghi sẵn ở bước thanh toán, trang Chính sách và trang FAQ.
- Mọi đơn đặt trên web đều được ghi vào tab **"Đơn giữ chỗ"**, để Ms Nguyên theo dõi và đối chiếu tiền.
- Nếu sau này tàu cấp **hạn mức riêng** cho đại lý (ví dụ 50 chỗ mỗi ngày): ghi con số đó vào ô **"Số chỗ mỗi ngày"** ở tab Cài đặt. Khi đó web sẽ tự trừ dần, và giữ chỗ 1 tiếng như mô tả bên dưới.

**Các trạng thái của một đơn:**

1. Khách bấm "Tiếp tục" sang bước thanh toán → đơn ở trạng thái **Giữ chỗ** trong **1 tiếng**.
2. Khách chuyển khoản rồi bấm **"Tôi đã chuyển khoản"** → đơn chuyển sang **Chờ xác nhận**. Chỗ được giữ cho tới khi Ms Nguyên kiểm tra, không tự hết hạn nữa.
3. Ms Nguyên thấy tiền đã vào → đổi đơn sang **Đã thanh toán**. Nếu không thấy tiền → đổi sang **Hủy**, chỗ được trả lại.
4. Nếu sau 1 tiếng khách vẫn chưa bấm "Tôi đã chuyển khoản" → chỗ tự trả lại, đơn thành **Hết hạn**.

Phần cài đặt dưới đây chỉ làm **một lần**, mất khoảng 10 phút.

## Bước 1. Dán mã vào Google Sheet

1. Mở Google Sheet của Nguyên Nguyên.
2. Trên menu, chọn **Tiện ích mở rộng → Apps Script**.
3. Xoá hết chữ đang có trong khung soạn thảo.
4. Mở file mã:
   - **Trên máy tính đang có thư mục web:** mở file `cong-cu/google-sheet/lich-cho.gs` bằng VS Code.
   - **Hoặc mở trên trình duyệt:** https://raw.githubusercontent.com/TrongHai14/VeTauSaiGon/master/cong-cu/google-sheet/lich-cho.gs
5. Ở file vừa mở, bấm **Ctrl+A** rồi **Ctrl+C** để chép **toàn bộ nội dung** (khoảng 350 dòng, bắt đầu bằng `/**`). Quay lại Apps Script, bấm **Ctrl+V**.
   ⚠ Không dán đường link vào Apps Script. Dán link sẽ báo lỗi "SyntaxError: Unexpected end of input".
6. Bấm **💾 Lưu** (Ctrl+S).

## Bước 2. Chạy cài đặt lần đầu

> Đã chạy `caiDat` bằng bản mã cũ (ô "Số chỗ mỗi ngày" đang là 50)? Dán bản mã mới, chạy lại `caiDat` để có thêm tab "Ngày hết chỗ", rồi **xoá số 50** ở tab Cài đặt (để trống).

1. Trên thanh công cụ, chọn hàm **caiDat** trong ô danh sách, rồi bấm **▶ Chạy**.
2. Google sẽ hỏi quyền: bấm **Xem lại quyền** và chọn tài khoản Gmail của bạn.
3. Nếu hiện "Google chưa xác minh ứng dụng này": bấm **Nâng cao → Chuyển tới … (không an toàn) → Cho phép**. Thông báo này hiện ra vì đây là mã do chính bạn tạo.
4. Quay lại Google Sheet, bạn sẽ thấy 4 tab mới: **Cài đặt**, **Số chỗ riêng**, **Đơn giữ chỗ** và **Tổng hợp**. Tải lại trang Sheet thì sẽ có thêm menu **Vé Tàu**.

## Bước 3. Đưa lên làm "Web App"

1. Trong Apps Script, bấm **Triển khai → Tùy chọn triển khai mới**.
2. Bấm biểu tượng ⚙ cạnh "Chọn loại", chọn **Ứng dụng web**.
3. Chọn **Thực thi dưới dạng: Tôi** và **Người có quyền truy cập: Bất kỳ ai**. Khách chỉ nhận được câu trả lời còn chỗ hay hết chỗ, không xem được Sheet.
4. Bấm **Triển khai**, rồi chép **URL ứng dụng web**. Link có dạng `https://script.google.com/macros/s/…/exec`.
5. Gửi link này cho người làm web, để dán vào `lichChoOnline.url` trong `js/cau-hinh.js`.

## Bước 4. Khoá Sheet lại (bắt buộc)

Sheet chứa tên và số điện thoại khách, nên phải khoá lại.

1. Bấm **Chia sẻ**.
2. Ở **Quyền truy cập chung**, đổi sang **Bị hạn chế**.
3. Thêm email của Ms Nguyên với quyền **Người chỉnh sửa**.

Web vẫn chạy bình thường sau khi khoá.

## Dùng hằng ngày

| Tab | Dùng để |
|---|---|
| **Ngày hết chỗ** | Tàu báo hết chỗ thì thêm 1 dòng: chọn tàu, gõ ngày (2026-12-24 hoặc 24/12/2026). Mở lại ngày đó thì xoá dòng. |
| **Cài đặt** | Số chỗ mỗi ngày (**để trống** = không giới hạn; chỉ ghi số khi tàu cấp hạn mức). Số giờ giữ chỗ chờ chuyển khoản (1). Có tính bé miễn phí vào số chỗ không. **Mã quản lý**. Chặn đặt khi đã sát giờ tàu chạy. Tối đa khách mỗi đơn online (20). Số đơn chờ tối đa của mỗi SĐT (2). Số lượt giữ chỗ tối đa trong 10 phút (30). |
| **Số chỗ riêng** | Chỉ dùng khi có hạn mức: tàu, ngày, số chỗ riêng của ngày đó. Muốn đóng ngày thì dùng tab "Ngày hết chỗ". |
| **Đơn giữ chỗ** | Đơn khách đặt trên web sẽ tự hiện ở đây. |
| **Tổng hợp** | Bấm menu **Vé Tàu → Xem chỗ còn lại 45 ngày tới** để xem mỗi tàu còn bao nhiêu chỗ. Số **âm** nghĩa là đang bán vượt số chỗ, cần kiểm tra với tàu. |

**Khi Ms Nguyên kiểm tra tiền:**

- Ở trang xác nhận đơn (link trong email), nhập **Mã quản lý** một lần, máy sẽ tự nhớ. Tạo phiếu xong, web tự đổi đơn sang **Đã thanh toán**.
- Không nhập mã thì tự đổi trạng thái trong cột **Trạng thái** của Sheet.
- Nếu web báo đơn đã quá hạn và ngày đó đang **vượt chỗ**, kiểm tra lại với tàu trước khi gửi phiếu cho khách.

**Đơn khách đặt qua điện thoại hoặc Zalo không tự vào Sheet.** Thêm một dòng bằng tay:

- Tàu: chọn trong danh sách.
- Ngày đi: gõ 2026-12-24 hoặc 24/12/2026.
- Số người lớn và trẻ em. Ô Số chỗ để trống cũng được, Sheet sẽ tự cộng.
- Trạng thái: **Đã thanh toán** hoặc **Chờ xác nhận**.

Cột **Ngày đi** và **SĐT** đang để dạng chữ, đừng đổi định dạng hai cột này.

## Khi bị spam (có người đặt bừa làm hết chỗ ảo)

- Web đã có sẵn các giới hạn: mỗi đơn online tối đa 20 khách; mỗi số điện thoại giữ tối đa 2 đơn chưa chuyển khoản; toàn web tối đa 30 lượt giữ chỗ trong 10 phút. Chỗ bị giữ ảo cũng tự trả lại sau 1 tiếng.
- Muốn trả chỗ ngay:
  - Menu **Vé Tàu → Hủy các đơn chưa thanh toán của một SĐT**, nhập số điện thoại cần hủy. Lệnh này hủy cả đơn "Giữ chỗ" lẫn "Chờ xác nhận" của số đó.
  - Hoặc **Vé Tàu → Hủy TẤT CẢ đơn "Giữ chỗ"**. Lệnh này không đụng tới đơn "Chờ xác nhận" và "Đã thanh toán".
- Đơn **"Chờ xác nhận"** mà không có email đặt chỗ đi kèm, hoặc kiểm tra không thấy tiền vào, thì đổi sang **Hủy**. Đơn đã Hủy thì không ai bấm "đã chuyển khoản" để làm nó sống lại được nữa.
- Bị spam bằng nhiều số điện thoại khác nhau: ở tab **Đơn giữ chỗ**, bấm **Dữ liệu → Tạo bộ lọc**. Lọc cột **Tạo lúc** theo khoảng thời gian bị spam. Bôi đen các ô ở cột **Trạng thái** của những dòng đó, gõ **Hủy** rồi bấm **Ctrl+Enter** để điền cho tất cả. Trước khi hủy, đối chiếu với email đặt chỗ để không hủy nhầm đơn thật.
- Muốn chặn chặt hơn: giảm "Tối đa lượt giữ chỗ mỗi 10 phút" ở tab Cài đặt. Khi chạm giới hạn, khách vẫn đặt được, nhưng email sẽ ghi "CHƯA giữ được chỗ tự động" để Ms Nguyên kiểm tra bằng tay.

## Khi có bản mã mới

1. Chép mã mới vào Apps Script như Bước 1, rồi lưu.
2. Vào **Triển khai → Quản lý các bản triển khai → ✏ Chỉnh sửa**.
3. Ở **Phiên bản**, chọn **Phiên bản mới**, rồi bấm **Triển khai**.

Link Web App giữ nguyên, không phải sửa gì trên web.
