# BrandVoice.ai MVP — Personas, Epics, User Stories

## 🎯 Core User Personas (Strict)

### 1. Solo Content Creator (Most Likely Early Adopter)
**Profile**: 24–35, indie creator on Instagram/TikTok/YouTube.  
**Goal**: Save time repurposing videos across platforms.  
**Pain Point**: Manually adapting a 1-min Reel to LinkedIn/Threads takes hours.  
**Why They’ll Use It Now**: No budget for agencies. Wants automation.

---

### 2. Social Media Manager at Small Agency
**Profile**: 25–32, manages 5–10 client accounts.  
**Goal**: Scale content production across multiple platforms.  
**Pain Point**: Copy-pasting/editing same video for different channels is repetitive.  
**Why They’ll Use It Now**: Needs to serve more clients without hiring.  

---

### 3. Small Business Owner (Secondary Persona)
**Profile**: 30–45, runs bakery, gym, or local brand.  
**Goal**: Have a presence on LinkedIn/Instagram/TikTok without hiring marketers.  
**Pain Point**: No time to learn platform best practices.  
**Why They’ll Use It Now**: Wants consistent content but fast + cheap.  

---

## 🚀 MVP EPICS

### Epic 1 — Mission Management
- Create, view, and manage repurpose sessions (“missions”).

### Epic 2 — Content Generation
- Input a URL → Generate LinkedIn, Carousel, Threads, Video Script.

### Epic 3 — Content Bank
- Save and reuse external content references (like a Pinterest-style library).

### Epic 4 — Brand Voice
- Save and apply tones/styles that shape AI output.

### Epic 5 — Prompt Presets
- Reusable tweaks for AI instructions (like “make it funny” / “SEO-style”).

---

## 📖 User Stories & Acceptance Criteria (Strict)

### Epic 1 — Mission Management
**Story 1.1**: As a creator, I want to input an Instagram/YouTube URL so I can repurpose it.  
- ✅ Input validated (only Insta/YT URLs)  
- ✅ Show preview (title/thumbnail)  
- ✅ If already processed → show existing results  

**Story 1.2**: As a user, I want to see all missions in a sidebar so I can reopen past outputs.  
- ✅ Sidebar shows mission history  
- ✅ Can pin/rename/delete missions  
- ✅ Collapsible state saved  

---

### Epic 2 — Content Generation
**Story 2.1**: As a user, I want to generate LinkedIn, Carousels, Threads, and Video Script in one click.  
- ✅ Multi-step loader animation  
- ✅ All outputs copyable  
- ✅ Saved back to mission  

<!-- **Story 2.2** : As a user, I want the AI to automatically pull relevant snippets from my Content Bank and past missions so my outputs sound consistent.

✅ System queries embeddings + lexical search

✅ Results injected into prompt automatically

✅ User sees which sources were used -->

---

### Epic 3 — Content Bank
**Story 3.1**: As a user, I want to save reference content from YouTube/Instagram/TikTok so I can reuse it later.  
- ✅ Save reference with title, url, tags, thumbnail  
- ✅ Search/filter library  
- ✅ Multi-select to add as context  

---

### Epic 4 — Brand Voice
**Story 4.1**: As a user, I want to define a brand voice so all outputs match my tone.  
- ✅ Fields: name, tone, style, vocabulary, audience, CTA, hashtags  
- ✅ Voice injected into system prompt  
- ✅ Sidebar selector for active voice  

---

### Epic 5 — Prompt Presets
**Story 5.1**: As a user, I want to apply quick prompt presets so I don’t retype style tweaks every time.  
- ✅ Presets selectable in input field  
- ✅ Preset text injected into AI prompt  
- ✅ User can save new presets  

---

## 🔄 Core User Flow (Happy Path)

1. **Log in with Clerk**  
2. **Create New Mission** → paste Instagram/YouTube URL  
3. (Optional) Select **Brand Voice**  
4. (Optional) Pick references from **Content Bank**  
5. (Optional) Apply **Prompt Preset**  
6. Click **Repurpose** → Loader runs  
7. **Outputs shown** (LinkedIn, Carousel, Threads, Video Script)  
8. Outputs saved to mission  
9. User copies/pins results  

---

## ✅ Out of Scope for MVP
- Direct publishing to platforms (LinkedIn, Threads APIs)  
- Analytics/engagement tracking  
- Collaboration/team features  
- Vector DB / semantic search  

---

## 💡 Why This Delivers Value (MVP)
- **Creators** → saves 90% time, expands reach.  
- **Managers** → scale content without hiring.  
- **Small businesses** → marketing without agencies.  
