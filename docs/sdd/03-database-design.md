# SDD 03 — Database Design (MongoDB)

## users
| Field | Type | Constraints |
|---|---|---|
| _id | ObjectId | pk |
| name | String | required, 2–60 |
| email | String | required, lowercase, **unique index** |
| passwordHash | String | required, `select:false` |
| createdAt/updatedAt | Date | timestamps |

## analyses
| Field | Type | Notes |
|---|---|---|
| _id | ObjectId | |
| userId | ObjectId | ref users, **indexed** |
| title | String | default = resume filename |
| resumeHash | String | sha256 of text (dedupe, no raw text) |
| jdSnippet | String | first 200 chars |
| score | Number | 0–100 |
| breakdown | {keyword, sections, readability, impact} | numbers |
| matched | [String] | |
| missing | [String] | |
| aiStatus | enum `ok` \| `unavailable` | |
| ai | {summary, missingSkills[], optimizationTips[], bulletImprovements[{original, improved, reason}]} | null if unavailable |
| createdAt | Date | |

Indexes: `{userId:1, createdAt:-1}`, `users.email` unique. TTL optional later.
Relationship: user 1—N analyses. Deleting a user cascades analyses (service-level).
