# The Last Mixtape — Project Plan

A shared, private "space" for 2+ people who are far apart (couples, best friends, trios,
family). Each person logs in with their own account; a **room code** brings people into
the same space. Songs, voice notes, photos, letters and little rituals live inside the room.

> The old project `last-mixtape` stays untouched as a reference. This is a fresh build.
> Date of plan: 2026-11-23. Facts about third-party APIs were researched on this date;
> they change often, so re-check the "verify" items before relying on them.

---

## 1. Product idea

- **Account** = one person (own email/password or Google). Nobody ever logs in as someone else.
- **Space (room)** = a group of 2–10 people with a join code. One person can be in many spaces
  (e.g. "Besties ♥", "Trio 🎶", "College gang").
- After login: **Your spaces** list → Create space / Join with code → click a space to enter it.
- Inside a space everyone sees what members shared there, and nothing else. Outsiders see nothing.

## 2. Platforms

Web **and** Android (iOS later) from **one codebase**.

| Layer | Choice | Why |
|---|---|---|
| UI | React + TypeScript + Vite + Tailwind | You already know this code; reuse components, animations, themes |
| Animation | `motion` | Already used; drop gsap/lenis unless needed |
| State | Zustand + TanStack Query | Zustand for UI state; Query for server data, caching, refetch on realtime events |
| App shell | **Capacitor** (wraps the web app into Android/iOS) | One codebase, real native push + permissions. Fastest path to Play Store |
| Web install | PWA (manifest + service worker) | Installable on desktop/phone even before the Play Store |
| Backend | **Supabase** (Postgres, Auth, Storage, Realtime, Edge Functions) | Already familiar; JWT login built in; row-level security enforces privacy |
| Web hosting | Cloudflare Pages/Workers + custom domain | Free/cheap, fast, same place as the YouTube proxy used before |
| Push | Firebase Cloud Messaging (Android) + Web Push | Notifications when the app is closed |
| Errors / analytics | Sentry + PostHog (free tiers) | Know when things break and what people use |
| Later: payments | RevenueCat | Only if you add a premium plan |

**Why not a full rewrite in React Native/Flutter?** Much more work, and the current style
(animated cassette, polaroids) is web-friendly. Revisit only if Capacitor feels slow.

**Important lesson from the old app:** Supabase's free plan pauses after ~1 week of no use,
and some Indian ISPs fail to resolve `supabase.co`. So: use the **Pro plan before public
launch**, and put the API behind **your own domain** (e.g. `api.yourapp.com` proxied through
Cloudflare) so users don't need a VPN/WARP.

## 3. Data model (Postgres)

- `profiles` — user id, display name, avatar, timezone
- `rooms` — id, name, type (couple/friends/family), join_code, max_members, created_by, code_enabled
- `room_members` — room_id, user_id, role (owner/member), joined_at
- `items` (songs / voice notes / photos / memories) — id, room_id, sender_id, type, storage_path or link, caption, created_at
- `letters` — id, room_id, title, body, unlock_at (optional), updated_by
- `reactions` — item_id, user_id, emoji
- `reports` / `blocks` — for moderation (required on Play Store for user content)
- later: `daily_questions`, `answers`, `pings`, `countdowns`

**Security (the most important part):** every table has a `room_id`, and every policy says
"the user is a member of this room" (via `room_members`). Same rule on the storage bucket,
with paths like `room_id/type/uuid.ext`. Test with 3+ fake accounts that nobody can read a
room they're not in. Never rely on the UI hiding things.

## 4. Music — how to avoid the YouTube quota and copyright trouble

### The problem
- YouTube Data API: default quota is **10,000 units/day**, and **each search costs 100 units
  ≈ 100 searches/day for the whole app**. One shared key breaks quickly with many users.
  (Some 2026 sources mention a separate search bucket from June 2026 — **verify in Google
  Cloud Console → Quotas**.)
- Hosting/uploading copyrighted songs yourself is the real copyright risk. Don't.

### The key insight
The **quota is only used by search**. *Playing* a YouTube video through the IFrame player
needs **no API key and uses no quota**. And the title/thumbnail can come from the free
**oEmbed** endpoint (no key). So:

### Recommended music strategy (use several tiers)
1. **Paste a link (default, zero quota, lowest legal risk).** User pastes a YouTube link
   (later also Spotify/Apple Music/SoundCloud links). We store only the link; YouTube plays
   via the embed player; metadata from oEmbed. We host nothing.
   - Optional "Search on YouTube" button that opens YouTube in a new tab, user copies the link back.
   - If you keep in-app search: **cache every search result in the database** (same query by
     anyone = free), add a per-user daily limit, and apply to Google for a **quota extension**
     once you have users.
   - Don't use unofficial scrapers (Piped/Invidious/yt-dlp): they violate YouTube's terms and break.
