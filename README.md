# Ticket Booking with a Waiting-Room Queue

A browser app (HTML, CSS, JavaScript) that shows why **queues** matter for ticket sales. When demand is high, buyers join a virtual waiting room. The first person in line gets a time-limited turn to pick seats, then the next person is admitted, so the system stays fair and never overloaded.

## How the queue is used

- Joining the waiting room = `enqueue`
- Admitting the next buyer = `dequeue` (FIFO: first to join, first to book)
- Only one buyer books at a time; each has 45 seconds, then the turn passes on
- The queue is a linked list written from scratch in `js/queue.js`

## Features

- Join the waiting room and see your position
- 48-seat map with row pricing, up to 4 seats per buyer
- Countdown timer for the active buyer
- "Add 5 random people" simulates a crowd that books automatically
- Live stats: waiting, seats sold, revenue, average wait
- Tickets table; sold-out handling; Reset button
- Light and dark mode, responsive layout

## Structure

```
index.html
css/style.css
js/queue.js   Queue class (enqueue, dequeue, isEmpty, toArray)
js/app.js     Booking logic and UI
```

## Run locally

Open `index.html` in a browser. No build step.

## Deploy with GitHub Pages

```bash
git init
git add .
git commit -m "Initial commit: ticket booking queue"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/ticket-booking-queue.git
git push -u origin main
```

Then on GitHub: **Settings → Pages → Deploy from a branch → main / (root) → Save**.

## License

MIT
