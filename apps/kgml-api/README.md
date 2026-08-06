# KGML API

This service exposes an auditable reference soil-carbon stock-change model.
The model applies a transparent stock-difference equation, never inflates a
result from practice flags, and returns its version hash, evidence Merkle root,
uncertainty interval, and scientific-use constraints.

```powershell
cd apps/kgml-api
uv sync
uv run uvicorn app.main:app --reload --port 8000
```

The reference result is not a certified carbon methodology. Production model
adapters should additionally:

1. validate the model version and feature contract;
2. record input evidence hashes and model artifact hashes;
3. return calibrated uncertainty with every result;
4. write a signed `model_run` MRV evidence record; and
5. never mutate an inference already referenced by a certificate.
