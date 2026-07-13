# PRPD Project — Claude Instructions

## Working Style
- **No bandaid fixes. Always address the root cause.**
- Keep current code safe — never delete or overwrite without double-checking first.
- Always confirm before destructive changes (deleting files, restructuring folders, etc.).

## Project
PRPD ("Prepped") — DFW halal high-protein custom meal prep website.
See README.md for full context.

## Deployment
- Deploy via `vercel --prod` from this folder (or double-click `deploy.bat`)
- GitHub Desktop pushes to `getprpd-sudo/getprpd-website-repo` (backup)
- Both `getprpd.com` and `www.getprpd.com` must be aliased after each deploy if they drift

## Hard Rules
- Never overwrite the Google Apps Script URL in script.js
- Never revert to Netlify
- Never remove vercel.json
- Never replace real PRPD food/founder photos with stock or AI images
- Never remove phone validation from the form
