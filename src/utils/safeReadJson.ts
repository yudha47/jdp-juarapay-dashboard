export async function safeReadJson(res: Response) {
  const text = await res.text();
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    return { status: res.status, errors: text };
  }
}