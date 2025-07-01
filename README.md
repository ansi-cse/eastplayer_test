# Brand Exposure Detection API

Hệ thống giúp upload video/image lên MinIO, tự động phân tách frame từ video, và phân tích mức độ xuất hiện của logo/thương hiệu trong các frame.

---

## 🚀 API Features

| Endpoint                        | Method | Description                              |
|--------------------------------|--------|------------------------------------------|
| `/upload/video`                | POST   | Upload video, tự động phân tách frame    |
| `/upload/image`                | POST   | Upload hình ảnh                          |
| `/frames/analyze`             | POST   | Phân tích mức độ xuất hiện logo trên video |

---

## 📦 Tech Stack

- **NestJS** (Framework chính)
- **MinIO** (Lưu trữ media)
- **Bull + Redis** (Queue xử lý phân tách video)
- **Busboy** (Stream file upload)
- **Docker** (Dev & deployment)
- **UUID** (Tên file duy nhất)

---

## 🧪 Cài đặt & chạy project

### 1. Clone repo

```bash
git clone <your-repo-url>
cd <project-folder>
```

### 2. Cài đặt dependencies

```bash
yarn
```

### 3. Khởi chạy MinIO & Redis (qua Docker)

> ⚠️ Đảm bảo Docker đã cài sẵn.

```bash
# Redis
docker run -d --name redis -p 6379:6379 redis

# MinIO
docker run -d -p 9000:9000 -p 9001:9001 \\
  -e MINIO_ROOT_USER=minioadmin \\
  -e MINIO_ROOT_PASSWORD=minioadmin \\
  -v minio_data:/data \\
  --name minio minio/minio server /data --console-address ":9001"
```

### 4. Thiết lập biến môi trường

Tạo file `.env` ở gốc:

```env
PORT=8000

MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_USE_SSL=false

REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

DEFAULT_FRAME_INTERVAL=10
```

### 5. Chạy ứng dụng

```bash
yarn run start:dev
```

---

## 📤 Upload API

### 📌 Upload video

```http
POST /upload/video
Content-Type: multipart/form-data
```

**Body**:
- `file`: video file (MP4,...)

**Response**:

```json
{
    "error": 0,
    "statusCode": 200,
    "message": "Upload successful and your video is splitting",
    "data": {
        "id": "e195406f-660c-4c02-9cbb-65ef349bc657_filename.mp4"
    }
}
```

> ✅ Hệ thống tự động đưa job tách frame vào queue Bull sau khi upload.

---

### 📌 Phân tích logo xuất hiện

```http
POST /frames/analyze
Content-Type: application/json
```

**Body**:

```json
{
  "videoId": "abc123_filename.mp4",
  "logoId": "logo1.png"
}
```

**Response**:

```json
{
    "error": 0,
    "statusCode": 200,
    "message": "Success",
    "data": {
        "totalFrames": 0,
        "logoDetectedFrames": 0,
        "exposureRatio": null,
        "totalDurationSeconds": 0,
        "exposureDurationSeconds": 0,
        "positions": {
            "topLeft": 0,
            "topRight": 0,
            "bottomLeft": 0,
            "bottomRight": 0
        }
    }
}
```