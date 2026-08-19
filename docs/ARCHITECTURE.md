# HomePath — Architecture & Implementation Scope

This document is the engineering source of truth for the hackathon build. It supersedes the
tech-stack and TrustLayer sections of `HomePath_Team_Brief.docx`, which remains useful for the
problem framing, statistics, and pitch narrative but should not be followed for implementation
details — several of its assumptions (Supabase, AI-driven verification, live government data
integrations) are revised below.

## 1. One-line pitch

HomePath connects Nigeria's 14.9M housing-deficit households to verified land records,
cooperative savings, and demand-matched developers — turning the housing crisis into a solvable
logistics problem.

## 2. The core architectural principle: AI does not establish truth

The original brief describes TrustLayer as a single AI pipeline: scan a document, extract fields,
flag inconsistencies, cross-reference records, output a Trust Score. Read as one pipeline, this
implies AI can determine whether someone actually owns a piece of land. It cannot, and no amount
of document analysis fixes that — Nigeria's core land fraud pattern is a *genuine-looking*
document sold to multiple buyers (double allocation), so even perfect document analysis proves
nothing about who actually holds title.

HomePath's Trust Score is therefore **not an AI judgment**. It is a transparent, deterministic
composite of two independently-checkable signals, with AI used only to explain the result in
plain English:

| Layer | What it does | Who/what computes it |
|---|---|---|
| Registry match | Look up the user-attested plot/survey number against a records table | Deterministic DB query |
| Community reports | Count and weight crowdsourced dispute/confirmation flags | Deterministic aggregation |
| Explanation | Turn the two signals above into a readable summary + disclaimer | Claude API (narration only) |

Document photos are stored for reference but **never parsed by AI**. The user reads their own
document and types in the fields (plot number, survey number, owner name). This removes an entire
class of "the AI hallucinated a field" or "the OCR misfired live on stage" failure modes, and it
is the more honest claim: HomePath checks what you tell it against records and community
intelligence — it does not claim to read or authenticate the document itself.

This must be the answer given to any judge who asks "how do you know the AI isn't just making
this up" — the AI is not in the truth-determining path at all.

### 2.1 Trust Score formula

A baseline score represents "unverified," and registry status sets the real base value; community
reports adjust it within capped bounds so no small number of reports can swing a score
disproportionately.

```
base =
  85   if registry status == CLEAN
  15   if registry status == FLAGGED / DISPUTED
  50   if registry status == NOT_FOUND   (explicitly labeled "Unverified", not "pass")

community_adjustment =
  + min(3 * confirmation_reports, 10)
  - min(8 * dispute_or_fraud_reports, 40)

score = clamp(base + community_adjustment, 0, 100)
```

UI bands:

- **70–100 (green)** — Likely legitimate. Registry-confirmed or strongly community-confirmed.
- **40–69 (yellow)** — Proceed with caution. Unverified, or mixed signals.
- **0–39 (red)** — High risk. Registry-flagged or multiple credible dispute reports.

Every score is rendered with its explanation and this fixed disclaimer:

> "This score is not legal proof of ownership. We recommend independent legal or survey
> verification before making any payment."

For the hackathon, `RegistryRecord` is a **seeded table** standing in for a real land-registry /
EFCC / court-records integration. This must be described accurately in the pitch and to judges as
representative demo data, not a live government integration — that distinction is itself part of
the credibility story.

## 3. Tech stack

| Layer | Choice | Notes |
|---|---|---|
| Frontend | React | Web only for the hackathon build |
| Backend | NestJS | Modules map naturally to domains: TrustLayer, Cooperatives, Properties, Neighbourhood |
| ORM | Prisma | Migrations + type-safe queries against Postgres |
| Database | PostgreSQL, self-hosted via Docker | No managed BaaS; own auth |
| Auth | Email/password, bcrypt, role field on `User` | No need for full IAM in a hackathon |
| AI | Claude API | Scoped to Trust Score explanation text only — see §2 |
| Maps | Google Maps + Places API | Real integration — cheap to wire in, demos well |
| WhatsApp/USSD | Simulated web UI mimicking the flow | Real Twilio/Africa's Talking integration only if time remains |

