# Roadmap

## Phase 1: Invitation site (local) — GATE
Goal: all 7 sections built and working locally on phone + desktop; RSVP form UI done (posts to a URL set in Phase 2).
Plan: `phases/01-invitation-site/01-01-PLAN.md` (tasks 1-1 … 1-8)
Requirements: R1 intro transition · R2 save-the-date · R3 countdown · R4 family/location · R5 couple · R6 timeline · R7 RSVP form + thank you · R8 mobile-native + desktop · R9 palette + fonts
**GATE:** user checks `python3 -m http.server 8000` on desktop + phone (same Wi-Fi: `http://<mac-ip>:8000`), tunes `object-position` of photos, scans the map QR with phone camera, then says "continue".

## Phase 2: RSVP backend + free deploy
Goal: live public URL; every RSVP lands as a row in the couple's Google Sheet.
Plan: `phases/02-rsvp-and-deploy/02-01-PLAN.md` (tasks 2-1 … 2-4)
Requirements: R10 RSVP stored in Google Sheet · R11 free public hosting · R12 link preview in Zalo/Messenger

## Phase 3: Design revamp — GATE
Goal: site matches the 8 designs in `~/Downloads/Hà Anh & Hoàng Minh/`, with RSVP still saving to the Sheet.
Plan: `phases/03-design-revamp/03-01-PLAN.md` (tasks 3-0 … 3-12)
**GATE:** user checks on a real phone and desktop before merge or push.