2. **Free, legal full songs in-app (smaller catalogue):**
   - **Audius** — free REST API (reported free tier: ~10 req/s, 500k req/month); streaming is
     allowed, must credit artists; artists can opt out. *Verify:* read Audius API terms and
     Open Music License for rules on commercial/monetised apps.
   - **Jamendo** — Creative Commons music, free API **for non-commercial use only**; commercial
     use needs a paid license (contact licensing@jamendo.com). Each track has its own CC license
     (attribution etc.) — show credits. Fine for a free app, not if you add ads/premium.
   - **Free Music Archive / Internet Archive / Openverse audio** — mixed licenses; check each track.
3. **Discovery + 30-second previews (for fun search with cover art):**
   - **Deezer API** — free, search works without a key, but streaming is **30-second previews only**.
   - **iTunes Search API** — free, 30-second previews; Apple wants previews shown near a store badge.
   - Use these to *find* a song and show artwork, then play the full song via the pasted/embedded link.
4. **Spotify — avoid as the core.** As of Feb 2026, new dev-mode apps need a **Premium owner
   account, max 5 authorised users**, fewer endpoints; full playback requires each listener to
   have Premium. Maybe later as an optional "connect Spotify" feature after approval for extended quota.
5. **Lyrics:** lrclib.net is a free community service (no guarantees). Keep lyrics **optional**
   and non-critical; lyrics themselves are copyrighted, so a "view lyrics" link is safer than
   storing text.

### UPDATE: "Dedicate a song" flow (no copy-pasting links)
Pasting links is too much friction for the core feature, so the main flow is **search → tap → write a note**:

1. **Search inside the app** using **Deezer/iTunes search** (free, no YouTube quota). Results show
   title, artist, album art. Calls go through our own small proxy (Cloudflare Worker / Edge
   Function) with caching, so browser CORS and rate limits aren't a problem. *Verify limits.*
2. **User taps a result + writes a dedication** ("this one's for you, you'll get it at 2am").
3. **We store metadata only** (title, artist, artwork, Deezer/iTunes id) — never audio files.
4. **Playback for the receiver, in order of preference:**
   - **Full song via YouTube embed.** Find the video ID **once per unique song, on first add**,
     then **cache it forever in the shared database**. YouTube search is only spent on the
     first person to add a song; everyone after that is free. That turns ~100 searches/day for
     the app into ~100 *new unique songs/day*, and the number of new songs shrinks as the cache
     grows. Also apply for a free **quota extension** once there are users.
   - **30-second preview** (Deezer/iTunes) as the instant fallback — plays immediately, legal,
     no quota — also used when the YouTube quota runs out for the day.
   - **"Open full song" buttons** that deep-link into the listener's own app
     (YouTube Music / Spotify / Apple Music search URL). No API, no key, zero quota.
   - **Indie/CC tracks** (Audius, Jamendo) play in full, in-app, with artist credit.
5. **Optional later:** Spotify embed player for full tracks for people logged in to Spotify
   (needs a Spotify app + track IDs — check the Feb 2026 dev-mode limits first).

### Keeping copyright risk low (so nobody can misuse it)
- **We never host or serve copyrighted audio.** Only official embeds, short licensed previews, or CC music.
- **No uploading music files, no downloading.** Voice notes and photos people record themselves are fine.
- Embeds respect the owner's settings — if a video is removed or blocked, it simply stops playing.
- Always show **artist + title credit** and a link to the original.
- Terms of use + **report button + takedown email**, and quick removal of reported items.
- Rate-limit adds per user per day to stop abuse.
- Keep all music code behind one small "music source" module so a provider can be swapped fast.

### What I'd ship in v1
In-app song search (Deezer/iTunes) → dedication note → playback via cached YouTube embed with
30s-preview fallback and "open full song" links, plus Audius for free full tracks.
**No user-uploaded music files.**

*I'm not a lawyer — before charging money or running ads, get the music licensing reviewed.*

## 5. Feature list

### MVP (v1)
- Sign up / login (email + Google), password reset, email verification
- Create space, join with code, spaces list, leave space, owner can remove members / reset code
- Shared **mixtape** (songs via links/Audius), cassette + vinyl player (reuse old UI)
- **Voice notes**, **photobooth** → shared photo wall, **memory polaroids**
- **Letters** per space (any member can edit; optional "opens on date")
- Per-member **timezone clocks** + "X hours apart"
- Realtime updates + push notifications ("Maya added a song 🎶")
- Themes, avatars, profile screen
- Delete account + delete my data (Play Store requirement), privacy policy, report/block

