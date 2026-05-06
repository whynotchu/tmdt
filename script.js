const items = [
  {id:1,name:'Nước chanh dây',price:15},
  {id:2,name:'Dừa tươi',price:15},
  {id:3,name:'Cam ép',price:17},
  {id:4,name:'Cà rốt ép',price:20},
  {id:5,name:'Ổi ép',price:20},
  {id:6,name:'Thơm ép',price:20},
  {id:7,name:'Trà tắc',price:12},
  {id:8,name:'Trà cam xí muội',price:15},
  {id:9,name:'Cà phê đen đá',price:15},
  {id:10,name:'Cà phê sữa đá',price:17},
  {id:11,name:'Bạc xỉu đá',price:17}
];
const cart = {};
const cartItemsEl = document.getElementById('cartItems');
const cartTotalEl = document.getElementById('cartTotal');
const checkoutMessageEl = document.getElementById('checkoutMessage');
const paymentOptionsEl = document.getElementById('paymentOptions');
const paymentDetailsEl = document.getElementById('paymentDetails');
const qrImageEl = document.getElementById('qrImage');
const cartOverlayEl = document.getElementById('cartOverlay');
const cartCountEl = document.getElementById('cartCount');
const menuFilterEl = document.getElementById('menuFilter');
const productCards = document.querySelectorAll('[data-type]');
const filterButtons = document.querySelectorAll('.filter-btn');
const searchInputEl = document.getElementById('searchInput');

function loadCart() {
  try {
    const saved = localStorage.getItem('cart');
    if (saved) Object.assign(cart, JSON.parse(saved));
  } catch (e) {
    console.error('Error loading cart:', e);
  }
}

function saveCart() {
  try {
    localStorage.setItem('cart', JSON.stringify(cart));
  } catch (e) {
    console.error('Error saving cart:', e);
  }
}

function setFilter(type) {
  menuFilterEl.value = type;
  updateFilterButtons(type);
  filterMenu();
}

function updateFilterButtons(type) {
  filterButtons.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.filter === type);
  });
}

function filterMenu() {
  const type = menuFilterEl.value;
  updateFilterButtons(type);
  productCards.forEach(card => {
    card.style.display = type === 'all' || card.dataset.type === type ? 'block' : 'none';
  });
}

function filterSearch() {
  const query = searchInputEl.value.toLowerCase();
  productCards.forEach(card => {
    const name = card.querySelector('h3').textContent.toLowerCase();
    const desc = card.querySelector('p').textContent.toLowerCase();
    card.style.display = name.includes(query) || desc.includes(query) ? 'block' : 'none';
  });
}

function choosePayment(method) {
  checkoutMessageEl.style.display = 'none';
  if (method === 'cash') {
    paymentDetailsEl.style.display = 'none';
    checkoutMessageEl.style.display = 'block';
    checkoutMessageEl.style.background = '#fff7e7';
    checkoutMessageEl.style.color = '#7a4a2b';
    checkoutMessageEl.textContent = 'Bạn đã chọn thanh toán bằng tiền mặt. Nhân viên sẽ liên hệ để xác nhận đơn hàng.';
    setTimeout(toggleCart, 3000);
  } else if (method === 'transfer') {
    paymentDetailsEl.style.display = 'block';
    checkoutMessageEl.style.display = 'block';
    checkoutMessageEl.style.background = '#f0fff3';
    checkoutMessageEl.style.color = '#1f5d28';
    checkoutMessageEl.textContent = 'Quét mã QR để chuyển khoản hoặc dùng thông tin ngân hàng bên dưới.';
  }
}

