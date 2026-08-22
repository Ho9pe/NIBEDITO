# Contributing

How we work on this repository. It is written for a two-person team learning the
standard workflow, so it explains the reasoning as well as the commands.

The short version: **`main` is always deployable, nobody pushes to it directly,
and every change arrives through a pull request that the other person reviews.**

---

## Table of contents

- [One-time setup](#one-time-setup)
- [The everyday loop](#the-everyday-loop)
- [Branch names](#branch-names)
- [Commit messages](#commit-messages)
- [Opening a pull request](#opening-a-pull-request)
- [Reviewing someone else's pull request](#reviewing-someone-elses-pull-request)
- [Merging](#merging)
- [Staying in sync and handling conflicts](#staying-in-sync-and-handling-conflicts)
- [Never commit secrets](#never-commit-secrets)
- [Getting out of trouble](#getting-out-of-trouble)
- [Command reference](#command-reference)

---

## One-time setup

Clone and install:

```bash
git clone https://github.com/<owner>/<repo>.git
cd <repo>
cp backend/.env.example backend/.env
cp frontend/.env.local.example frontend/.env.local
```

Fill both `.env` files in with real values. They are gitignored and must stay
that way — see [Never commit secrets](#never-commit-secrets).

Set your identity so commits are attributed correctly:

```bash
git config user.name "Your Name"
git config user.email "you@example.com"
```

### Protect `main` (repository owner, once)

On GitHub: **Settings → Branches → Add branch ruleset**, targeting `main`:

- Require a pull request before merging
- Require approvals: **1**
- Dismiss stale approvals when new commits are pushed
- Block force pushes
- Restrict deletions

This is what makes the workflow real rather than a convention you both have to
remember. With it on, `git push origin main` is rejected, which is the point.

---

## The everyday loop

Five commands cover almost every change.

**1. Start from an up-to-date `main`.**

```bash
git switch main
git pull
```

Do this every time. Branching from a stale `main` is the most common cause of
painful conflicts later.

**2. Create a branch for the change.**

```bash
git switch -c feat/wishlist-page
```

One branch per piece of work. If you find an unrelated bug while working, note
it and fix it on its own branch — mixing two things in one PR makes it harder to
review and impossible to revert cleanly.

**3. Work, and commit in meaningful steps.**

```bash
git add -p                 # stage selectively, review as you go
git commit -m "Add wishlist page with empty state"
```

`git add -p` walks you through each change and asks whether to stage it. It is
the cheapest habit for catching a stray `console.log` or a debug file before it
becomes permanent.

**4. Push the branch.**

```bash
git push -u origin feat/wishlist-page
```

`-u` links the local branch to the remote one, so later pushes are just
`git push`.

**5. Open a pull request**, get it reviewed, merge it, delete the branch.

Then start again from step 1.

---

## Branch names

`type/short-description`, lowercase, hyphenated.

| Prefix | For |
|---|---|
| `feat/` | a new capability |
| `fix/` | a bug fix |
| `refactor/` | restructuring with no behaviour change |
| `docs/` | documentation only |
| `chore/` | dependencies, config, tooling |

Good: `fix/cart-image-not-loading`, `feat/order-tracking`, `chore/bump-next-15`

Poor: `patch-1`, `asif-branch`, `new`, `test2`

The name is read by whoever reviews it, weeks later, in a list of ten others.

---

## Commit messages

Structure:

```
Short summary in the imperative, under ~70 characters

Why the change was needed, and anything non-obvious about how it works.
Wrap around 72 characters. Explain the reasoning, not the diff - the diff
is already in the commit.

Fixes #12
```

"Imperative" means write it as an instruction: *Add*, *Fix*, *Remove* — not
*Added*, *Fixes*, *Removing*. It reads as "apply this commit to *fix the cart
image*", which is how git itself phrases things.

The body matters more than the summary. Six months from now the question is
never *what* changed, it is *why*, and the code cannot answer that.

Referencing `Fixes #12` in the PR description closes issue 12 automatically when
the PR merges.

---

## Opening a pull request

```bash
git push -u origin feat/wishlist-page
```

GitHub prints a link; open it. Or use the CLI:

```bash
gh pr create --fill
```

A good description answers three questions:

- **What** does this change?
- **Why** is it needed?
- **How** should the reviewer verify it?

That last one saves the most time. "Log in, add an item, open the cart, the
image should render" is far more useful than "please review".

Add screenshots for anything visual. A before/after pair answers more questions
than a paragraph.

**Keep pull requests small.** A 200-line PR gets a real review; a 2000-line one
gets "looks good to me". If a change is genuinely large, split it: one PR for
the API, another for the UI that consumes it.

**Open it as a draft** if you want early feedback on an unfinished branch:

```bash
gh pr create --draft
```

---

## Reviewing someone else's pull request

Reviewing is not a formality — it is the main reason this workflow exists.

Pull the branch and actually run it:

```bash
gh pr checkout 7          # or: git fetch origin && git switch feat/their-branch
docker compose up --build
```

Look for:

- **Does it do what the description says?** Run the verification steps.
- **Does anything else break?** Especially shared code — the axios instance,
  the auth context, the validation rules.
- **Are secrets or debug output included?** Check the diff for `.env`, API keys,
  stray `console.log`.
- **Is a rule duplicated rather than shared?** This project has produced the same
  bug three times from a rule written in two places that then drifted. If a new
  check appears in a form, look for the matching one on the server.

When commenting, be specific and separate the essential from the optional:

> `services/order.ts:42` — this throws if `payload` is undefined, which happens
> when the cart is empty. Worth a guard.

> Optional: this could use the existing `formatPrice` helper.

Approve when you would be comfortable with it in production. Request changes when
something is actually wrong — not because you would have written it differently.

---

## Merging

Once approved and CI is green:

```bash
gh pr merge --squash --delete-branch
```

Or use the GitHub button. **Squash and merge** is the default here: it collapses
the branch into one commit on `main`, so the history reads as one clear change
per feature rather than "wip", "fix typo", "actually fix it".

The squashed commit takes the PR title and description, so tidy them up before
merging.

Then, locally:

```bash
git switch main
git pull
git branch -d feat/wishlist-page
```

Delete merged branches. A branch list with thirty stale entries is a branch list
nobody reads.

---

## Staying in sync and handling conflicts

If your branch has been open a while and `main` has moved on:

```bash
git switch main
git pull
git switch feat/wishlist-page
git merge main
```

Resolve any conflicts, commit, and push. Do this *before* asking for review, not
after — nobody wants to review a branch that no longer applies.

`git rebase main` is the alternative, producing a linear history. It rewrites
your commits, so **only rebase a branch nobody else has pulled**. When two people
are on one branch, merge.

### Resolving a conflict

Git marks conflicts in the file:

```
<<<<<<< HEAD
the version already on your branch
=======
the version coming from main
>>>>>>> main
```

Edit the file so it reads correctly — usually keeping parts of both, not picking
one blindly — and delete all three marker lines. Then:

```bash
git add path/to/file
git commit
```

If it goes badly, `git merge --abort` returns you to where you started.

---

## Never commit secrets

**This repository exists because the previous one had a full `.env` committed to
public history.** Everything in it had to be rotated: database credentials,
three JWT signing keys, Cloudinary keys, the SMTP password and the admin
password.

Understand why deleting the file afterwards does not help: git keeps every
version of every file forever. A secret committed once is in the history, in
every clone, and in every fork — permanently. The only real remedies are
rewriting history (disruptive, and useless once someone has cloned it) or
rotating the secret.

So:

- `.env` and `.env.local` are gitignored. Keep it that way.
- Add new configuration to `.env.example` with a **placeholder**, never a real
  value.
- Never paste credentials into code, commit messages, PR descriptions or issues.
- Never log them. `logger.debug` is silent in production but the strings still
  ship, and development logs get pasted into chats.

Check before every commit:

```bash
git status                 # anything unexpected staged?
git diff --cached          # read what you are about to commit
```

If a secret does get committed, **rotate it immediately**. Treat cleaning the
history as secondary — the moment it is pushed, assume it is public.

---

## Getting out of trouble

**Committed to `main` by accident** (before pushing):

```bash
git branch feat/my-work        # save the work on a new branch
git reset --hard origin/main   # put main back
git switch feat/my-work
```

**Last commit needs a change** (not yet pushed):

```bash
git add .
git commit --amend
```

**Undo the last commit but keep the changes:**

```bash
git reset --soft HEAD~1
```

**Discard uncommitted changes to one file:**

```bash
git restore path/to/file
```

**Need to switch branches with work in progress:**

```bash
git stash
git switch other-branch
# later
git switch -
git stash pop
```

**Made a mess and want the last known-good state:**

```bash
git reflog                 # every position HEAD has held
git reset --hard <hash>
```

`git reflog` is the safety net. Almost nothing committed is ever truly lost.

---

## Command reference

| Task | Command |
|---|---|
| Update local `main` | `git switch main && git pull` |
| New branch | `git switch -c feat/name` |
| Switch branches | `git switch branch-name` |
| Stage interactively | `git add -p` |
| Commit | `git commit -m "Message"` |
| Push a new branch | `git push -u origin feat/name` |
| Push afterwards | `git push` |
| Open a PR | `gh pr create --fill` |
| Check out a PR to test | `gh pr checkout <number>` |
| Merge a PR | `gh pr merge --squash --delete-branch` |
| Bring `main` into a branch | `git merge main` |
| See what changed | `git diff` / `git diff --cached` |
| History, one line each | `git log --oneline --graph --all` |
| Undo, keep changes | `git reset --soft HEAD~1` |
| Abandon a merge | `git merge --abort` |
| Recover from anything | `git reflog` |

The `gh` commands need the [GitHub CLI](https://cli.github.com/); everything is
equally doable from the website.
