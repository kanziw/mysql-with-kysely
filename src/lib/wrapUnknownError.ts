export const wrapUnknownError = (unknownErr: unknown): Error => {
  return unknownErr instanceof Error ? unknownErr : new Error(`${unknownErr}`)
}
