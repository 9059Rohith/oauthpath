# ScreenOps README review

Reviewed November 3, 2026. This is a documentation review of local files, not an audit of ScreenOps runtime behavior. No ScreenOps project, resume, remote repository, credentials, or deployment was modified.

## Files and project identity

The local downloaded `screenops-mvp` copies identify the upstream repository as [Ajey95/screenops-mvp](https://github.com/Ajey95/screenops-mvp). Two other local variants identify [9059Rohith/screenops-codex](https://github.com/9059Rohith/screenops-codex). These references must not be conflated with authorship or a verified resume association.

| Local README inspected                                                               | Identity stated in the file | Finding                                                     |
| ------------------------------------------------------------------------------------ | --------------------------- | ----------------------------------------------------------- |
| `C:/Users/BhaviChasvi/Downloads/screenops-mvp-main/screenops-mvp-main/README.md`     | Ajey95/screenops-mvp        | Primary downloaded reference; 297 newline-separated entries |
| `C:/Users/BhaviChasvi/Downloads/screenops-mvp-main (1)/screenops-mvp-main/README.md` | Ajey95/screenops-mvp        | Byte-identical duplicate                                    |
| `C:/Users/BhaviChasvi/Downloads/screen-ops/README.md`                                | 9059Rohith/screenops-codex  | Same general structure, different repository/demo links     |
| `C:/Users/BhaviChasvi/Downloads/screenops-codex-benchmark/README.md`                 | 9059Rohith/screenops-codex  | Expanded problem statement; 303 newline-separated entries   |

The two downloaded copies have SHA-256 `98e71d7c7720b3512a87a3b525ae5acd121157b4abef7e8ae8e9301e77c05cc5`. The `screen-ops` variant has `3cedd34bb711edf29109ed68aa6b79261a8ab96dfb60800b4546de061bc47ee6`; the benchmark variant has `b325791a3945e56bfa09e4e9801135b5c99ea3d61cfa0b7bf38398186c542972`.

The upstream README links to a [demo video](https://youtu.be/2djY_VtzFu8). The two codex variants instead link to [this video](https://www.youtube.com/watch?v=HGX2dOMiO8c). All inspected files state the same ScreenOps live-app URL. These are references found in documentation, not a verification of current playback or deployment identity. The resume itself was not inspected or edited in this task.

## Why the structure works

The README leads with a one-line proposition and immediately supplies repository, demonstration, and deployment links. Its strongest section is the concrete demo narrative: an actual work commitment is detected, transformed into structured intent, passed through risk approval, and checked in downstream tools. Readers know what to look for instead of receiving only a technology list.

| Dimension             | Useful structure                                              | Lesson applied to OAuthPath                                                           |
| --------------------- | ------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| Problem               | Specific user pain and consequence                            | Describe uncertain setup/approval work and cost of choosing the wrong path            |
| Demo                  | Concrete input, visible intermediate state, observable output | Provide a timed reviewer route from ownership choice to shareable guide               |
| Architecture          | Diagram identifies where sensitive data crosses a boundary    | Show input validation, public retrieval, models, storage and browser progress         |
| Features              | Connects UI behavior to backend work                          | Explain library, scenario input, source retrieval, next action and handoff            |
| Implementation status | Implemented and deferred lists are separate                   | Distinguish eight guides/live generation from 100-guide coverage and autonomous setup |
| Evidence              | Commands, test counts, screenshots, observed outcomes         | Link recorded tests and real production runs with narrow boundaries                   |
| Setup                 | Prerequisites and copyable commands                           | Explain library-only setup separately from model/storage configuration                |
| Security              | Excluded secrets and runtime artifacts                        | Explain actual data flows, token non-custody, sharing and residual risks              |
| AI usage              | Discloses where agents contributed                            | Separate runtime AI, implementation assistance and generated artwork                  |
| Screenshots           | Captions explain what each screen demonstrates                | Prefer task-based demo chapters over decorative images as proof                       |

The benchmark variant expands the problem narrative. Its extra detail makes the motivation explicit, but repeats the problem heading and uses stronger universal language than the implementation evidence alone establishes. OAuthPath keeps a concrete problem statement and avoids unsupported claims that no alternative product solves the problem.

## What should not be copied uncritically

1. **Proof must match the claim.** ScreenOps describes a network-inspector view as privacy proof. A demonstrated network boundary is useful evidence, but a single screenshot does not establish every code path or deployment's behavior. OAuthPath therefore treats HTTP retrieval as document availability, not OAuth correctness.
2. **Test counts need scope and date.** ScreenOps states extraction/planning pass counts. Those numbers belong to that project and were not rerun here. OAuthPath reports its own recorded observations, what was checked, and what remains outside the evidence.
3. **Local setup and public deployment differ.** Multiple runtime processes, OAuth configuration and development assumptions need explicit prerequisites. OAuthPath explains that the local library works without credentials while fresh durable research needs model/storage services.
4. **A link is not verified ownership.** The local copies use different repository/demo identities. This review reports that distinction instead of attributing upstream implementation to the user.
5. **Feature lists should expose limits.** ScreenOps's implemented/deferred split is valuable. OAuthPath keeps unknown waits, incomplete scans, anonymous-only setup attempts, quotas, nonresumable work, and lack of authenticated team access visible.
6. **A demo must show the actual system.** OAuthPath's recording uses real browser footage. Saved results and fresh generation are distinguished; a mocked UI or completed guide cannot stand in for a live research run.

## Resulting OAuthPath README structure

The expanded README gives an evaluator a short entry path and a detailed engineering reference: product problem, ownership model, five-minute review, measured demo chapter map, provider variety, guide interpretation, architecture, research stages, practical attempts, corrections, security boundaries, environment variables, streaming contract, reproducible checks, deployment, recovery, repository map, decisions, limits, and assignment evidence.

The main OAuthPath README stands alone and does not use ScreenOps's product claims, stack, tests, or privacy assertions as evidence. This analysis is intentionally a separate document. The completed 2:05 application recording includes actual live generation; codec, duration, decoding and seeking were checked. Its recording boundaries are disclosed in the demo notes. Measurements are dated and scoped instead of being promoted into general guarantees.
