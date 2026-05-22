# Student feedback survey — proposed questions

Draft of a Google Form to collect feedback from students using
`regexp.cheminfo.org`. Six questions (seven if you keep the optional NPS),
designed to finish in under 3 minutes so students actually submit.

Copy-paste each section into a separate Google Forms section. Question types
in parentheses match the Google Forms widgets.

---

## Section 1 — Context (1 question)

**Q1. In what context did you use `regexp.cheminfo.org`?** _(Multiple choice
— single answer)_

- For a course at EPFL — _please write the course name_ (short-answer
  follow-up)
- For personal learning
- For a specific work / project task
- Other

> **Why:** lets you separate "course-driven" feedback from "self-driven"
> feedback, which behave very differently.

---

## Section 2 — Overall (2 questions)

**Q2. Overall, how useful was the tool for learning regular expressions?**
_(Linear scale, 1–5; 1 = "not useful", 5 = "extremely useful")_

**Q3. Which sections did you actually use?** _(Checkboxes — multiple
answers)_

- 🎓 Tutorial
- 🧪 Playground
- 🏆 Exercises
- 📚 Cheatsheet
- 📖 Glossary
- About / "Beyond JavaScript"

> **Why:** Q2 gives a single trend metric across cohorts; Q3 tells you which
> parts of the site earn their keep and which don't get visited (e.g. if
> Glossary is at 5 %, maybe the cheatsheet absorbs its role).

---

## Section 3 — Exercises specifically (1 question)

**Q4. The exercises:** _(Multiple-choice grid)_

| Row                       | 1                  | 2   | 3              | 4   | 5                       |
| ------------------------- | ------------------ | --- | -------------- | --- | ----------------------- |
| Difficulty progression    | Too gentle         |     | Just right     |     | Too steep               |
| Hint quality              | Useless            |     |                |     | Exactly what I needed   |
| Test cases                | Confusing          |     |                |     | Clear                   |

> **Why:** the exercises are the most pedagogically loaded part of the site,
> so this is where the most actionable signal lives. A multiple-choice grid
> is one question for the student but three signals for you.

---

## Section 4 — Open feedback (2 questions)

**Q5. What worked best for you? What clicked?** _(Paragraph)_

**Q6. What would you add, remove, or fix?** _(Paragraph)_

> **Why:** keep open-ended questions to two — students stop typing past
> that. Q5 catches the "you should keep doing X" signal that pure ratings
> miss; Q6 catches the unprompted feature requests.

---

## Optional Q7 — NPS-style intent

**Q7. Would you recommend this site to a fellow student?** _(Linear scale,
0–10)_

Skip if you want the form really short — Q2 already covers usefulness.

---

## Form URL

**https://forms.gle/YWQZs7fntJBuv5xM6**

---

## Where the link will go on the site

Planned placement:

1. **About page** — bottom of the "About this site" card, as an
   `AnchorButton` with a `comment` or `feed` icon.
2. **Top-right of the header** — a small minimal "Feedback" button next to
   the GitHub and ECMA-262 links, so it's visible from every page without
   being intrusive.

---

## How to push people to actually submit

The biggest drop-off is forgetting or not caring. A few levers:

- **Ask in class** — mention the survey at the end of the session where
  students used the site; completion rates 3–5× higher than a passive link.
- **QR code on slides** — generate a QR from the short link and put it on
  the last slide. Students scan while still in the room.
- **Banner on the site after ~5 minutes of use** — a `Callout` with a
  close button ("You've been here a while — 2-minute feedback?"), shown
  once per browser via `localStorage`.
- **Completion page redirect** — after the last exercise, show a card
  "Nice work! Mind sharing 2 minutes of feedback?" with the link.
- **Course credit nudge** — if the site is used in a graded assignment,
  mention that the feedback helps improve the tool for next year's cohort
  (social / legacy motivation, not grade-linked).
