/** Read a small JSON request without buffering an unbounded chunked body. */
export async function readBoundedBody(
  request: Request,
  limit = 1500,
): Promise<string> {
  if (Number(request.headers.get("content-length") || 0) > limit)
    throw new Error("INPUT_TOO_LARGE");
  if (!request.body) return "";
  const reader = request.body.getReader();
  const decoder = new TextDecoder();
  let bytes = 0;
  let text = "";
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      bytes += value.byteLength;
      if (bytes > limit) {
        await reader.cancel();
        throw new Error("INPUT_TOO_LARGE");
      }
      text += decoder.decode(value, { stream: true });
    }
    return text + decoder.decode();
  } finally {
    reader.releaseLock();
  }
}
