const timeline = document.querySelector('.timeline');

if (timeline) {
  const filters = document.querySelector('.filters');
  const navigation = document.querySelector('.timeline-nav');
  const status = document.querySelector('#timeline-status');
  const entries = [...timeline.children];

  filters.hidden = false;
  navigation.hidden = false;

  filters.addEventListener('click', event => {
    const button = event.target.closest('button[data-filter]');
    if (!button) return;

    const category = button.dataset.filter;
    for (const filter of filters.querySelectorAll('button')) {
      filter.setAttribute('aria-pressed', String(filter === button));
    }
    for (const entry of entries) {
      entry.hidden = category !== 'All' && entry.dataset.category !== category;
    }
    timeline.scrollLeft = 0;
    const count = entries.filter(entry => !entry.hidden).length;
    status.textContent = `${count} timeline ${count === 1 ? 'entry' : 'entries'} shown.`;
  });

  navigation.addEventListener('click', event => {
    const button = event.target.closest('button[data-step]');
    if (!button) return;

    const entry = entries.find(item => !item.hidden);
    const gap = parseFloat(getComputedStyle(timeline).columnGap);
    const direction = Number(button.dataset.step);
    const behavior = matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
    timeline.scrollBy({ left: direction * (entry.offsetWidth + gap), behavior });
  });
}
