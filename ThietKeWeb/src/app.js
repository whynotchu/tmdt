// db is globally available from db.js

// Application State
let cart = [];
let currentFilter = 'all';

// DOM Elements
const productGrid = document.getElementById('product-grid');
const cartSidebar = document.getElementById('cart-sidebar');
const cartItemsContainer = document.getElementById('cart-items');
const cartCount = document.getElementById('cart-count');
const cartTotal = document.getElementById('cart-total');
const cartToggle = document.getElementById('cart-toggle');
const cartClose = document.getElementById('cart-close');
const cartOverlay = document.getElementById('cart-overlay');
const checkoutBtn = document.getElementById('checkout-btn');
const customerNameInput = document.getElementById('customer-name');
const paymentSelect = document.getElementById('payment-select');
const filterBtns = document.querySelectorAll('.filter-btn');
const navItems = document.querySelectorAll('.nav-item');
const views = document.querySelectorAll('.view');
const viewTitle = document.getElementById('view-title');
const ordersList = document.getElementById('orders-list');

// --- Initialization ---
const init = async () => {
    renderProducts();
    updateCartUI();
    setupEventListeners();
};

// --- View Rendering ---

const renderProducts = async () => {
    const products = await db.SanPham.toArray();
    const filtered = currentFilter === 'all' 
        ? products 
        : products.filter(p => p.Loai === currentFilter);

    productGrid.innerHTML = filtered.map(product => `
        <div class="product-card">
            <div class="product-img">☕</div>
            <div class="type">${product.Loai}</div>
            <h3>${product.TenSP}</h3>
            <div class="product-footer">
                <span class="price">${product.GiaBan.toLocaleString('vi-VN')}₫</span>
                <button class="add-btn" data-id="${product.MaSP}">+</button>
            </div>
        </div>
    `).join('');

    // Add listeners to new buttons
    document.querySelectorAll('.add-btn').forEach(btn => {
        btn.onclick = () => addToCart(parseInt(btn.dataset.id));
    });
};

const renderOrders = async () => {
    const orders = await db.HoaDon.orderBy('MaHD').reverse().toArray();
    ordersList.innerHTML = orders.map(order => `
        <tr>
            <td>#${order.MaHD}</td>
            <td>${new Date(order.NgayLap).toLocaleString('vi-VN')}</td>
            <td>${order.TenKhachHang}</td>
            <td><strong>${order.TongTien.toLocaleString('vi-VN')}₫</strong></td>
            <td><span class="status-badge">${order.PhuongThuc}</span></td>
            <td>
                <button class="btn-detail" onclick="viewOrderDetail(${order.MaHD})">👁️</button>
            </td>
        </tr>
    `).join('');
};

// --- Cart Logic ---

const addToCart = async (maSP) => {
    const product = await db.SanPham.get(maSP);
    const existing = cart.find(item => item.MaSP === maSP);

    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }

    updateCartUI();
    // showCart(); // Disabled auto-show as requested
};

const removeFromCart = (maSP) => {
    cart = cart.filter(item => item.MaSP !== maSP);
    updateCartUI();
};

const updateQty = (maSP, delta) => {
    const item = cart.find(i => i.MaSP === maSP);
    if (item) {
        item.quantity += delta;
        if (item.quantity <= 0) removeFromCart(maSP);
        else updateCartUI();
    }
};

const updateCartUI = () => {
    const total = cart.reduce((sum, item) => sum + (item.GiaBan * item.quantity), 0);
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);

    cartCount.textContent = count;
    cartTotal.textContent = total.toLocaleString('vi-VN') + '₫';

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<div class="empty-cart-msg">Giỏ hàng đang trống</div>';
        checkoutBtn.disabled = true;
    } else {
        cartItemsContainer.innerHTML = cart.map(item => `
            <div class="cart-item">
                <div class="cart-item-info">
                    <h4>${item.TenSP}</h4>
                    <p>${(item.GiaBan * item.quantity).toLocaleString('vi-VN')}₫</p>
                </div>
                <div class="qty-controls">
                    <button class="qty-btn" onclick="window.app.updateQty(${item.MaSP}, -1)">-</button>
                    <span>${item.quantity}</span>
                    <button class="qty-btn" onclick="window.app.updateQty(${item.MaSP}, 1)">+</button>
                </div>
            </div>
        `).join('');
        checkoutBtn.disabled = false;
    }
};

// --- Checkout Logic ---

