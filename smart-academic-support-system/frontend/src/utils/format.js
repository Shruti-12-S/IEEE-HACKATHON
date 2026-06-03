export const fmtDate = (date) => (date ? new Date(date).toLocaleDateString() : "Not set");
export const overdue = (date) => date && new Date(date) < new Date();
