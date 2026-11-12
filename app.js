// Add the deployed Google Apps Script web app URL here to save RSVPs to Google Sheets.
const RSVP_ENDPOINT = 'https://script.google.com/macros/s/AKfycbzWNVFOh3QizCcN_CtMpt-pw1ofklF17ZIMDMZPHkEYkZQHEihFWvpiS0zMByOYFqXx/exec';

const opening = document.querySelector('#opening');
const site = document.querySelector('#site');
const openButton = document.querySelector('#open-invite');
const params = new URLSearchParams(window.location.search);
const guestFromLink = params.get('to');
const requestedInvitationType = params.get('invite');
const invitationType = ['full', 'church', 'dinner'].includes(requestedInvitationType) ? requestedInvitationType : 'full';
const invitationCategory = {
  full: 'church & dinner',
  church: 'church only',
  dinner: 'dinner only'
}[invitationType];
if (invitationType === 'church') {
  document.querySelector('[data-invitation-event="dinner"]')?.classList.add('is-hidden');
  document.querySelector('.event-cards')?.classList.add('has-single-event');
}
if (invitationType === 'dinner') {
  document.querySelector('[data-invitation-event="full"]')?.classList.add('is-hidden');
  document.querySelector('.event-cards')?.classList.add('has-single-event');
  const guestCount = document.querySelector('#guest-count');
  guestCount?.querySelector('option[value="2"]')?.remove();
  if (guestCount) guestCount.value = '1';
}
if (guestFromLink) document.querySelector('#invite-to').innerHTML = `Kepada Yth.<br><strong>${escapeHtml(guestFromLink)}</strong>`;

openButton.addEventListener('click', () => {
  opening.classList.add('closed');
  site.classList.remove('is-locked');
  site.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = '';
  window.setTimeout(() => opening.remove(), 1000);
  startWeddingMusic();
});

// Try once on page entry; browsers that block autoplay will start it on the invitation click.
startWeddingMusic();

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
}

const weddingDate = new Date('2026-12-12T15:00:00+07:00').getTime();
const countdownParts = { days: 86400000, hours: 3600000, minutes: 60000, seconds: 1000 };
function updateCountdown() {
  let remaining = Math.max(0, weddingDate - Date.now());
  for (const [id, unit] of Object.entries(countdownParts)) {
    document.querySelector(`#${id}`).textContent = String(Math.floor(remaining / unit) % (id === 'days' ? Infinity : 24)).padStart(2, '0');
    remaining %= unit;
  }
}
updateCountdown();
window.setInterval(updateCountdown, 1000);

// Reveal content as it approaches the viewport; preserve normal rendering in older browsers.
const revealTargets = document.querySelectorAll(
  '.story-grid > *, .countdown-content, .event-cards > *, .venue-card, .venue-map, .parents-section, .rsvp-photo, .rsvp-panel, .gift-section'
);
if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  document.documentElement.classList.add('motion-ready');
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      entry.target.classList.toggle('is-revealed', entry.isIntersecting);
    });
  }, { rootMargin: '0px 0px 4% 0px', threshold: 0.06 });
  revealTargets.forEach((element, index) => {
    element.classList.add('reveal-on-scroll');
    element.style.setProperty('--reveal-delay', `${Math.min(index % 4, 3) * 35}ms`);
    revealObserver.observe(element);
  });
}

// Keep the navigation link in sync with the section currently crossing the viewport center.
const sectionLinks = [...document.querySelectorAll('.topbar nav a[href^="#"]')];
const sectionById = sectionLinks
  .map((link) => ({ link, section: document.querySelector(link.getAttribute('href')) }))
  .filter(({ section }) => section);
