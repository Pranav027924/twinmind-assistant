# TwinMind — Test Scenarios & Expected Behavior

This document provides concrete test scenarios you can use to validate TwinMind during a live demo or self-testing session. Each scenario describes what to **say**, what **suggestions** should appear, and what the **chat response** should contain when clicked.

---

## How to Use This Guide

1. Open the app, paste your Groq API key in **Settings**.
2. Click the **mic button** to start recording.
3. **Say the script** out loud (or read it near your mic).
4. Wait ~30 seconds for transcription + suggestions.
5. Check suggestions against the **expected output** below.
6. Click a suggestion and verify the chat response.
7. Type follow-up questions in chat and verify answers.

---

## Scenario 1: Startup Pitch Meeting

**Use case:** Founders pitching to investors. TwinMind helps the founder by fact-checking claims, suggesting follow-up questions the investor might ask, and surfacing talking points.

### What to say (Script)

> "So our company Vani has been growing at about 40% month over month. We're in the B2B voice assistant space and our total addressable market is around 6 billion dollars by 2028. We currently have 12 paying customers and our average contract value is about 50,000 dollars per year. We're looking to raise a 2 million dollar seed round at a 10 million dollar pre-money valuation."

### Expected Suggestions (3 cards)

| # | Expected Type | Why This Type | Example Title | Example Preview |
|---|---------------|---------------|---------------|-----------------|
| 1 | **fact_check** | "40% MoM growth" and "$6B TAM by 2028" are specific claims | "Verify 40% MoM Growth Claim" | "40% month-over-month growth implies ~57x annual growth. Confirm whether this is revenue, users, or another metric — investors will probe this." |
| 2 | **question_to_ask** | Investor context, exploratory discussion | "Ask About Unit Economics" | "With a $50K ACV and 12 customers, what's the CAC and payback period? This will likely be the next investor question." |
| 3 | **talking_point** | Could benefit from a new angle | "Highlight Net Revenue Retention" | "If existing customers expand, mention NRR — a rate above 120% would strengthen the 5x valuation multiple story." |

### Chat Follow-ups to Test

| Type in Chat | Expected Response Should Include |
|---|---|
| "Is the valuation reasonable?" | Analysis of $10M pre on $600K ARR (12 × $50K), comparison to typical seed multiples (15-20x ARR), conclusion that it's within range |
| "Summarize the key metrics" | Bullet list: 40% MoM growth, $6B TAM, 12 customers, $50K ACV, $2M raise, $10M pre-money |
| "What questions should I prepare for?" | Burn rate, runway, competitive landscape, why now, team background, path to Series A |

---

## Scenario 2: Engineering Sprint Planning

**Use case:** Engineering team planning a sprint. TwinMind helps by clarifying technical terms, suggesting questions about scope, and surfacing relevant talking points.

### What to say (Script)

> "Alright team, this sprint we need to tackle the authentication migration from JWT to OAuth 2.0 with PKCE. The deadline is in two weeks. Sarah mentioned we also need to handle the backwards compatibility for the mobile app since it's still using the old refresh token flow. I'm worried about the CORS configuration on the new auth server. Also, we should probably write integration tests before we merge anything."

### Expected Suggestions (3 cards)

| # | Expected Type | Why This Type | Example Title | Example Preview |
|---|---------------|---------------|---------------|-----------------|
| 1 | **clarification** | "PKCE" is a technical acronym | "What Is PKCE in OAuth 2.0?" | "PKCE (Proof Key for Code Exchange) prevents authorization code interception attacks. It's required for public clients like mobile/SPA apps that can't securely store a client secret." |
| 2 | **question_to_ask** | Scope is unclear, exploratory planning | "Define Mobile Backwards Compatibility Scope" | "Ask Sarah: does backwards compatibility mean supporting both token flows simultaneously, or a migration window with a hard cutoff date?" |
| 3 | **talking_point** | Discussion could benefit from technical data | "CORS Pitfalls in Auth Migrations" | "Common issue: the new auth server needs to whitelist both old and new redirect URIs during migration. Consider a feature flag to toggle auth providers per environment." |

### Chat Follow-ups to Test

| Type in Chat | Expected Response Should Include |
|---|---|
| "What's the risk with two-week deadline?" | OAuth migrations typically take longer, backwards compat adds complexity, suggest focusing on auth server first then mobile migration in next sprint |
| "List the tasks we should create" | Structured task list: 1) Set up OAuth server with PKCE, 2) CORS config, 3) Mobile backwards compat layer, 4) Integration tests, 5) Feature flag setup |
| "What did Sarah say?" | Reference to Sarah's mention about backwards compatibility for the mobile app with old refresh token flow |

---

## Scenario 3: Sales Call Debrief

