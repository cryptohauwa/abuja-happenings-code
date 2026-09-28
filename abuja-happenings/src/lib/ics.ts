type IcsEvent = {
  id: string;
  name: string;
  description: string;
  venue_name: string;
  area: string;
  address: string;
  event_date: string;
  start_time: string;
  end_time: string | null;
};

function escapeText(value: string) {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");
}

function stamp(date: string, time: string) {
  return `${date.replace(/-/g, "")}T${time.slice(0, 5).replace(":", "")}00`;
}

function fallbackEnd(time: string) {
  const [h, m] = time.split(":").map(Number);
  const end = ((h ?? 0) + 2) % 24;
  return `${String(end).padStart(2, "0")}:${String(m ?? 0).padStart(2, "0")}`;
}

export function buildIcs(events: IcsEvent[], calendarName = "Abuja Happenings") {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Abuja Happenings//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:${escapeText(calendarName)}`,
    "X-WR-TIMEZONE:Africa/Lagos",
  ];

  for (const event of events) {
    const location = [event.venue_name, event.address, event.area, "Abuja"]
      .filter(Boolean)
      .join(", ");
    lines.push(
      "BEGIN:VEVENT",
      `UID:${event.id}@abujahappenings`,
      `DTSTAMP:${stamp(event.event_date, event.start_time)}`,
      `DTSTART;TZID=Africa/Lagos:${stamp(event.event_date, event.start_time)}`,
      `DTEND;TZID=Africa/Lagos:${stamp(event.event_date, event.end_time ?? fallbackEnd(event.start_time))}`,
      `SUMMARY:${escapeText(event.name)}`,
      `DESCRIPTION:${escapeText(event.description)}`,
      `LOCATION:${escapeText(location)}`,
      "END:VEVENT",
    );
  }

  lines.push("END:VCALENDAR");
  return lines.join("\r\n");
}

export function downloadIcs(event: IcsEvent) {
  const blob = new Blob([buildIcs([event], event.name)], {
    type: "text/calendar;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${event.name.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}.ics`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
