# Deploy birthday-site to GitHub Pages

## Steps

1. Create a GitHub repository.
   - Name it something like `birthday-site`.
   - Keep it public if you want a shareable URL.

2. Add your local project to git and push it.
   In the `birthday-site` folder, run:
   ```bash
   git init
   git add .
   git commit -m "Initial birthday site"
   git branch -M main
   git remote add origin https://github.com/<your-username>/<repo-name>.git
   git push -u origin main
   ```

3. The included workflow will auto-deploy on push.
   - The file `.github/workflows/deploy.yml` is already added.
   - On push, GitHub Actions will deploy the site to the `gh-pages` branch.

4. Open GitHub Pages settings for the repository.
   - Go to Settings > Pages.
   - Set the source branch to `gh-pages` and folder to `/root`.

5. Your public URL will be:
   `https://<your-username>.github.io/<repo-name>/`

## Notes

- If GitHub Actions does not run automatically, check the `Actions` tab.
- If you change files later, just commit and push again.
- Your existing `index.html`, `styles.css`, `script.js`, and `timeline-editor.html` will all be published.