**Use case:** Sales team debriefing after a prospect call. TwinMind surfaces action items, fact-checks pricing discussed, and helps prepare follow-up materials.

### What to say (Script)

> "OK so that call with Acme Corp went pretty well. Their CTO Jennifer said they're evaluating three vendors including us. Their main concern is data residency — they need everything hosted in the EU because of GDPR. She mentioned their budget is around 200K per year and they want to go live by Q3. I told her our enterprise plan starts at 150K and includes dedicated support. She seemed interested but asked about SOC 2 compliance — I wasn't sure if we have that yet."

### Expected Suggestions (3 cards)

| # | Expected Type | Why This Type | Example Title | Example Preview |
|---|---------------|---------------|---------------|-----------------|
| 1 | **answer** | "Do we have SOC 2?" was asked/implied | "Check Your SOC 2 Status" | "You mentioned uncertainty about SOC 2. This is a deal-critical blocker for enterprise sales — confirm with your compliance team and follow up with Jennifer within 24 hours." |
| 2 | **fact_check** | Pricing claim was made | "Verify $150K Enterprise Pricing" | "You quoted $150K for the enterprise plan. Confirm this includes EU data residency — hosting in EU regions typically adds 15-20% to infrastructure costs." |
| 3 | **question_to_ask** | Competitive deal, needs intel | "Ask About the Other Two Vendors" | "Jennifer said they're evaluating three vendors. Find out who the other two are and what their key differentiators are — this will shape your follow-up pitch." |

### Chat Follow-ups to Test

| Type in Chat | Expected Response Should Include |
|---|---|
| "Draft a follow-up email" | Professional email to Jennifer, references specific points (EU hosting, SOC 2 follow-up, Q3 timeline), next steps |
| "What are the deal risks?" | SOC 2 unknown, competitive pressure (2 other vendors), EU data residency cost impact on margins, tight Q3 timeline |
| "Summarize action items" | 1) Confirm SOC 2 status, 2) Verify EU hosting pricing, 3) Identify competing vendors, 4) Send follow-up email, 5) Schedule technical deep-dive |

---

## Scenario 4: Product Design Review

**Use case:** Design team reviewing a new feature. TwinMind clarifies UX terms, suggests research-backed points, and helps capture decisions.

### What to say (Script)

> "So for the onboarding flow, I think we should use progressive disclosure instead of showing all the settings upfront. The current bounce rate on the settings page is 67%. Mike suggested we add a skeleton loading state instead of the spinner, and also maybe implement optimistic UI for the save actions. I'm not convinced the hamburger menu works on desktop — our analytics show only 4% of users click it."

### Expected Suggestions (3 cards)

| # | Expected Type | Why This Type | Example Title | Example Preview |
|---|---------------|---------------|---------------|-----------------|
| 1 | **clarification** | "Progressive disclosure" and "optimistic UI" are UX terms | "What Is Progressive Disclosure?" | "Progressive disclosure shows only essential options first, revealing advanced settings on demand. Nielsen Norman Group research shows it reduces cognitive load by up to 40% on complex forms." |
| 2 | **fact_check** | "67% bounce rate" and "4% click rate" are specific metrics | "Context for 67% Bounce Rate" | "A 67% bounce rate on a settings page is significantly above average (typically 30-45% for in-app pages). This strongly supports simplifying the page via progressive disclosure." |
| 3 | **talking_point** | New angle on the hamburger menu data | "Replace Hamburger with Visible Nav" | "With only 4% clicking the hamburger menu, consider a persistent sidebar or top-tab navigation. Studies show visible navigation increases feature discovery by 2-3x over hidden menus." |

### Chat Follow-ups to Test

| Type in Chat | Expected Response Should Include |
|---|---|
| "What's the difference between skeleton loading and spinner?" | Skeleton shows content shape/layout, perceived as faster, spinners give no spatial info. Reference to Mike's suggestion. |
| "What did Mike suggest?" | Mike suggested skeleton loading state instead of spinner, plus optimistic UI for save actions |
| "Should we A/B test the hamburger menu removal?" | Yes, recommended approach with suggested metrics (navigation clicks, feature discovery rate, task completion time) |

---

## Scenario 5: Interview / Hiring Discussion

**Use case:** Hiring panel discussing a candidate after an interview. TwinMind helps structure the discussion and capture objective assessments.

### What to say (Script)

> "So what did everyone think about the candidate? I thought her system design answer was really strong — she brought up event-driven architecture without prompting. But I'm concerned about her communication skills, she took a long time to explain her approach. Tom mentioned she has 6 years of experience at Google and Amazon. She's asking for 180K base salary which is above our band of 150 to 170."

### Expected Suggestions (3 cards)