const handleCheckout = async () => {
    const name = customerNameInput.value.trim() || 'Khách vãng lai';
    const total = cart.reduce((sum, item) => sum + (item.GiaBan * item.quantity), 0);
    const method = paymentSelect.value;

    try {
        // 1. Create Invoice (HoaDon)
        const maHD = await db.HoaDon.add({
            NgayLap: new Date().toISOString(),
            TenKhachHang: name,
            TongTien: total,
            PhuongThuc: method
        });

        // 2. Create Details (ChiTietHoaDon)
        const details = cart.map(item => ({
            MaHD: maHD,
            MaSP: item.MaSP,
            SoLuong: item.quantity,
            DonGia: item.GiaBan
        }));
        await db.ChiTietHoaDon.bulkAdd(details);

        // 3. Reset Cart
        alert(`Thanh toán thành công! Mã đơn hàng: #${maHD}`);
        cart = [];
        customerNameInput.value = '';
        updateCartUI();
        hideCart();
        if (currentView === 'orders') renderOrders();
    } catch (err) {
        console.error('Checkout error:', err);
        alert('Có lỗi xảy ra khi thanh toán.');
    }
};

// --- Event Listeners ---

const setupEventListeners = () => {
    cartToggle.onclick = showCart;
    cartClose.onclick = hideCart;
    cartOverlay.onclick = hideCart;
    checkoutBtn.onclick = handleCheckout;

    filterBtns.forEach(btn => {
        btn.onclick = () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.dataset.filter;
            renderProducts();
        };
    });

    navItems.forEach(item => {
        item.onclick = () => {
            const view = item.dataset.view;
            switchView(view);
            navItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');
        };
    });
};

let currentView = 'shop';
const switchView = (view) => {
    currentView = view;
    views.forEach(v => v.classList.add('hidden'));
    document.getElementById(`${view}-view`).classList.remove('hidden');
    viewTitle.textContent = view === 'shop' ? 'Thực đơn Coffee' : 'Quản lý Đơn hàng';
    if (view === 'orders') renderOrders();
};

const showCart = () => {
    cartSidebar.classList.remove('hidden');
    cartOverlay.classList.remove('hidden');
};

const hideCart = () => {
    cartSidebar.classList.add('hidden');
    cartOverlay.classList.add('hidden');
};

// Expose functions to window for onclick handlers
window.app = { updateQty };
window.viewOrderDetail = async (maHD) => {
    const order = await db.HoaDon.get(maHD);
    const details = await db.ChiTietHoaDon.where('MaHD').equals(maHD).toArray();
    
    // Fetch product names for details
    const productIds = details.map(d => d.MaSP);
    const products = await db.SanPham.where('MaSP').anyOf(productIds).toArray();
    const productMap = products.reduce((acc, p) => ({ ...acc, [p.MaSP]: p.TenSP }), {});

    const content = `
        <div class="order-summary" style="margin-bottom: 20px; line-height: 1.6;">
            <p><strong>Khách hàng:</strong> ${order.TenKhachHang}</p>
            <p><strong>Ngày lập:</strong> ${new Date(order.NgayLap).toLocaleString('vi-VN')}</p>
            <p><strong>Thanh toán:</strong> <span class="status-badge ${order.PhuongThuc}">${order.PhuongThuc}</span></p>
        </div>
        <div class="table-responsive">
            <table class="detail-table">
                <thead>
                    <tr>
                        <th>Sản phẩm</th>
                        <th style="text-align:center">SL</th>
                        <th style="text-align:right">Đơn giá</th>
                        <th style="text-align:right">Thành tiền</th>
                    </tr>
                </thead>
                <tbody>
                    ${details.map(d => `
                        <tr>
                            <td>${productMap[d.MaSP] || 'Sản phẩm ' + d.MaSP}</td>
                            <td style="text-align:center">${d.SoLuong}</td>
                            <td style="text-align:right">${d.DonGia.toLocaleString('vi-VN')}₫</td>
                            <td style="text-align:right">${(d.SoLuong * d.DonGia).toLocaleString('vi-VN')}₫</td>
                        </tr>
                    `).join('')}
                </tbody>
                <tfoot>
                    <tr>
                        <td colspan="3" style="text-align:right; padding-top: 15px; border:none;"><strong>Tổng cộng:</strong></td>
                        <td style="text-align:right; padding-top: 15px; border:none;"><strong style="color: var(--accent); font-size: 1.3rem;">${order.TongTien.toLocaleString('vi-VN')}₫</strong></td>
                    </tr>
                </tfoot>
            </table>
        </div>
    `;
    
    document.getElementById('order-details-content').innerHTML = content;
    document.getElementById('modal-mahd').textContent = '#' + maHD;
    document.getElementById('modal-overlay').classList.remove('hidden');
};

document.querySelectorAll('.modal-close, .modal-overlay').forEach(el => {
    el.onclick = (e) => {
        if (e.target === el) document.getElementById('modal-overlay').classList.add('hidden');
    };
});

init();
