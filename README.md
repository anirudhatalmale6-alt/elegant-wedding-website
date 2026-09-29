# Danielle & Jordan — wedding website

A coastal, Great Ocean Road take on a classic wedding site, built for a wedding
in Anglesea, Victoria on Friday 12 February 2027.

The content comes from the couple's own Canva site. Two deliberate omissions:

- **Their phone numbers are not in this repository.** They appear on the
  couple's own site, but this repo is public and indexable, so the contact FAQ
  says "the numbers go here on the live site" until they confirm otherwise.
- **Their photographs are now included**, at their request — two supplied by
  the couple. `IMG_7037` arrived physically sideways because the EXIF
  orientation tag was stripped in transit, so it is rotated 90 degrees
  clockwise here before use.

The RSVP-by date is a placeholder: the couple's stated deadline of 30 August
2026 had already passed, so it needs a new one from them.

## Palette

Bleached sand, limestone and deep sea, replacing the earlier ivory-and-gold.
All six colours are CSS variables at the top of `styles.css`; the coastline
illustration recolours with them automatically.

The Great Ocean Road coastline under the hero is hand-drawn inline SVG —
headland, sea, four limestone stacks, breaking foam, wet and dry sand, and
gulls that drift. No photograph, no licensing, no download.

## What's in it

| Section | What it does |
|---|---|
| Hero | Names, date, place, live countdown, RSVP call to action, coastline illustration |
| Private-ceremony band | A dark full-width band stating plainly that the ceremony is private and the reception is for everyone |
| Our Wedding | Why Anglesea, in the couple's own words, with their beach photograph |
| Photo band | Full-width pier photograph between Details and Our Song |
| Schedule | Four cards; the 11am ceremony card is set apart and tagged "Not a guest event" |
| Details | Venue, dress code, where to stay, getting home |
| Our Song | Inline player with a turning record, seek bar and times, plus a floating control that follows the guest down the page |
| RSVP | Full form with validation, conditional fields, and a confirmation state |
| Gifts | Wishing well at the venue, and their 2027 overseas trip |
| FAQs | Nine expandable questions, the first answering "can we come to the ceremony?" |

## How the RSVP behaves

- Required: first name, last name, a valid email, and an accept/decline choice.
- Choosing **Joyfully accepts** reveals party size, guest name, the Torquay bus
  question, dietary requirements and a song request. Declining hides all of it —
  nobody who isn't coming is asked whether they want the bus.
- Guest names become required only when the party size is more than one.
- The bus question exists because the couple are deciding whether to run a bus
  back to Torquay based on numbers. Asking it here answers that for them
  automatically instead of by group chat.
- Party size caps at two, and the form says plainly that a +1 only applies if
  the invitation included one.
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

Two separate things, deliberately kept apart:

**Their song** — *Daylight (Piano Version)* by Relaxing Piano Covers — plays
through a Spotify embed in the Our Song section. This is the only element on
the site that reaches a third party: the embed loads Spotify's script and sets
Spotify's cookies. Everything else is served from this site. Spotify plays the
full track for signed-in listeners and a ~30 second preview for everyone else,
and it cannot autoplay or play in the background.

**The background music** is `audio/our-song.mp3` (plus a smaller `.ogg`), an
original piano piece written for this build — nothing sampled, nothing
licensed. It is a placeholder until the couple supply an audio file they own;
dropping that file in makes the background player play their actual song across
the whole site, which the Spotify embed can never do.

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
- Fonts (Cormorant Garamond and Lora) are self-hosted in `fonts/`. There is no
  analytics and no tracking of our own, and **no guest data leaves the page** —
  the RSVP never touches a third party.
- **One exception, and only one:** the Spotify embed in the Our Song section
  loads Spotify's script and sets Spotify's cookies for anyone who scrolls to
  it. Removing that one `<iframe>` restores the property that the page makes no
  external requests whatsoever.
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
audio/        the background music, as mp3 and ogg
img/          the couple's photographs, resized for the web
```

To re-skin it, change the six colour variables at the top of `styles.css`.
