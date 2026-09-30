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

## No music

There was a music section: a Spotify embed of the track the couple chose, plus
an original piano piece playing quietly in the background. They could not
obtain a licensed copy of the track they wanted, so on 30 September they asked
for the music to be removed altogether. The player, the embed, the floating
control, the audio files and all their CSS and JavaScript are gone.

`make_music.py` and `make_music2.py` (outside this repo) still generate the two
original pieces if it is ever wanted back.

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
| Photo band | Full-width pier photograph between Details and the RSVP |
| Schedule | Five cards laid out 3 + 2 and centred; the 11am ceremony card is set apart and tagged "Not a guest event" |
| Details | Venue, dress code, where to stay, getting home |
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

## Collecting the replies

**Out of the box the form sends nowhere.** With `data-endpoint` empty on the
`<form>` in `index.html`, a reply is written to the guest's own `localStorage`
and nobody else ever sees it. That is fine for a draft and fatal if the link
gets shared, so it is the first thing to wire up before launch.

`rsvp-google-sheet.gs` (outside this repo) is a Google Apps Script the couple
paste into a spreadsheet in their own Google account. Deploy it as a web app,
put the resulting URL in `data-endpoint`, and every reply:

- appends a row to their private "Wedding RSVPs" sheet, which they can sort,
  filter and export as CSV for the caterer;
- emails both of them a summary of who replied and what they said;
- emails the guest a confirmation with the date, venue and the 4:30pm arrival.

It runs under their Google account, so they own the data and it keeps working
independently of anyone else. A `LockService` lock stops two simultaneous
replies from colliding on the same row.

The POST deliberately uses `Content-Type: text/plain`. That keeps it a "simple"
CORS request, so the browser skips the preflight `OPTIONS` that an Apps Script
web app cannot answer.

**Failure is handled honestly.** If the send fails for any reason, the guest
does not get a thank-you. They get an error asking them to try again, and the
submit button re-enables. `test_rsvp_send.py` covers all four paths: no
endpoint, a working endpoint, an endpoint returning 500, and the connection
dropping. The thank-you also only promises a confirmation email when an
endpoint is actually configured.

## Technical notes

- Static HTML, CSS and vanilla JavaScript. No build step, no framework, no
  dependencies, nothing to keep updated.
- Fonts (Cormorant Garamond and Lora) are self-hosted in `fonts/`, so **loading
  the page makes no external requests at all**: no Google, no analytics, no
  trackers, nothing that records a visit. The Spotify embed was the one
  exception and it went with the music.
- The one deliberate outbound request is the RSVP itself, once `data-endpoint`
  is set: submitting sends the reply to the couple's own Google Sheet. That is
  the guest knowingly sending their answer where it was asked for, not
  tracking, and it happens only on submit. Browsing the site still reveals
  nothing to anyone.
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
script.js     countdown, navigation, scroll reveals, RSVP logic
fonts.css     self-hosted @font-face declarations
fonts/        woff2 files (latin subset)
img/          the couple's photographs, resized for the web
```

To re-skin it, change the six colour variables at the top of `styles.css`.
