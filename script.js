/* ---------------------------------------------------------------
   Danielle & Jordan wedding site
   Demo build: the RSVP is fully validated client-side and stores
   replies in this browser. In the live build the same submit handler
   posts to the backend (see README) which writes to the guest-list
   database and emails the couple.
   --------------------------------------------------------------- */
(function () {
  'use strict';

  /* ---------- sticky nav shadow ---------- */
  var nav = document.getElementById('nav');
  function onScroll() {
    nav.classList.toggle('is-stuck', window.scrollY > 8);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- mobile menu ---------- */
  var navToggle = document.getElementById('navToggle');
  var links = document.getElementById('navLinks');

  navToggle.addEventListener('click', function () {
    var open = links.classList.toggle('is-open');
    navToggle.setAttribute('aria-expanded', String(open));
  });

  links.addEventListener('click', function (e) {
    if (e.target.tagName === 'A') {
      links.classList.remove('is-open');
      navToggle.setAttribute('aria-expanded', 'false');
    }
  });

  /* ---------- countdown ---------- */
  var target = new Date('2027-02-12T17:00:00+11:00').getTime();
  var cdEls = {
    days: document.querySelector('[data-cd="days"]'),
    hours: document.querySelector('[data-cd="hours"]'),
    minutes: document.querySelector('[data-cd="minutes"]'),
    seconds: document.querySelector('[data-cd="seconds"]')
  };

  function pad(n) { return n < 10 ? '0' + n : String(n); }

  function tickCountdown() {
    var diff = target - Date.now();
    if (diff < 0) diff = 0;
    var s = Math.floor(diff / 1000);
    cdEls.days.textContent = Math.floor(s / 86400);
    cdEls.hours.textContent = pad(Math.floor(s % 86400 / 3600));
    cdEls.minutes.textContent = pad(Math.floor(s % 3600 / 60));
    cdEls.seconds.textContent = pad(s % 60);
  }
  tickCountdown();
  setInterval(tickCountdown, 1000);

  /* ---------- reveal on scroll ---------- */
  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -60px 0px' });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ---------- RSVP ---------- */
  var form = document.getElementById('rsvpForm');
  var confirmPanel = document.getElementById('rsvpConfirm');
  var confirmTitle = document.getElementById('confirmTitle');
  var confirmBody = document.getElementById('confirmBody');
  var attendingBlock = document.getElementById('attendingBlock');
  var guestNamesField = document.getElementById('guestNamesField');
  var guestsSelect = document.getElementById('guests');

  function isComing() {
    var picked = form.querySelector('input[name="attending"]:checked');
    return picked && picked.value === 'yes';
  }

  /* Show the extra questions only for guests who are actually coming */
  form.querySelectorAll('input[name="attending"]').forEach(function (radio) {
    radio.addEventListener('change', function () {
      attendingBlock.classList.toggle('is-hidden', !isComing());
      clearError('attending');
      syncGuestNames();
    });
  });

  /* Guest names only matter when more than one person is coming */
  function syncGuestNames() {
    var many = isComing() && Number(guestsSelect.value) > 1;
    guestNamesField.classList.toggle('is-hidden', !many);
    if (!many) clearError('guestNames');
  }
  guestsSelect.addEventListener('change', syncGuestNames);
  syncGuestNames();

  function showError(id) {
    var field = document.getElementById(id);
    var err = document.getElementById(id + '-error');
    if (field) field.setAttribute('aria-invalid', 'true');
    if (err) err.classList.add('is-shown');
  }

  function clearError(id) {
    var field = document.getElementById(id);
    var err = document.getElementById(id + '-error');
    if (field) field.removeAttribute('aria-invalid');
    if (err) err.classList.remove('is-shown');
  }

  /* Clear a field's error as soon as the guest starts fixing it */
  ['firstName', 'lastName', 'email', 'guestNames'].forEach(function (id) {
    var el = document.getElementById(id);
    el.addEventListener('input', function () { clearError(id); });
  });

  function validEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim());
  }

  function validate() {
    var problems = [];

    ['firstName', 'lastName'].forEach(function (id) {
      if (!document.getElementById(id).value.trim()) problems.push(id);
    });

    if (!validEmail(document.getElementById('email').value)) problems.push('email');

    if (!form.querySelector('input[name="attending"]:checked')) problems.push('attending');

    if (isComing() && Number(guestsSelect.value) > 1 &&
        !document.getElementById('guestNames').value.trim()) {
      problems.push('guestNames');
    }

    problems.forEach(showError);
    return problems;
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    var problems = validate();
    if (problems.length) {
      var first = document.getElementById(problems[0]) ||
                  form.querySelector('input[name="' + problems[0] + '"]');
      if (first) {
        first.scrollIntoView({ block: 'center', behavior: 'smooth' });
        first.focus({ preventScroll: true });
      }
      return;
    }

    var data = {};
    new FormData(form).forEach(function (value, key) { data[key] = value; });
    data.submittedAt = new Date().toISOString();

    /* Demo storage. Live build: fetch('/api/rsvp', {method:'POST', ...}) */
    try {
      var all = JSON.parse(localStorage.getItem('rsvps') || '[]');
      all.push(data);
      localStorage.setItem('rsvps', JSON.stringify(all));
    } catch (err) {
      /* private browsing — the demo still confirms */
    }

    var coming = data.attending === 'yes';
    confirmTitle.textContent = coming ? 'Wonderful, see you there' : 'Thank you for letting us know';
    confirmBody.textContent = coming
      ? 'Your reply is in, ' + data.firstName + '. We\'ve got you down for ' +
        (Number(data.guests) > 1 ? 'two places' : 'one place') +
        '. A confirmation is on its way to ' + data.email +
        ', and we\'ll send the final details closer to the date.'
      : 'We\'re sorry you can\'t make it, ' + data.firstName +
        ', but thank you for replying. It really does help with the planning, and we\'ll raise a glass to you.';

    form.classList.add('is-hidden');
    confirmPanel.classList.remove('is-hidden');
    confirmPanel.scrollIntoView({ block: 'center', behavior: 'smooth' });
  });

  document.getElementById('rsvpAgain').addEventListener('click', function () {
    form.reset();
    attendingBlock.classList.add('is-hidden');
    syncGuestNames();
    ['firstName', 'lastName', 'email', 'guestNames'].forEach(clearError);
    clearError('attending');
    confirmPanel.classList.add('is-hidden');
    form.classList.remove('is-hidden');
    document.getElementById('firstName').focus();
  });

})();
