/* ---------------------------------------------------------------
   Danielle & Jordan — wedding site
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
    confirmTitle.textContent = coming ? 'Wonderful — see you there' : 'Thank you for letting us know';
    confirmBody.textContent = coming
      ? 'Your reply is in, ' + data.firstName + '. We\'ve got you down for ' +
        (Number(data.guests) > 1 ? 'two places' : 'one place') +
        '. A confirmation is on its way to ' + data.email +
        ', and we\'ll send the final details closer to the date.'
      : 'We\'re sorry you can\'t make it, ' + data.firstName +
        ', but thank you for replying — it really does help with the planning. We\'ll raise a glass to you.';

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

  /* ---------- our song ----------------------------------------
     One <audio> driven by two controls (the inline player and the
     floating button) that always show the same state.

     It never autoplays. Browsers block sound-on-load anyway, but it is
     also just rude, so playback only ever starts from a real click.
     ------------------------------------------------------------- */
  var audio = document.getElementById('songAudio');
  var playBtn = document.getElementById('songPlay');
  var jukeBtn = document.getElementById('jukeboxBtn');
  var seek = document.getElementById('songSeek');
  var nowEl = document.getElementById('songNow');
  var totalEl = document.getElementById('songTotal');
  var noteEl = document.getElementById('songNote');
  var hint = document.getElementById('jukeboxHint');
  var songSection = document.getElementById('song');

  var VOLUME = 0.55;        /* background music should sit under the room */
  var FADE_MS = 700;
  var fadeTimer = null;
  var seeking = false;

  audio.volume = 0;

  function clock(secs) {
    if (!isFinite(secs) || secs < 0) return '—:—';
    var m = Math.floor(secs / 60);
    var s = Math.floor(secs % 60);
    return m + ':' + (s < 10 ? '0' + s : s);
  }

  /* Fade rather than cut — a hard stop on a wedding site sounds like a fault */
  function fadeTo(targetVol, done) {
    clearInterval(fadeTimer);
    var start = audio.volume;
    var steps = Math.round(FADE_MS / 40);
    var i = 0;
    fadeTimer = setInterval(function () {
      i++;
      audio.volume = Math.min(1, Math.max(0, start + (targetVol - start) * (i / steps)));
      if (i >= steps) {
        clearInterval(fadeTimer);
        if (done) done();
      }
    }, 40);
  }

  function paintState(playing) {
    document.body.classList.toggle('is-playing', playing);
    songSection.classList.toggle('is-spinning', playing);
    [playBtn, jukeBtn].forEach(function (b) {
      b.setAttribute('aria-pressed', String(playing));
      b.setAttribute('aria-label', playing ? 'Pause our song' : 'Play our song');
    });
  }

  function paintSeek() {
    var pct = audio.duration ? (audio.currentTime / audio.duration) * 100 : 0;
    if (!seeking) seek.value = Math.round(pct * 10);
    seek.style.backgroundImage =
      'linear-gradient(to right, var(--gold) 0%, var(--gold) ' + pct +
      '%, var(--rule) ' + pct + '%, var(--rule) 100%)';
    nowEl.textContent = clock(audio.currentTime);
  }

  function toggleSong() {
    dismissHint();
    if (audio.paused) {
      var p = audio.play();
      if (p && p.catch) {
        p.catch(function () {
          /* the browser refused (rare, since this came from a click) */
          noteEl.textContent = 'Your browser blocked playback — tap the button once more.';
        });
      }
    } else {
      fadeTo(0, function () { audio.pause(); });
    }
  }

  playBtn.addEventListener('click', toggleSong);
  jukeBtn.addEventListener('click', toggleSong);

  audio.addEventListener('play', function () {
    paintState(true);
    fadeTo(VOLUME);
  });

  audio.addEventListener('pause', function () {
    paintState(false);
  });

  /* While the file is still arriving the browser reports an estimated
     duration and revises it, so listen for the correction as well as the
     first reading — otherwise the total time shows wrong on a slow line. */
  function paintDuration() {
    totalEl.textContent = clock(audio.duration);
    paintSeek();
  }

  audio.addEventListener('loadedmetadata', paintDuration);
  audio.addEventListener('durationchange', paintDuration);

  audio.addEventListener('timeupdate', paintSeek);

  /* With <source> children the failure surfaces on the sources, not always on
     the <audio>, so listen to both and only give up once none are left. */
  function songUnavailable() {
    [playBtn, jukeBtn].forEach(function (b) { b.disabled = true; });
    noteEl.textContent = 'The song could not be loaded.';
  }

  audio.addEventListener('error', songUnavailable);

  var sources = audio.querySelectorAll('source');
  var deadSources = 0;
  sources.forEach(function (s) {
    s.addEventListener('error', function () {
      deadSources++;
      if (deadSources === sources.length) songUnavailable();
    });
  });

  /* Scrubbing: follow the thumb live, and don't let timeupdate fight it */
  seek.addEventListener('input', function () {
    seeking = true;
    if (audio.duration) {
      nowEl.textContent = clock((seek.value / 1000) * audio.duration);
    }
  });

  seek.addEventListener('change', function () {
    if (audio.duration) audio.currentTime = (seek.value / 1000) * audio.duration;
    seeking = false;
    paintSeek();
  });

  /* The nudge: once per visit, and only after they've settled in */
  function dismissHint() {
    hint.classList.remove('is-shown');
    try { sessionStorage.setItem('hintSeen', '1'); } catch (e) {}
  }

  document.getElementById('jukeboxDismiss').addEventListener('click', function (e) {
    e.stopPropagation();
    dismissHint();
  });

  var seen = false;
  try { seen = sessionStorage.getItem('hintSeen') === '1'; } catch (e) {}

  if (!seen) {
    setTimeout(function () {
      if (audio.paused) {
        hint.classList.add('is-shown');
        setTimeout(function () { hint.classList.remove('is-shown'); }, 7000);
      }
    }, 2500);
  }

  /* On a phone the floating button sits right where the RSVP submit is.
     Tuck it away while the form is on screen — missing "Send our reply"
     because a music button was in the way would be a genuinely bad trade. */
  var jukebox = document.getElementById('jukebox');
  var narrow = window.matchMedia('(max-width: 620px)');

  if ('IntersectionObserver' in window) {
    var rsvpSection = document.getElementById('rsvp');
    var rsvpOnScreen = false;

    function syncTuck() {
      jukebox.classList.toggle('is-tucked', rsvpOnScreen && narrow.matches);
    }

    new IntersectionObserver(function (entries) {
      rsvpOnScreen = entries[0].isIntersecting;
      syncTuck();
    }, { threshold: 0.12 }).observe(rsvpSection);

    /* rotating the phone changes the answer, so re-check on resize too */
    if (narrow.addEventListener) narrow.addEventListener('change', syncTuck);
    else if (narrow.addListener) narrow.addListener(syncTuck);
  }

  paintSeek();

  /* Gift links are placeholders in the demo */
  document.querySelectorAll('[data-demo-link]').forEach(function (el) {
    el.addEventListener('click', function (e) {
      e.preventDefault();
      window.alert('Demo only — in the live site this opens your real registry, ' +
                   'honeymoon fund or donation page.');
    });
  });

})();
