const menuBtn = document.getElementById('menuBtn');
const nav = document.getElementById('nav');

menuBtn.addEventListener('click', () => {
  nav.classList.toggle('active');
});

document.querySelectorAll('.nav a').forEach(link => {
  link.addEventListener('click', () => {
    nav.classList.remove('active');
  });
});

const topBtn = document.getElementById('topBtn');

window.addEventListener('scroll', () => {
  if (window.scrollY > 300) {
    topBtn.style.display = 'block';
  } else {
    topBtn.style.display = 'none';
  }
});

topBtn.addEventListener('click', () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
});

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
});

document.querySelectorAll('.section, .card, .review').forEach(el => {
  el.classList.add('fade-in');
  observer.observe(el);
});

const orderForm = document.getElementById('orderForm');

orderForm.addEventListener('submit', (e) => {
  e.preventDefault();
  alert('Thank you! Your cake order has been received. We will contact you shortly.');
  orderForm.reset();
});
