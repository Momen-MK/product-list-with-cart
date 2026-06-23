const productsContainer = document.querySelector(".products");
const cartContainer = document.querySelector(".cart-items");
const totalEl = document.querySelector(".total-price");
const H1 = document.querySelector(".cart-empty h1");

// 🛒 CART STATE
const cart = [];
// store fetched products globally so other handlers can use them
let productsData = [];

function renderProducts(products) {
  products.forEach(product => {
    const card = document.createElement("div");
    card.className = "product";
    card.dataset.id = product.id;

    card.innerHTML = `

      <div class="card">
        <picture>
          <source media="(min-width:600px)" srcset="${product.image.desktop}">
          <source media="(min-width:500px)" srcset="${product.image.tablet}">
          <img src="${product.image.mobile}" alt="${product.name}">
        </picture>
      </div>

  <div class="cart-control">
        <button class="add-btn">
          <img src="assets/images/icon-add-to-cart.svg" alt="">
          <p>Add to Cart</p>
        </button>
      <div class="qty-control">
        <button class="minus">
            <img src="assets/images/icon-decrement-quantity.svg" alt="">
        </button>
         <span>1</span>
          <button class="plus">      
            <img src="assets/images/icon-increment-quantity.svg" alt="">
          </button>
      </div>
  </div>

      <article>
        <p class="name">${product.name}</p>
        <p class="description">${product.category}</p>
        <p class="price">$${product.price.toFixed(2)}</p>
      </article>


    `;

    productsContainer.appendChild(card);
  });
}

// ADD TO CART FUNCTION
function addToCart(id, products) {
  const item = cart.find(item => item.id === id);

  if (item) {
    item.qty++;
  } else {
    cart.push({ id, qty: 1 });
  }

  renderCart(products);
  updateCartCount();
}

// REMOVE ITEM
function removeFromCart(id, products) {
  const index = cart.findIndex(item => item.id === id);
  if (index !== -1) cart.splice(index, 1);
  renderCart(products);
  updateCartCount();
}

// UPDATE CART COUNT
function updateCartCount() {
  let cartCount = cart.reduce((sum, item) => sum + item.qty, 0);
  H1.textContent = `Your Cart (${cartCount})`;
  
}

// RENDER CART UI
function renderCart(products) {
  cartContainer.innerHTML = "";
  let total = 0;
  const orderSection = document.querySelector(".order");

  if (cart.length === 0) {
    cartContainer.innerHTML = '<div class="box-empty"><img src="assets/images/illustration-empty-cart.svg" alt=""><p>Your added items will appear here</p></div>';
    if (totalEl) totalEl.textContent = "0.00";
    if (orderSection) orderSection.style.display = "none";
    return;
  }

  if (orderSection) orderSection.style.display = "flex";

  cart.forEach(item => {
    const product = products.find(p => p.id === item.id);
    const itemTotal = product.price * item.qty;
    total += itemTotal;
    
    const totalEl = document.querySelector(".order-total");
    totalEl.textContent = "$" + total.toFixed(2);
    const div = document.createElement("div");
    div.className = "item";

    div.innerHTML = `
<div class="info">

      <h4>${product.category}</h4>

      <span class="amount">
      x${item.qty}
      </span>

      <span class="pa">
      $${product.price.toFixed(2)} 
      </span>

      <span class="pa2">
      $${itemTotal.toFixed(2)}
      </span>
</div>

<div class="cancel">
      <button class="remove-btn">
      <img src="assets/images/icon-remove-item.svg" alt="">
      </button>
</div>

    `;

    div.querySelector(".remove-btn")
      .addEventListener("click", () => {
        removeFromCart(item.id, products);
        updateProductUI(item.id);
      });

    cartContainer.appendChild(div);
  });

  if (totalEl) totalEl.textContent = total.toFixed(2);
}

// UPDATE PRODUCT UI
function updateProductUI(productId) {
  const card = document.querySelector(`.product[data-id="${productId}"]`);
  if (!card) return;

  const cartItem = cart.find(item => item.id === productId);
  const qtyControl = card.querySelector(".qty-control");
  const addBtn = card.querySelector(".add-btn");
  const border = card.querySelector(".card img");
  const spanEl = card.querySelector("span");

  if (!cartItem) {
    addBtn.style.display = "flex";
    qtyControl.style.display = "none";
    border.style.border = "none";
    spanEl.textContent = "1";
  } else {
    spanEl.textContent = cartItem.qty;
  }
}

