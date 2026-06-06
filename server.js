const express = require('express');
const mysql = require('mysql2');
const nodemailer = require('nodemailer');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// 1. Cấu hình Database
const db = mysql.createConnection({
    host: 'bang-hai-tac-db-tnquochuy10-73da.g.aivencloud.com',
    port: 22059,
    user: 'avnadmin',
    password: 'AVNS_59Y53sTggDfEvCZEtrf',
    database: 'defaultdb',
    ssl: {
        rejectUnauthorized: false
    }
});

// 2. Cấu hình Nodemailer (Dùng Gmail của bạn)
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'tnquochuy10@gmail.com',
        pass: 'putf rqmh htdj aflc'    
    }
});

// ==========================================
// API 1: XỬ LÝ KHI ỨNG VIÊN BẤM "RA KHƠI"
// ==========================================
app.post('/api/nop-ho-so', (req, res) => {
    const data = req.body; // Dữ liệu từ form gửi lên

    // MỚI: Thêm từ điển dịch chức danh ở đây
    const tuDienViTri = {
        'thuyen_vien': 'Thuyền Viên ⚓',
        'kiem_si': 'Kiếm Sĩ ⚔️',
        'hoa_tieu': 'Hoa Tiêu 🧭',
        'bac_si': 'Bác Sĩ 🩺',
        'dau_bep': 'Đầu Bếp 🍳',
        'tho_dong_tau': 'Thợ Đóng Tàu 🪚',
        'khao_co': 'Khảo Cổ Học 📜',
        'it_tau': 'IT Hệ Thống Tàu 💻',
        'xa_thu': 'Xạ Thủ 🎯',
        'nhac_cong': 'Nhạc Công 🎻',
        'lai_tau': 'Lái Tàu 🚢'
    };

    const viTriDep = tuDienViTri[data.vi_tri] || data.vi_tri;
    
    // Insert vào DB
    const sql = `INSERT INTO ho_so_ung_tuyen (ma_ht, ho_ten, email, sdt, ngay_sinh, gioi_tinh, vi_tri, ly_do) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
    
    db.query(sql, [data.ma_ht, data.ho_ten, data.email, data.sdt, data.ngay_sinh, data.gioi_tinh, data.vi_tri, data.ly_do], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        
        const insertId = result.insertId; // Lấy ID của hồ sơ vừa nộp

        // 1. Gửi mail thông báo chờ duyệt cho Ứng viên
        transporter.sendMail({
            from: '"Băng Hải Tặc Mũ Rơm" <tnquochuy10@gmail.com>',
            to: data.email,
            subject: 'Đã nhận hồ sơ gia nhập!',
            html: `<h3>Chào ${data.ho_ten},</h3><p>Hồ sơ ứng tuyển vị trí ${data.vi_tri} của bạn đã được chim hải âu giao tới tàu. Vui lòng chờ Thuyền trưởng quyết định nhé!</p>`
        });

        // 2. Gửi mail thông báo cho Admin (kèm 2 nút Duyệt/Từ chối)
        // Đường dẫn gọi về server của bạn (chạy localhost port 3000)
        const linkDongY = `http://localhost:3000/api/duyet-ho-so?id=${insertId}&action=dong_y`;
        const linkTuChoi = `http://localhost:3000/api/duyet-ho-so?id=${insertId}&action=tu_choi`;

        transporter.sendMail({
            from: '"Hệ thống Tàu" <tnquochuy10@gmail.com>',
            to: 'tnquochuy10@gmail.com', // Mail của bạn
            subject: `[CÓ HỒ SƠ MỚI] Ứng viên: ${data.ho_ten}`,
            html: `
                <p>Có người muốn gia nhập tàu nè!</p>
                <p>Tên: ${data.ho_ten} | Vị trí: ${data.vi_tri}</p>
                <p>Lý do: ${data.ly_do}</p>
                <br>
                <a href="${linkDongY}" style="padding: 10px; background: green; color: white; text-decoration: none;">ĐỒNG Ý NHẬN</a>
                <a href="${linkTuChoi}" style="padding: 10px; background: red; color: white; text-decoration: none; margin-left: 10px;">TỪ CHỐI</a>
            `
        });

        res.json({ message: 'Nộp hồ sơ thành công!' });
    });
});

// ==========================================
// API 2: XỬ LÝ KHI BẠN BẤM NÚT TRONG EMAIL
// ==========================================
app.get('/api/duyet-ho-so', (req, res) => {
    const { id, action } = req.query; // Lấy id hồ sơ và hành động (dong_y / tu_choi) từ thanh URL

    // Cập nhật trạng thái vào DB
    db.query(`UPDATE ho_so_ung_tuyen SET trang_thai = ? WHERE id = ?`, [action, id], (err, result) => {
        if (err) return res.send('Lỗi cập nhật DB!');

        // Lấy lại email của ứng viên để báo kết quả
        db.query(`SELECT ho_ten, email FROM ho_so_ung_tuyen WHERE id = ?`, [id], (err, rows) => {
            if (err || rows.length === 0) return res.send('Không tìm thấy ứng viên!');
            
            const ungVien = rows[0];

            if (action === 'dong_y') {
                transporter.sendMail({
                    from: '"Băng Hải Tặc Mũ Rơm" <tnquochuy10@gmail.com>',
                    to: ungVien.email,
                    subject: '🎉 CHÚC MỪNG! BẠN ĐÃ ĐƯỢC NHẬN!',
                    html: `<h3>Chào ${ungVien.ho_ten},</h3><p>Thuyền trưởng đã đồng ý! Chuẩn bị hành lý nhổ neo thôi!</p>`
                });
                res.send('Đã duyệt ĐỒNG Ý và gửi mail báo cho ứng viên!');
            } else {
                transporter.sendMail({
                    from: '"Băng Hải Tặc Mũ Rơm" <tnquochuy10@gmail.com>',
                    to: ungVien.email,
                    subject: 'Thư từ chối...',
                    html: `<h3>Chào ${ungVien.ho_ten},</h3><p>Rất tiếc, hiện tại tàu đã đủ người hoặc kỹ năng của bạn chưa phù hợp. Hẹn bạn ở Đại Trình Tuyến nhé!</p>`
                });
                res.send('Đã duyệt TỪ CHỐI và gửi mail báo cho ứng viên!');
            }
        });
    });
});

// ==========================================
// API 3: LẤY DANH SÁCH HỒ SƠ CHO GIAO DIỆN ADMIN
// ==========================================
app.get('/api/danh-sach-ho-so', (req, res) => {
    // Sắp xếp ORDER BY id DESC để hồ sơ mới nộp luôn nằm trên cùng
    db.query('SELECT * FROM ho_so_ung_tuyen ORDER BY id DESC', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});
app.listen(3000, () => {
    console.log('Server Hải Tặc đang chạy ở port 3000...');
});