# Preview setup blocked

This workspace did not include the expected `UI/` application source when the task ran.

Intended task scope:
- make the existing UI previewable against the local API
- keep public/non-auth flows rendering
- preserve backend envelope and field names exactly

Current blocker:
- no existing Next.js app files were present to inspect or patch

Required next step:
1. sync the repository contents into the workspace
2. rerun the task so the existing frontend can be updated in place
