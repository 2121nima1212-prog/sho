# آموزش آپلود به GitHub و Deploy

## قدم 1: GitHub Repo بساز
1. به github.com برو، login کن.
2. "New repository" کلیک کن.
3. نام: `lingplus-academy` (public/private).
4. "Create repository" بزن.

## قدم 2: فایل‌ها رو آماده کن
1. فولدر `lingplus-academy` بساز.
2. 8 فایل بالا رو کپی کن داخلش (index.html, style.css, etc.).
3. Git نصب کن (git-scm.com اگر نداری).

## قدم 3: Local Git Init و Push
در ترمینال (Command Prompt/Terminal):
```bash
cd lingplus-academy  # به فولدر برو
git init
git add .
git commit -m "Initial commit: LingPlus Academy"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/lingplus-academy.git  # YOUR_USERNAME عوض کن
git push -u origin main