# 📚 Digital Learning Platform

Nền tảng chia sẻ và khai thác học liệu số - cho phép học sinh, sinh viên tìm kiếm, xem, tải tài liệu học tập; người đóng góp tải tài liệu lên; và quản trị viên duyệt/quản lý nội dung, người dùng và doanh thu.

Dự án gồm 2 phần tách biệt trong cùng một repo (monorepo dạng thư mục):

| Thư mục | Vai trò | Công nghệ chính |
|---|---|---|
| `backend/` | REST API | Node.js, Express 5, Prisma ORM, PostgreSQL |
| `frontend/` | Giao diện người dùng | React 19, Vite, Tailwind CSS |

---

## 🧩 Tính năng chính

**Sinh viên (Student)**
- Đăng ký / Đăng nhập
- Tìm kiếm, xem, tải tài liệu
- Bình luận, đánh giá, lưu yêu thích

**Người đóng góp (Uploader)**
- Tải lên, chỉnh sửa, xoá tài liệu của mình

**Quản trị viên (Admin)**
- Quản lý người dùng, danh mục
- Duyệt tài liệu
- Xem thống kê

**Khác**
- Xác thực bằng JWT (access token + refresh token)
- Xử lý file PDF/DOCX: trích xuất văn bản, tạo ảnh bìa (`pdftotext`, `pdftoppm`)
- Quét mã độc file tải lên bằng **ClamAV**
- Tích hợp thanh toán **VNPay** (mua gói tài liệu/premium)
- Tác vụ định kỳ (cron job) dọn dữ liệu đã xoá mềm

---

## 🛠 Yêu cầu môi trường

Trước khi cài đặt, máy cần có:

