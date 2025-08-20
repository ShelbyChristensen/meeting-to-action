export const errMsg = (e) =>
  e?.response?.data?.message || e?.response?.data?.error || e.message || 'Error'
