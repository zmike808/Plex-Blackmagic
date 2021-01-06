# Plex-Blackmagic
A cloudflare worker for plex that uses blackmagic to change default client bitrates!

# IMPORTANT!!!
For this to work properly, use the following routes for your cloudflare worker:

<CLOUDFLARE_PLEX_URL>/video/:/transcode/universal/decision*
<CLOUDFLARE_PLEX_URL>/video/:/transcode/universal/start*
<CLOUDFLARE_PLEX_URL>/video/:/transcode/universal/subtitles*

## For example if your plex domain was plex.example.com: 
plex.example.com/video/:/transcode/universal/decision*
plex.example.com/video/:/transcode/universal/start*
plex.example.com/video/:/transcode/universal/subtitles*

## A Quick Note
Yes, the code is a huge mess. This was just a script I whipped up for myself. I will try to clean it up eventually if it actually ends up being used.

## Generating

Use [wrangler](https://github.com/cloudflare/wrangler)

```
wrangler generate projectname https://github.com/zmike808/Plex-Blackmagic
```

Then you can build your project, publish it, etc with `wrangler`:
```
cd projectname
wrangler build
```
