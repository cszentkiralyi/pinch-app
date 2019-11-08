Pinch
=====

A stupid money-tracking web app. Intended for use on a phone without needing
internet access.

## Development server

```
$ npm run dev
```

Opens up a dev server on `localhost:8080`. Parcel supports hot module reloading,
but on my Chromebook it doesn't work so I diabled it. Remove the `--no-hmr`
flag in the alias to re-enable it.

## Distribution

```
$ npm run build
```

Outputs to `./dist`, minified & fingerprinted, just serve the contents of
the directory as-is.

# Q&Q

- **Why?**
- Why not? I have been wanting to find an app idea that could be implemented
  as a pure HTML/JS/CSS project with no backend requirement. It took a while,
  but I finally found that idea because it's simple but I'll actually use it.
- **Okay, why Mithril instead of React?**
- I've seen a few less-popular frameworks that fill the same niche as React
  (Inferno, svelte, Preact, etc) and wanted to try one, Mithril's just the one
  I learned about most-recently. Plus I'm targeting mobile, so a smaller
  framework that happens to run faster is nice.
- **Did you have to pick such an awful color scheme?**
- Yup. I'm not going for some artistic angle or anything, I just genuinely
  think it looks okay and can't articulate why.
- **Back to the code, what's the stack?**
- A lot of compact little pieces:
  - Parcel <https://parceljs.org> handles a lot of the hard work: it runs the
    watch server, development server, minification, fingerprinting, and is my
    favorite way to set up toy projects. It also installs quite a few packages
    for us automatically, and I use it so I _don't_ have to know what they
    are.
  - Mithril <https://mithril.js.org> does our client-side rendering, plus
    all the routing
  - dexie.js <https://dexie.org> is our wrapper around IndexedDB and takes
    care of all the data storage. Did you know IndexedDB can be used in IE10?
    Well, you do now.
  - Tailwind <https://tailwindcss.com> forms the basis of the CSS. I could use
    the full-fat version through Parcel, but I don't care enough to set it up.
- **So how does this work?**
- Once it's ready, it's an app, full stop. Run the build, serve it up to an
  Android phone's Chrome over the WiFi or something, and add it to the home
  screen. Open it once (TODO: I don't know if you have to do that or not) and
  it'll cache its own files on the device. From there, you just... use it; your
  data is preserved, and you never need to go online for it again. Unless there
  is an update or something, I guess.
- **Files?**
- Everything important is in `src/`, including assets like fonts and icons.
  It's in vanilla CSS, and class-based JSX, configured for Mithril in the
  `.babelrc`. `index.html` is tiny, go read that for entry points.
