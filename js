// Smooth scroll behavior for internal links
document.querySelectorAll('nav a[href^="#"]').forEach(link => {
  link.addEventListener('click', function (e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
});

// Contact form basic validation and submission message
document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('#contact form');

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      const name = form.querySelector('[name="name"]').value.trim();
      const email = form.querySelector('[name="email"]').value.trim();
      const message = form.querySelector('[name="message"]').value.trim();

      if (!name || !email || !message) {
        alert('Please fill in all fields before submitting.');
        return;
      }

      alert('Thank you for contacting CytTrust Chad! We will get back to you soon.');
      form.reset();
    });
  }
});