### v1.5 — fun additions
- **"Thinking of you" tap** — one tap sends a heart/vibration to everyone in the space
- **Daily question** — everyone answers; answers reveal once all have replied
- **Countdown** to next meet-up / birthdays / anniversaries (shared)
- **Time-capsule letters** — sealed until a chosen date
- **Reactions** on songs, photos and voice notes
- **Streaks** — "12 days in a row someone shared something"
- **Mood check-in** — emoji mood per day, shown on a small shared board
- **Android home-screen widget** — partner's latest photo, local time, countdown

### Later ideas
- **Listen together** (synced playback in realtime), movie-night sync
- Shared **doodle canvas / stickers**, shared bucket list, polls, "pass the mixtape" weekly theme
- Year-end **Wrapped** recap for the space
- Premium: more storage, more members, extra themes (RevenueCat)

## 6. Play Store / legal checklist

- Google Play developer account ($25 one-time). New personal accounts must run a **closed test
  with ~12 testers for 14 days** before production.
- Privacy policy (public URL) + Data Safety form (photos, voice, camera/mic, account data)
- **Account deletion** inside the app + a public web page for it
- User-generated-content rules: report, block, terms of use, a way to remove content
- Target the current required Android API level (check at submission time)
- App icon, splash, screenshots, store description
- Terms of use covering music links/uploads and a takedown contact email (DMCA-style)

## 7. Cost estimate (rough, verify before launch)

| Item | Cost |
|---|---|
| Play developer account | $25 once |
| Supabase Pro | ~$25/month |
| Domain | ~$10–15/year |
| Cloudflare hosting | free to a few $/month |
| Firebase push, Sentry, PostHog | free tiers at first |
| Storage growth | watch it; compress photos/audio on upload; per-space cap |

## 8. Risks to watch
- Room-membership security rules are easy to get wrong → test with several fake users
- Storage cost growth → compression + per-space limits
- Music provider rules change (Spotify did in 2026) → keep music behind one small adapter
  so a source can be swapped without touching the rest of the app
- Abuse: rate-limit uploads, check file types/sizes, CAPTCHA on sign-up
- ISP/DNS blocking in India → custom domain for the API

## 9. Suggested build order

1. **Project setup:** Vite + React + TS + Tailwind, new Supabase project, `.env`, GitHub repo
2. **Auth + profiles** (email, Google, reset)
3. **Rooms:** tables, join codes, membership security rules, spaces list/create/join screens
4. **Port features into rooms:** songs/player, voice notes, photos, memories, letters
5. **Realtime + toasts**, then **push notifications**
6. **Capacitor Android build**, icons, permissions (camera/mic)
7. **Safety + legal:** delete account, report/block, privacy policy
8. **Closed test** (14 days) → fix feedback → Play Store release
9. v1.5 fun features, one at a time

## 10. Decisions I need from you
1. ~~App name~~ — **decided: "The Last Mixtape"** (unisex, ties to the cassette theme). Still to do:
   check Play Store/trademark/domain/social handles (see naming checklist below).
2. **Decided:** free to start, paid plans (and maybe light ads) later once there are users. See "Monetization".
3. **Decided:** up to 10 people per space, minimum 2 (a space shows "waiting for a friend" until a second person joins).
4. **Decided:** Android first, iPhone later (iOS needs a Mac and a $99/year Apple account).
5. **Decided:** v1 = everything the current last-mixtape app does, plus the changes discussed (see "Version 1 scope"). The fun extras in section 5 come after v1.

## Version 1 scope (decided)

**Carried over from the current last-mixtape app**
- Cassette and vinyl player, songs list, lyrics view
- Voice notes (record, send, receive, delete own)
- Photobooth + shared photo feed + polaroid download
- Memory polaroid wall, letters (editable), timezone clocks with "hours apart"
- Themes, floating animated avatars, ending scene, login screen look and feel

**New in v1 (from our discussions)**
- Real accounts: sign up, login, Google sign-in, password reset
- Spaces: create, join with code, spaces list, leave, owner removes members/resets code (2–10 people)
- Per-space security (membership rules on every table and file)
- Avatar gallery picker + upload own picture (free, see Avatars)
- In-app song search + dedication note, cached YouTube embed with preview fallback (see section 4)
- Realtime updates, in-app toasts and push notifications
- Per-member timezone clocks (replacing the fixed India/Chicago pair)
- Safety and store basics: delete account, report/block, privacy policy, terms

**After v1:** song of the day, mood labels, "thinking of you", daily question, countdown, time-capsule
letters, reactions, streaks, widget, listen-together (see section 5).

