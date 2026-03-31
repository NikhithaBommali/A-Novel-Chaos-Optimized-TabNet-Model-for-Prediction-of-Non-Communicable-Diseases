# Project Architecture Notes

This project is a full-stack disease prediction platform with a clear split between:

- `UI/`: a Next.js frontend for admin and user workflows
- `API/`: a FastAPI backend for auth, prediction, chat, and data persistence
- `API/ml/`: an offline-oriented ML training and inference module centered on TabNet

## What the diagrams represent

### Architecture diagram

The architecture image focuses on the structural layout:

- frontend screens and role-based routing
- FastAPI routers and their responsibilities
- dataset-processing service behavior
- PostgreSQL-backed persistence through SQLAlchemy models
- the current hybrid inference approach:
  - trained TabNet for heart disease when model artifacts exist
  - heuristic scoring for breast cancer, lung cancer, and fallback disease flows

### Methodology diagram

The methodology image focuses on process:

1. User or admin authentication
2. Disease-labeled CSV upload
3. Metadata extraction and dataset chunk generation
4. Optional model training with Chaos Optimization and TabNet
5. User prediction through form or guided chat
6. Result persistence and visualization in dashboards

## Important implementation observations

- The admin preprocessing tab in the UI is currently a simulated frontend flow; the real backend processing happens during CSV upload via `process_uploaded_dataset`.
- The user dashboard presents a polished analytics experience, but part of the analytics layer still uses locally accumulated frontend state and placeholder values.
- Chat prediction is dataset-aware for question generation, but its final risk calculation is still simplified compared to the direct prediction endpoint.
- The training pipeline exists and is meaningful, but the runtime inference path is only fully integrated for heart disease when saved model resources are available.

## Main code anchors used for analysis

- Backend bootstrap: `API/main.py`
- Auth: `API/auth.py`
- Prediction endpoints: `API/endpoints.py`
- Dataset processing: `API/dataset_service.py`
- Database models: `API/models.py`
- Chat workflow: `API/chat.py`
- ML training and inference: `API/ml/train.py`, `API/ml/tabnet_model.py`, `API/ml/chaos_optimizer.py`, `API/ml/utils.py`
- Frontend API bridge: `UI/lib/api.ts`
- Admin UX: `UI/components/admin-dashboard.tsx`, `UI/components/csv-upload.tsx`
- User UX: `UI/components/user-dashboard.tsx`, `UI/components/chat-interface.tsx`, `UI/components/prediction-results.tsx`, `UI/components/health-analytics.tsx`

## Generated files

- `docs/project-architecture.svg`
- `docs/project-methodology.svg`
- `docs/project-architecture-notes.md`
