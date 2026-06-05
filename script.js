const CONFIG = {
    storeName: "Tama x Superrior",
    ownerName: "Tama x Superrior",
    avatar: "image/logo/logo.jpg",
    instagram: "",
    telegram: "https://t.me/Bosmuda908",
    whatsappNumber: "628995444004",
    adminNumber: "628995444004"
};

const products = [
    { id: 1, name: "MEMBER", packages: [
        { duration: "Per Hari", price: 3000 },
        { duration: "1 Bulan", price: 5000 },
        { duration: "Permanen", price: 10000 }
    ]},
    { id: 2, name: "RESELLER", packages: [
        { duration: "Per Hari", price: 5000 },
        { duration: "1 Bulan", price: 10000 },
        { duration: "Permanen", price: 25000 }
    ]},
    { id: 3, name: "ADMIN", packages: [
        { duration: "Per Hari", price: 10000 },
        { duration: "1 Bulan", price: 15000 },
        { duration: "Permanen", price: 30000 }
    ]},
    { id: 4, name: "PARTNER", packages: [
        { duration: "Per Hari", price: 15000 },
        { duration: "1 Bulan", price: 20000 },
        { duration: "Permanen", price: 35000 }
    ]},
    { id: 5, name: "TANGAN KANAN", packages: [
        { duration: "Per Hari", price: 20000 },
        { duration: "1 Bulan", price: 25000 },
        { duration: "Permanen", price: 40000 }
    ]},
    { id: 6, name: "MODERATOR", packages: [
        { duration: "Per Hari", price: 25000 },
        { duration: "1 Bulan", price: 30000 },
        { duration: "Permanen", price: 45000 }
    ]},
    { id: 7, name: "OWNER", packages: [
        { duration: "Per Hari", price: 30000 },
        { duration: "1 Bulan", price: 35000 },
        { duration: "Permanen", price: 50000 }
    ]}
];

let cart = JSON.parse(localStorage.getItem("cart") || "[]");
let currentProduct = null;
let bannerInterval = null;

function playSound() {
    const audio = document.getElementById("clickSound");
    if (audio) {
        audio.currentTime = 0;
        audio.play().catch(() => {});
    }
}

function addRipple(e, element) {
    const rect = element.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const ripple = document.createElement("span");
    ripple.className = "ripple-effect";
    ripple.style.width = ripple.style.height = size + "px";
    ripple.style.left = e.clientX - rect.left - size / 2 + "px";
    ripple.style.top = e.clientY - rect.top - size / 2 + "px";
    element.style.position = "relative";
    element.style.overflow = "hidden";
    element.appendChild(ripple);
    setTimeout(() => ripple.remove(), 500);
}

document.addEventListener("click", function(e) {
    const target = e.target.closest(".product-card, .feature-item, .social-icon, .btn-buy, .btn-cart, .menu-btn, .cart-badge, .menu-item, .modal-close, .btn-confirm, .duration-option");
    if (target && !target.closest(".modal-overlay")) {
        playSound();
        addRipple(e, target);
    }
});

function updateCartCount() {
    document.getElementById("cartCount").innerText = cart.reduce((sum, i) => sum + i.qty, 0);
    localStorage.setItem("cart", JSON.stringify(cart));
}

function showToast(message) {
    let toast = document.querySelector(".toast-notification");
    if (!toast) {
        toast = document.createElement("div");
        toast.className = "toast-notification";
        document.body.appendChild(toast);
    }
    toast.innerText = message;
    toast.classList.add("show");
    setTimeout(() => {
        toast.classList.remove("show");
    }, 2000);
}

function addToCart(productWithPackage) {
    const existing = cart.find(i => i.id === productWithPackage.id && i.duration === productWithPackage.duration);
    if (existing) {
        existing.qty++;
    } else {
        cart.push({ ...productWithPackage, qty: 1 });
    }
    updateCartCount();
    showToast(`${productWithPackage.name} (${productWithPackage.duration}) +1`);
}

function initBanner() {
    const container = document.getElementById("bannerSlider");
    if (!container) return;
    container.innerHTML = '';
    const video = document.createElement('video');
    video.src = 'image/banner/banner.mp4';
    video.autoplay = true;
    video.loop = true;
    video.muted = true;
    video.playsInline = true;
    video.style.width = '100%';
    video.style.height = '100%';
    video.style.objectFit = 'cover';
    container.appendChild(video);
}

