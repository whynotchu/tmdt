// Initialize Dexie
const db = new Dexie('CoffeeShopDB');

// Define the database schema
db.version(1).stores({
    SanPham: '++MaSP, TenSP, GiaBan, Loai',
    HoaDon: '++MaHD, NgayLap, TenKhachHang, TongTien, PhuongThuc',
    ChiTietHoaDon: '++id, MaHD, MaSP, SoLuong, DonGia'
});

// Seed data
const seedProducts = async () => {
    const count = await db.SanPham.count();
    if (count === 0) {
        await db.SanPham.bulkAdd([
            { TenSP: 'Cà phê Đen Đá', GiaBan: 25000, Loai: 'Cà phê' },
            { TenSP: 'Cà phê Sữa Sài Gòn', GiaBan: 29000, Loai: 'Cà phê' },
            { TenSP: 'Bạc Xỉu 3 Tầng', GiaBan: 35000, Loai: 'Cà phê' },
            { TenSP: 'Cappuccino Ý', GiaBan: 45000, Loai: 'Espresso' },
            { TenSP: 'Latte Art Macchiato', GiaBan: 49000, Loai: 'Espresso' },
            { TenSP: 'Trà Đào Cam Sả', GiaBan: 39000, Loai: 'Trà' },
            { TenSP: 'Trà Vải Hoa Lài', GiaBan: 39000, Loai: 'Trà' },
            { TenSP: 'Chocolate Đá Xay', GiaBan: 55000, Loai: 'Đá xay' },
            { TenSP: 'Matcha Latte Nhật', GiaBan: 45000, Loai: 'Đá xay' },
            { TenSP: 'Caramel Macchiato', GiaBan: 52000, Loai: 'Espresso' },
            { TenSP: 'Trà Sữa Trân Châu', GiaBan: 42000, Loai: 'Trà' },
            { TenSP: 'Croissant Bơ Tỏi', GiaBan: 35000, Loai: 'Bánh' }
        ]);
        console.log('Database seeded successfully.');
    }
};

seedProducts();
