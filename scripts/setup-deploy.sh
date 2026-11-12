#!/usr/bin/env bash
# Jednorázové založení: soukromé GitHub repo + Vercel projekt napojený na větev main.
# Spuštění z kořene projektu:  bash scripts/setup-deploy.sh
# Potom stačí `git push` do main a Vercel nasadí novou verzi sám.
set -euo pipefail
cd "$(dirname "$0")/.."

REPO="${REPO:-itsjakubmazur/florbal-trener}"
PROJECT="${PROJECT:-florbal-trener}"

echo "1/4 GitHub: soukromé repo $REPO"
if gh repo view "$REPO" >/dev/null 2>&1; then
  echo "    repo už existuje"
else
  gh repo create "$REPO" --private --description "Florbal Trenér – domácí trénink pro malého florbalistu (PWA, soukromé)"
fi
[ "$(gh repo view "$REPO" --json visibility -q .visibility)" = "PRIVATE" ] || { echo "Repo není soukromé, končím."; exit 1; }
git remote get-url origin >/dev/null 2>&1 || git remote add origin "https://github.com/$REPO.git"
git push -u origin main

echo "2/4 Vercel: přihlášení (otevře prohlížeč)"
npx -y vercel@latest whoami >/dev/null 2>&1 || npx -y vercel@latest login

echo "3/4 Vercel: projekt $PROJECT + napojení na GitHub"
npx -y vercel@latest link --yes --project "$PROJECT"
npx -y vercel@latest git connect "https://github.com/$REPO.git" --yes || echo "    (napojení na GitHub udělejte ve Vercel → Project → Settings → Git, pokud selhalo)"

echo "4/4 První produkční nasazení"
npx -y vercel@latest deploy --prod --yes
echo "Hotovo. Adresu (…vercel.app) otevřete na iPadu v Safari → Sdílet → Přidat na plochu."
