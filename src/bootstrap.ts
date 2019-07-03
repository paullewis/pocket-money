const btn1 = document.querySelector('#section-1')!;
const btn2 = document.querySelector('#section-2')!;

btn1.addEventListener('click', async () => {
  const module = await import('./sections/section-1.js').then((m) => m.default);
  module.go();
});

btn2.addEventListener('click', async () => {
  const module = await import('./sections/section-2.js').then((m) => m.default);
  module.go();
});