function showDurationSelector(product) {
    const modal = document.getElementById("productDetailModal");
    const content = document.getElementById("detailContent");
    content.innerHTML = `
        <div class="detail-title">${product.name}</div>
        <div style="margin: 16px 0;">
            ${product.packages.map(pkg => `
                <button class="duration-option" data-duration="${pkg.duration}" data-price="${pkg.price}">
                    ${pkg.duration} - Rp ${pkg.price.toLocaleString('id-ID')}
                </button>
            `).join('')}
        </div>
        <button class="modal-close" id="closeDuration">Batal</button>
    `;
    modal.classList.add("open");
    document.getElementById("modalOverlay").classList.add("active");
    
    document.querySelectorAll(".duration-option").forEach(btn => {
        btn.addEventListener("click", () => {
            const duration = btn.dataset.duration;
            const price = parseInt(btn.dataset.price);
            closeDetail();
            showPaymentWithDuration(product, { duration, price });
        });
    });
    document.getElementById("closeDuration")?.addEventListener("click", closeDetail);
}

function showProductDetail(product) {
    currentProduct = product;
    const modal = document.getElementById("productDetailModal");
    const content = document.getElementById("detailContent");
    content.innerHTML = `
        <div class="detail-title">${product.name}</div>
        <div class="detail-desc">Pilih durasi untuk melanjutkan pembelian</div>
        <div class="product-actions" style="margin-top:16px;">
            <button class="btn-buy" style="flex:1;" id="detailBuyBtn">Pilih Durasi</button>
            <button class="btn-cart" style="flex:1;" id="detailCartBtn"><i class="ri-add-line"></i> Keranjang</button>
        </div>
    `;
    modal.classList.add("open");
    document.getElementById("modalOverlay").classList.add("active");
    document.getElementById("detailBuyBtn").onclick = () => { showDurationSelector(product); closeDetail(); };
    document.getElementById("detailCartBtn").onclick = () => { showDurationSelector(product); closeDetail(); };
}

function closeDetail() {
    document.getElementById("productDetailModal").classList.remove("open");
    document.getElementById("modalOverlay").classList.remove("active");
}

function showPaymentWithDuration(product, selectedPackage) {
    const modal = document.getElementById("paymentModal");
    const content = document.getElementById("paymentContent");
    content.innerHTML = `
        <div style="text-align:center; padding: 0 10px;">
            <img src="image/qris.png" class="qris-image" onerror="this.src='https://placehold.co/300x300?text=QRIS'">
            <div style="font-size:20px; font-weight:700; margin-top:10px;">${product.name} (${selectedPackage.duration})</div>
            <div style="font-size:28px; font-weight:800; color:#22d3ee; margin:12px 0;">Rp ${selectedPackage.price.toLocaleString('id-ID')}</div>
            <div class="payment-note">
                <i class="ri-alert-line"></i> Untuk Saat Ini Pembayaran Tidak Bisa Memakai QRIS. Silahkan Melakukan Pembayaran Ke Dana Dengan Nomor 08995444004
            </div>
            <button class="btn-confirm" id="confirmWAButton">
                <i class="ri-whatsapp-line"></i> Konfirmasi via WhatsApp
            </button>
        </div>
    `;
    modal.classList.add("open");
    document.getElementById("modalOverlay").classList.add("active");
    document.getElementById("confirmWAButton").onclick = () => {
        const message = `Halo admin, saya ingin konfirmasi pembayaran untuk produk: ${product.name} (${selectedPackage.duration}) dengan harga Rp ${selectedPackage.price.toLocaleString('id-ID')}. Terima kasih.`;
        const url = `https://wa.me/${CONFIG.adminNumber}?text=${encodeURIComponent(message)}`;
        window.open(url, "_blank");
    };
}

function closePayment() {
    document.getElementById("paymentModal").classList.remove("open");
    document.getElementById("modalOverlay").classList.remove("active");
}