## Monetization (decided: free first, paid later)

- **Launch free** to grow users; add paid plans once people use it.
- **Prefer a subscription ("Plus") over ads.** Ads are irritating in an intimate app and add review
  rules (this audience includes teens). If ads are used, keep them light: e.g. none inside the
  player or letters, maybe one banner on the spaces list, or optional "watch an ad for a bonus".
- **Possible free vs Plus split (starting idea, tune with real usage):**
  - Free: 1–2 spaces, up to ~4 people per space, limited photo/voice storage, basic themes and avatars
  - Plus: more spaces, up to 10 people, more storage, extra themes/avatar packs, time-capsule letters,
    yearly recap, no ads
- Billing: Google Play Billing through RevenueCat. Google takes a cut of in-app purchases.
- **Music licensing changes once you earn money — check before turning payments on:**
  - Jamendo: free only for **non-commercial** use, so don't depend on it (or buy a license).
  - Audius: read the API terms and Open Music License for commercial apps.
  - YouTube embeds: follow YouTube's API/embed terms; get a lawyer's opinion on charging for an app
    that plays YouTube content. Safest: keep the music itself free and charge for storage, spaces,
    members, themes and extras, not for "access to songs".
  - Deezer/iTunes previews: check their terms for commercial use.
- Keep music behind one swappable module so the source can change if terms or pricing change.

## Avatars (decided: free, no per-image cost)

Reference: the current app shows hand-made illustrated portraits (anime style, one pixel-art)
in a circle with a floating animation. Keep that look.

**v1 — Netflix-style picker (free forever to run)**
- On sign-up the user picks one avatar from a gallery, then can change it anytime in Profile.
- Gallery of ~24–30 illustrated characters, grouped by vibe (cozy, music, pixel, chill, sporty...).
  Variety of skin tones, hair and outfits so everyone finds one that feels like them.
- Each avatar is a small transparent PNG/WebP (ship in the app, no server cost).
- "Upload my own picture" as a second option (crop to a circle, resize on the phone before upload).
- Simple extras: choose a ring colour, floating animation on/off, "sleeping" look at night in the user's timezone.

**Where the artwork comes from (must be legal to ship)**
- Make your own set, in the same style as the current app's illustrated portraits, once. Check the terms of whichever tool
  you use for **commercial use** before shipping.
- Or use open-licensed avatar packs (check each license; some styles require credit or forbid commercial use).
- **Do not use** Snapchat Bitmoji, Netflix, or other brands' characters: they're copyrighted and
  tied to those companies' logins. Bitmoji can't be embedded in our app.

**v1.5 — "Make my portrait" guide (still free)**
- App shows a ready-made prompt per style (anime, pixel art...) to paste with a selfie into a
  free tool of the user's choice, then they upload the result. The user's own account pays for it.
- Selfie never has to touch our server.

**v2 — only if there's revenue**
- Automatic photo-to-portrait generation (costs per image) as an optional paid extra, plus
  dress-up edits. Needs consent, selfie deleted right after, minimum age, and Data Safety form entry.

**Not doing:** 3D avatars (paid SDKs; Ready Player Me shut down 31 Jan 2026), on-device cartoon
filters (quality too low next to the current portraits).

## Naming checklist — "The Last Mixtape"
- [ ] Search Google Play for "last mixtape" and "mixtape" (similar names can still cause rejection or complaints)
- [ ] Search trademark databases (India: IP India public search; US: USPTO; also EUIPO) for "Mixtape" in software/music classes
- [ ] Check domains (e.g. thelastmixtape.app / .com / .in) and Instagram/TikTok/X handles
- [ ] Pick a unique Android package id, e.g. `app.thelastmixtape` (cannot be changed after publishing)
- [ ] Keep a backup name in case of a trademark conflict
- Store title idea: "The Last Mixtape: Songs for Friends" (keywords in the title help search)

## Sources checked (2026-11-23)
- YouTube quota: https://developers.google.com/youtube/v3/determine_quota_cost
- Audius REST API: https://docs.audius.org/developers/guides/rest-api
- Audius terms update: https://blog.audius.co/posts/audius-terms-of-service-update
- Jamendo API terms: https://devportal.jamendo.com/api_terms_of_use
- Spotify Feb 2026 dev-mode changes: https://developer.spotify.com/blog/2026-02-06-update-on-developer-access-and-platform-security
- Deezer developer FAQ: https://support.deezer.com/hc/en-gb/articles/360011538897-Deezer-FAQs-For-Developers
- iTunes Search API: https://developer.apple.com/library/archive/documentation/AudioVideo/Conceptual/iTuneSearchAPI/UnderstandingSearchResults.html
