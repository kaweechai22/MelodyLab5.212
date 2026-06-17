# MelodyLab v5.177 - Full Base v5.175 + Final Sound Diffraction

ชุดนี้ใช้ MelodyLab v5.175 เป็นฐานเต็มของแอป และอัปเดตเฉพาะหัวข้อ Sound Diffraction ด้วยเวอร์ชันที่ตรวจหลักฟิสิกส์แล้ว

## หลักการทำไฟล์
- คงฟังก์ชันหลักของ MelodyLab จาก v5.175 ไว้ครบ
- คงหน้า Home และหน้า Visualizer ที่มีหลายหัวข้อไว้
- แทนเฉพาะไฟล์ visualizer_sound_diffraction.html
- ไม่แก้หน้า Reflection / Refraction / Measure / Analysis / Spectrogram / Generator / Calibration

## Sound Diffraction ที่อัปเดต
- หน้าคลื่นจากลำโพงเคลื่อนที่จากซ้ายไปขวา
- แสดงการเลี้ยวเบนผ่านช่องเปิดเดี่ยว
- ฉากรับ/แนวผู้ฟังแสดงโปรไฟล์ความเข้มเสียงสัมพัทธ์ I/I0 ไม่ใช่แถบสว่างของแสง
- ใช้ λ = v/f และ v ≈ 331 + 0.6T
- ใช้ a sinθ1 = λ เฉพาะเมื่อ a > λ
- ถ้า a ≤ λ แสดงว่า “แผ่กว้างมาก”