| # | Expected Type | Why This Type | Example Title | Example Preview |
|---|---------------|---------------|---------------|-----------------|
| 1 | **question_to_ask** | Decision-oriented discussion | "Separate Technical from Communication Scores" | "Ask the panel to rate technical skills and communication skills independently on a 1-5 scale. This avoids halo/horn effect where one concern overshadows strengths." |
| 2 | **fact_check** | Salary claim needs context | "Market Rate for 6 YoE at FAANG" | "With 6 years at Google and Amazon, $180K base is within market range for senior engineers in most metros. Your band of $150-170K may need adjustment for this caliber." |
| 3 | **talking_point** | New angle on the communication concern | "Reframe the Communication Concern" | "Slow explanation during interviews may indicate thoroughness rather than poor communication. Ask: was the final explanation clear and correct? If yes, this may be interview nerves, not a red flag." |

### Chat Follow-ups to Test

| Type in Chat | Expected Response Should Include |
|---|---|
| "Draft a scorecard for this candidate" | Structured scorecard with categories: system design (strong), communication (concern), experience (6 yrs FAANG), compensation (above band) |
| "What did Tom say?" | Tom mentioned she has 6 years of experience at Google and Amazon |
| "Should we make an offer?" | Balanced analysis: strong technical, communication concern may be resolvable, salary gap needs negotiation, recommend second-round focused on communication |

---

## Scenario 6: Casual / General Knowledge Conversation

**Use case:** Informal conversation testing TwinMind's ability to add value even in non-business contexts.

### What to say (Script)

> "Did you know that octopuses have three hearts and blue blood? I read that they're considered one of the most intelligent invertebrates. Apparently they can solve puzzles and even escape from aquariums. Some scientists think they might be as smart as dogs."

### Expected Suggestions (3 cards)

| # | Expected Type | Why This Type | Example Title | Example Preview |
|---|---------------|---------------|---------------|-----------------|
| 1 | **fact_check** | "Three hearts and blue blood" is a factual claim | "Verify Three Hearts Claim" | "Correct — octopuses have two branchial hearts for gills and one systemic heart. Their blood is blue because it uses copper-based hemocyanin instead of iron-based hemoglobin." |
| 2 | **fact_check** / **clarification** | "As smart as dogs" is a comparison claim | "Octopus vs Dog Intelligence" | "The comparison is debated. Octopuses excel at problem-solving and tool use, but measure intelligence differently than mammals — they have 500M neurons, 2/3 in their arms." |
| 3 | **talking_point** | Fun conversation can go deeper | "The Aquarium Escape Phenomenon" | "Inky the octopus famously escaped the National Aquarium of New Zealand in 2016 by squeezing through a drain pipe to the ocean. Their boneless bodies can fit through any gap larger than their beak." |

---

## Where TwinMind Is Most Beneficial

| Meeting Type | Key Value Delivered |
|---|---|
| **Investor pitches** | Real-time fact-checking of claims, preparation for tough questions, metric validation |
| **Sales calls** | Capture action items, verify pricing quotes, draft follow-up emails |
| **Sprint planning** | Clarify technical terms, surface scope risks, structure task lists |
| **Design reviews** | Cite UX research, validate metrics, capture design decisions |
| **Hiring panels** | Structure evaluations objectively, market-check compensation, reduce bias |
| **Client meetings** | Summarize decisions, extract requirements, fact-check commitments |
| **Brainstorms** | Suggest new angles, connect ideas to data, prevent groupthink |
| **1:1 meetings** | Track action items, reference past discussion, suggest coaching questions |
| **Board meetings** | Fact-check financials, summarize long discussions, track commitments |
| **Training sessions** | Clarify concepts in real time, generate summaries, answer follow-up questions |

---

## Testing Checklist

- [ ] Mic starts/stops cleanly with visual feedback
- [ ] Transcript appears within ~35 seconds of speaking
- [ ] Exactly 3 suggestions appear per batch
- [ ] Suggestions are diverse (different types per batch)
- [ ] Suggestions are specific to what was said (not generic)
- [ ] Preview text is useful on its own without clicking
- [ ] Clicking a suggestion opens a detailed, well-formatted chat response
- [ ] Chat correctly answers the current question (not the previous one)
- [ ] Streaming text renders without layout jitter
- [ ] Markdown renders correctly after streaming completes (bold, bullets, tables, code)
- [ ] Manual refresh button flushes audio and generates new suggestions
- [ ] Auto-refresh fires every ~30 seconds during recording
- [ ] Older suggestion batches remain visible below newer ones
- [ ] Export downloads a valid JSON with transcript, suggestions, and chat
- [ ] Settings persist across page reload (API key, prompts, parameters)
- [ ] Dark mode / light mode / system mode all work correctly
- [ ] Panels are resizable via drag handles
- [ ] Toast notifications appear for actions and errors