function showCart() {
    const main = document.getElementById("mainContent");
    if (cart.length === 0) {
        main.innerHTML = `
            <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 60vh; text-align: center;">
                <i class="ri-shopping-cart-line" style="font-size: 80px; color: #8e95a5; margin-bottom: 20px;"></i>
                <p style="font-size: 16px; color: #8e95a5; margin-bottom: 24px;">Keranjang kosong</p>
                <button id="btnBackToShop" style="width: 200px; padding: 12px 24px; background: var(--accent); border: none; border-radius: 40px; color: white; font-weight: 600; cursor: pointer;">Kembali Belanja</button>
            </div>
        `;
        const backBtn = document.getElementById("btnBackToShop");
        if (backBtn) {
            backBtn.onclick = function(e) {
                e.stopPropagation();
                renderHome();
            };
        }
        return;
    }
    
    const total = cart.reduce((sum, i) => sum + (i.price * i.qty), 0);
    main.innerHTML = `
        <div style="padding:20px 0;">
            <div style="display:flex; align-items:center; gap:12px; margin-bottom:20px;">
                <i class="ri-arrow-left-line" id="backHomeFromCart" style="font-size:24px; cursor:pointer;"></i>
                <h2 style="font-size:20px;">Keranjang Belanja</h2>
            </div>
            <div class="cart-items">
                ${cart.map(item => `
                    <div class="cart-item">
                        <div><strong>${item.name} (${item.duration})</strong><br><small>Rp ${item.price.toLocaleString('id-ID')}</small></div>
                        <div style="display:flex; align-items:center; gap:12px;">
                            <button class="cart-qty-minus" data-id="${item.id}" data-duration="${item.duration}" style="background:#2a2f38; border:none; width:32px; height:32px; border-radius:16px; cursor:pointer; font-size:16px; color:white;">-</button>
                            <span style="min-width:24px; text-align:center;">${item.qty}</span>
                            <button class="cart-qty-plus" data-id="${item.id}" data-duration="${item.duration}" style="background:#2a2f38; border:none; width:32px; height:32px; border-radius:16px; cursor:pointer; font-size:16px; color:white;">+</button>
                            <button class="cart-remove" data-id="${item.id}" data-duration="${item.duration}" style="background:#dc2626; border:none; width:32px; height:32px; border-radius:16px; cursor:pointer; color:white;"><i class="ri-delete-bin-line"></i></button>
                        </div>
                    </div>
                `).join('')}
            </div>
            <div class="cart-total">Total: Rp ${total.toLocaleString('id-ID')}</div>
            <button class="btn-buy" id="checkoutFromCart" style="width:100%; padding:14px;">Checkout Semua</button>
            <button id="backToShopBtn" style="width:100%; padding:14px; margin-top:12px; background:var(--bg-elevated); border:1px solid var(--border); border-radius:40px; color:white; cursor:pointer;">Kembali Belanja</button>
        </div>
    `;
    
    document.getElementById("backHomeFromCart")?.addEventListener("click", () => renderHome());
    document.getElementById("backToShopBtn")?.addEventListener("click", () => renderHome());
    
    document.querySelectorAll(".cart-qty-minus").forEach(btn => {
        btn.addEventListener("click", (e) => {
            e.stopPropagation();
            const id = parseInt(btn.dataset.id);
            const duration = btn.dataset.duration;
            const index = cart.findIndex(i => i.id === id && i.duration === duration);
            if (index !== -1) {
                if (cart[index].qty > 1) cart[index].qty--;
                else cart.splice(index, 1);
                updateCartCount();
                showCart();
            }
        });
    });
    
    document.querySelectorAll(".cart-qty-plus").forEach(btn => {
        btn.addEventListener("click", (e) => {
            e.stopPropagation();
            const id = parseInt(btn.dataset.id);
            const duration = btn.dataset.duration;
            const item = cart.find(i => i.id === id && i.duration === duration);
            if (item) item.qty++;
            updateCartCount();
            showCart();
        });
    });
    
    document.querySelectorAll(".cart-remove").forEach(btn => {
        btn.addEventListener("click", (e) => {
            e.stopPropagation();
            const id = parseInt(btn.dataset.id);
            const duration = btn.dataset.duration;
            cart = cart.filter(i => !(i.id === id && i.duration === duration));
            updateCartCount();
            showCart();
        });
    });
    
    document.getElementById("checkoutFromCart")?.addEventListener("click", () => {
        const totalPrice = cart.reduce((sum, i) => sum + (i.price * i.qty), 0);
        const productList = cart.map(i => `${i.name} (${i.duration}) x${i.qty}`).join(", ");
        const modal = document.getElementById("paymentModal");
        const content = document.getElementById("paymentContent");
        content.innerHTML = `
            <div style="text-align:center; padding: 0 10px;">
                <img src="image/qris.png" class="qris-image" onerror="this.src='https://placehold.co/300x300?text=QRIS'">
                <div style="font-size:18px; font-weight:700; margin-top:10px;">Checkout Keranjang</div>
                <div style="font-size:13px; color:#8e95a5; margin:8px 0; word-break:break-word;">${productList}</div>
                <div style="font-size:28px; font-weight:800; color:#22d3ee; margin:12px 0;">Rp ${totalPrice.toLocaleString('id-ID')}</div>
                <div class="payment-note">
                    <i class="ri-alert-line"></i> WAJIB: Setelah transfer, kirim bukti screenshot ke admin untuk verifikasi.
                </div>
                <button class="btn-confirm" id="confirmCheckoutWAButton">
                    <i class="ri-whatsapp-line"></i> Konfirmasi via WhatsApp
                </button>
            </div>
        `;
        modal.classList.add("open");
        document.getElementById("modalOverlay").classList.add("active");
        
        document.getElementById("confirmCheckoutWAButton").onclick = () => {
            const message = `Halo admin, saya ingin checkout: ${productList} dengan total Rp ${totalPrice.toLocaleString('id-ID')}. Mohon panduan pembayaran.`;
            window.open(`https://wa.me/${CONFIG.adminNumber}?text=${encodeURIComponent(message)}`, "_blank");
            document.getElementById("paymentModal").classList.remove("open");
            document.getElementById("modalOverlay").classList.remove("active");
            cart = [];
            updateCartCount();
            renderHome();
            showToast("Checkout berhasil, terima kasih!");
        };
    });
}

