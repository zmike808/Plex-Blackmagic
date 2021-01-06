# Plex-Blackmagic
A cloudflare worker for plex that uses blackmagic to change default client bitrates!

# IMPORTANT!!! Remember to configure the routes in wrangler.toml
For this to work properly, remember edit wrangler.toml and replace the "CLOUDFLARE_PLEX_URL" in routes with the correct plex domain 

For example if your plex domain was plex.example.com: 
plex.example.com/video/:/transcode/universal/decision*

plex.example.com/video/:/transcode/universal/start*

plex.example.com/video/:/transcode/universal/subtitles*

Also if you are unfamiliar with wrangler / cf workers refer to the information below

## Wrangler

You can use [wrangler](https://github.com/cloudflare/wrangler) to generate a new Cloudflare Workers project based on this template by running the following command from your terminal:

```
wrangler generate myapp https://github.com/zmike808/Plex-Blackmagic
```

Before publishing your code you need to edit `wrangler.toml` file and add your Cloudflare `account_id` - more information about publishing your code can be found [in the documentation](https://workers.cloudflare.com/docs/quickstart/configuring-and-publishing/).

Once you are ready, you can publish your code by running the following command:

```
wrangler publish
```

#### A Final Quick Note
Yes, the code is a huge mess. This was just a script I whipped up for myself. I will try to clean it up eventually if it actually ends up being used.
