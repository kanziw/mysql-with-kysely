type DelayWithCancelReturn = {
  cancel: () => void,
  promise: Promise<unknown>,
}

export const cancellableDelay = (ms: number): DelayWithCancelReturn => {
  const ret: DelayWithCancelReturn = { cancel: () => undefined, promise: Promise.resolve() }
  const signal = new Promise((resolve, reject) => {
    ret.cancel = () => { reject(new Error('cancelled')) }
  })

  ret.promise = new Promise<void>((resolve, reject) => {
    const timeOut = setTimeout(() => { resolve() }, ms)

    signal.catch(err => {
      reject(err)
      clearTimeout(timeOut)
    })
  }).catch(() => null)

  return ret
}
