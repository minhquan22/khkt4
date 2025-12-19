# 🚀 HƯỚNG DẪN DEPLOY LÊN VERCEL

## ✅ Đã Fix Lỗi 404!

File `vercel.json` đã được sửa để web có thể chạy bình thường. Vercel sẽ tự động:
- Serve các file HTML tĩnh (index.html, login.html)
- Route API endpoints (/api/questions, /api/bulk-save)

---

## 📋 CHECKLIST TRƯỚC KHI DEPLOY

### 1️⃣ Chuẩn bị Vercel Blob Storage

Trước khi deploy, bạn **BẮT BUỘC** phải tạo Vercel Blob Store:

#### Bước 1: Tạo Blob Store
1. Truy cập [Vercel Dashboard](https://vercel.com/dashboard)
2. Chọn **Storage** → **Create Database** → Chọn **Blob**
3. Đặt tên: `edumatrix-questions` (hoặc tên bạn thích)
4. Click **Create**

#### Bước 2: Lấy Token
1. Sau khi tạo store, vào tab **Settings** của store
2. Copy **Read-Write Token** (dạng: `vercel_blob_rw_xxxxxxxxxx`)
3. **LƯU LẠI TOKEN NÀY** - sẽ cần ở bước sau!

---

## 🎯 CÁCH 1: DEPLOY QUA VERCEL DASHBOARD (KHUYẾN NGHỊ CHO NGƯỜI MỚI)

### Bước 1: Push code lên GitHub
```bash
# Nếu chưa có git repo
git init
git add .
git commit -m "Ready to deploy"

# Tạo repo mới trên GitHub rồi push
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git branch -M main
git push -u origin main
```

### Bước 2: Import vào Vercel
1. Truy cập [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **Add New** → **Project**
3. Import repository từ GitHub
4. Chọn repository vừa push

### Bước 3: Cấu hình Environment Variables (QUAN TRỌNG!)
Trước khi deploy, thêm biến môi trường:

1. Trong màn hình cấu hình project, tìm phần **Environment Variables**
2. Thêm biến:
   - **Key**: `BLOB_READ_WRITE_TOKEN`
   - **Value**: Token bạn đã copy ở bước chuẩn bị
   - **Environment**: Chọn tất cả (Production, Preview, Development)
3. Click **Add**

### Bước 4: Deploy
1. Click **Deploy**
2. Chờ 1-2 phút
3. Xong! 🎉

---

## 🎯 CÁCH 2: DEPLOY QUA VERCEL CLI (CHO DEVELOPER)

### Bước 1: Cài đặt Vercel CLI
```bash
npm install -g vercel
```

### Bước 2: Login
```bash
vercel login
```

### Bước 3: Deploy lần đầu
```bash
vercel
```

Khi được hỏi, chọn:
- **Set up and deploy?** → Yes
- **Which scope?** → Chọn account của bạn
- **Link to existing project?** → No
- **Project name?** → Nhập tên (hoặc Enter để dùng mặc định)
- **Directory?** → `.` (Enter)
- **Override settings?** → No

### Bước 4: Thêm Environment Variable
```bash
# Cách 1: Qua dashboard (đơn giản hơn)
# Vào https://vercel.com/[your-username]/[project-name]/settings/environment-variables
# Thêm BLOB_READ_WRITE_TOKEN

# Cách 2: Qua CLI
vercel env add BLOB_READ_WRITE_TOKEN
# Nhập token khi được hỏi
# Chọn Production, Preview, Development
```

### Bước 5: Deploy production
```bash
vercel --prod
```

---

## 🧪 KIỂM TRA SAU KHI DEPLOY

### 1. Kiểm tra Web chạy
Truy cập URL Vercel cung cấp (ví dụ: `https://your-project.vercel.app`)

✅ Nên thấy trang chủ EduMatrix
✅ Có thể vào `/login.html`
❌ Không còi bị lỗi 404

### 2. Kiểm tra API hoạt động
Mở DevTools (F12) → Console, chạy:

```javascript
// Test API questions
fetch('https://your-project.vercel.app/api/questions')
  .then(r => r.json())
  .then(data => console.log('✅ API hoạt động:', data))
  .catch(e => console.error('❌ Lỗi API:', e));
```

### 3. Kiểm tra Auto-Save
1. Trên trang chủ, tạo câu hỏi bằng AI
2. Sau khi tạo xong, mở Console (F12)
3. Nên thấy log:
   ```
   💾 Đang tự động lưu X câu hỏi vào Vercel Blob...
   ✅ Đã lưu câu hỏi mới: q_xxxxx
   📊 Kết quả lưu: {saved: X, duplicates: 0, errors: 0}
   ```

4. Kiểm tra đã lưu thành công:
```javascript
fetch('https://your-project.vercel.app/api/questions')
  .then(r => r.json())
  .then(data => console.log(`Tổng câu hỏi đã lưu: ${data.count}`));
```

---

## 🔧 TROUBLESHOOTING

### Lỗi: "Missing BLOB_READ_WRITE_TOKEN"
❌ Nguyên nhân: Chưa thêm environment variable
✅ Giải pháp: Làm theo **Bước 3** ở phần Deploy

### Lỗi: Web vẫn bị 404
❌ Nguyên nhân: Cache cũ của Vercel
✅ Giải pháp: 
1. Vào Vercel Dashboard → Project → Settings → General
2. Kéo xuống phần **Deployment Protection**
3. Click **Redeploy** để deploy lại

### Lỗi: API trả về 500
❌ Nguyên nhân: Token không đúng hoặc chưa tạo Blob Store
✅ Giải pháp:
1. Kiểm tra đã tạo Blob Store chưa
2. Kiểm tra token copy đúng không
3. Re-add environment variable

### Câu hỏi không được save
❌ Có thể do:
- API không hoạt động (xem lỗi trong Console)
- Token sai
- Blob Store chưa được tạo

✅ Debug:
1. Mở Console (F12) khi tạo câu hỏi
2. Xem log có lỗi gì không
3. Test API bằng cách gọi trực tiếp (xem phần Kiểm tra trên)

---

## 📊 THEO DÕI USAGE

Vercel Blob có giới hạn:
- **Free tier**: 500MB storage, 5GB bandwidth/tháng
- Xem usage tại: [Vercel Dashboard](https://vercel.com/dashboard) → Storage → Your Blob Store

Nếu vượt quota, nâng cấp plan hoặc xóa câu hỏi cũ:

```javascript
// Lấy danh sách câu hỏi
fetch('https://your-project.vercel.app/api/questions')
  .then(r => r.json())
  .then(data => {
    console.log('Danh sách câu hỏi:', data.data);
    // Xóa câu hỏi theo ID nếu cần
    // fetch('https://your-project.vercel.app/api/questions?id=QUESTION_ID', {method: 'DELETE'})
  });
```

---

## 🎉 HOÀN THÀNH!

Sau khi deploy thành công, bạn có thể:
✅ Truy cập web từ bất kỳ đâu qua URL Vercel
✅ Tạo câu hỏi bằng AI → Tự động lưu vào Vercel Blob
✅ Câu hỏi được lưu trữ an toàn, không mất khi refresh
✅ Share link cho người khác dùng

**URL của bạn:** `https://[project-name].vercel.app`

---

## 📞 HỖ TRỢ

Nếu gặp vấn đề:
1. Kiểm tra Console (F12) xem có lỗi gì
2. Kiểm tra Vercel Logs: Dashboard → Project → Logs
3. Xem lại checklist trên

Good luck! 🚀

