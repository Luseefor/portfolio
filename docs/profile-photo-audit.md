# Profile photo audit

Workdir: /Users/lucifer/.ace/worktrees/cc04d76a6347ac88196da0ebb7572add102b1ea8004b551faefe18d937f95515, HEAD 79bbecd. Research only. No source, public, or asset files changed.

## GitHub source

I checked the public API for Luseefor.

- Profile: https://github.com/Luseefor
- Name on GitHub: Rijan Ghimire
- avatar_url: https://avatars.githubusercontent.com/u/78535253?v=4
- Downloaded copy: /tmp/portfolio-profile-assets/github-Luseefor-avatar.png
- Format: PNG, 460 by 460, RGBA, 198,909 bytes
- SHA256: cea1055d2249d3ed28c4e0ccc83ac49455c36fe44385f4a72a4e1b0ca1dd3eb5

The image shows the same person in a black collared shirt, glasses, short curly hair, white earbud in right ear, cut out against black. It reads well at small sizes.

## Local candidate

- Path: /Users/lucifer/Downloads/github-profile-photo.png
- Format: PNG, 512 by 512, RGBA, 271,377 bytes
- Modified: Oct 18 11:47
- SHA256: 1b52ba4b77770d11840a73a72f9be91e6f7acefc7157064cda4e2d308aa90ee1

I opened and compared both files side by side. Same pose, same crop, same shirt fold, same cutout edge. No other local file matched by name.

## Match confidence

Not byte identical. Hashes differ and sizes differ, 512 local against 460 from GitHub. That fits GitHub resizing the upload.

After scaling both to 64 by 64, RMS difference is about 1.6 out of 255. That is noise level. I rate this a high confidence visual match, likely the original upload for the current GitHub avatar.

So: same asset, different export size. Do not claim byte match.

## Suitability

Good for portfolio use. Clean cutout, face centered, plain background, sharp at 512. Works on light and dark. I would use it at 160 to 320 px display size.

## Places searched

Filename search only with terms rijan, profile, avatar, headshot, portrait, self, photo, pfp, luseefor. I did not open the Photos library or unrelated private photos.

- Desktop: listed with rg, no photo match
- Downloads: found github-profile-photo.png plus unrelated docs and images, listed only
- Pictures: contains Photos Library.photoslibrary and one screenshot, did not open library
- Documents: covered through mdfind, only code config matches
- Programming: covered through mdfind, only UI avatar components and /Users/lucifer/Programming/portfolio/public/cyberpunk-avatar.png by name, did not open that file since scope says not to touch public assets

mdfind for github-profile-photo returned only /Users/lucifer/Downloads/github-profile-photo.png.

I did not open /Users/lucifer/Downloads/PHOTO-2025-08-05-11-50-27.jpg. Name gives no link to profile use.

## Recommendation

Use the canonical GitHub download as fallback:

- /tmp/portfolio-profile-assets/github-Luseefor-avatar.png

If the parent wants the higher resolution file, inspect this first:

- /Users/lucifer/Downloads/github-profile-photo.png