function renderCart() {
  const entries = Object.entries(cart);
  if (entries.length === 0) {
    cartItemsEl.innerHTML = '<p style="margin:0;color:#6f5a52;">Giỏ hàng trống. Chọn món bạn thích nhé!</p>';
    paymentOptionsEl.style.display = 'none';
    paymentDetailsEl.style.display = 'none';
  } else {
    cartItemsEl.innerHTML = entries.map(([id, qty]) => {
      const item = items.find(i => i.id === Number(id));
      return '<div style="margin-bottom:14px;padding:14px;border-radius:22px;background:#fff4ea;display:flex;align-items:center;justify-content:space-between;">' +
        '<div><div style="font-weight:700;color:#2d2d2d;">' + item.name + '</div>' +
        '<div style="font-size:0.9rem;color:#6b4a42;margin-top:4px;">' + qty + ' x ' + item.price + 'k</div></div>' +
        '<div style="display:flex;align-items:center;gap:8px;">' +
        '<button onclick="removeFromCart(' + item.id + ')" style="border:none;border-radius:14px;padding:8px 10px;background:#ffb4a0;color:#7a3028;cursor:pointer;">-</button>' +
        '<button onclick="addToCart(' + item.id + ')" style="border:none;border-radius:14px;padding:8px 10px;background:#d23f4a;color:#fff;cursor:pointer;">+</button>' +
        '</div></div>';
    }).join('');
  }
  const total = entries.reduce((sum,[id,qty]) => {
    const item = items.find(i => i.id === Number(id));
    return sum + item.price * qty;
  }, 0);
  cartTotalEl.textContent = total + 'k';
  cartCountEl.textContent = entries.reduce((sum,[,qty]) => sum + qty, 0);
  checkoutMessageEl.style.display = 'none';
  saveCart();
}

function addToCart(id) {
  try {
    if (!items.find(i => i.id === id)) {
      alert('Sản phẩm không tồn tại');
      return;
    }
    cart[id] = (cart[id] || 0) + 1;
    renderCart();
    saveCart();
    // Bounce animation for cart count
    cartCountEl.style.animation = 'bounce 0.5s';
    setTimeout(() => cartCountEl.style.animation = '', 500);
  } catch (e) {
    console.error('Error adding to cart:', e);
    alert('Lỗi khi thêm sản phẩm');
  }
}

function removeFromCart(id) {
  try {
    if (!cart[id]) return;
    cart[id]--;
    if (cart[id] === 0) delete cart[id];
    renderCart();
    saveCart();
  } catch (e) {
    console.error('Error removing from cart:', e);
    alert('Lỗi khi xóa sản phẩm');
  }
}

function toggleCart() {
  cartOverlayEl.style.display = cartOverlayEl.style.display === 'flex' ? 'none' : 'flex';
}

function confirmTransfer() {
  checkoutMessageEl.textContent = 'Cảm ơn bạn đã thanh toán. Nhân viên sẽ xác nhận đơn hàng.';
  checkoutMessageEl.style.background = '#f0fff3';
  checkoutMessageEl.style.color = '#1f5d28';
  checkoutMessageEl.style.display = 'block';
  setTimeout(toggleCart, 2000);
}

renderCart();
filterMenu();
loadCart();
searchInputEl.addEventListener('input', filterSearch);

// Remove skeleton loaders after 1.5s
window.addEventListener('load', () => {
  setTimeout(() => {
    document.querySelectorAll('.skeleton').forEach(el => el.remove());
  }, 1500);
});

// A/B Testing: Random variation for CTA color
const variations = ['#d23f4a', '#ff6b6b'];
const randomVariation = variations[Math.floor(Math.random() * variations.length)];
document.querySelectorAll('.add-btn').forEach(btn => btn.style.background = `linear-gradient(135deg, ${randomVariation}, #ff6b6b)`);

// Form Validation - wait for DOM to be ready
document.addEventListener('DOMContentLoaded', () => {
  const contactForm = document.getElementById('contactForm');
  const formMessage = document.getElementById('formMessage');
  
  if (contactForm && formMessage) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('email').value;
      const message = document.getElementById('message').value;
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        formMessage.textContent = 'Email không hợp lệ.';
        return;
      }
      if (message.trim() === '') {
        formMessage.textContent = 'Vui lòng nhập tin nhắn.';
        return;
      }
      formMessage.textContent = 'Cảm ơn bạn đã liên hệ! Chúng tôi sẽ phản hồi sớm.';
      contactForm.reset();
    });
  }
});
