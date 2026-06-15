export function getApiErrorMessage(error, fallback) {
  return error?.response?.data?.mensagem || fallback;
}

export function isPlanLimitError(error) {
  return error?.response?.data?.code === "PLAN_LIMIT_REACHED";
}

export function getPlanLimitDetails(error) {
  return error?.response?.data?.details || null;
}
