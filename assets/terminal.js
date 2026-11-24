(() => {
  const root = document.documentElement;
  const preference = matchMedia("(prefers-reduced-motion: reduce)");
  const motionButton = document.querySelector("[data-motion-switch]");
  const storagePrefix = "ringler.os.";
  const read = (key, session = false) => {
    try { return (session ? sessionStorage : localStorage).getItem(storagePrefix + key); }
    catch { return null; }
  };
  const write = (key, value, session = false) => {
    try { (session ? sessionStorage : localStorage).setItem(storagePrefix + key, value); }
    catch { /* Private browsing may disable storage. */ }
  };
  const motionOn = () => root.dataset.motion === "on";
  function setMotion() {
    root.dataset.motion = read("motion") || (preference.matches ? "off" : "on");
    motionButton.setAttribute("aria-pressed", String(motionOn()));
    motionButton.hidden = false;
  }
  setMotion();
  motionButton.addEventListener("click", () => {
    const next = motionOn() ? "off" : "on";
    write("motion", next);
    root.dataset.motion = next;
    motionButton.setAttribute("aria-pressed", String(motionOn()));
  });
  preference.addEventListener("change", setMotion);

  const panel = document.querySelector(".case-panel");
  if (panel) {
    if (motionOn() && read("arrival", true) === location.pathname) {
      panel.classList.add("case-enter");
      panel.focus({ preventScroll: true });
    }
    write("arrival", "", true);
    return;
  }

  const boot = document.querySelector(".boot");
  if (motionOn() && !read("booted") && !location.hash) {
    const message = "Initializing Ringler.OS…\nWelcome, Josh Ringler.";
    const line = boot.querySelector(".boot-text");
    const skip = boot.querySelector(".skip-boot");
    const background = [...document.querySelectorAll(".site-header,main,.site-footer")];
    boot.hidden = false;
    background.forEach(element => { element.inert = true; });
    skip.focus({ preventScroll: true });
    const start = performance.now();
    let frame;
    function finish() {
      cancelAnimationFrame(frame);
      boot.hidden = true;
      background.forEach(element => { element.inert = false; });
      document.removeEventListener("keydown", escapeBoot);
      write("booted", "yes");
    }
    function escapeBoot(event) { if (event.key === "Escape") finish(); }
    function type(now) {
      const elapsed = now - start;
      line.textContent = message.slice(0, Math.ceil(elapsed / 32));
      if (elapsed >= 2000 || !motionOn()) finish();
      else frame = requestAnimationFrame(type);
    }
    skip.addEventListener("click", finish, { once: true });
    document.addEventListener("keydown", escapeBoot);
    frame = requestAnimationFrame(type);
  }

  const market = document.querySelector(".market-display");
  const ctx = market.getContext("2d");
  const bank = document.querySelector("[data-register-bank]");
  const clock = document.querySelector("[data-clock]");
  let tick = 0;
  function price(i) {
    return 118 + Math.sin(i * .13) * 2.2 + Math.cos(i * .47) * 1.1 + Math.sin(i * 2.3) * .55;
  }
  function marketFrame() {
    if (!ctx) return;
    const width = market.width;
    const height = market.height;
    const candles = [];
    // Take six price observations per interval, with a developing final candle.
    const lastInterval = 31 + Math.floor(tick / 6);
    for (let interval = lastInterval - 31; interval <= lastInterval; interval++) {
      const start = interval * 6;
      const length = interval === lastInterval ? tick % 6 + 1 : 6;
      const samples = Array.from({ length: length + 1 }, (_, i) => price(start + i));
      candles.push({
        open: samples[0], close: samples.at(-1),
        high: Math.max(...samples), low: Math.min(...samples)
      });
    }
    const high = Math.max(...candles.map(c => c.high)) + .35;
    const low = Math.min(...candles.map(c => c.low)) - .35;
    const top = 106, bottom = 404, left = 25, right = width - 94;
    const y = value => bottom - (value - low) / (high - low) * (bottom - top);
    const dx = (right - left) / candles.length;
    const body = dx * .59;
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = "#aeffa7";
    ctx.font = "bold 29px monospace";
    ctx.fillText("RINGLER // MARKET SIM", left, 45);
    ctx.fillStyle = "#83c789";
    ctx.font = "20px monospace";
    ctx.fillText("SIMULATED INDEX   /   CANDLESTICKS", left, 78);
    for (let level = 0; level <= 4; level++) {
      const value = high - level / 4 * (high - low);
      const row = y(value);
      ctx.strokeStyle = "#284d31";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(left, row);
      ctx.lineTo(right, row);
      ctx.stroke();
      ctx.fillStyle = "#8bbe90";
      ctx.fillText(value.toFixed(1), right + 8, row + 6);
    }
    for (const [i, candle] of candles.entries()) {
      const x = left + (i + .5) * dx;
      const rising = candle.close >= candle.open;
      const color = rising ? "#acff94" : "#f3a694";
      ctx.strokeStyle = color;
      ctx.fillStyle = color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x, y(candle.high));
      ctx.lineTo(x, y(candle.low));
      ctx.stroke();
      ctx.fillRect(x - body / 2, Math.min(y(candle.open), y(candle.close)), body,
        Math.max(2, Math.abs(y(candle.open) - y(candle.close))));
    }
    const latest = candles.at(-1);
    ctx.fillStyle = "#bdffa8";
    ctx.font = "bold 23px monospace";
    ctx.fillText("O " + latest.open.toFixed(2) + "   H " + latest.high.toFixed(2), left, 453);
    ctx.fillText("L " + latest.low.toFixed(2) + "   C " + latest.close.toFixed(2), left, 488);
  }
  function updateTelemetry() {
    marketFrame();
    clock.textContent = "UTC " + new Date().toISOString().slice(11, 19);
    bank.textContent = Array.from({ length: 48 }, () => Math.floor(Math.random() * 256).toString(16).toUpperCase().padStart(2, "0")).join(" ");
  }
  updateTelemetry();
  let heroVisible = true;
  const observer = new IntersectionObserver(([entry]) => { heroVisible = entry.isIntersecting; });
  observer.observe(document.querySelector(".hero"));
  window.setInterval(() => {
    if (motionOn() && heroVisible && !document.hidden) { tick++; updateTelemetry(); }
  }, 850);

  const overlay = document.querySelector(".unlock-overlay");
  let launching = false;
  let unlockFrame = 0;
  const entries = document.querySelectorAll(".project-entry");
  for (const card of entries) {
    function trackTitle(event) {
      if (!motionOn() || event.pointerType === "touch") return;
      const rect = card.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width - .5) * 18;
      const y = ((event.clientY - rect.top) / rect.height - .5) * 60;
      card.style.setProperty("--hover-x", x + "px");
      card.style.setProperty("--hover-y", y + "px");
    }
    card.addEventListener("pointerenter", event => {
      if (event.pointerType === "touch") return;
      card.classList.add("show-title");
      trackTitle(event);
    });
    card.addEventListener("pointermove", trackTitle);
    card.addEventListener("pointerleave", () => {
      if (!card.matches(":focus-visible")) card.classList.remove("show-title");
    });
    card.addEventListener("focus", () => {
      if (card.matches(":focus-visible")) card.classList.add("show-title");
    });
    card.addEventListener("blur", () => card.classList.remove("show-title"));
    card.addEventListener("click", e => {
      if (e.button !== 0 || e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return;
      if (launching) { e.preventDefault(); return; }
      playWhoosh();
      if (!motionOn()) return;
      e.preventDefault();
      launch(card);
    });
  }

  function playWhoosh() {
    try {
      const AudioEngine = window.AudioContext || window.webkitAudioContext;
      if (!AudioEngine) return;
      const audio = new AudioEngine();
      const duration = .82;
      const buffer = audio.createBuffer(1, Math.ceil(audio.sampleRate * duration), audio.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
      const source = audio.createBufferSource(); source.buffer = buffer;
      const filter = audio.createBiquadFilter(); filter.type = "bandpass"; filter.Q.value = 1.6;
      const volume = audio.createGain();
      source.connect(filter).connect(volume).connect(audio.destination);
      audio.resume().then(() => {
        const now = audio.currentTime;
        filter.frequency.setValueAtTime(1750, now);
        filter.frequency.exponentialRampToValueAtTime(95, now + duration);
        volume.gain.setValueAtTime(.001, now);
        volume.gain.exponentialRampToValueAtTime(.13, now + .1);
        volume.gain.exponentialRampToValueAtTime(.001, now + duration);
        source.onended = () => audio.close().catch(() => {});
        source.start(now);
      }).catch(() => audio.close().catch(() => {}));
    } catch { /* The visual launch also works without an audio device. */ }
  }

  const terminal = overlay.querySelector(".unlock-terminal");
  const status = overlay.querySelector(".unlock-status");
  const titleLine = overlay.querySelector("[data-unlock-title]");
  const skip = overlay.querySelector(".unlock-skip");
  const background = document.querySelectorAll(".site-header, main, .site-footer");
  let destination = null;

  function enterProject() {
    if (!destination) return;
    cancelAnimationFrame(unlockFrame);
    write("arrival", destination.pathname, true);
    const next = destination.href;
    destination = null;
    location.assign(next);
  }
  skip.addEventListener("click", enterProject);
  document.addEventListener("keydown", event => {
    if (!launching) return;
    if (event.key === "Escape") enterProject();
    if (event.key === "Tab") {
      event.preventDefault();
      skip.focus();
    }
  });

  function launch(card) {
    const name = card.querySelector("h3").textContent.trim();
    destination = new URL(card.href);
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const started = performance.now();
    let previousStep = -1;
    launching = true;
    terminal.classList.remove("granted");
    status.textContent = "DECODING PROJECT";
    overlay.querySelector("[data-unlock-path]").textContent = "~" + destination.pathname;
    overlay.hidden = false;
    root.classList.add("launching");
    background.forEach(element => { element.inert = true; });
    skip.focus({ preventScroll: true });

    function decode(now) {
      const elapsed = now - started;
      const progress = Math.max(0, Math.min(1, elapsed / 1180));
      const step = Math.floor(elapsed / 64);
      if (step !== previousStep) {
        previousStep = step;
        const resolved = Math.floor(progress * name.length);
        titleLine.textContent = Array.from(name, (letter, i) => {
          if (i < resolved || !/[a-z]/i.test(letter)) return letter;
          return alphabet[(step * 7 + i * 11) % alphabet.length];
        }).join("");
      }
      terminal.style.setProperty("--progress", progress);
      if (elapsed >= 1340 && !terminal.classList.contains("granted")) {
        titleLine.textContent = name;
        terminal.classList.add("granted");
        status.textContent = "ACCESS GRANTED";
      }
      if (elapsed >= 2060 || !motionOn()) enterProject();
      else unlockFrame = requestAnimationFrame(decode);
    }
    decode(started);
  }
  window.addEventListener("pageshow", event => {
    if (!event.persisted) return;
    cancelAnimationFrame(unlockFrame);
    destination = null;
    launching = false;
    overlay.hidden = true;
    root.classList.remove("launching");
    background.forEach(element => { element.inert = false; });
    entries.forEach(card => card.classList.remove("show-title"));
  });
})();
