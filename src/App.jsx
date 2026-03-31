import { useState, useEffect, useCallback } from “react”;

const SUPABASE_URL = “https://enmtgtmrosbvdroispky.supabase.co”;
const SUPABASE_ANON_KEY = “eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVubXRndG1yb3NidmRyb2lzcGt5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ5NTA2MzcsImV4cCI6MjA5MDUyNjYzN30.Xo-gfs3LnPg1dudXFG5lKZI_HEhgabLns3pTP-HOLzI”;

const headers = {
apikey: SUPABASE_ANON_KEY,
Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
“Content-Type”: “application/json”,
Prefer: “return=representation”,
};

const db = {
async get(table) {
const r = await fetch(`${SUPABASE_URL}/rest/v1/${table}?order=created_at.desc`, { headers });
return r.json();
},
async insert(table, data) {
const r = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, { method: “POST”, headers, body: JSON.stringify(data) });
return r.json();
},
async update(table, id, data) {
await fetch(`${SUPABASE_URL}/rest/v1/${table}?id=eq.${id}`, { method: “PATCH”, headers, body: JSON.stringify(data) });
},
async remove(table, id) {
await fetch(`${SUPABASE_URL}/rest/v1/${table}?id=eq.${id}`, { method: “DELETE”, headers });
},
};

const MONTHS = [“January”,“February”,“March”,“April”,“May”,“June”,“July”,“August”,“September”,“October”,“November”,“December”];
const MONTHS_SHORT = [“Jan”,“Feb”,“Mar”,“Apr”,“May”,“Jun”,“Jul”,“Aug”,“Sep”,“Oct”,“Nov”,“Dec”];
const DAYS = [“Su”,“Mo”,“Tu”,“We”,“Th”,“Fr”,“Sa”];