function showGuide() {
    const main = document.getElementById("mainContent");
    main.innerHTML = `
        <div style="padding:20px 0;">
            <div style="display:flex; align-items:center; gap:12px; margin-bottom:24px;">
                <i class="ri-arrow-left-line" id="backHomeGuide" style="font-size:24px; cursor:pointer;"></i>
                <h2 style="font-size:20px;">Panduan Belanja</h2>
            </div>
            <div style="background:#1a1d24; border-radius:24px; padding:24px;">
                <div style="margin-bottom:20px;"><span style="background:#6366f1; width:28px; height:28px; display:inline-flex; align-items:center; justify-content:center; border-radius:14px; margin-right:12px;">1</span> Pilih produk yang ingin dibeli</div>
                <div style="margin-bottom:20px;"><span style="background:#6366f1; width:28px; height:28px; display:inline-flex; align-items:center; justify-content:center; border-radius:14px; margin-right:12px;">2</span> Pilih durasi (Per Hari, 1 Bulan, atau Permanen)</div>
                <div style="margin-bottom:20px;"><span style="background:#6366f1; width:28px; height:28px; display:inline-flex; align-items:center; justify-content:center; border-radius:14px; margin-right:12px;">3</span> Lakukan pembayaran ke nomor Dana yang tertera</div>
                <div style="margin-bottom:20px;"><span style="background:#6366f1; width:28px; height:28px; display:inline-flex; align-items:center; justify-content:center; border-radius:14px; margin-right:12px;">4</span> Klik "Konfirmasi via WhatsApp" dan kirim bukti transfer</div>
                <div><span style="background:#6366f1; width:28px; height:28px; display:inline-flex; align-items:center; justify-content:center; border-radius:14px; margin-right:12px;">5</span> Produk akan dikirim dalam 2-15 menit setelah verifikasi</div>
            </div>
        </div>
    `;
    document.getElementById("backHomeGuide")?.addEventListener("click", () => renderHome());
}

