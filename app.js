const ROWS = "ABCDEF".split("");
const COLS = 8;
const MAX_SEATS = 4;      // seats one buyer can take
const SESSION_SEC = 45;   // time a buyer has once admitted
const PRICES = [60, 60, 45, 45, 30, 30];
const BOTS = ["Kofi", "Esi", "Yaw", "Akua", "Kwame", "Abena", "Nana", "Efua", "Kojo", "Adwoa"];

const $ = (id) => document.getElementById(id);
const esc = (s) => String(s).replace(/[&<>"']/g, (c) =>
  ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const secs = (ms) => Math.max(0, Math.round(ms / 1000));

let queue, seats, active, tickets, waits, nextId;

function init() {
  queue = new Queue();
  seats = ROWS.flatMap((r, ri) =>
    Array.from({ length: COLS }, (_, c) => ({ id: r + (c + 1), price: PRICES[ri], owner: null })));
  active = null; tickets = []; waits = []; nextId = 1;
  notice("Join the waiting room to get a turn at the seats.");
  render();
}

const soldOut = () => seats.every((s) => s.owner);
function notice(msg) { $("notice").textContent = msg; }

function join(name, bot) {
  if (soldOut()) return notice("Sorry, the event is sold out.");
  queue.enqueue({ id: nextId++, name, bot, joined: Date.now() });
  notice(bot ? "" : `${name} joined the waiting room.`);
  tick();
}

function startSession(user) {
  const now = Date.now();
  waits.push(now - user.joined);
  active = { user, selected: [], expiresAt: now + SESSION_SEC * 1000, botAt: now + 2000 + Math.random() * 2000 };
  if (!user.bot) notice(`${user.name}, it's your turn! Pick up to ${MAX_SEATS} seats.`);
}

function book(ids) {
  const chosen = seats.filter((s) => ids.includes(s.id));
  chosen.forEach((s) => (s.owner = active.user.name));
  const total = chosen.reduce((sum, s) => sum + s.price, 0);
  tickets.push({ id: "T" + (1000 + tickets.length + 1), name: active.user.name, seats: ids.join(", "), total });
  notice(`${active.user.name} booked ${ids.join(", ")} for $${total}.`);
  active = null;
}

function botBuy() {
  const free = seats.filter((s) => !s.owner).sort(() => Math.random() - 0.5);
  const n = Math.min(free.length, 1 + Math.floor(Math.random() * 3));
  book(free.slice(0, n).map((s) => s.id));
}

function tick() {
  const now = Date.now();
  if (active) {
    if (active.user.bot && now >= active.botAt) botBuy();
    else if (now >= active.expiresAt) { notice(`${active.user.name}'s time ran out.`); active = null; }
  }
  if (soldOut()) { while (queue.dequeue()) {} }
  else if (!active) { const next = queue.dequeue(); if (next) startSession(next); }
  render();
}

function render() {
  const waiting = queue.toArray();
  $("sQueue").textContent = waiting.length;
  $("qCount").textContent = waiting.length;
  const sold = seats.filter((s) => s.owner);
  $("sSold").textContent = `${sold.length}/${seats.length}`;
  $("sRevenue").textContent = "$" + sold.reduce((sum, s) => sum + s.price, 0);
  $("sWait").textContent = (waits.length ? secs(waits.reduce((a, b) => a + b, 0) / waits.length) : 0) + "s";

  $("queueList").innerHTML = waiting.length
    ? waiting.map((u, i) => `<li><span class="pos">${i + 1}</span><b>${esc(u.name)}</b>` +
        `${u.bot ? "" : '<span class="tag">You</span>'}<span class="muted" style="margin-left:auto">${secs(Date.now() - u.joined)}s</span></li>`).join("")
    : '<li class="empty">Nobody is waiting</li>';

  const human = active && !active.user.bot;
  if (!active) {
    $("session").innerHTML = `<p class="idle">${soldOut() ? "Sold out. Thank you!" : "No one is booking right now."}</p>`;
  } else {
    const picked = seats.filter((s) => active.selected.includes(s.id));
    const total = picked.reduce((sum, s) => sum + s.price, 0);
    const left = secs(active.expiresAt - Date.now());
    $("session").innerHTML =
      `<div class="who"><div class="avatar">${esc(active.user.name[0])}</div><div><b>${esc(active.user.name)}</b>` +
      `<div class="muted">${human ? "Your turn" : "Another buyer"}</div></div>` +
      `<span class="timer ${left <= 10 ? "urgent" : ""}">${left}s</span></div>` +
      (human
        ? `<div class="muted">Selected: ${picked.length ? picked.map((s) => s.id).join(", ") : "none yet"}</div>` +
          `<div class="total">$${total}</div><div class="row"><button id="confirmBtn" ${picked.length ? "" : "disabled"}>Confirm booking</button>` +
          `<button id="cancelBtn" class="danger">Give up turn</button></div>`
        : '<div class="muted">Choosing seats...</div>');
  }

  $("seatMap").innerHTML = ROWS.map((r, ri) => `<div class="srow"><span class="rl">${r}</span>` +
    seats.slice(ri * COLS, ri * COLS + COLS).map((s) => {
      const sel = human && active.selected.includes(s.id);
      const cls = s.owner ? "booked" : sel ? "selected" : "";
      return `<button class="seat ${cls}" data-seat="${s.id}" title="${s.id} · $${s.price}" ` +
        `${s.owner || !human ? "disabled" : ""}>${s.id.slice(1)}</button>`;
    }).join("") + "</div>").join("");

  $("ticketBody").innerHTML = tickets.length
    ? tickets.slice().reverse().map((t) => `<tr><td>${t.id}</td><td>${esc(t.name)}</td><td>${t.seats}</td><td>$${t.total}</td></tr>`).join("")
    : '<tr><td colspan="4" class="empty">No tickets sold yet</td></tr>';
}

$("joinForm").addEventListener("submit", (e) => {
  e.preventDefault();
  join($("name").value.trim(), false);
  e.target.reset();
});
$("crowdBtn").addEventListener("click", () => {
  for (let i = 0; i < 5; i++) join(BOTS[Math.floor(Math.random() * BOTS.length)] + " " + (nextId), true);
});
$("resetBtn").addEventListener("click", init);
$("seatMap").addEventListener("click", (e) => {
  const id = e.target.dataset.seat;
  if (!id || !active || active.user.bot) return;
  const i = active.selected.indexOf(id);
  if (i >= 0) active.selected.splice(i, 1);
  else if (active.selected.length < MAX_SEATS) active.selected.push(id);
  else notice(`You can book at most ${MAX_SEATS} seats.`);
  render();
});
$("session").addEventListener("click", (e) => {
  if (e.target.id === "confirmBtn" && active && active.selected.length) { book(active.selected); tick(); }
  if (e.target.id === "cancelBtn" && active) { notice(`${active.user.name} gave up their turn.`); active = null; tick(); }
});

setInterval(tick, 1000);
init();
