# 🚀 Hướng Dẫn Setup Nhanh - Auto Save Vercel Blob

## ❗ VẤN ĐỀ: Câu hỏi chưa được lưu

### Nguyên nhân phổ biến:

1. ⚠️ **Đang test LOCAL** → Vercel Blob chỉ hoạt động khi deploy
2. ⚠️ **Chưa deploy** lên Vercel
3. ⚠️ **Chưa tạo Blob Storage** trên Vercel
4. ⚠️ **Thiếu Environment Variable**: `BLOB_READ_WRITE_TOKEN`

---

## ✅ GIẢI PHÁP - 3 BƯỚC ĐƠN GIẢN

### 🔥 Bước 1: Tạo Vercel Blob Storage (2 phút)

1. Vào [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **Storage** (menu bên trái)
3. Click **Create Database**
4. Chọn **Blob** → Đặt tên: `edumatrix-questions`
5. Click **Create**
6. **Copy token** (Read-Write Token) → Lưu lại

---

### 🚀 Bước 2: Deploy lên Vercel (1 phút)

#### Cách 1: Dùng Vercel CLI (Khuyến nghị)

```bash
# Cài Vercel CLI (nếu chưa có)
npm install -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

#### Cách 2: Deploy qua GitHub

1. Push code lên GitHub
2. Vào [Vercel Dashboard](https://vercel.com/dashboard)
3. Click **Add New** → **Project**
4. Import repository từ GitHub
5. Click **Deploy**

---

### ⚙️ Bước 3: Thêm Environment Variable (30 giây)

Trong Vercel Dashboard:

1. Vào project vừa deploy
2. Click **Settings** → **Environment Variables**
3. Thêm biến mới:
   - **Key**: `BLOB_READ_WRITE_TOKEN`
   - **Value**: Token đã copy ở Bước 1
   - **Environment**: Chọn **Production**, **Preview**, **Development**
4. Click **Save**
5. **Redeploy** project (quan trọng!)

---

## 🧪 TEST

Sau khi setup xong:

1. Mở website đã deploy: `https://your-project.vercel.app`
2. Tạo câu hỏi bằng AI
3. Sau khi tạo xong, sẽ thấy popup:

```
💾 Kết quả lưu vào Vercel Blob:
✅ Lưu mới: X câu
🔄 Đã tồn tại: Y câu
```

4. Mở **DevTools** (F12) → **Console** để xem logs chi tiết:

```javascript
💾 Đang tự động lưu 5 câu hỏi vào Vercel Blob...
✅ Đã lưu câu hỏi mới: q_1234567890_abc
📊 Kết quả lưu: {total: 5, saved: 5, duplicates: 0, errors: 0}
```

---

## 🐛 Troubleshooting

### Lỗi: "Failed to fetch"

**Nguyên nhân**: Đang test local, Vercel Blob không hoạt động local  
**Giải pháp**: Deploy lên Vercel theo Bước 2

### Lỗi: "Missing BLOB_READ_WRITE_TOKEN"

**Nguyên nhân**: Chưa thêm environment variable  
**Giải pháp**: Làm Bước 3, nhớ **redeploy** sau khi thêm

### Không thấy popup thông báo

1. Mở **DevTools** (F12) → **Console**
2. Tìm dòng: `💾 Đang tự động lưu...`
3. Nếu có lỗi → Copy lỗi và báo lại

### Lỗi: "Rate limit exceeded"

**Nguyên nhân**: Tạo quá nhiều câu hỏi quá nhanh  
**Giải pháp**: Đợi 1 phút rồi thử lại

---

## 📱 Kiểm Tra Câu Hỏi Đã Lưu

### Cách 1: Qua Vercel Dashboard

1. Vào **Storage** → Chọn Blob Storage của bạn
2. Vào tab **Browse**
3. Thấy các file: `questions/q_xxxxx.json`

### Cách 2: Qua API

Mở browser, vào:
```
https://your-project.vercel.app/api/questions
```

Sẽ thấy JSON response:
```json
{
  "success": true,
  "count": 10,
  "data": [
    {
      "id": "q_1234567890_abc",
      "question": "...",
      "options": [...],
      ...
    }
  ]
}
```

---

## 💡 Tips

### 1. Test nhanh API

```bash
# GET all questions
curl https://your-project.vercel.app/api/questions

# POST new question
curl -X POST https://your-project.vercel.app/api/questions \
  -H "Content-Type: application/json" \
  -d '{"question":"Test?","options":["A","B","C","D"],"correctAnswer":0}'
```

### 2. Xem logs real-time

```bash
vercel logs your-project-name --follow
```

### 3. Test local với Vercel Dev

```bash
# Cần có .env file với BLOB_READ_WRITE_TOKEN
vercel dev
```

---

## ⚡ Checklist Hoàn Thành

- [ ] Đã tạo Vercel Blob Storage
- [ ] Đã copy BLOB_READ_WRITE_TOKEN
- [ ] Đã deploy project lên Vercel
- [ ] Đã thêm Environment Variable
- [ ] Đã redeploy sau khi thêm env var
- [ ] Đã test tạo câu hỏi và thấy popup thông báo
- [ ] Đã kiểm tra console không có lỗi
- [ ] Đã kiểm tra API `/api/questions` hoạt động

---

## 🎯 Kết Quả Mong Đợi

Sau khi setup đúng:

✅ Mỗi khi tạo câu hỏi → Tự động lưu vào Vercel Blob  
✅ Câu hỏi trùng lặp → Tự động phát hiện  
✅ Có thông báo popup sau khi lưu  
✅ Console logs chi tiết  
✅ Có thể xem câu hỏi đã lưu qua API  

---

**Cần hỗ trợ?**

- Kiểm tra Console logs (F12 → Console)
- Kiểm tra Vercel logs: `vercel logs`
- Đọc file `HUONG_DAN_AUTO_SAVE.md` để biết thêm chi tiết

**Thời gian setup**: ~5 phút ⏱️  
**Độ khó**: Dễ ⭐  

---

**Cập nhật**: 19/12/2025  
**Phiên bản**: 1.0

