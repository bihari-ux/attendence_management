// Returns YYYY-MM-DD for a given Date (or now) in server local time
const toDateKey = (date = new Date()) => {
  const d = new Date(date);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

const isWeekend = (dateKey, weekendDays = [0, 6]) => {
  const d = new Date(dateKey);
  return weekendDays.includes(d.getDay());
};

const daysBetween = (start, end) => {
  const s = new Date(start);
  const e = new Date(end);
  const diff = Math.round((e - s) / (1000 * 60 * 60 * 24)) + 1;
  return diff > 0 ? diff : 0;
};

const eachDateInRange = (start, end) => {
  const dates = [];
  let cur = new Date(start);
  const last = new Date(end);
  while (cur <= last) {
    dates.push(toDateKey(cur));
    cur.setDate(cur.getDate() + 1);
  }
  return dates;
};

module.exports = { toDateKey, isWeekend, daysBetween, eachDateInRange };
