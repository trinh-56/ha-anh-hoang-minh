const reveals = document.querySelectorAll('.reveal');

const observer = new IntersectionObserver((entries) => {
  for (const entry of entries) {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-in');
      observer.unobserve(entry.target);
    }
  }
}, { threshold: 0.2 });

reveals.forEach((el) => observer.observe(el));
