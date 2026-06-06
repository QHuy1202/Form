// script.js

// 1. Tính toán ngày tối đa được phép chọn (Hôm nay trừ đi 10 năm)
const today = new Date();
const maxBirthDate = new Date(today.getFullYear() - 10, today.getMonth(), today.getDate());

// 2. Khởi tạo Flatpickr cho ô nhập ngày sinh
flatpickr("#ngay_sinh", {
    dateFormat: "d/m/Y",
    allowInput: true,
    maxDate: maxBirthDate // Khóa luôn các ngày sinh của người dưới 10 tuổi trên bảng lịch
});

// 3. Bắt sự kiện khi người dùng bấm nút "RA KHƠI" (Submit Form)
document.getElementById("pirateForm").addEventListener("submit", function(event) {
    // Ngăn chặn form tải lại trang mặc định để mình xử lý validate trước
    event.preventDefault(); 
    
    // Lấy giá trị ngày sinh người dùng nhập
    const ngaySinhValue = document.getElementById("ngay_sinh").value;
    
    // Kiểm tra xem đã nhập ngày sinh chưa
    if (!ngaySinhValue) {
        alert("Thuyền trưởng cần biết ngày ra đời của bạn để xem có đủ tuổi ra khơi không chứ!");
        return;
    }
    
    // Cắt chuỗi dd/mm/yyyy để chuyển thành Object Date trong JS nhằm tính tuổi thực tế
    const parts = ngaySinhValue.split("/");
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // Tháng trong JS bắt đầu từ 0
    const year = parseInt(parts[2], 10);
    const birthDate = new Date(year, month, day);
    
    // Thuật toán tính tuổi chuẩn xác
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();
    
    // Nếu chưa tới tháng sinh hoặc chưa tới ngày sinh trong tháng đó thì chưa đủ tuổi đầy
    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    
    // Kiểm tra điều kiện 10 tuổi trở lên
    if (age < 10) {
        alert("Trông bạn còn 'búng ra sữa' quá! Băng hải tặc chỉ tuyển thành viên từ 10 tuổi trở lên thôi nha nhóc!");
        return;
    }
    
    // Nếu vượt qua tất cả các bước validate trên
    const formData = {
        ma_ht: document.getElementById('ma_ht').value,
        ho_ten: document.getElementById('ho_ten').value,
        email: document.getElementById('email').value,
        sdt: document.getElementById('sdt').value,
        ngay_sinh: document.getElementById('ngay_sinh').value,
        
        // Lấy giá trị của ô Giới tính đang được check
        gioi_tinh: document.querySelector('input[name="gioi_tinh"]:checked').value,
        
        vi_tri: document.getElementById('vi_tri').value,
        
        // Gom các kỹ năng (nếu có chọn nhiều ô) thành 1 chuỗi chữ
        ky_nang: Array.from(document.querySelectorAll('input[name="ky_nang"]:checked')).map(cb => cb.value).join(', '),
        
        ly_do: document.getElementById('ly_do').value
    };

    // Đổi nút thành "Đang gửi..." để người dùng biết hệ thống đang xử lý
    const submitBtn = document.querySelector('.btn-submit');
    submitBtn.textContent = "ĐANG GỬI THƯ...";
    submitBtn.disabled = true;

    // Bắn dữ liệu qua Node.js
    fetch('https://bang-hai-tac-api.onrender.com/api/nop-ho-so', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
    })
    .then(response => response.json())
    .then(data => {
        // Nếu Node.js báo gửi thành công thì mới chuyển sang trang chờ
        window.location.href = "success.html";
    })
    .catch(error => {
        console.error('Lỗi:', error);
        alert("Có lỗi xảy ra khi gửi chim hải âu đi! Vui lòng thử lại.");
        submitBtn.textContent = "RA KHƠI";
        submitBtn.disabled = false;
    });
    
});

// =========================================
    // XỬ LÝ CUSTOM DROPDOWN
    // =========================================
    const dropdownSelected = document.querySelector('.dropdown-selected');
    const dropdownOptions = document.querySelector('.dropdown-options');
    const hiddenInput = document.getElementById('vi_tri');
    const options = document.querySelectorAll('.dropdown-options .option');

    // 1. Mở/Đóng dropdown khi click vào ô chọn
    dropdownSelected.addEventListener('click', function(e) {
        e.stopPropagation(); // Ngăn chặn sự kiện click lan ra ngoài
        dropdownOptions.classList.toggle('show');
        this.classList.toggle('active');
    });

    // 2. Xử lý khi click chọn một vị trí
    options.forEach(option => {
        option.addEventListener('click', function() {
            // Cập nhật text hiển thị
            dropdownSelected.textContent = this.textContent;
            // Cập nhật value cho thẻ input ẩn để submit
            hiddenInput.value = this.getAttribute('data-value');
            // Đóng dropdown
            dropdownOptions.classList.remove('show');
            dropdownSelected.classList.remove('active');
        });
    });

    // 3. Click ra ngoài vùng dropdown thì tự động đóng lại
    document.addEventListener('click', function(e) {
        if (!dropdownSelected.contains(e.target) && !dropdownOptions.contains(e.target)) {
            dropdownOptions.classList.remove('show');
            dropdownSelected.classList.remove('active');
        }
    });

