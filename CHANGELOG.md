# Changelog

## [Planned: 2.0.0] - TBD 

### Major Improvements Planned
- ** AST Parser Integration**: แทนที่ Regular Expression ด้วย AST (Abstract Syntax Tree) Parser สำหรับความแม่นยำ 100%
  - ใช้ Acorn หรือ Babel Parser
  - รองรับ JavaScript syntax ที่ซับซ้อนได้อย่างสมบูรณ์
  - ค้นหาฟังก์ชัน, parameters, return statements ได้แม่นยำ

- ** Configuration File Support**: ระบบ config file `.commentfixerrc.json`
  - กำหนด ALLOWED_EXTENSIONS เอง
  - เพิ่มคำแปลใน generateDescriptionFromName แบบ custom
  - เลือกโหมดเริ่มต้น (ai-mode หรือปกติ)
  - Custom zone organization patterns

- ** Asynchronous File I/O**: ประสิทธิภาพที่เหนือกว่า
  - ใช้ fs.promises.readFile, fs.promises.writeFile
  - ประมวลผลไฟล์พร้อมกันด้วย Promise.all()
  - เร็วขึ้นอย่างเห็นได้ชัดสำหรับโปรเจกต์ขนาดใหญ่

### Additional Features Planned
- ** Smart Function Detection**: ตรวจจับฟังก์ชันที่ซับซ้อนได้ดีขึ้น
- ** Progress Bar**: แสดงความคืบหน้าสำหรับไฟล์จำนวนมาก
- ** Plugin System**: ระบบ plugin สำหรับ custom transformations
- ** Performance Metrics**: รายงานประสิทธิภาพการทำงาน

## [1.1.0] - 2025-09-22

### Added
- ** Zone Organization**: ฟีเจอร์จัดระเบียบโค้ดเป็นโซนตามหัวข้อใหญ่อัตโนมัติ
  - `--organize-zones` / `-z` - ตรวจจับและจัดกลุ่มฟังก์ชันตามหัวข้อ
  - สร้างโซนพร้อมกรอบตกแต่งแบบ Chahuadev style
  - รองรับ 7 ประเภทหลัก: Authentication, API, Data, UI, File, Event, Utilities
  
- ** Author Information**: เพิ่มข้อมูลผู้เขียน
  - `--add-author` - เพิ่มข้อมูล @author ลงในไฟล์
  - `--author=<name>` - กำหนดชื่อผู้เขียนเอง

### Improved
- Enhanced function detection patterns
- Better zone categorization with Thai/English descriptions
- Updated CLI help with new features

## [1.0.0] - 2025-09-22

### Added
-  เปิดตัวเครื่องมือ Chahuadev Comment Fixer
-  แก้ไข /** */ comments เป็น // format พร้อมคำอธิบายสองภาษา
-  ระบบค้นหาฟังก์ชันและเพิ่มคอมเมนต์อัตโนมัติ
-  ระบบสำรองไฟล์อัตโนมัติ
-  ระบบความปลอดภัยขั้นสูง:
  - การป้องกัน Path Traversal
  - การป้องกัน ReDoS Attack
  - การตรวจสอบ Symbolic Link
  - การจำกัดขนาดไฟล์
-  รองรับไฟล์ .js, .ts, .jsx, .tsx
-  โหมด AI-friendly สำหรับ AI Code Assistant
-  CLI Interface พร้อมตัวเลือกต่างๆ
-  รองรับ npx และการติดตั้ง global

### Features
- `--recursive` - ประมวลผลโฟลเดอร์ย่อยทั้งหมด
- `--add-missing` - เพิ่มคอมเมนต์ให้ฟังก์ชันที่ไม่มีคอมเมนต์
- `--ai-mode` - โหมด AI-friendly พร้อม @function และ @description tags

### Security
- ตรวจสอบไฟล์และโฟลเดอร์ที่อันตราย
- จำกัดประเภทไฟล์ที่รองรับ
- สำรองข้อมูลก่อนแก้ไขทุกครั้ง
- ป้องกันการโจมตีผ่าน Regular Expression