const dayjs = require("dayjs");
const customParseFormat = require("dayjs/plugin/customParseFormat");

dayjs.extend(customParseFormat);

function parseDate(inputDate) {
  if (!inputDate) return null;

  const formats = ["YYYY-MM-DD", "DD-MM-YYYY"]; // allowed formats

  const parsed = dayjs(inputDate, formats, true);
  return parsed.isValid() ? parsed.toDate() : null;
}

module.exports = { parseDate };
