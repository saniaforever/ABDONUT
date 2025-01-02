// Cart functionality
const cartIcon = document.querySelector('.cart-icon');
const cartOverlay = document.querySelector('.cart-overlay');
const cartItemsContainer = document.querySelector('.cart-list');
const cartTotal = document.querySelector('.total');
const checkoutButton = document.querySelector('.checkout');
const addToCartButtons = document.querySelectorAll('.add-to-cart');

let cartItems = [];
let total = 0;

// Update cart count in the header
function updateCartCount() {
  const cartCount = document.querySelector('.cart-count');
  cartCount.textContent = cartItems.length;
}

// Calculate and update cart total
function updateCartTotal() {
  total = cartItems.reduce((sum, item) => sum + item.price, 0);
  cartTotal.textContent = `Total: $${total.toFixed(2)}`;
}

// Add item to cart
function addToCart(item) {
  cartItems.push(item);
  updateCartCount();
  updateCartTotal();
  renderCartItems();
}

// Remove item from cart
function removeFromCart(index) {
  cartItems.splice(index, 1);
  updateCartCount();
  updateCartTotal();
  renderCartItems();
}

// Render cart items
function renderCartItems() {
  cartItemsContainer.innerHTML = '';

  cartItems.forEach((item, index) => {
    const cartItem = document.createElement('div');
    cartItem.classList.add('cart-item');

    const image = document.createElement('img');
    image.src = item.image;
    image.alt = item.name;

    const itemName = document.createElement('h4');
    itemName.textContent = item.name;

    const itemPrice = document.createElement('p');
    itemPrice.textContent = `$${item.price.toFixed(2)}`;

    const removeButton = document.createElement('button');
    removeButton.classList.add('remove-from-cart');
    removeButton.textContent = 'Remove';
    removeButton.addEventListener('click', () => {
      removeFromCart(index);
    });

    cartItem.appendChild(image);
    cartItem.appendChild(itemName);
    cartItem.appendChild(itemPrice);
    cartItem.appendChild(removeButton);
    cartItemsContainer.appendChild(cartItem);
  });
}

// Show/hide cart overlay
function toggleCartOverlay() {
  cartOverlay.classList.toggle('show');
}

// Open cart overlay
cartIcon.addEventListener('click', toggleCartOverlay);

// Close cart overlay
cartOverlay.addEventListener('click', (e) => {
  if (e.target === cartOverlay) {
    toggleCartOverlay();
  }
});

// Add to cart buttons
addToCartButtons.forEach((button, index) => {
  button.addEventListener('click', () => {
    const donut = {
      name: button.previousElementSibling.previousElementSibling.textContent,
      price: parseFloat(button.previousElementSibling.textContent.slice(1)),
      image: button.previousElementSibling.previousElementSibling.previousElementSibling.src
    };
    addToCart(donut);
  });
});

// Checkout button
checkoutButton.addEventListener('click', () => {
  alert(`Thank you for your purchase!\nTotal: $${total.toFixed(2)}`);
  cartItems = [];
  updateCartCount();
  updateCartTotal();
  renderCartItems();
});
