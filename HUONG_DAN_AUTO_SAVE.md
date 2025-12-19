# 📚 Hướng Dẫn Sử Dụng Tính Năng Auto-Save

## 🎯 Tính năng đã được thêm

### ✅ Đã hoàn thành:

1. **Auto-save câu hỏi**: Tự động lưu câu hỏi vào Vercel Blob sau khi AI tạo xong
2. **Kiểm tra duplicate**: So sánh nội dung câu hỏi trước khi lưu
3. **Tái sử dụng câu hỏi**: Nếu câu hỏi đã tồn tại, sẽ trả về từ database thay vì tạo mới

---

## 🛠️ Các file đã sửa đổi

### 1. `api/questions.js`
- ✅ Thêm hàm `generateQuestionHash()` - Tạo hash từ nội dung câu hỏi
- ✅ Thêm hàm `findDuplicateQuestion()` - Tìm câu hỏi duplicate
- ✅ Cập nhật POST endpoint - Kiểm tra duplicate trước khi lưu
- ✅ Lưu hash cùng với câu hỏi để so sánh sau này

### 2. `index.html`
- ✅ Thêm hàm `saveQuestionToCloud()` - Lưu câu hỏi lên Vercel
- ✅ Thêm hàm `autoSaveGeneratedQuestions()` - Lưu tất cả câu hỏi
- ✅ Tích hợp auto-save vào `executeGeneration()` - Tự động chạy sau khi tạo câu hỏi

---

## 🚀 Cách sử dụng

### Bước 1: Deploy lên Vercel

```bash
# Trong thư mục dự án
vercel --prod
```

### Bước 2: Cấu hình Environment Variable

Trong Vercel Dashboard:
1. Vào **Settings** → **Environment Variables**
2. Thêm biến:
   - **Key**: `BLOB_READ_WRITE_TOKEN`
   - **Value**: Token từ Vercel Blob Storage

### Bước 3: Tạo Blob Storage

1. Vào [Vercel Dashboard](https://vercel.com/dashboard)
2. Chọn **Storage** → **Create Database** → **Blob**
3. Đặt tên: `edumatrix-questions`
4. Copy token và paste vào Environment Variables

### Bước 4: Test

1. Mở website đã deploy
2. Tạo câu hỏi bằng AI
3. Sau khi tạo xong, sẽ thấy thông báo:
   - ✅ "Lưu mới: X câu"
   - 🔄 "Đã tồn tại: Y câu"
   - ❌ "Lỗi: Z câu" (nếu có)

---

## 🔍 Cách hoạt động

### Luồng xử lý:

1. **User tạo câu hỏi** → AI sinh câu hỏi
2. **Tính hash** → Chuẩn hóa nội dung câu hỏi và tạo SHA-256 hash
3. **Kiểm tra database** → Tìm câu hỏi có hash giống nhau
4. **Quyết định**:
   - Nếu **đã có**: Trả về câu hỏi cũ
   - Nếu **chưa có**: Lưu câu hỏi mới

### Thuật toán so sánh:

```javascript
// Chuẩn hóa câu hỏi
question = "Thủ đô Việt Nam là gì?"
normalized = "thu do viet nam la gi"  // lowercase, loại bỏ ký tự đặc biệt

// Chuẩn hóa options
options = ["Hà Nội", "TP.HCM", "Đà Nẵng"]
normalized_options = "da nang|ha noi|tphcm"  // sort + join

// Tạo hash
combined = "thu do viet nam la gi|||da nang|ha noi|tphcm"
hash = SHA256(combined).substring(0, 16)
```

---

## 📊 Dữ liệu được lưu

Mỗi câu hỏi trong Vercel Blob có cấu trúc:

```json
{
  "id": "q_1234567890_abc123",
  "hash": "a1b2c3d4e5f6g7h8",
  "question": "Thủ đô Việt Nam là gì?",
  "options": ["Hà Nội", "TP.HCM", "Đà Nẵng", "Cần Thơ"],
  "correctAnswer": 0,
  "subject": "Địa lý",
  "difficulty": "easy",
  "tags": [],
  "createdAt": "2025-12-19T10:30:00.000Z"
}
```

---

## 🎯 Lợi ích

### 1. Tiết kiệm Storage
- Không lưu câu hỏi trùng lặp
- Database nhỏ gọn hơn

### 2. Tái sử dụng
- Câu hỏi chất lượng được sử dụng lại
- Không cần tạo lại từ đầu

### 3. Consistency
- Cùng 1 câu hỏi → Cùng 1 ID
- Dễ tracking và quản lý

### 4. Performance
- Hash-based lookup rất nhanh
- O(n) complexity với n = số câu hỏi

---

## ⚙️ Tùy chỉnh

### Thay đổi API URL

Nếu deploy ở domain khác, sửa trong `index.html`:

```javascript
// Dòng 2999
const VERCEL_API_URL = 'https://your-domain.vercel.app/api/questions';
```

### Tắt auto-save

Comment dòng trong `executeGeneration()`:

```javascript
// await autoSaveGeneratedQuestions(currentQuestions);
```

### Điều chỉnh thuật toán duplicate

Sửa hàm `generateQuestionHash()` trong `api/questions.js`:

```javascript
// Ví dụ: Chỉ so sánh câu hỏi, không so sánh options
const combined = `${normalizedQuestion}`;
```

---

## 🐛 Troubleshooting

### Lỗi: "Missing BLOB_READ_WRITE_TOKEN"
**Nguyên nhân**: Chưa set environment variable
**Giải pháp**: Thêm token trong Vercel Settings

### Lỗi: "HTTP 404"
**Nguyên nhân**: API endpoint không tồn tại
**Giải pháp**: Kiểm tra file `api/questions.js` đã deploy chưa

### Lỗi: "CORS"
**Nguyên nhân**: API không cho phép cross-origin requests
**Giải pháp**: CORS đã được config trong API, kiểm tra lại headers

### Không thấy thông báo auto-save
**Nguyên nhân**: Có thể console.log bị ẩn
**Giải pháp**: Mở DevTools (F12) → Console để xem logs

---

## 📝 Logs & Monitoring

### Console logs:

```javascript
💾 Đang tự động lưu 5 câu hỏi vào Vercel Blob...
✅ Đã lưu câu hỏi mới: q_1234567890_abc
🔄 Câu hỏi đã tồn tại: q_0987654321_xyz
📊 Kết quả lưu: {total: 5, saved: 3, duplicates: 2, errors: 0}
```

### User notification:

```
💾 Kết quả lưu vào Vercel Blob:
✅ Lưu mới: 3 câu
🔄 Đã tồn tại: 2 câu
❌ Lỗi: 0 câu
```

---

## 🎉 Hoàn thành!

Tính năng auto-save và duplicate detection đã sẵn sàng sử dụng! 🚀

**Lưu ý**: Deploy lên Vercel mới có thể test được tính năng này, vì cần Vercel Blob Storage.

---

**Ngày tạo**: 19/12/2025  
**Phiên bản**: 1.0  
**Tác giả**: AI Assistant 🤖

