# Danielle & Jordan — wedding website

A coastal, Great Ocean Road take on a classic wedding site, built for a wedding
in Anglesea, Victoria on Friday 12 February 2027.

The content comes from the couple's own Canva site, plus a round of wording
changes from them. Two things worth flagging:

- **Their phone numbers are deliberately absent**, at their request. The
  contact FAQ says guests should already have their details. `test_site.py`
  asserts the numbers never reappear.
- **Their photographs are now included**, at their request — two supplied by
  the couple. `IMG_7037` arrived physically sideways because the EXIF
  orientation tag was stripped in transit, so it is rotated 90 degrees
  clockwise here before use.

The RSVP-by date is 30 November 2026, confirmed by the couple. Their Canva site
said 30 August 2026, which had already passed when this was built.

## House style

The couple asked for **no en or em dashes anywhere in the copy** — they felt the
dashes read as AI-written. Commas or full stops instead. `test_site.py` walks
every text node and fails if a dash comes back, so this cannot regress
unnoticed.

"The Love House" is wrapped in `.nowrap` everywhere it appears, because they
asked for it never to break across two lines. The test asserts each of those
elements occupies exactly one client rect.

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
| Ceremony band | A dark full-width band stating plainly that the ceremony is for them, the boys and immediate family, and that the reception is for everyone |
| Our Wedding | Why Anglesea, in the couple's own words, with their beach photograph |
| Photo band | Full-width pier photograph between Details and Music |
| Schedule | Five cards laid out 3 + 2 and centred; the 11am ceremony card is set apart and tagged "Not a guest event" |
| Details | Venue, dress code, where to stay, getting home |
| Music | The Spotify embed of their track, and a separate background player with a turning record, seek bar and a floating control that follows the guest |
| RSVP | Full form with validation, conditional fields, and a confirmation state |
| Gifts | Wishing well at the venue, and what contributions go towards |
| FAQs | Nine expandable questions, the first answering "can we come to the ceremony?" |

## How the RSVP behaves

- Required: first name, last name, a valid email, and an accept/decline choice.
- Choosing **Joyfully accepts** reveals party size, guest name, the Torquay bus
  question, dietary requirements and a song request. Declining hides all of it —
  nobody who isn't coming is asked whether they want the bus.
- Guest names become required only when the party size is more than one.
- The bus back to Torquay is confirmed, dropping at the Torquay Hotel. The RSVP
  still asks who will use it so the couple can size it, which answers that for
  them automatically instead of by group chat.
- Party size caps at two, and the form states the couple's rule: if you are
  married or engaged, your partner is invited.
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
through a Spotify embed in the Music section. This is the only element on
the site that reaches a third party: the embed loads Spotify's script and sets
Spotify's cookies. Everything else is served from this site. Spotify plays the
full track for signed-in listeners and a ~30 second preview for everyone else,
and it cannot autoplay or play in the background.

**The background music** is `audio/our-song.mp3` (plus a smaller `.ogg`), an
original piano piece written for this build: nothing sampled, nothing
licensed, nothing to clear. It is a slow 4/4 ballad in G major, chosen to sit
near the mood of the track they picked. `make_music2.py` generates it; the
earlier 3/4 waltz is `make_music.py` if they prefer that one.

The couple asked whether the track could be pulled from a YouTube link. It
could not: the video is a third-party upload of commercial music, so taking the
audio would breach both YouTube's terms and the rights in the recording. The
Spotify embed is the legitimate way to have that exact track on the page, and
original music is the legitimate way to have something playing in the
background.

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

Note on rights: hosting a commercial recording on a public page needs a licence,
which is why the background music here is original. An embed
(Spotify/Apple Music/YouTube) is the licensed route to a commercial track, but
it costs you the "no external requests" property described below, since it loads
third-party scripts and cookies.

## Technical notes

- Static HTML, CSS and vanilla JavaScript. No build step, no framework, no
  dependencies, nothing to keep updated.
- Fonts (Cormorant Garamond and Lora) are self-hosted in `fonts/`. There is no
  analytics and no tracking of our own, and **no guest data leaves the page** —
  the RSVP never touches a third party.
- **One exception, and only one:** the Spotify embed in the Music section
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
