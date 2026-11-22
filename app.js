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

const intro = document.getElementById('intro');
const seal = intro.querySelector('.seal');

seal.addEventListener('click', () => {
  intro.classList.add('is-open');
  document.body.classList.remove('is-locked');
});
