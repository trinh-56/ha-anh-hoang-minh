// Paste this whole file into Extensions → Apps Script of the RSVP Google Sheet.

function validateRsvp(p) {
  if (p.website) return { ok: true, spam: true };

  var name = String(p.name || '').trim();
  if (!name || name.length > 100) return { ok: false, error: 'name' };

  if (p.attending !== 'yes' && p.attending !== 'no') return { ok: false, error: 'attending' };

  var guests = 0;
  if (p.attending === 'yes') {
    guests = Number(p.guests);
    if (!Number.isInteger(guests) || guests < 1 || guests > 10) return { ok: false, error: 'guests' };
  }

  // Stop spreadsheet formula injection: a leading = + - @ would run as a formula.
  if (/^[=+\-@]/.test(name)) name = "'" + name;

  return { ok: true, row: [name, p.attending === 'yes' ? 'Có' : 'Không', guests] };
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    var result = validateRsvp(e.parameter);
    if (result.ok && !result.spam) {
      SpreadsheetApp.getActiveSpreadsheet().getSheets()[0].appendRow([new Date()].concat(result.row));
    }
    return json({ ok: result.ok, error: result.error });
  } catch (err) {
    return json({ ok: false, error: 'server' });
  }
}

// Run once from the Apps Script editor to write the header row.
function setup() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
  if (sheet.getLastRow() === 0) sheet.appendRow(['Thời gian', 'Tên', 'Tham dự', 'Số người']);
}
