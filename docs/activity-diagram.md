# Activity diagram: external disaster and donation validation

```mermaid
flowchart TD
  A[Request or donation offer submitted] --> B[App Admin reviews completeness and consistency]
  B --> C{Information complete?}
  C -- No --> D[App Admin records missing information and follows up through existing channels]
  D --> B
  C -- Yes --> E[App Admin assigns/updates in-app priority and organizes the case]
  E --> F[App Admin makes case information available in the limited DSWD validation workspace]
  F --> G[DSWD Officer checks disaster genuineness and eligibility]
  G --> H[DSWD Officer checks donation/assistance suitability]
  H --> I[DSWD Officer records the two assessment outcomes]
  I --> J[App Admin uses the recorded outcome for platform coordination/status decisions]
  J --> K{Eligible disaster and suitable offer confirmed?}
  K -- Yes --> L[App Admin coordinates assistance with the relevant request]
  K -- No or pending --> M[App Admin records the outcome and keeps/follows up the case as appropriate]
  L --> N[App Admin updates request/offer status from confirmed information]
  M --> N
  N --> O[App Admin monitors progress]
```

DSWD is an application user only within the limited validation workspace; DSWD's official systems remain external. There is no system-to-system integration or automatic transfer. The current validation queue and decisions are demonstration data in browser memory, not persisted by the API.
