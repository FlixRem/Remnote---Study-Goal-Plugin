# Study Goal

Set a study goal (a number of cards) in the plugin settings. A small progress
badge is always shown in the top-right of the queue toolbar, counting the cards
you press. When you reach your goal, a celebration popup appears with your custom
message (default: **"You're done!!! nice!"**).

## Settings

- **Study goal (number of cards)** — how many cards to press before the celebration. Default: `120`.
- **Celebration message** — the message shown when you hit your goal. Default: `You're done!!! nice!`.

## How it works

- The counter starts at 0 each time you enter the queue.
- Every pressed card increments the badge (`seen / goal`).
- On reaching the goal, the celebration fires once. Click it (or press the next card) to dismiss.

## Development

```bash
npm install
npm run dev     # local dev server for RemNote (Build > Develop from localhost)
npm run build   # produces dist/ and PluginZip.zip for upload
```
