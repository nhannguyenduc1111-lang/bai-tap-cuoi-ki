# HỆ THỐNG ĐIỀU HÀNH NHÂN SỰ & TIỀN LƯƠNG THÔNG MINH - CÔNG TY A
**(Smart HRM & Payroll Dashboard - Công ty Cổ phần Thương mại & Sản xuất A)**

Hệ thống Quản trị Nhân sự & Tiền lương thông minh dành cho **Ban Giám đốc** và **Phòng Hành chính - Nhân sự**. Giải pháp xóa bỏ hoàn toàn tình trạng quản lý phân mảnh trên nhiều file Excel rời rạc, tự động đối soát liên kết 5 chiều dữ liệu 360°, cảnh báo sớm rủi ro nhân sự và tích hợp AI Google Gemini tham mưu quỹ lương.

---

## 🚀 TÍNH NĂNG CỐT LÕI

1. **Giao diện Bento Grid & Glassmorphism hiện đại**:
   - Bảng màu doanh nghiệp sang trọng: Sidebar Xanh Rừng Sâu (`#0F291E`), nền Trắng Sứ (`#F8FAFC`), điểm nhấn Vàng Đồng (`#D97706`).
   - Hỗ trợ chuyển đổi giao diện **Sáng / Tối (Light / Dark Mode)**.
   - Hiệu ứng chuyển động mượt mà: *Count-up KPI Numbers, Fade-in Up, Hover 3D Glow, Skeleton Shimmer*.

2. **3 Biểu đồ Recharts động theo thời gian thực**:
   - **Biểu đồ Thanh ngang (Horizontal Bar)**: Nhân sự thực tế vs Định biên của 6 phòng ban (đạt 50/50 - 100%).
   - **Biểu đồ Cột ghép & Đường (Composed Bar & Line)**: Biến động Tổng thu nhập và Thực lĩnh qua 3 tháng Quý 3/2026 (`07/2026`, `08/2026`, `09/2026`).
   - **Biểu đồ Donut**: Cơ cấu tỷ trọng quỹ lương theo 6 phòng ban.

3. **Đối soát dữ liệu 360° & Đọc file Excel thông minh (`SheetJS`)**:
   - Tự động nhận diện tiêu đề tại **Dòng 4**, đọc dữ liệu nhân viên từ **Dòng 5 đến Dòng 54**, tự động loại bỏ dòng **TỔNG CỘNG (Dòng 55)** để tránh nhân đôi số liệu.
   - Lấy `Mã NV` (`TP0001` – `TP0050`) làm khóa chính liên kết xuyên suốt 5 chiều: *Hồ sơ cá nhân + Hợp đồng + Chấm công OT + Quỹ phép năm + Chi tiết lương / BHXH (10.5%) / Thuế TNCN*.

4. **Hệ thống Cảnh báo Rủi ro (Đỏ - Vàng - Xanh)**:
   - 🔴 **Màu Đỏ (Khẩn cấp)**: Hợp đồng sắp hết hạn trong 30 ngày (`TP0021`, `TP0035`) và nhân sự kết thúc 2 tháng thử việc cần đánh giá ký chính thức (`TP0008`, `TP0049`).
   - 🟡 **Màu Vàng (Chờ xử lý)**: Đơn xin nghỉ phép chờ duyệt (`NP-2026-0515`, `NP-2026-0518`, `NP-2026-0520`) và nhân sự đang thử việc (`TP0023`).
   - 🟢 **Màu Xanh (Ổn định)**: Nhân sự chính thức đang làm việc, hợp đồng hiệu lực.

5. **Trí tuệ Nhân tạo Gemini & Cơ chế Fallback tự động**:
   - Tích hợp mô hình `gemini-3-flash` với cơ chế tự động Fallback sang `gemini-3.1-flash-lite` / `gemini-2.0-flash` kèm *Exponential Backoff* khi quá tải.
   - Tích hợp sẵn **Chế độ Phân tích Chuyên gia Offline** hoạt động tức thì ngay cả khi chưa nhập API Key.
   - Trợ lý AI Nhân sự hỗ trợ hỏi đáp văn bản và nhận diện giọng nói tiếng Việt (*Web Speech API*).

6. **Kết nối & Xuất bản Thực tế**:
   - Xem trước và in **Phiếu lương cá nhân chuẩn A5/A4** hoặc **Tờ trình đánh giá thử việc** ra **PDF / Word (`.doc`)**.
   - Xuất bảng dữ liệu đã lọc ra **Excel (`.xlsx`)**.
   - Tạo lịch nhắc tái ký hợp đồng trực tiếp trên **Google Calendar**.
   - Gửi Phiếu lương tự động qua **Gmail**.

---

## 🛠️ CÀI ĐẶT VÀ KHỞI CHẠY

### Cách 1: Mở trực tiếp không cần cài đặt (Standalone Offline)
Nhấp đúp chuột trực tiếp vào tệp **`Ung_dung_HRM_Offline.html`** (hoặc **`Chay_Web_App.bat`**) để mở ngay trên mọi trình duyệt web.

### Cách 2: Chạy môi trường Development (Node.js + Vite)
```bash
# Cài đặt thư viện
npm install

# Khởi chạy máy chủ phát triển (http://localhost:3000)
npm run dev

# Đóng gói bản Production
npm run build
```

---

## 🔐 BẢO MẬT API KEY
- Không nhúng cứng (*hardcode*) bất kỳ khóa API nào trong mã nguồn.
- Người dùng nhập `GEMINI_API_KEY` qua nút **🔑 Cài đặt API Key** trên thanh Header (lưu cục bộ tại `localStorage` của trình duyệt) hoặc cấu hình biến `VITE_GEMINI_API_KEY` trong tệp `.env.local`.
