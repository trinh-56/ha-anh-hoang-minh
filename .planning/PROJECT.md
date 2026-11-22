# Wedding Invitation — Hà Anh & Hoàng Minh

Online wedding invitation (Vietnamese), one scrolling page, mobile-first, also good on desktop. 100% free to host and run.
Source brief: `Wedding Invitation Design.rtf`. Visual references: `Reference images/page-*.png`.

## Stack (locked)
- Plain `index.html` + `styles.css` + `app.js` + `countdown.js` (ES module). No framework, no npm, no build.
- Fonts: script = **FS North Land** (`assets/fonts/FS-North-Land.otf`, from `Reference images/font/`, covers Vietnamese accents; the Swash variant does not, so unused); body = Montserrat 300/400/500/600 via Google Fonts with `&subset=vietnamese`.
- Hosting: **GitHub Pages** (free, HTTPS, custom URL `<user>.github.io/<repo>`). Fallback if repo must stay private: Cloudflare Pages direct upload (free).
- RSVP storage: **Google Sheet + Google Apps Script web app** (free, no server, rows readable on phone in Google Sheets app).
- Image processing: macOS `sips` (built in). No image libraries.

## Palette (from `Reference images/color-palette.png`) → CSS custom properties on `:root`
| token | hex | use |
|---|---|---|
| `--peony` | #D87BAA | small accents only (timeline line dot, focus ring) |
| `--ivory` | #FFFEEF | page background, light text on photos |
| `--ink` | #292727 | body text, dark sections, desktop backdrop |
| `--carmine` | #C2062B | primary button |
| `--mauve` | #AF3E4D | headings on ivory, labels |
| `--wine` | `color-mix(in srgb, var(--carmine) 55%, var(--ink))` | couple-page + thank-you background (reference burgundy) |

## Content (exact text)
- Couple: **Hà Anh & Hoàng Minh** — date **17/12/2026** (Thứ 5, verified Thursday)
- Countdown target = reception start 2026-12-17 11:30 Asia/Ho_Chi_Minh = `Date.UTC(2026, 11, 17, 4, 30)`
- Nhà gái: "Bố Mai Hồng Anh" · "Mẹ Đặng Thị Thúy Hà"
- Nhà trai: "Bố Nguyễn Văn Hải" · "Mẹ Vũ Thị Thuyền Quyên"
- "Thân mời tới dự lễ cưới thân mật của chúng tôi"
- Lễ Vu Quy block: "Lễ Vu Quy" / "Hôn lễ được tổ chức tại tư gia" / "BT02-19 khu đô thị An Hưng, Dương Nội, Hà Nội" / "9:30 (Tức ngày 09 tháng 11 Bính Ngọ)"
- Reception block: "Được tổ chức vào lúc" / "11:30, Thứ 5" / 17 | Tháng 12 · 2026 / "Trung Tâm Tiệc Cưới" / "PROMES CENTER" / "Sảnh Camella - Tầng 2" / "122-124 Xuân Thuỷ, Cầu Giấy, Hà Nội"
- Directions: map-pin icon + "Hướng dẫn tới địa chỉ" → `https://maps.app.goo.gl/MWEVd2WznuuyFbfQA` (new tab), plus QR code of the same URL in palette colours (`assets/map-qr.svg`)
- Timeline: 09:30 Lễ Vu Quy · 10:30 Đón Khách · 11:00 Lễ Thành Hôn · 11:30 Khai Mạc · "Rất hân hạnh được đón tiếp"
- Thank you: "Cảm ơn quý khách đã hiện diện và cùng chia sẻ niềm vui trong ngày đặc biệt này. Sự hiện diện của quý khách chính là món quà ý nghĩa dành cho chúng tôi." + script "Thank you!"

## Sections (in order, ids)
1. `#intro` — full-screen overlay: image-1 (colour) behind, lily-1 left, lily-2 right, wax-seal centre (button). Tap seal → seal + lilies animate away, image-1 transitions to grayscale, names + date fade in (= page-1.2). Scroll locked until opened.
2. `#save-date` — "SAVE / the / DATE" heading, envelope.png tilted, 3-photo polaroid strip rotated ~-8° overlapping it (page-date.png).
3. `#countdown` — countdown-image full-bleed B&W, script "Countdown", `DD : HH : MM : SS` with small labels Ngày/Giờ/Phút/Giây.
4. `#family` — page-info-family-location layout: left vertical rule + Nhà gái/Nhà trai block, lily-2 line-art faded on left, script couple names, time/date block, addresses.
5. `#couple` — wine background with repeated embossed script "i love you" pattern, two stacked photo cards (bride, groom) with label "Cô dâu"/"Chú rể" (Montserrat) + first name in script.
6. `#timeline` — script "Timeline", vertical rule, 3 items, closing line.
7. `#rsvp` — simplified form (name, attending yes/no, number of guests) then `#thanks` block on image-2 with wine overlay.

## Decisions
- Name field added to RSVP (required — otherwise entries are anonymous). No message, no bride/groom side, no children count (user asked for simpler).
- All photos shown grayscale (`filter: grayscale(1)`) to match references; intro image starts colour then fades to grayscale.
- image-page-2.JPG → background of the thank-you block.
- Ginkgo watermark in references → replaced by lily-1 at ~8% opacity (we have no ginkgo asset).
- QR code: generated ONCE at build time into a static SVG (modules `--mauve` #AF3E4D on `--ivory`); no QR library shipped to the browser. Only the reception venue gets a map link (brief gives no link for the home address).
- Music button in references: skipped (no audio provided).
- Desktop: content is a centred column `max-width: 480px`; outside the column is `--ink`. Same layout as mobile, looks like the reference phone frames.
