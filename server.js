const express = require('express');
const mysql = require('mysql2');
const nodemailer = require('nodemailer');
const cors = require('cors');

// Thần chú IPv4
require('dns').setDefaultResultOrder('ipv4first');

const app = express();
app.use(express.json());
app.use(cors());

// 🌟 THAY ĐỔI QUAN TRỌNG: Dùng createPool thay vì createConnection
const db = mysql.createPool({
    host: 'bang-hai-tac-db-tnquochuy10-73da.a.aivencloud.com',
    port: 22059,
    user: 'avnadmin',
    password: 'AVNS_59Y53sTggDfEvCZEtrf',
    database: 'defaultdb',
    ssl: {
        rejectUnauthorized: false
    },
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Cấu hình Nodemailer
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
    const data = req.body; 

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
    
    const sql = `INSERT INTO ho_so_ung_tuyen (ma_ht, ho_ten, email, sdt, ngay_sinh, gioi_tinh, vi_tri, ly_do) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
    
    // createPool vẫn dùng db.query mượt mà y như cũ
    db.query(sql, [data.ma_ht, data.ho_ten, data.email, data.sdt, data.ngay_sinh, data.gioi_tinh, data.vi_tri, data.ly_do], async (err, result) => {
        if (err) {
            console.error("Lỗi Database:", err);
            return res.status(500).json({ error: "Lỗi lưu dữ liệu: " + err.message });
        }
        
        const insertId = result.insertId; 

        try {
            await transporter.sendMail({
                from: '"Băng Hải Tặc Mũ Rơm" <tnquochuy10@gmail.com>',
                to: data.email,
                subject: 'Đã nhận hồ sơ gia nhập!',
                html: `<h3>Chào ${data.ho_ten},</h3><p>Hồ sơ ứng tuyển vị trí ${viTriDep} của bạn đã được chim hải âu giao tới tàu. Vui lòng chờ Thuyền trưởng quyết định nhé!</p>`
            });

            const linkDongY = `https://bang-hai-tac-api.onrender.com/api/duyet-ho-so?id=${insertId}&action=dong_y`;
            const linkTuChoi = `https://bang-hai-tac-api.onrender.com/api/duyet-ho-so?id=${insertId}&action=tu_choi`;

            await transporter.sendMail({
                from: '"Hệ thống Tàu" <tnquochuy10@gmail.com>',
                to: 'tnquochuy10@gmail.com', 
                subject: `[CÓ HỒ SƠ MỚI] Ứng viên: ${data.ho_ten}`,
                html: `
                    <p>Có người muốn gia nhập tàu nè!</p>
                    <p>Tên: ${data.ho_ten} | Vị trí: ${viTriDep}</p>
                    <p>Lý do: ${data.ly_do}</p>
                    <br>
                    <a href="${linkDongY}" style="padding: 10px; background: green; color: white; text-decoration: none;">ĐỒNG Ý NHẬN</a>
                    <a href="${linkTuChoi}" style="padding: 10px; background: red; color: white; text-decoration: none; margin-left: 10px;">TỪ CHỐI</a>
                `
            });

            res.json({ message: 'Nộp hồ sơ thành công!' });
        } catch (mailError) {
            console.error("Lỗi gửi mail:", mailError);
            res.status(500).json({ error: "Hồ sơ đã lưu nhưng lỗi gửi mail!" });
        }
    });
});

// ==========================================
// API 2: XỬ LÝ KHI BẠN BẤM NÚT TRONG EMAIL
// ==========================================
app.get('/api/duyet-ho-so', (req, res) => {
    const { id, action } = req.query; 

    db.query(`UPDATE ho_so_ung_tuyen SET trang_thai = ? WHERE id = ?`, [action, id], (err, result) => {
        if (err) return res.send('Lỗi cập nhật DB!');

        db.query(`SELECT ho_ten, email FROM ho_so_ung_tuyen WHERE id = ?`, [id], async (err, rows) => {
            if (err || rows.length === 0) return res.send('Không tìm thấy ứng viên!');
            
            const ungVien = rows[0];

            try {
                if (action === 'dong_y') {
                    await transporter.sendMail({
                        from: '"Băng Hải Tặc Mũ Rơm" <tnquochuy10@gmail.com>',
                        to: ungVien.email,
                        subject: '🎉 CHÚC MỪNG! BẠN ĐÃ ĐƯỢC NHẬN!',
                        html: `<h3>Chào ${ungVien.ho_ten},</h3><p>Thuyền trưởng đã đồng ý! Chuẩn bị hành lý nhổ neo thôi!</p>`
                    });
                    res.send('Đã duyệt ĐỒNG Ý và gửi mail báo cho ứng viên!');
                } else {
                    await transporter.sendMail({
                        from: '"Băng Hải Tặc Mũ Rơm" <tnquochuy10@gmail.com>',
                        to: ungVien.email,
                        subject: 'Thư từ chối...',
                        html: `<h3>Chào ${ungVien.ho_ten},</h3><p>Rất tiếc, hiện tại tàu đã đủ người hoặc kỹ năng của bạn chưa phù hợp. Hẹn bạn ở Đại Trình Tuyến nhé!</p>`
                    });
                    res.send('Đã duyệt TỪ CHỐI và gửi mail báo cho ứng viên!');
                }
            } catch (mailError) {
                res.send('Đã cập nhật trạng thái nhưng không gửi được mail cho ứng viên!');
            }
        });
    });
});

// ==========================================
// API 3: LẤY DANH SÁCH HỒ SƠ CHO GIAO DIỆN ADMIN
// ==========================================
app.get('/api/danh-sach-ho-so', (req, res) => {
    db.query('SELECT * FROM ho_so_ung_tuyen ORDER BY id DESC', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server Hải Tặc đã nhổ neo an toàn ở port ${PORT}...`);
});