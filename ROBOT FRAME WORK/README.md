# 🤖 Robot Framework Test Suite

คู่มือสำหรับการติดตั้งและรันการทดสอบระบบ (Automated Testing) ด้วย **Robot Framework** บนระบบปฏิบัติการ Windows สำหรับโปรเจกต์ Japan Travel Booking (รันการทดสอบตรงไปยังเซิร์ฟเวอร์จริงบน Railway!)

---

## 📋 โครงสร้างไฟล์การทดสอบทั้งหมด (Modular Test Suites)

สคริปต์การทดสอบได้รับการออกแบบแบบแยกหมวดหมู่ (Modular) ไว้ในโฟลเดอร์ [ROBOT FRAME WORK](file:///d:/travel-booking%20-%20depoy/travel-booking/ROBOT%20FRAME%20WORK) ดังนี้:

1. 🔑 **[01_authentication.robot](file:///d:/travel-booking%20-%20depoy/travel-booking/ROBOT%20FRAME%20WORK/01_authentication.robot)**: ทดสอบระบบยืนยันตัวตน, หน้าลงทะเบียน (UI & API), หน้าเข้าสู่ระบบ และปุ่ม Google OAuth
2. 🗺️ **[02_packages.robot](file:///d:/travel-booking%20-%20depoy/travel-booking/ROBOT%20FRAME%20WORK/02_packages.robot)**: ทดสอบการแสดงผลแพ็กเกจทัวร์ท่องเที่ยวทั้งหมด (UI) และการเรียก API ข้อมูลทัวร์รายตัว
3. 💳 **[03_bookings_payments.robot](file:///d:/travel-booking%20-%20depoy/travel-booking/ROBOT%20FRAME%20WORK/03_bookings_payments.robot)**: ทดสอบกระบวนการทำรายการจอง, การเปลี่ยนราคาทัวร์ตามสัดส่วนจำนวนคน และการสร้าง QR Code
4. 📈 **[04_agency_dashboard.robot](file:///d:/travel-booking%20-%20depoy/travel-booking/ROBOT%20FRAME%20WORK/04_agency_dashboard.robot)**: ทดสอบระบบ Dashboard ของเอเจนซี่ทัวร์, การป้องกันสิทธิ์ผู้ใช้งาน (Redirection)
5. 💬 **[05_blog_and_reviews.robot](file:///d:/travel-booking%20-%20depoy/travel-booking/ROBOT%20FRAME%20WORK/05_blog_and_reviews.robot)**: ทดสอบการโหลดบทความบล็อกท่องเที่ยวและระบบรีวิวแพ็กเกจ
6. 🛡️ **[06_input_validation.robot](file:///d:/travel-booking%20-%20depoy/travel-booking/ROBOT%20FRAME%20WORK/06_input_validation.robot)**: ทดสอบการดักจับข้อผิดพลาดเมื่อป้อนข้อมูลยาวเกิน (เช่น Username เกิน 150 ตัวอักษร) หรือฟอร์แมตไม่ถูกต้อง

---

## 🛠️ ขั้นตอนการเตรียมระบบและการเปิดใช้งาน virtualenv (venv)

ให้ทำตามขั้นตอนดังนี้เพื่อรันการทดสอบในโปรเจกต์:

### 1. เปิด Terminal (เช่น PowerShell หรือ CMD)
และสลับไดเรกทอรีไปยังโฟลเดอร์หลักของโปรเจกต์:
```powershell
cd "d:\travel-booking - depoy\travel-booking"
```

### 2. เปิดใช้งาน venv (Activate Virtual Environment) บน Windows

* **สำหรับ PowerShell (แนะนำ):**
  ```powershell
  & "backend\venv\Scripts\Activate.ps1"
  ```
  *(หากเกิดข้อผิดพลาดเกี่ยวกับ Execution Policy ให้รัน `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope Process` ก่อนเปิดใช้งาน venv)*

* **สำหรับ Command Prompt (CMD):**
  ```cmd
  backend\venv\Scripts\activate.bat
  ```

*(เมื่อเปิดสำเร็จจะมีตัวอักษร `(venv)` ขึ้นอยู่ด้านหน้าสุดของบรรทัดคำสั่ง)*

### 3. ติดตั้ง Robot Framework และโมดูลที่จำเป็น
รันคำสั่งด้านล่างนี้เพื่อติดตั้งไลบรารีทั้งหมด:
```powershell
pip install -r "ROBOT FRAME WORK\requirements.txt"
```

---

## 🚀 วิธีการสั่งรันการทดสอบ (Running Tests)

คุณสามารถสั่งรันแยกเฉพาะหมวดหมู่ หรือสั่งรันทั้งหมดพร้อมกันได้:

### สั่งรันทุกชุดทดสอบพร้อมกัน 🚀
```powershell
robot "ROBOT FRAME WORK\"
```

### สั่งรันเฉพาะหมวดหมู่ที่ต้องการ 🎯
* **รันเทสระบบสมัครสมาชิก/เข้าสู่ระบบ:**
  ```powershell
  robot "ROBOT FRAME WORK\01_authentication.robot"
  ```
* **รันเทสระบบแสดงแพ็กเกจทัวร์:**
  ```powershell
  robot "ROBOT FRAME WORK\02_packages.robot"
  ```
* **รันเทสระบบการจองและการเงิน:**
  ```powershell
  robot "ROBOT FRAME WORK\03_bookings_payments.robot"
  ```
* **รันเทสฝั่งเอเจนซี่ทัวร์:**
  ```powershell
  robot "ROBOT FRAME WORK\04_agency_dashboard.robot"
  ```
* **รันเทสบทความและรีวิว:**
  ```powershell
  robot "ROBOT FRAME WORK\05_blog_and_reviews.robot"
  ```
* **รันเทสการดักจับและตรวจสอบขนาด/ฟอร์แมตข้อมูลอินพุต:**
  ```powershell
  robot "ROBOT FRAME WORK\06_input_validation.robot"
  ```

---

## 📊 รายงานผลการทดสอบ (Test Reports)
เมื่อทดสอบเสร็จสิ้น จะมีไฟล์ผลลัพธ์ปรากฏขึ้นที่โฟลเดอร์หลักของโปรเจกต์:
- **`report.html`**: รายงานสรุปผลภาพรวมสีสันสวยงาม (ดูแบบผ่าน/ไม่ผ่าน)
- **`log.html`**: บันทึกการทำงานและขั้นตอนอย่างละเอียด
- **`output.xml`**: ข้อมูลดิบสำหรับเชื่อมต่อระบบ CI/CD
