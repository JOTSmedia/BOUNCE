# BOUNCE — GitHub-ready website

A self-contained interactive pitch website and complete nine-part development package for the original Broadway musical and feature film. This folder is ready to become a GitHub repository. No repository has been created or uploaded by preparing this package.

The finished website is in `dist/`. It includes the basketball O loading sequence, eight character profiles, relationship map, stage and film treatments, concise story pitch, detailed sixteen-song plan, optional rhythm sketch, full script reader, downloads, and print edition. The included GitHub Actions workflow publishes that folder without installing dependencies or rebuilding it. Before upload, it updates the social-preview URLs to the actual GitHub Pages address supplied by GitHub, including the repository path when applicable.

## Upload using the GitHub website

1. Create a repository on GitHub. Use a public repository for the simplest GitHub Pages setup, or confirm that your account supports Pages for the private repository you choose. If needed, initialize it with a README so GitHub offers its file-upload page.
2. Open **Add file → Upload files**. Upload the **contents** of this folder to the repository root, including `dist/`, `content/`, `.github/`, `.gitignore`, and the root files. Do not upload the ZIP itself or put everything inside an extra `BOUNCE-github-ready` folder.
3. Commit the files to `main`. The root should contain `.github/workflows/pages.yml` and `dist/index.html`. On macOS, press **Command–Shift–Period** in Finder to show the hidden `.github` directory and `.gitignore`. If your browser will not upload the hidden directory, use GitHub's **Add file → Create new file** to create `.github/workflows/pages.yml` and paste the included workflow exactly.
4. Open **Settings → Pages** and set **Source** to **GitHub Actions**. No custom domain is required.
5. Open **Actions → Deploy BOUNCE to GitHub Pages**. The push to `main` starts it automatically; after enabling Pages, use **Run workflow** if the first run needs to be repeated. A successful run and **Settings → Pages** show the actual website address.

This package uses relative asset paths so it works when GitHub Pages serves it beneath a repository name. Do not change them to paths beginning with `/`.

## Upload with Git instead

Create an empty repository on GitHub first. In a terminal, change into this folder and run the commands below, replacing the example remote URL with your repository's URL. These commands are instructions for you to run; preparing this folder did not run them.

```sh
git init
git add .
git commit -m "Add BOUNCE interactive pitch"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPOSITORY.git
git push -u origin main
```

Then set **Settings → Pages → Source → GitHub Actions**. Future pushes to `main` redeploy the contents of `dist/`. You can also start a deployment manually from the Actions page.

## Preview locally

With Node.js/npm and Python 3 installed, run:

```sh
npm start
```

Open `http://localhost:4173` in your browser. The prebuilt website requires no dependency installation for this preview. Stop the local server with **Control–C**. Serve the site over HTTP rather than opening `index.html` directly, so its script reader and JavaScript modules can load.

## Edit the development package

The three source documents are in `content/`. After editing them, rebuild the downloadable Markdown, print edition, and reader data:

```sh
npm ci
npm run build:content
npm run check
```

Commit the edited source documents **and the regenerated files in `dist/`**. The Pages workflow deploys the finished files; it does not rebuild the writing during publication. `npm run check` checks JavaScript syntax, while `build:content` also verifies that the package contains nine sections and sixteen songs. Neither command replaces reviewing the experience in a browser.

**THE CITY KEEPS TIME** opens one concise, ten-scene pitch with a white plus/minus indicator. Edit `dist/story-pitch.json` to revise that pitch. The detailed sixteen-song plan remains available through **READ THE SCORE & MOTIF PLAN** and the package reader; it is separate from the concise pitch.

For visual or interaction changes, edit the relevant HTML, CSS, or JavaScript files in `dist/`, then preview and run `npm run check` again. `dist/reading-flow.js` controls the reading pace; `dist/ball3d.js` controls the basketballs; `dist/arena-wireframe.js` controls the loading journey.

## Included files

