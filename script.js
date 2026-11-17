const items = [
  ['Caffè Latte', 'Smooth espresso with steamed milk.', 4.5, 'coffee', 'ph'],
  ['Americano', 'Bold & classic, always a good idea.', 3.5, 'coffee', 'ph2'],
  ['Caramel Macchiato', 'Espresso, milk, caramel, perfection.', 5.5, 'cold', 'ph3'],
  ['Chocolate Croissant', 'Buttery, flaky, and delicious.', 3.75, 'food', 'ph4'],
  ['Cappuccino', 'Rich foam, bold espresso.', 4, 'coffee', 'ph'],
  ['Vanilla Latte', 'Sweet vanilla with creamy milk.', 4.5, 'coffee', 'ph3'],
  ['Cold Brew', 'Slow-steeped, served over ice.', 4.25, 'cold', 'ph2'],
  ['Blueberry Muffin', 'Baked fresh every morning.', 3.25, 'food', 'ph4']
];

const grid = document.getElementById('grid');

function render(filter) {
  grid.innerHTML = items
    .filter(i => filter === 'all' || i[3] === filter)
    .map(i => `
      <article class="card">
        <div class="img ${i[4]}"></div>
        <div class="body">
          <h3>${i[0]}</h3>
          <p>${i[1]}</p>
          <div class="row"><span>$${i[2].toFixed(2)}</span>
            <button class="add" data-name="${i[0]}" aria-label="Add to cart">🛒</button></div>
        </div>
      </article>`).join('');
}
render('all');

document.getElementById('tabs').addEventListener('click', e => {
  const btn = e.target.closest('.tab');
  if (!btn) return;
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  render(btn.dataset.f);
});

// ---- Cart ----
const cart = {};              // name -> {price, qty}
const $ = id => document.getElementById(id);
const money = n => '$' + n.toFixed(2);

function updateCart() {
  const entries = Object.entries(cart);
  $('cartCount').textContent = entries.reduce((n, [, v]) => n + v.qty, 0);
  $('cartItems').innerHTML = entries.map(([name, v]) => `
    <li>
      <div class="info"><b>${name}</b><span>${money(v.price)} each</span></div>
      <div class="qty"><button data-act="dec" data-name="${name}">−</button>
        <span>${v.qty}</span><button data-act="inc" data-name="${name}">+</button></div>
      <button class="rm" data-act="rm" data-name="${name}" aria-label="Remove">🗑</button>
    </li>`).join('');
  $('cartEmpty').hidden = entries.length > 0;
  $('cartFoot').hidden = entries.length === 0;
  $('cartTotal').textContent = money(entries.reduce((t, [, v]) => t + v.price * v.qty, 0));
}

function openCart() {
  $('cartView').hidden = false; $('orderDone').hidden = true;
  $('cartModal').hidden = false;
}
const closeCart = () => $('cartModal').hidden = true;

grid.addEventListener('click', e => {
  const btn = e.target.closest('.add');
  if (!btn) return;
  const name = btn.dataset.name;
  const item = items.find(i => i[0] === name);
  cart[name] = cart[name] || { price: item[2], qty: 0 };
  cart[name].qty++;
  updateCart();
  btn.textContent = '✓'; btn.classList.add('done');
  setTimeout(() => { btn.textContent = '🛒'; btn.classList.remove('done'); }, 1000);
});

$('cartItems').addEventListener('click', e => {
  const b = e.target.closest('button'); if (!b) return;
  const name = b.dataset.name, act = b.dataset.act;
  if (act === 'inc') cart[name].qty++;
  if (act === 'dec' && --cart[name].qty < 1) delete cart[name];
  if (act === 'rm') delete cart[name];
  updateCart();
});

$('cartBtn').addEventListener('click', openCart);
$('cartClose').addEventListener('click', closeCart);
$('doneBtn').addEventListener('click', closeCart);
$('cartModal').addEventListener('click', e => { if (e.target === $('cartModal')) closeCart(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeCart(); });

$('placeOrder').addEventListener('click', () => {
  Object.keys(cart).forEach(k => delete cart[k]);
  updateCart();
  $('cartView').hidden = true; $('orderDone').hidden = false;
});
updateCart();

document.getElementById('burger').addEventListener('click', () =>
  document.getElementById('nav').classList.toggle('open'));
document.querySelectorAll('#nav a').forEach(a =>
  a.addEventListener('click', () => document.getElementById('nav').classList.remove('open')));

document.getElementById('sub').addEventListener('submit', e => {
  e.preventDefault();
  e.target.innerHTML = '<p style="padding:8px 16px;color:#3b2415;font-size:14px">Welcome to the club! ☕</p>';
});

document.getElementById('msg').addEventListener('submit', e => {
  e.preventDefault();
  document.getElementById('ok').hidden = false;
  e.target.reset();
});

// ---- Gallery uploads (kept in the browser only; lost on refresh) ----
const galleryGrid = document.getElementById('gallery-grid');
const uploadErr = document.getElementById('uploadErr');
const MAX_MB = 50;

document.getElementById('upload').addEventListener('change', e => {
  uploadErr.hidden = true;
  [...e.target.files].forEach(file => {
    const isImg = file.type.startsWith('image/'), isVid = file.type.startsWith('video/');
    if (!isImg && !isVid) { showErr(`"${file.name}" is not an image or video.`); return; }
    if (file.size > MAX_MB * 1024 * 1024) { showErr(`"${file.name}" is larger than ${MAX_MB} MB.`); return; }
    const url = URL.createObjectURL(file);
    const box = document.createElement('div');
    box.className = 'media';
    box.innerHTML = (isImg ? `<img src="${url}" alt="Customer upload">`
                           : `<video src="${url}" controls preload="metadata"></video>`)
                  + '<button aria-label="Remove">✕</button>';
    box.querySelector('button').onclick = () => { URL.revokeObjectURL(url); box.remove(); };
    galleryGrid.prepend(box);
  });
  e.target.value = '';
});

function showErr(msg) { uploadErr.textContent = msg; uploadErr.hidden = false; }
