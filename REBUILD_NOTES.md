# Pharmacon Rebuild Notes & Architecture Decisions

## Summary of Rebuilt Architecture

The original repository suffered from:
1. **Broken persistence & fake storage**: Critical application state (inventory, team profiles, auth) relied on fragmented `localStorage` blobs or unauthenticated mock state that vanished on browser clear.
2. **Over-engineered & convoluted layers**: Unnecessary abstractions and broken API mockers obscured the core clinical workflow.
3. **Unclear ML claims**: Unverifiable synthetic benchmark claims were mixed with incomplete scripts.

### What was Rebuilt Cleanly:
1. **React 18 + JavaScript + Vite 5 + Tailwind CSS**: Clean, simple component hierarchy without complex Redux or custom JWT state machines.
2. **True PostgreSQL Database Persistence**: Full DDL schema with 10 tables, triggers, and Row Level Security (RLS) policies.
3. **Supabase Storage Integration**: Real file uploads and downloads across `team-assets`, `prescriptions`, `presentations`, and `deliverables`.
4. **Isolated Extraction Engine**: The handwriting OCR logic is cleanly encapsulated in `src/lib/extractionEngine.js` with clear `DEMO / PLANNED` labels.
5. **Strict Formulary Matching**: `src/lib/formularyMatcher.js` enforces exact SKU and stock lookups with zero autonomous drug substitution.
6. **Tactile Visual Branding**: Faithful preservation of the warm creamy canvas (`#FFF8E8`), deep dark burgundy borders (`#351027`), brand pink (`#FF6F89`), and gold accents (`#FECB66`).

---

## Where to Integrate the Future Real ML Model

When the PyTorch / FastAPI handwriting model service is ready:
1. Open [`src/lib/extractionEngine.js`](file:///Users/aniketraj/Desktop/pharmacon2/src/lib/extractionEngine.js).
2. Update the `extractPrescription(imageSource)` function to POST the image file to the live inference endpoint (e.g. `https://api.pharmacon.health/v1/extract` or Supabase Edge Function).
3. Transform the response tokens into the standard array of `{ label, value, confidence, needsVerification }`.
4. The rest of the application (human review UI, formulary matching, stock decrement, patient scheduling) will work immediately without any frontend redesign.
