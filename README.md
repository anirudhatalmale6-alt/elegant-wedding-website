# Elegant Wedding Website — demo

A classic, elegant wedding website built as a working sample. Every name, date,
place and paragraph on the page is invented placeholder content — it exists to
show the design and the functionality, not to describe a real wedding.

## What's in it

| Section | What it does |
|---|---|
| Hero | Names, date, place, live countdown, RSVP call to action |
| Private-ceremony band | A dark full-width band stating plainly that the ceremony is private and the celebration is for everyone |
| Our Story | Three-chapter "about us" timeline, alternating text and portrait frames |
| The Day | Four schedule cards; the ceremony card is visually set apart and tagged "Not a guest event" |
| Details | Venue, accommodation, dress code, travel |
| Our Song | Inline player with a turning record, seek bar and times, plus a floating control that follows the guest down the page |
| RSVP | Full form with validation, conditional fields, and a confirmation state |
| Gift List | Honeymoon fund, registry, charity donation |
| FAQ | Six expandable questions, the first answering "can we come to the ceremony?" |

## How the RSVP behaves

- Required: first name, last name, a valid email, and an accept/decline choice.
- Choosing **Joyfully accepts** reveals party size, guest names, menu choice,
  coach booking, dietary requirements and a song request. Declining hides all of
  it — nobody who isn't coming is asked what they want for dinner.
- Guest names become required only when the party size is more than one.
- Errors appear inline under the offending field and clear as soon as the guest
  starts correcting them. The page scrolls to the first problem.
- On success the form is replaced by a confirmation that differs for accepts and
  declines.

In this demo the submission is saved to the browser's `localStorage` so the flow
can be clicked through end to end. In a live build the same `submit` handler
posts to a small backend instead — that's the one-line change marked
`Live build:` in `script.js` — which writes the reply to a guest-list database
and emails the couple. A password-protected page listing every reply, with a
CSV export for the caterer, is the usual companion to that.

## The music

`audio/our-song.mp3` (and a smaller `.ogg` for browsers that prefer it) is an
original piano piece written for this demo — nothing sampled, nothing licensed.
It is a stand-in for the couple's real song.

How it behaves:

- **It never autoplays.** Browsers block sound-on-load, and it is also just
  rude, so playback only ever starts from a real click. A small nudge appears
  by the button a couple of seconds in, once per visit, and can be dismissed.
- Two controls — the inline player and the floating button — drive one `<audio>`
  element and always show the same state.
- Volume fades in and out over ~0.7s rather than cutting, which otherwise sounds
  like a fault.
- `preload="none"`: the file is not downloaded at all unless a guest asks for
  it, so nobody on mobile data pays for music they never played.
- The seek bar scrubs and the track loops.
- On phones the floating button tucks itself away while the RSVP form is on
  screen, so it can never sit over the submit button.
- If the audio file is missing or unplayable, both controls disable themselves
  and say so rather than sitting there dead.

To swap in a different song, drop your file in `audio/` and update the two
`<source>` elements plus the title and artist in `index.html`. Keep both an mp3
and an ogg if you want the widest coverage; mp3 alone is fine in practice.

Note on rights: hosting a commercial track on a public page technically needs a
licence. An embed (Spotify/Apple Music/YouTube) avoids that but costs you the
"no external requests" property described below, since it loads third-party
scripts and cookies.

## Technical notes

- Static HTML, CSS and vanilla JavaScript. No build step, no framework, no
  dependencies, nothing to keep updated.
- Fonts (Cormorant Garamond and Lora) are self-hosted in `fonts/`, so the page
  makes **no external network requests at all** — nothing is loaded from Google,
  no analytics, no trackers, and no guest data leaves the page.
- Responsive from 320px up; verified with no horizontal overflow at 390px and
  1280px.
- Accessibility: semantic landmarks, labelled form controls, `aria-invalid` on
  failed fields, a live region on the confirmation, visible focus rings, and a
  `prefers-reduced-motion` path that disables all animation.
- `<meta name="robots" content="noindex">` — a wedding site shouldn't turn up in
  search results.

## Running it

Any static file server:

```sh
python3 -m http.server 8000
```

Then open <http://localhost:8000>.

## Files

```
index.html    all page content
styles.css    the whole design — colours are CSS variables at the top
script.js     countdown, navigation, scroll reveals, RSVP logic, music player
fonts.css     self-hosted @font-face declarations
fonts/        woff2 files (latin subset)
audio/        the song, as mp3 and ogg
```

To re-skin it, change the six colour variables at the top of `styles.css`.