function setActiveNavigation(activeLink) {
  sectionLinks.forEach((link) => {
    const isActive = link === activeLink;
    link.classList.toggle('is-active', isActive);
    if (isActive) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  });
}
let navigationFrame = 0;
function updateActiveNavigation() {
  navigationFrame = 0;
  const markerY = Math.min(window.innerHeight * 0.42, 220);
  let active = null;
  for (const item of sectionById) {
    const bounds = item.section.getBoundingClientRect();
    if (bounds.top <= markerY && bounds.bottom > markerY) active = item;
  }
  if (active) setActiveNavigation(active.link);
  else if (window.scrollY < (document.querySelector('#details')?.offsetTop || 0) - 100) setActiveNavigation(null);
}
function scheduleNavigationUpdate() {
  if (navigationFrame) return;
  navigationFrame = window.requestAnimationFrame(updateActiveNavigation);
}
window.addEventListener('scroll', scheduleNavigationUpdate, { passive: true });
window.addEventListener('resize', scheduleNavigationUpdate);
sectionLinks.forEach((link) => link.addEventListener('click', () => {
  const destination = document.querySelector(link.getAttribute('href'));
  if (destination) setActiveNavigation(link);
}));
scheduleNavigationUpdate();

// Swipe through the wedding portraits presented as a layered photo stack.
const photoStack = document.querySelector('.photo-stack');
const stackPhotos = [...photoStack.querySelectorAll('.stack-photo')];
let activeStackPhoto = 0;
let dragStartX = null;
let stackPointerMoved = false;
let ignoreStackClick = false;
function renderPhotoStack() {
  stackPhotos.forEach((photo, index) => {
    const offset = (index - activeStackPhoto + stackPhotos.length) % stackPhotos.length;
    photo.dataset.stackPosition = String(offset);
    photo.setAttribute('aria-hidden', offset === 0 ? 'false' : 'true');
  });
}
function advancePhotoStack(direction) {
  activeStackPhoto = (activeStackPhoto + direction + stackPhotos.length) % stackPhotos.length;
  renderPhotoStack();
}
renderPhotoStack();
photoStack.addEventListener('pointerdown', (event) => {
  if (event.pointerType === 'mouse' && event.button !== 0) return;
  dragStartX = event.clientX;
  stackPointerMoved = false;
  photoStack.classList.add('is-dragging');
  photoStack.setPointerCapture(event.pointerId);
});
photoStack.addEventListener('pointerup', (event) => {
  if (dragStartX === null) return;
  const distance = event.clientX - dragStartX;
  if (Math.abs(distance) > 12) {
    stackPointerMoved = true;
    ignoreStackClick = true;
    window.setTimeout(() => { ignoreStackClick = false; }, 250);
    advancePhotoStack(distance < 0 ? 1 : -1);
  }
  dragStartX = null;
  photoStack.classList.remove('is-dragging');
});
photoStack.addEventListener('pointercancel', () => {
  dragStartX = null;
  photoStack.classList.remove('is-dragging');
});
photoStack.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowRight') { event.preventDefault(); advancePhotoStack(1); }
  if (event.key === 'ArrowLeft') { event.preventDefault(); advancePhotoStack(-1); }
});
photoStack.addEventListener('click', () => {
  if (ignoreStackClick || stackPointerMoved) {
    ignoreStackClick = false;
    stackPointerMoved = false;
    return;
  }
  advancePhotoStack(1);
});

const audio = document.querySelector('#wedding-audio');
const musicButton = document.querySelector('#music-toggle');
function setMusicState(isPlaying) {
  musicButton.classList.toggle('playing', isPlaying);
  musicButton.setAttribute('aria-label', isPlaying ? 'Matikan musik' : 'Nyalakan musik');
  musicButton.setAttribute('title', isPlaying ? 'Matikan musik' : 'Nyalakan musik');
  musicButton.setAttribute('aria-pressed', String(isPlaying));
}
// Autoplay begins on the cover when allowed; keep the icon in sync if the browser blocks it.
audio.addEventListener('play', () => setMusicState(true));
audio.addEventListener('pause', () => setMusicState(false));
audio.addEventListener('playing', () => setMusicState(true));
audio.addEventListener('error', () => setMusicState(false));
musicButton.addEventListener('click', async () => {
  if (!audio.paused) {
    audio.pause();
    setMusicState(false);
    return;
  }
  try {
    await audio.play();
    setMusicState(true);
  } catch {
    setMusicState(false);
  }
});
setMusicState(!audio.paused);
async function startWeddingMusic() {
  try {
    await audio.play();
    setMusicState(true);
  } catch {
    // The invitation-opening click is the browser's first permitted playback gesture.
    setMusicState(false);
  }
}