- `dist/`: complete website, concise pitch data, downloadable development package, print edition, fonts, images, full basketball model, brand artwork, and locally bundled Three.js.
- `content/`: editable story package, staged opening/bar scripts, and visual brief.
- `build-package.mjs`: rebuilds the written-package exports from the source documents.
- `package.json` and `package-lock.json`: commands and pinned dependency resolution.
- `.github/workflows/pages.yml`: static GitHub Pages publication workflow for `dist/`.
- `DESIGN-REVIEW.md`: development design notes, including the scope and timing of verification.

## Characters and reading experience

All eight figures in the uncropped hero artwork are clickable and keyboard accessible. Hover or focus reveals each character's spotlight color. A translucent profile modal presents that character's portrait and story; it closes through **CLOSE**, Escape, or a backdrop click. Opening a profile pauses auto-scroll.

Eight individual concept portraits are included in `dist/assets/characters/`. These are fictional character concepts, not photographs of an attached cast. The large story field and Zay's profile card use leather-textured basketball orange, with yellow retained as his chakra accent. Scenic images and portraits blend into the page through soft edge masks.

Auto-scroll starts three seconds after the hero appears at 45 CSS pixels per second. User interaction pauses it; the visible control resumes it. Titles, subtitles, controls, and loader text are uppercase, while paragraph text is justified. The decorative on-ball script intentionally reads “Bounce” in connected lettering.

## Basketball, motion, and arrival

Every basketball logo uses the same complete Innerscene CC0 GLB mesh, with embedded 2K base-color and normal textures. Full geometry and UV mapping support rotation through every side. This replaces the earlier photograph projected onto a sphere. The main website wordmark keeps a basketball in place of its O.

The original downloaded `dist/assets/basketball-cc0.glb` is unchanged. Custom “Bounce” connected Lobster script with an ordinary letter o, plus an original vertical dunk badge, is blended onto the model at runtime. The ink follows the curved leather surface and retains its grain; no manufacturer or league marks are used. A matching 1024×1024 transparent Blender render, `dist/assets/basketball-model.png`, supplies the fallback with the branding facing forward.

The skippable, replayable loader follows a wireframe flight from Las Vegas to New York City. Its route and plane follow the displayed loading percentage. At 100%, it reveals an original navy MSG blueprint with an arena elevation and overhead plan. The loading ball repeatedly dribbles vertically until arrival, then settles with diminishing rebounds and its script and badge facing forward. Proportionate orange neon contours travel around the title letters and through the ball's actual seams; letter shadows and the moving floor shadow support the motion. Other logo balls continue rotating and make occasional subtle hops.

**PAUSE MOTION** stops ongoing motion. Reduced-motion preferences show a static ball and a brief transition. If WebGL is unavailable, the matching Blender still remains visible. Sound defaults off; the optional rhythm sketch is an instrumental demonstration, not a cast recording.

## Sharing

`dist/assets/bounce-share.jpg` is the 1200×630 loading-logo preview for Open Graph and Twitter cards. The publication workflow replaces the original hosted origin in `dist/index.html` with GitHub Pages' configured base URL before it uploads the website. No repository name or account is hard-coded into the workflow. Social services may cache an older preview for a while after you update the site.

## Creative status and licenses

The nine required development sections and sixteen working songs are included. Full staged lyrics are written for the opening and bar duet; the other songs are dramatic and musical development outlines rather than finished recordings or orchestrated scores.

The ensemble artwork, individual portraits, and leather background texture are AI-generated concept visuals. Final print-poster art should be composed for portrait format so all eight figures remain within the crop.

The basketball source, CC0 license links, and downloaded model hash are recorded in `dist/assets/basketball-model-license.json`. The original custom brand artwork and Lobster font's SIL Open Font License are described in `dist/assets/bounce-ball-brand-license.txt`. Anton and DM Sans license files accompany their local fonts. The neon letter paths derive from the bundled OFL-licensed Anton font. Three.js, its GLTF loader, support code, and license are bundled locally. The continental outline uses Natural Earth's public-domain geography. The MSG blueprint is an original schematic illustration, not an engineering drawing.

No analytics, credentials, or third-party runtime requests are required by the website. This package excludes the original hosting configuration, repository history, dependency folder, credentials, and local workflow state. Publishing on GitHub Pages is a separate action you take from your own account.