// FETCH PRODUCTS
fetch("data/data.json")
  .then(res => res.json())
  .then(products => {
    // keep a global reference for use outside this fetch scope
    productsData = products;
    renderProducts(products);
    renderCart(products); // عرض حالة السلة الفارغة في البداية

    // ADD TO CART BUTTON
    productsContainer.addEventListener("click", (e) => {
      const btn = e.target.closest(".add-btn");
      if (!btn) return;

      const card = btn.closest(".product");
      const productId = parseInt(card.dataset.id);
      const cartControl = btn.closest(".cart-control");
      const qtyControl = cartControl.querySelector(".qty-control");
      const border = card.querySelector(".card img");
      // const box = card.querySelector(".box-empty");

      // box.style.display = "none";
      border.style.border = "2px solid var(--Red)";
      btn.style.display = "none";
      qtyControl.style.display = "flex";

      addToCart(productId, products);
    });

    // QUANTITY CONTROLS
    productsContainer.addEventListener("click", (e) => {
      const btn = e.target.closest(".qty-control button");
      if (!btn) return;

      const card = btn.closest(".product");
      const productId = parseInt(card.dataset.id);
      const cartControl = btn.closest(".cart-control");
      const border = card.querySelector(".card img");
      const qtyControl = cartControl.querySelector(".qty-control");
      const addBtn = cartControl.querySelector(".add-btn");
      const box = cartControl.querySelector(".box-empty");
      const spanEl = cartControl.querySelector("span");

      const cartItem = cart.find(item => item.id === productId);
      let qty = cartItem ? cartItem.qty : 1;

      // PLUS
      if (btn.classList.contains("plus")) {
        qty++;
        cartItem.qty = qty;
      }

      // MINUS
      if (btn.classList.contains("minus")) {
        qty--;

        if (qty <= 0) {
          removeFromCart(productId, products);
          qtyControl.style.display = "none";
          addBtn.style.display = "flex";
          border.style.border = "none";
          spanEl.textContent = "1";
          
          return;
        }

        cartItem.qty = qty;
      }

      spanEl.textContent = qty;
      renderCart(products);
      updateCartCount();
    });

    updateCartCount();
  })
  .catch(error => {
    console.error(error);
  });




const confirmBtn = document.querySelector(".confirm button");
const confirmedDiv = document.querySelector(".order-confirmed");
const confirmedItems = document.querySelector(".confirmed-items-list");
const confirmedTotal = document.querySelector(".confirmed-total");

if (confirmBtn) {
  confirmBtn.addEventListener("click", () => {

  // scroll لفوق
  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });

  // عرض المنتجات داخل التأكيد
  confirmedItems.innerHTML = "";

  let total = 0;

    cart.forEach(item => {
      const product = productsData.find(p => p.id === item.id);
      if (!product) return;
      const itemTotal = product.price * item.qty;
      const itemprice = product.price;
      total += itemTotal;

      const div = document.createElement("div");
      div.className = "items";
      div.innerHTML = `
        <img src="${product.image.desktop}" alt="${product.name}">

      <div class="confirmed-info">
        <div>
          <p class="c-item-category">${product.category}</p>
          </div>
        <div class = "item-pandq">
          <p class="c-item-qty">x${item.qty}</p>

          
          <p class="c-item-price">@ $${itemprice.toFixed(2)}</p>
        </div>
        
      </div>
      <div>
          <p class="c-item-total">$${itemTotal.toFixed(2)}</p>
        </div>

        
      `;

      confirmedItems.appendChild(div);
    });

  confirmedTotal.textContent = "$" + total.toFixed(2);

  // إظهار المودال
  confirmedDiv.classList.remove("hidden");
  });
}
const startNewBtn = document.querySelector(".start-new");
if (startNewBtn) {
  startNewBtn.addEventListener("click", () => {
    location.reload(); // إعادة تحميل الصفحة
  });
}


  