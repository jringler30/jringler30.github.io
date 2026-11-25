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

if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const reveal = new IntersectionObserver((items, observer) => {
    for (const item of items) {
      if (!item.isIntersecting) continue;
      item.target.animate(
        [{ opacity: .25, transform: 'translateY(10px)' }, { opacity: 1, transform: 'translateY(0)' }],
        { duration: 380, easing: 'cubic-bezier(.2,.65,.3,1)' }
      );
      observer.unobserve(item.target);
    }
  }, { threshold: .2 });

  for (const element of document.querySelectorAll('.project, .timeline-head, .contact')) {
    reveal.observe(element);
  }
}
