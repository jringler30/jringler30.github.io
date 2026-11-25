const timeline = document.querySelector('.timeline');

if (timeline) {
  const filters = document.querySelector('.filters');
  const navigation = document.querySelector('.timeline-nav');
  const status = document.querySelector('#timeline-status');
  const entries = [...timeline.children];
  const [newer, older] = navigation.querySelectorAll('button');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const desktop = matchMedia('(min-width: 721px)');

  function updateNavigation() {
    const max = timeline.scrollWidth - timeline.clientWidth;
    const canScroll = desktop.matches && max > 2;
    navigation.hidden = !canScroll;
    if (canScroll) {
      timeline.setAttribute('tabindex', '0');
    } else {
      timeline.removeAttribute('tabindex');
    }
    newer.setAttribute('aria-disabled', String(timeline.scrollLeft <= 2));
    older.setAttribute('aria-disabled', String(timeline.scrollLeft >= max - 2));
  }

  filters.hidden = false;
  updateNavigation();

  filters.addEventListener('click', event => {
    const button = event.target.closest('button[data-filter]');
    if (!button || button.getAttribute('aria-pressed') === 'true') return;

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
    updateNavigation();
  });

  navigation.addEventListener('click', event => {
    const button = event.target.closest('button[data-step]');
    if (!button || button.getAttribute('aria-disabled') === 'true') return;

    const entry = entries.find(item => !item.hidden);
    const gap = parseFloat(getComputedStyle(timeline).columnGap);
    timeline.scrollBy({
      left: Number(button.dataset.step) * (entry.offsetWidth + gap),
      behavior: motion.matches ? 'instant' : 'smooth'
    });
  });

  timeline.addEventListener('scroll', updateNavigation, { passive: true });
  window.addEventListener('resize', updateNavigation);
}

const measureControls = document.querySelector('.measure-controls');

if (measureControls) {
  const measureButtons = [...measureControls.querySelectorAll('button')];
  const measures = measureButtons.map(button => document.getElementById(button.getAttribute('aria-controls')));

  function selectMeasure(index) {
    measureButtons.forEach((button, position) => {
      button.setAttribute('aria-pressed', String(position === index));
      measures[position].hidden = position !== index;
    });
  }

  selectMeasure(0);
  measureControls.hidden = false;
  measureButtons.forEach((button, index) => button.addEventListener('click', () => selectMeasure(index)));
}