| Công cụ | Phiên bản khuyến nghị | Ghi chú |
|---|---|---|
| [Node.js](https://nodejs.org/) | ≥ 22.x | Trùng với base image Docker (`node:22-bookworm-slim`) |
| [PostgreSQL](https://www.postgresql.org/) | ≥ 16 | Có thể chạy qua Docker, không cần cài trực tiếp |
| [Docker Desktop](https://www.docker.com/products/docker-desktop/) | Mới nhất | Khuyến nghị để chạy backend + DB nhanh gọn |
| Git | Mới nhất | Clone mã nguồn |
| **poppler-utils** (`pdftotext`, `pdftoppm`) | — | Chỉ cần nếu chạy backend **không** qua Docker |
| **ClamAV** (`clamscan`, `freshclam`) | — | Chỉ cần nếu chạy backend **không** qua Docker |

> 💡 Nếu chạy backend bằng Docker (khuyến nghị), Dockerfile đã tự cài `poppler-utils` và `clamav` bên trong container — không cần cài thủ công trên máy host.

---

## 🚀 Cài đặt & chạy dự án

### Bước 1 — Clone repository

```bash
git clone https://github.com/PhongNguyenKobe/digital-learning-platform.git
cd digital-learning-platform
```

### Bước 2 — Cấu hình Backend

#### 2.1. Tạo file biến môi trường

Trong thư mục `backend/`, sao chép file mẫu:

```bash
cd backend
cp .env.example .env
```

Trên Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

Mở file `.env` vừa tạo và chỉnh các giá trị quan trọng:

```env
DATABASE_URL="postgresql://digital_learning:digital_learning_dev@localhost:5432/digital_learning?schema=public"
PORT=3000
NODE_ENV=development

# Đổi thành chuỗi ngẫu nhiên, đủ dài — dùng để ký JWT
JWT_ACCESS_SECRET="replace-with-a-long-random-access-secret"
JWT_REFRESH_SECRET="replace-with-a-different-long-random-refresh-secret"
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN_DAYS=30

UPLOAD_DIR=uploads
PUBLISH_DOCUMENTS_IMMEDIATELY=true
PURGE_CRON_SCHEDULE="0 3 * * *"

# Domain frontend được phép gọi API (CORS)
CORS_ORIGINS="http://localhost:5173,http://127.0.0.1:5173"
FRONTEND_URL=http://localhost:5173

PDF_TEXT_COMMAND=pdftotext
PDF_IMAGE_COMMAND=pdftoppm
CLAMAV_COMMAND=clamscan
DOCUMENT_WORKER_INTERVAL_MS=15000

# Thông tin cổng thanh toán VNPay (sandbox)
VNP_TMNCODE=
VNP_HASH_SECRET=
VNP_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
VNP_RETURN_URL=http://localhost:3000/api/payments/vnpay/return
```

> 🔐 **Không commit `VNP_HASH_SECRET` thật lên Git.** Dự án có sẵn `.env.local.example` để lưu riêng secret nhạy cảm — file `.env.local` được `.gitignore` bỏ qua:
>
> ```bash
> cp .env.local.example .env.local
> ```
> rồi điền `VNP_HASH_SECRET` thật vào đó. Giá trị trong `.env.local` sẽ **ghi đè** giá trị trong `.env`.

#### 2.2. Chạy Backend + Database bằng Docker (khuyến nghị)

Cách này khởi động cả API và PostgreSQL cùng lúc, không cần cài Postgres/ClamAV/Poppler thủ công:

```bash
cd backend
docker compose up --build
```

Docker Compose sẽ:
1. Build image API (cài sẵn `clamav`, `poppler-utils`, chạy `prisma generate`).
2. Khởi động container PostgreSQL (`digital-learning-postgres`), đợi đến khi DB sẵn sàng (`healthcheck`).
3. Container API tự chạy `prisma migrate deploy` rồi khởi động server tại `http://localhost:3000`.

Dừng lại bằng `Ctrl + C`, hoặc chạy nền:

```bash
docker compose up --build -d
```

Xem log:

```bash
docker compose logs -f api
```

Dừng và xoá container (giữ lại dữ liệu DB trong volume):

```bash
docker compose down
```

#### 2.3. Hoặc chạy Backend thủ công (không dùng Docker)

Cần tự cài PostgreSQL 16, `poppler-utils`, `clamav` trên máy trước, đảm bảo `DATABASE_URL` trong `.env` trỏ đúng tới DB đó.

```bash
cd backend
npm install

# Sinh Prisma Client
npm run prisma:generate

# Áp dụng migration (tạo bảng trong DB)
npm run db:migrate

# (Tùy chọn) Seed dữ liệu mẫu
npm run db:seed

# Chạy ở chế độ development (tự reload khi sửa code)
npm run dev

# Hoặc chạy production
npm start
```

Backend chạy tại: **http://localhost:3000**

#### 2.4. Các lệnh Prisma hữu ích

| Lệnh | Chức năng |
|---|---|
| `npm run prisma:format` | Format file `schema.prisma` |
| `npm run prisma:validate` | Kiểm tra schema hợp lệ |
| `npm run prisma:generate` | Sinh lại Prisma Client sau khi đổi schema |
| `npm run db:migrate` | Tạo & áp dụng migration mới (dev) |
| `npm run db:push` | Đẩy schema thẳng vào DB, không tạo file migration |
| `npm run db:studio` | Mở Prisma Studio (GUI xem/sửa dữ liệu) tại `http://localhost:5555` |
| `npm run db:seed` | Chạy script seed dữ liệu mẫu |
| `npm run db:sync-catalog` | Đồng bộ danh mục tài liệu |
| `npm run db:purge-deleted` | Xoá vĩnh viễn dữ liệu đã xoá mềm quá hạn |

---

### Bước 3 — Cấu hình & chạy Frontend

Mở terminal mới (giữ backend đang chạy):

```bash
cd frontend
npm install
npm run dev
```

Frontend (Vite) mặc định chạy tại: **http://localhost:5173**

> Nếu backend chạy ở cổng khác `3000`, kiểm tra thư mục `frontend/src/services` để cập nhật base URL gọi API cho khớp, đồng thời cập nhật `CORS_ORIGINS` và `FRONTEND_URL` trong `backend/.env`.

Các lệnh khác của frontend:

```bash
npm run build     # Build bản production vào thư mục dist/
npm run preview   # Xem thử bản build production
npm run lint      # Kiểm tra lỗi ESLint
```

---

## ✅ Kiểm tra sau khi cài đặt

1. Backend: truy cập `http://localhost:3000` — API phải phản hồi (không lỗi kết nối DB).
2. Frontend: truy cập `http://localhost:5173` — trang chủ tải được, gọi API không bị lỗi CORS.
3. (Nếu dùng Docker) `docker compose ps` — cả 2 service `api` và `postgres` ở trạng thái `running`/`healthy`.

---

## 📁 Cấu trúc thư mục (rút gọn)

```
digital-learning-platform/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma       # Định nghĩa DB schema
│   │   ├── seed.ts             # Dữ liệu mẫu
│   │   └── migrations/
│   ├── src/
│   │   ├── modules/            # auth, documents, interactions, payments, admin
│   │   ├── middlewares/
│   │   ├── services/
│   │   ├── jobs/                # cron job dọn dữ liệu
│   │   ├── config/
│   │   ├── app.js
│   │   └── server.js
│   ├── uploads/                 # File người dùng tải lên
│   ├── Dockerfile
│   └── docker-compose.yml
├── frontend/
│   ├── src/
│   │   ├── pages/               # Home, Library, Login, Register, Admin, Contributor,...
│   │   ├── components/
│   │   ├── services/            # Gọi API
│   │   └── utils/
│   └── vite.config.js
└── docs/
    └── project-plan.md
```

---

## 🔧 Xử lý sự cố thường gặp

| Vấn đề | Nguyên nhân thường gặp | Cách khắc phục |
|---|---|---|
| Backend báo lỗi kết nối DB | `DATABASE_URL` sai, Postgres chưa chạy | Kiểm tra container `postgres` đã `healthy`, đúng port `5432` |
| Frontend gọi API bị lỗi CORS | `CORS_ORIGINS` không khớp URL frontend | Thêm đúng origin frontend vào `CORS_ORIGINS` trong `.env` backend |
| Không xử lý được PDF (thiếu text/ảnh bìa) | Thiếu `poppler-utils` khi chạy không qua Docker | Cài `poppler-utils`, đảm bảo `pdftotext`, `pdftoppm` có trong `PATH` |
| Upload bị đánh dấu lỗi virus scan | ClamAV chưa cập nhật signature hoặc chưa cài | Chạy `freshclam`, hoặc dùng bản Docker (đã tự động `freshclam` khi khởi động) |
| Thanh toán VNPay không hoạt động | Thiếu `VNP_TMNCODE` / `VNP_HASH_SECRET` | Đăng ký tài khoản sandbox VNPay, điền đủ thông tin vào `.env` / `.env.local` |

---

## 📄 Giấy phép

Chưa xác định — bổ sung khi dự án phát hành chính thức.