function renderHome() {
    const main = document.getElementById("mainContent");
    main.innerHTML = `
        <div class="profile-section">
            <img src="${CONFIG.avatar}" class="profile-avatar" onerror="this.src='image/logo/logo.jpg'">
            <div class="profile-info">
                <h2>${CONFIG.storeName}</h2>
                <p><span class="status-badge"></span> Online & Terpercaya</p>
                <div class="social-links">
                    <a href="${CONFIG.instagram}" target="_blank" class="social-icon"><i class="ri-instagram-line"></i></a>
                    <a href="${CONFIG.telegram}" target="_blank" class="social-icon"><i class="ri-telegram-line"></i></a>
                    <a href="https://wa.me/${CONFIG.whatsappNumber}" target="_blank" class="social-icon"><i class="ri-whatsapp-line"></i></a>
                </div>
            </div>
        </div>
        <div class="banner-slider" id="bannerSlider"></div>
        <div class="marquee">
            <div class="marquee-text">PROMO SPESIAL CASHBACK 10 UNTUK PEMBELIAN PERTAMA   GARANSI 100 AMAN   LAYANAN 24 JAM   HUBUNGI ADMIN JIKA ADA KENDALA</div>
        </div>
        <div class="section-title"><i class="ri-shopping-bag-3-line"></i> Produk Kami</div>
        <div class="products-grid" id="productsGrid"></div>
        <div class="feature-grid">
            <div class="feature-item"><i class="ri-flashlight-line feature-icon"></i><div class="feature-text"><h5>Proses Cepat</h5><p>2-5 menit</p></div></div>
            <div class="feature-item"><i class="ri-shield-check-line feature-icon"></i><div class="feature-text"><h5>Garansi 100</h5><p>Refund jika gagal</p></div></div>
            <div class="feature-item"><i class="ri-customer-service-2-line feature-icon"></i><div class="feature-text"><h5>Support 24/7</h5><p>Admin siap bantu</p></div></div>
        </div>
        <div class="promo-card"><h4>PROMO CASHBACK 10</h4><p>Khusus pengguna baru transaksi pertama</p><i class="ri-discount-line promo-deco"></i></div>
    `;

    const grid = document.getElementById("productsGrid");
    grid.innerHTML = products.map(p => {
        const firstPrice = p.packages[0].price;
        return `
            <div class="product-card" data-id="${p.id}">
                <img src="image/produk/produk${p.id}.jpg" class="product-image" onerror="this.src='image/logo/logo.jpg'">
                <div class="product-title">${p.name}</div>
                <div class="product-price">Mulai Rp ${firstPrice.toLocaleString('id-ID')}</div>
                <div class="product-actions">
                    <button class="btn-buy" data-product='${JSON.stringify(p)}'>Beli</button>
                    <button class="btn-cart" data-product='${JSON.stringify(p)}'><i class="ri-add-line"></i> Keranjang</button>
                </div>
            </div>
        `;
    }).join("");

    document.querySelectorAll(".product-card").forEach(card => {
        card.addEventListener("click", (e) => {
            if (e.target.classList.contains("btn-buy") || e.target.classList.contains("btn-cart")) return;
            const id = parseInt(card.dataset.id);
            const product = products.find(p => p.id === id);
            if (product) showProductDetail(product);
        });
    });

    document.querySelectorAll(".btn-buy").forEach(btn => {
        btn.addEventListener("click", (e) => {
            e.stopPropagation();
            const product = JSON.parse(btn.dataset.product);
            showDurationSelector(product);
        });
    });

    document.querySelectorAll(".btn-cart").forEach(btn => {
        btn.addEventListener("click", (e) => {
            e.stopPropagation();
            const product = JSON.parse(btn.dataset.product);
            showDurationSelector(product);
        });
    });

    initBanner();
}

function initMenu() {
    const menuBtn = document.getElementById("menuBtn");
    const sidebar = document.getElementById("menuSidebar");
    const overlay = document.getElementById("modalOverlay");
    const closeMenu = document.getElementById("closeMenu");
    
    function openMenu() {
        sidebar.classList.add("open");
        overlay.classList.add("active");
    }
    
    function closeMenuPanel() {
        sidebar.classList.remove("open");
        overlay.classList.remove("active");
    }
    
    menuBtn.addEventListener("click", openMenu);
    closeMenu.addEventListener("click", closeMenuPanel);
    overlay.addEventListener("click", closeMenuPanel);
    
    document.querySelectorAll(".menu-item").forEach(item => {
        item.addEventListener("click", () => {
            const nav = item.dataset.nav;
            if (nav === "home") renderHome();
            else if (nav === "cart") showCart();
            else if (nav === "guide") showGuide();
            closeMenuPanel();
            document.getElementById("storeNameHeader").innerText = CONFIG.storeName;
        });
    });
}

function initModals() {
    document.getElementById("closeDetail").addEventListener("click", closeDetail);
    document.getElementById("closePayment").addEventListener("click", closePayment);
    
    const cartBadge = document.getElementById("cartBadge");
    if (cartBadge) {
        cartBadge.addEventListener("click", (e) => {
            e.stopPropagation();
            e.preventDefault();
            showCart();
        });
    }
}

document.getElementById("storeNameHeader").innerText = CONFIG.storeName;
renderHome();
initMenu();
initModals();
updateCartCount();
