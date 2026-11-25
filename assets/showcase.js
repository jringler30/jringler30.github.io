const showcase = document.querySelector('.showcase');
const controls = showcase.querySelector('.showcase-controls');
const buttons = [...controls.querySelectorAll('button')];
const status = showcase.querySelector('[data-showcase-status]');

controls.addEventListener('click', event => {
  const selected = event.target.closest('button');
  if (!selected || selected.getAttribute('aria-pressed') === 'true') return;

  for (const button of buttons) {
    const isSelected = button === selected;
    const panel = document.getElementById(button.getAttribute('aria-controls'));
    button.setAttribute('aria-pressed', String(isSelected));
    panel.hidden = !isSelected;
    if (isSelected) status.textContent = panel.querySelector('h3 a').firstChild.textContent.trim() + ' preview shown.';
  }
});

controls.hidden = false;