const EVENT_COLORS = [
{ id: “slate”,  label: “Slate”,  dot: “#64748B”, bg: “#F1F5F9”, text: “#334155” },
{ id: “zinc”,   label: “Zinc”,   dot: “#52525B”, bg: “#F4F4F5”, text: “#27272A” },
{ id: “red”,    label: “Rose”,   dot: “#E11D48”, bg: “#FFF1F2”, text: “#9F1239” },
{ id: “orange”, label: “Amber”,  dot: “#D97706”, bg: “#FFFBEB”, text: “#92400E” },
{ id: “blue”,   label: “Sky”,    dot: “#0284C7”, bg: “#F0F9FF”, text: “#075985” },
{ id: “violet”, label: “Violet”, dot: “#7C3AED”, bg: “#F5F3FF”, text: “#4C1D95” },
{ id: “teal”,   label: “Teal”,   dot: “#0D9488”, bg: “#F0FDFA”, text: “#134E4A” },
{ id: “pink”,   label: “Pink”,   dot: “#DB2777”, bg: “#FDF2F8”, text: “#831843” },
];

function getColor(id) { return EVENT_COLORS.find(c => c.id === id) || EVENT_COLORS[0]; }
function getDaysInMonth(y, m) { return new Date(y, m + 1, 0).getDate(); }
function getFirstDay(y, m) { return new Date(y, m, 1).getDay(); }
function isSameDay(a, b) { return a.getFullYear()===b.getFullYear()&&a.getMonth()===b.getMonth()&&a.getDate()===b.getDate(); }
function formatDate(d) { return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`; }
function getWeekStart(d) { const s = new Date(d); s.setDate(s.getDate()-s.getDay()); return s; }
function addDays(d, n) { const r = new Date(d); r.setDate(r.getDate()+n); return r; }
function fmt12(t) {
if (!t) return “”;
const [h, m] = t.split(”:”).map(Number);
return `${h%12||12}:${String(m).padStart(2,"0")}${h>=12?"pm":"am"}`;
}

const Icon = ({ name, size = 20 }) => {
const icons = {
calendar: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
list: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><circle cx="3" cy="6" r="1"/><circle cx="3" cy="12" r="1"/><circle cx="3" cy="18" r="1"/></svg>,
note: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
plus: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
chevLeft: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>,
chevRight: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>,
trash: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>,
check: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
clock: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
month: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg>,
week: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="8" y1="4" x2="8" y2="22"/><line x1="14" y1="4" x2="14" y2="22"/></svg>,
};
return icons[name] || null;
};

const styles = `@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&display=swap'); *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; } :root { --bg: #F7F7F7; --surface: #FFFFFF; --border: #E9E9E9; --border-dark: #CFCFCF; --text: #181818; --text-2: #444; --muted: #888; --muted-light: #BBBBBB; --accent: #222222; --accent-light: #EFEFEF; --shadow-sm: 0 1px 2px rgba(0,0,0,0.05); } body { font-family:'DM Sans',sans-serif; background:var(--bg); color:var(--text); min-height:100vh; -webkit-font-smoothing:antialiased; } .app { max-width:430px; margin:0 auto; min-height:100vh; display:flex; flex-direction:column; background:var(--bg); } .header { padding:52px 24px 14px; background:var(--surface); border-bottom:1px solid var(--border); } .header-row { display:flex; align-items:baseline; justify-content:space-between; } .app-title { font-family:'DM Serif Display',serif; font-size:26px; letter-spacing:-0.5px; } .app-title em { font-style:italic; color:var(--muted); } .header-sub { font-size:12px; color:var(--muted-light); margin-top:3px; font-weight:300; } .nav { display:flex; background:var(--surface); border-bottom:1px solid var(--border); } .nav-btn { flex:1; display:flex; flex-direction:column; align-items:center; gap:4px; padding:10px 0; cursor:pointer; border:none; background:none; color:var(--muted); font-family:'DM Sans',sans-serif; font-size:10px; font-weight:500; letter-spacing:0.5px; text-transform:uppercase; border-bottom:2px solid transparent; transition:all 0.2s; } .nav-btn.active { color:var(--text); border-bottom-color:var(--text); } .content { flex:1; overflow-y:auto; padding:20px 24px 100px; } .cal-toolbar { display:flex; align-items:center; justify-content:space-between; margin-bottom:16px; } .cal-month-label { font-family:'DM Serif Display',serif; font-size:20px; letter-spacing:-0.3px; } .cal-controls { display:flex; align-items:center; gap:6px; } .view-toggle { display:flex; border:1px solid var(--border); border-radius:8px; overflow:hidden; } .view-btn { padding:6px 10px; border:none; background:none; cursor:pointer; color:var(--muted); display:flex; align-items:center; transition:all 0.15s; } .view-btn.active { background:var(--accent); color:white; } .icon-btn { width:32px; height:32px; border:1px solid var(--border); background:var(--surface); border-radius:8px; cursor:pointer; display:flex; align-items:center; justify-content:center; color:var(--text-2); transition:background 0.15s; } .icon-btn:hover { background:var(--accent-light); } .cal-grid { display:grid; grid-template-columns:repeat(7,1fr); gap:1px; margin-bottom:20px; } .cal-day-label { text-align:center; font-size:10px; font-weight:500; color:var(--muted); letter-spacing:0.5px; padding:6px 0; text-transform:uppercase; } .cal-day { aspect-ratio:1; display:flex; flex-direction:column; align-items:center; justify-content:flex-start; padding-top:4px; border-radius:8px; font-size:12px; cursor:pointer; position:relative; transition:background 0.15s; } .cal-day:hover:not(.empty) { background:var(--accent-light); } .cal-day.empty { cursor:default; } .cal-day-num { width:24px; height:24px; display:flex; align-items:center; justify-content:center; border-radius:50%; } .cal-day.today .cal-day-num { background:var(--accent); color:white; font-weight:500; } .cal-day.selected:not(.today) .cal-day-num { background:var(--accent-light); color:var(--accent); font-weight:500; border:1.5px solid var(--border-dark); } .cal-day-dots { display:flex; gap:2px; margin-top:3px; flex-wrap:wrap; justify-content:center; max-width:30px; } .cal-dot { width:5px; height:5px; border-radius:50%; flex-shrink:0; } .week-header { display:grid; grid-template-columns:repeat(7,1fr); gap:2px; margin-bottom:6px; } .week-day-col { text-align:center; } .week-day-name { font-size:10px; font-weight:500; color:var(--muted); letter-spacing:0.5px; text-transform:uppercase; } .week-day-num { width:26px; height:26px; display:flex; align-items:center; justify-content:center; border-radius:50%; font-size:12px; margin:3px auto 0; cursor:pointer; transition:background 0.15s; } .week-day-num:hover { background:var(--accent-light); } .week-day-num.today { background:var(--accent); color:white; font-weight:500; } .week-day-num.selected:not(.today) { background:var(--accent-light); border:1.5px solid var(--border-dark); } .week-events-grid { display:grid; grid-template-columns:repeat(7,1fr); gap:3px; margin-bottom:20px; min-height:60px; } .week-col { display:flex; flex-direction:column; gap:3px; } .week-chip { border-radius:5px; padding:3px 4px; font-size:9px; font-weight:600; line-height:1.3; overflow:hidden; } .week-chip-time { font-weight:400; opacity:0.75; margin-top:1px; } .section-label { font-size:11px; font-weight:500; color:var(--muted); letter-spacing:0.8px; text-transform:uppercase; margin-bottom:10px; } .event-card { background:var(--surface); border:1px solid var(--border); border-radius:12px; padding:12px 14px; margin-bottom:8px; display:flex; align-items:center; gap:12px; box-shadow:var(--shadow-sm); } .event-bar { width:4px; border-radius:2px; align-self:stretch; flex-shrink:0; min-height:32px; } .event-info { flex:1; min-width:0; } .event-title { font-size:14px; font-weight:500; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; } .event-time { font-size:11px; color:var(--muted); margin-top:2px; display:flex; align-items:center; gap:3px; } .event-del { color:var(--muted-light); cursor:pointer; opacity:0; transition:opacity 0.15s; display:flex; flex-shrink:0; } .event-card:hover .event-del { opacity:1; } .color-picker { display:flex; gap:8px; flex-wrap:wrap; margin-top:6px; } .color-swatch { width:26px; height:26px; border-radius:50%; cursor:pointer; border:2.5px solid transparent; transition:all 0.15s; } .color-swatch.sel { border-color:var(--text); transform:scale(1.15); } .modal-overlay { position:fixed; inset:0; background:rgba(0,0,0,0.22); backdrop-filter:blur(6px); display:flex; align-items:flex-end; justify-content:center; z-index:100; } .modal { background:var(--surface); border-radius:20px 20px 0 0; padding:28px 24px 44px; width:100%; max-width:430px; box-shadow:0 -4px 40px rgba(0,0,0,0.10); } .modal-title { font-family:'DM Serif Display',serif; font-size:20px; margin-bottom:20px; } .input-label { font-size:11px; font-weight:500; color:var(--muted); letter-spacing:0.5px; text-transform:uppercase; margin-bottom:5px; } .input-row { margin-bottom:14px; } .input { width:100%; border:1px solid var(--border); border-radius:10px; padding:11px 13px; font-family:'DM Sans',sans-serif; font-size:14px; color:var(--text); background:var(--bg); outline:none; transition:border-color 0.15s; } .input:focus { border-color:var(--border-dark); } .time-row { display:grid; grid-template-columns:1fr 1fr; gap:8px; } .btn-row { display:flex; gap:10px; margin-top:20px; } .btn { flex:1; padding:13px; border-radius:10px; font-family:'DM Sans',sans-serif; font-size:14px; font-weight:500; cursor:pointer; border:none; transition:all 0.15s; } .btn-primary { background:var(--accent); color:white; } .btn-primary:hover { background:#333; } .btn-secondary { background:var(--bg); color:var(--text); border:1px solid var(--border); } .list-tabs { display:flex; gap:6px; margin-bottom:14px; overflow-x:auto; padding-bottom:2px; } .list-tab { padding:6px 14px; border-radius:20px; font-size:13px; font-weight:500; cursor:pointer; border:1px solid var(--border); background:var(--surface); color:var(--muted); white-space:nowrap; transition:all 0.15s; } .list-tab.active { background:var(--accent); color:white; border-color:var(--accent); } .new-item-row { display:flex; gap:8px; margin-bottom:10px; } .new-item-row .input { flex:1; } .add-btn { width:44px; height:44px; border-radius:10px; background:var(--accent); color:white; border:none; cursor:pointer; display:flex; align-items:center; justify-content:center; flex-shrink:0; } .list-item { background:var(--surface); border:1px solid var(--border); border-radius:12px; padding:13px 14px; margin-bottom:7px; display:flex; align-items:center; gap:12px; box-shadow:var(--shadow-sm); } .checkbox { width:20px; height:20px; border-radius:50%; border:1.5px solid var(--border-dark); flex-shrink:0; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:all 0.15s; } .checkbox.checked { background:var(--accent); border-color:var(--accent); color:white; } .item-text { flex:1; font-size:14px; } .item-text.done { color:var(--muted); text-decoration:line-through; } .item-del { color:var(--muted-light); cursor:pointer; opacity:0; transition:opacity 0.15s; display:flex; } .list-item:hover .item-del { opacity:1; } .note-card { background:var(--surface); border:1px solid var(--border); border-radius:14px; padding:16px; margin-bottom:10px; position:relative; box-shadow:var(--shadow-sm); } .note-author { font-size:11px; font-weight:500; color:var(--text-2); letter-spacing:0.5px; text-transform:uppercase; margin-bottom:7px; } .note-body { font-size:14px; line-height:1.6; color:var(--text); white-space:pre-wrap; } .note-time { font-size:11px; color:var(--muted-light); margin-top:10px; } .note-del { position:absolute; top:14px; right:14px; color:var(--muted-light); cursor:pointer; opacity:0; transition:opacity 0.15s; display:flex; } .note-card:hover .note-del { opacity:1; } textarea.input { resize:none; min-height:110px; line-height:1.5; } .fab { position:fixed; bottom:32px; right:24px; width:52px; height:52px; border-radius:50%; background:var(--accent); color:white; border:none; cursor:pointer; display:flex; align-items:center; justify-content:center; box-shadow:0 4px 20px rgba(0,0,0,0.18); transition:all 0.2s; z-index:50; } .fab:hover { transform:scale(1.07); } .empty-state { text-align:center; padding:40px 24px; color:var(--muted); } .empty-icon { margin-bottom:10px; opacity:0.2; display:flex; justify-content:center; } .empty-text { font-size:13px; } .loading { display:flex; justify-content:center; padding:40px; color:var(--muted); font-size:14px; } ::-webkit-scrollbar { width:0; }`;

export default function Synced() {
const [tab, setTab] = useState(“calendar”);
const [calView, setCalView] = useState(“month”);
const [today] = useState(new Date());
const [viewDate, setViewDate] = useState(new Date());
const [selectedDate, setSelectedDate] = useState(new Date());
const [events, setEvents] = useState([]);
const [listItems, setListItems] = useState([]);
const [notes, setNotes] = useState([]);
const [loading, setLoading] = useState(true);
const [modal, setModal] = useState(null);
const [activeList, setActiveList] = useState(“Shopping”);

const [eventTitle, setEventTitle] = useState(””);
const [eventDate, setEventDate] = useState(””);
const [eventTimeStart, setEventTimeStart] = useState(””);
const [eventTimeEnd, setEventTimeEnd] = useState(””);
const [eventColor, setEventColor] = useState(“slate”);
const [newListItem, setNewListItem] = useState(””);
const [newListName, setNewListName] = useState(””);
const [noteAuthor, setNoteAuthor] = useState(””);
const [noteBody, setNoteBody] = useState(””);

const lists = […new Set([“Shopping”, “To-Do”, …listItems.map(i => i.list_name)])].filter(Boolean);

const load = useCallback(async () => {
setLoading(true);
const [evts, items, nts] = await Promise.all([db.get(“events”), db.get(“list_items”), db.get(“notes”)]);
setEvents(evts || []); setListItems(items || []); setNotes(nts || []);
setLoading(false);
}, []);

useEffect(() => { load(); }, [load]);
useEffect(() => { const t = setInterval(load, 10000); return () => clearInterval(t); }, [load]);

const year = viewDate.getFullYear(), month = viewDate.getMonth();
const daysInMonth = getDaysInMonth(year, month);
const firstDay = getFirstDay(year, month);
const calDays = [];
for (let i = 0; i < firstDay; i++) calDays.push(null);
for (let d = 1; d <= daysInMonth; d++) calDays.push(d);

const weekStart = getWeekStart(viewDate);
const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

const weekLabel = (() => {
const s = weekDays[0], e = weekDays[6];
return s.getMonth() === e.getMonth()
? `${MONTHS[s.getMonth()]} ${s.getFullYear()}`
: `${MONTHS_SHORT[s.getMonth()]} – ${MONTHS_SHORT[e.getMonth()]} ${e.getFullYear()}`;
})();

function eventsFor(date) { return events.filter(e => e.date === formatDate(date)); }
function navPrev() { calView===“month” ? setViewDate(new Date(year,month-1,1)) : setViewDate(addDays(viewDate,-7)); }
function navNext() { calView===“month” ? setViewDate(new Date(year,month+1,1)) : setViewDate(addDays(viewDate,7)); }
function selectDay(date) { setSelectedDate(date); setViewDate(date); }

const selectedEvents = eventsFor(selectedDate).sort((a,b)=>(a.time_start||””).localeCompare(b.time_start||””));

const addEvent = async () => {
if (!eventTitle.trim() || !eventDate) return;
await db.insert(“events”, { title: eventTitle.trim(), date: eventDate, time_start: eventTimeStart||null, time_end: eventTimeEnd||null, color: eventColor });
setEventTitle(””); setEventDate(””); setEventTimeStart(””); setEventTimeEnd(””); setEventColor(“slate”);
setModal(null); load();
};
const deleteEvent = async id => { await db.remove(“events”, id); load(); };

const addListItem = async () => {
if (!newListItem.trim()) return;
await db.insert(“list_items”, { text: newListItem.trim(), done: false, list_name: activeList });
setNewListItem(””); load();
};
const toggleItem = async item => { await db.update(“list_items”, item.id, { done: !item.done }); load(); };
const deleteItem = async id => { await db.remove(“list_items”, id); load(); };
const addList = () => { const n = newListName.trim(); if (!n||lists.includes(n)) return; setActiveList(n); setNewListName(””); setModal(null); };

const addNote = async () => {
if (!noteBody.trim()) return;
await db.insert(“notes”, { author: noteAuthor.trim()||“Anonymous”, body: noteBody.trim() });
setNoteAuthor(””); setNoteBody(””); setModal(null); load();
};
const deleteNote = async id => { await db.remove(“notes”, id); load(); };

const currentListItems = listItems.filter(i => i.list_name === activeList);

return (
<>
<style>{styles}</style>
<div className="app">
<div className="header">
<div className="header-row">
<span className="app-title">Sync<em>ed</em></span>
</div>
<div className="header-sub">Your shared space</div>
</div>

```
    <nav className="nav">
      {[["calendar","Calendar","calendar"],["lists","Lists","list"],["notes","Notes","note"]].map(([id,label,icon])=>(
        <button key={id} className={`nav-btn${tab===id?" active":""}`} onClick={()=>setTab(id)}>
          <Icon name={icon} size={17}/>{label}
        </button>
      ))}
    </nav>

    <div className="content">
      {loading ? <div className="loading">Loading…</div> : (<>

        {tab==="calendar" && (<>
          <div className="cal-toolbar">
            <span className="cal-month-label">{calView==="month"?`${MONTHS[month]} ${year}`:weekLabel}</span>
            <div className="cal-controls">
              <div className="view-toggle">
                <button className={`view-btn${calView==="month"?" active":""}`} onClick={()=>setCalView("month")} title="Month"><Icon name="month" size={14}/></button>
                <button className={`view-btn${calView==="week"?" active":""}`} onClick={()=>setCalView("week")} title="Week"><Icon name="week" size={14}/></button>
              </div>
              <button className="icon-btn" onClick={navPrev}><Icon name="chevLeft" size={15}/></button>
              <button className="icon-btn" onClick={navNext}><Icon name="chevRight" size={15}/></button>
            </div>
          </div>

          {calView==="month" && (
            <div className="cal-grid">
              {DAYS.map(d=><div key={d} className="cal-day-label">{d}</div>)}
              {calDays.map((d,i)=>{
                if (!d) return <div key={`e${i}`} className="cal-day empty"/>;
                const date=new Date(year,month,d);
                const isToday=isSameDay(date,today), isSel=isSameDay(date,selectedDate);
                const dayEvts=eventsFor(date);
                return (
                  <div key={d} className={`cal-day${isToday?" today":""}${isSel&&!isToday?" selected":""}`} onClick={()=>selectDay(date)}>
                    <div className="cal-day-num">{d}</div>
                    <div className="cal-day-dots">
                      {dayEvts.slice(0,4).map(e=><div key={e.id} className="cal-dot" style={{background:getColor(e.color).dot}}/>)}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {calView==="week" && (
            <>
              <div className="week-header">
                {weekDays.map((date,i)=>{
                  const isToday=isSameDay(date,today), isSel=isSameDay(date,selectedDate);
                  return (
                    <div key={i} className="week-day-col" onClick={()=>selectDay(date)}>
                      <div className="week-day-name">{DAYS[i]}</div>
                      <div className={`week-day-num${isToday?" today":""}${isSel&&!isToday?" selected":""}`}>{date.getDate()}</div>
                    </div>
                  );
                })}
              </div>
              <div className="week-events-grid">
                {weekDays.map((date,i)=>{
                  const dayEvts=eventsFor(date).sort((a,b)=>(a.time_start||"").localeCompare(b.time_start||""));
                  return (
                    <div key={i} className="week-col">
                      {dayEvts.map(e=>{
                        const c=getColor(e.color);
                        return (
                          <div key={e.id} className="week-chip" style={{background:c.bg,color:c.text}}>
                            <div>{e.title}</div>
                            {e.time_start && <div className="week-chip-time">{fmt12(e.time_start)}{e.time_end?`–${fmt12(e.time_end)}`:""}</div>}
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </>
          )}

          <div className="section-label">
            {isSameDay(selectedDate,today)?"Today":selectedDate.toLocaleDateString("en-AU",{weekday:"long",day:"numeric",month:"long"})}
          </div>
          {selectedEvents.length===0
            ?<div className="empty-state"><div className="empty-icon"><Icon name="calendar" size={30}/></div><div className="empty-text">No events this day</div></div>
            :selectedEvents.map(e=>{
              const c=getColor(e.color);
              return (
                <div key={e.id} className="event-card">
                  <div className="event-bar" style={{background:c.dot}}/>
                  <div className="event-info">
                    <div className="event-title">{e.title}</div>
                    {e.time_start&&<div className="event-time"><Icon name="clock" size={11}/>{fmt12(e.time_start)}{e.time_end?` – ${fmt12(e.time_end)}`:""}</div>}
                  </div>
                  <div className="event-del" onClick={()=>deleteEvent(e.id)}><Icon name="trash" size={15}/></div>
                </div>
              );
            })}
        </>)}

        {tab==="lists" && (<>
          <div className="list-tabs">
            {lists.map(l=><div key={l} className={`list-tab${activeList===l?" active":""}`} onClick={()=>setActiveList(l)}>{l}</div>)}
            <div className="list-tab" onClick={()=>setModal("list")} style={{borderStyle:"dashed"}}>+ New</div>
          </div>
          <div className="new-item-row">
            <input className="input" placeholder={`Add to ${activeList}…`} value={newListItem} onChange={e=>setNewListItem(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addListItem()}/>
            <button className="add-btn" onClick={addListItem}><Icon name="plus" size={20}/></button>
          </div>
          {currentListItems.length===0
            ?<div className="empty-state"><div className="empty-icon"><Icon name="list" size={30}/></div><div className="empty-text">List is empty</div></div>
            :currentListItems.map(item=>(
              <div key={item.id} className="list-item">
                <div className={`checkbox${item.done?" checked":""}`} onClick={()=>toggleItem(item)}>{item.done&&<Icon name="check" size={11}/>}</div>
                <div className={`item-text${item.done?" done":""}`}>{item.text}</div>
                <div className="item-del" onClick={()=>deleteItem(item.id)}><Icon name="trash" size={15}/></div>
              </div>
            ))}
        </>)}

        {tab==="notes" && (<>
          {notes.length===0&&<div className="empty-state"><div className="empty-icon"><Icon name="note" size={30}/></div><div className="empty-text">Leave each other a note</div></div>}
          {notes.map(n=>(
            <div key={n.id} className="note-card">
              <div className="note-author">{n.author}</div>
              <div className="note-body">{n.body}</div>
              <div className="note-time">{new Date(n.created_at).toLocaleDateString("en-AU",{day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"})}</div>
              <div className="note-del" onClick={()=>deleteNote(n.id)}><Icon name="trash" size={15}/></div>
            </div>
          ))}
        </>)}

      </>)}
    </div>

    {tab==="calendar"&&<button className="fab" onClick={()=>{setEventDate(formatDate(selectedDate));setModal("event");}}><Icon name="plus" size={22}/></button>}
    {tab==="notes"&&<button className="fab" onClick={()=>setModal("note")}><Icon name="plus" size={22}/></button>}

    {modal==="event"&&(
      <div className="modal-overlay" onClick={()=>setModal(null)}>
        <div className="modal" onClick={e=>e.stopPropagation()}>
          <div className="modal-title">Add Event</div>
          <div className="input-row"><div className="input-label">Title</div>
            <input className="input" placeholder="What's happening?" value={eventTitle} onChange={e=>setEventTitle(e.target.value)} autoFocus/>
          </div>
          <div className="input-row"><div className="input-label">Date</div>
            <input className="input" type="date" value={eventDate} onChange={e=>setEventDate(e.target.value)}/>
          </div>
          <div className="input-row"><div className="input-label">Time (optional)</div>
            <div className="time-row">
              <input className="input" type="time" value={eventTimeStart} onChange={e=>setEventTimeStart(e.target.value)}/>
              <input className="input" type="time" value={eventTimeEnd} onChange={e=>setEventTimeEnd(e.target.value)}/>
            </div>
          </div>
          <div className="input-row"><div className="input-label">Colour</div>
            <div className="color-picker">
              {EVENT_COLORS.map(c=>(
                <div key={c.id} className={`color-swatch${eventColor===c.id?" sel":""}`} style={{background:c.dot}} onClick={()=>setEventColor(c.id)} title={c.label}/>
              ))}
            </div>
          </div>
          <div className="btn-row">
            <button className="btn btn-secondary" onClick={()=>setModal(null)}>Cancel</button>
            <button className="btn btn-primary" onClick={addEvent}>Add Event</button>
          </div>
        </div>
      </div>
    )}

    {modal==="note"&&(
      <div className="modal-overlay" onClick={()=>setModal(null)}>
        <div className="modal" onClick={e=>e.stopPropagation()}>
          <div className="modal-title">Leave a Note</div>
          <div className="input-row"><div className="input-label">From</div>
            <input className="input" placeholder="Your name" value={noteAuthor} onChange={e=>setNoteAuthor(e.target.value)} autoFocus/>
          </div>
          <div className="input-row"><div className="input-label">Message</div>
            <textarea className="input" placeholder="Write something…" value={noteBody} onChange={e=>setNoteBody(e.target.value)}/>
          </div>
          <div className="btn-row">
            <button className="btn btn-secondary" onClick={()=>setModal(null)}>Cancel</button>
            <button className="btn btn-primary" onClick={addNote}>Post Note</button>
          </div>
        </div>
      </div>
    )}

    {modal==="list"&&(
      <div className="modal-overlay" onClick={()=>setModal(null)}>
        <div className="modal" onClick={e=>e.stopPropagation()}>
          <div className="modal-title">New List</div>
          <div className="input-row"><div className="input-label">List Name</div>
            <input className="input" placeholder="e.g. Groceries, Travel, Movies…" value={newListName} onChange={e=>setNewListName(e.target.value)} autoFocus onKeyDown={e=>e.key==="Enter"&&addList()}/>
          </div>
          <div className="btn-row">
            <button className="btn btn-secondary" onClick={()=>setModal(null)}>Cancel</button>
            <button className="btn btn-primary" onClick={addList}>Create</button>
          </div>
        </div>
      </div>
    )}

  </div>
</>
```

);
}
