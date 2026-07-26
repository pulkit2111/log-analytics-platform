const KEYS = {
  pageSize: "logAnalytics.defaultPageSize",
  rangeHours: "logAnalytics.defaultRangeHours",
};

export function getDefaultPageSize() {
  const stored = localStorage.getItem(KEYS.pageSize);
  return stored ? Number(stored) : 20;
}

export function setDefaultPageSize(size) {
  localStorage.setItem(KEYS.pageSize, String(size));
}

export function getDefaultRangeHours() {
  const stored = localStorage.getItem(KEYS.rangeHours);
  return stored ? Number(stored) : 24;
}

export function setDefaultRangeHours(hours) {
  localStorage.setItem(KEYS.rangeHours, String(hours));
}