const giftModal = document.querySelector('#gift-modal');
const giftOpen = document.querySelector('#gift-open');
const giftFeedback = document.querySelector('#gift-copy-feedback');
function closeGiftModal() {
  giftModal.classList.remove('is-open');
  giftModal.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('modal-open');
}
giftOpen.addEventListener('click', () => {
  giftModal.classList.add('is-open');
  giftModal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('modal-open');
  giftModal.querySelector('.gift-modal-close').focus();
});
giftModal.querySelectorAll('[data-close-gift]').forEach((element) => element.addEventListener('click', closeGiftModal));
giftModal.querySelectorAll('[data-copy-account]').forEach((button) => button.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(button.dataset.copyAccount);
    giftFeedback.textContent = 'Account number copied.';
  } catch {
    giftFeedback.textContent = button.dataset.copyAccount;
  }
}));
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && giftModal.classList.contains('is-open')) closeGiftModal();
});
const form = document.querySelector('#rsvp-form');
const status = document.querySelector('#form-status');
const rsvpModal = document.querySelector('#rsvp-modal');
const rsvpModalTitle = document.querySelector('#rsvp-modal-title');
const rsvpModalMessage = document.querySelector('#rsvp-modal-message');
const rsvpLoader = document.querySelector('#rsvp-loader');
const rsvpModalOk = document.querySelector('#rsvp-modal-ok');
function showRsvpModal(state, message) {
  const isLoading = state === 'loading';
  rsvpModalTitle.textContent = isLoading ? 'Sending your RSVP' : state === 'success' ? 'Thank you!' : 'Unable to send';
  rsvpModalMessage.textContent = message;
  rsvpLoader.hidden = !isLoading;
  rsvpModalOk.hidden = isLoading;
  rsvpModal.classList.toggle('is-loading', isLoading);
  rsvpModal.classList.add('is-open');
  rsvpModal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('modal-open');
  if (!isLoading) rsvpModalOk.focus();
}
function closeRsvpModal() {
  rsvpModal.classList.remove('is-open');
  rsvpModal.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('modal-open');
}
rsvpModal.querySelectorAll('[data-close-rsvp]').forEach((element) => element.addEventListener('click', closeRsvpModal));
rsvpModalOk.addEventListener('click', closeRsvpModal);
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && rsvpModal.classList.contains('is-open') && !rsvpLoader.hidden) return;
  if (event.key === 'Escape' && rsvpModal.classList.contains('is-open')) closeRsvpModal();
});
form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const button = form.querySelector('[type="submit"]');
  const payload = Object.fromEntries(new FormData(form));
  payload.submittedAt = new Date().toISOString();
  payload.invitationCategory = invitationCategory;
  button.disabled = true;
  status.textContent = 'Mengirim konfirmasi…';
  showRsvpModal('loading', 'Please wait while we send your confirmation.');
  if (!RSVP_ENDPOINT) {
    const saved = JSON.parse(localStorage.getItem('michael-sharen-rsvps') || '[]');
    saved.push(payload);
    localStorage.setItem('michael-sharen-rsvps', JSON.stringify(saved));
    status.textContent = 'Terima kasih! Konfirmasi tersimpan di perangkat ini. Hubungkan Google Sheets untuk menerima RSVP secara online.';
    showRsvpModal('success', 'Your confirmation has been saved on this device.');
    form.reset();
    button.disabled = false;
    return;
  }
  try {
    await fetch(RSVP_ENDPOINT, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    status.textContent = 'Terima kasih! Konfirmasi Anda sudah dikirim.';
    showRsvpModal('success', 'Your confirmation has been sent. Thank you for celebrating with us.');
    form.reset();
  } catch {
    status.textContent = 'Konfirmasi belum terkirim. Periksa koneksi Anda dan coba lagi.';
    showRsvpModal('error', 'Your confirmation was not sent. Please check your connection and try again.');
  } finally { button.disabled = false; }
});