No scaling, caching, or load concerns are in scope. Basics that are still non-negotiable: input
validation on all forms, no plaintext passwords, no AI overclaiming (per §2), and a data model
that doesn't need to be reworked mid-build.

## 4. Data model

Entity sketch — to be turned into the Prisma schema next.

- **User** — `id, name, email, passwordHash, role (BUYER_RENTER | LANDLORD | DEVELOPER | AGENT), phone, createdAt`
- **Property** — `id, ownerUserId, type (SALE | RENT), price, bedrooms, lat, lng, address, areaKey, status`
- **PropertyDocument** — `id, propertyId, submittedByUserId, plotNumber, surveyNumber, attestedOwnerName, documentType, photoUrl (reference only), createdAt`
- **RegistryRecord** — `id, plotNumber, surveyNumber, status (CLEAN | FLAGGED | DISPUTED), notes` — seeded demo dataset, see §2.1
- **CommunityReport** — `id, propertyId, reporterUserId, type (CONFIRMATION | DISPUTE | FRAUD_FLAG), description, createdAt`
- **TrustScore** — `id, propertyId, score, registryStatus, communityAdjustment, explanationText, computedAt`
- **Cooperative** — `id, name, targetAreaKey, targetPropertyType`
- **CooperativeMembership** — `id, cooperativeId, userId, monthlyContributionAmount, joinedAt`
- **Contribution** — `id, membershipId, amount, month, createdAt` — seeded/generated history for demo
- **RentToOwnMatch** — `id, cooperativeId, propertyId, matchedAt, status`
- **LandlordRating** — `id, landlordUserId, raterUserId, rating, comment, createdAt`
- **NeighbourhoodData** — `id, areaKey, floodRiskScore (seeded), powerScore (seeded), securityScore (seeded), placesCache, commuteCache`

**Demand clusters (BuildMatch)** are not a stored table — they're an aggregate query over
`Contribution` grouped by `Cooperative.targetAreaKey`, computed on demand for the developer
dashboard. No new data collection needed; it's a read model on top of cooperative savings data
that already exists for the RentToOwn flow.

## 5. Scope: what we are building

Following the user journey in the original brief (search → verify → understand → save → build
credit → own), scoped to what a small team can build well in the available time.

### In scope, real
- TrustLayer: self-attested document fields, registry lookup, community reports, Trust Score + explanation (§2)
- Property Search Map + Trust Heatmap
- Cooperative savings dashboard (seeded contribution data, real aggregation logic)
- BuildMatch demand cluster map (aggregate query, no new data source)
- Neighbourhood Intelligence Card: nearby schools/hospitals/market via Google Places, commute estimate via Google Maps

### In scope, simulated
- WhatsApp/USSD access — a web UI mimicking the flow, not a real telephony integration
- Cooperative "12-month contribution history" credit profile — computed off seeded data
- Landlord rating system — simple, reuses TrustLayer infrastructure

### Out of scope
- Digital lease e-signature (legally meaningless without real e-sign infra)
- Local language UI (Yoruba/Igbo/Hausa)
- Offline mode
- HomePath Agents (business-model concept, not a build item — pitch narrative only)
- Real payment/payroll integration
- Any scaling, caching, or load-testing work
- Live government/EFCC/court-records integration (seeded data stands in — see §2.1)

## 6. Demo script

Mirrors the user journey from the brief, now mapped to what's actually built:

1. **Search** — user opens the map, filters a 2-bedroom in Ojodu
2. **Verify** — sees Trust Scores on listings, taps one to see the registry + community signal breakdown and explanation
3. **Understand** — Neighbourhood Intelligence Card: nearby amenities, commute, seeded flood/power/security scores
4. **Save** — joins a cooperative savings group for the area, seeded contribution history shown building up
5. **Build credit** — dashboard shows contribution consistency as a portable profile
6. **Own** — matched to a rent-to-own listing
7. **Developer view** — switch to a developer account, show the BuildMatch demand cluster map surfacing the same cooperative's savings data as verified, committed demand

## 7. Open items

- Confirm final Trust Score weighting after seeding sample `RegistryRecord` / `CommunityReport` data — the constants in §2.1 are a reasonable starting point, not final
- Decide whether WhatsApp/USSD simulation gets built at all, given remaining time after the core map/TrustLayer/cooperative flow is done
- Prisma schema to be written from §4 next
