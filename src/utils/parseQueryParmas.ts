export function parseQueryParams<T = {}>(params: any): T {
  const parsedParams = {}

  Object.keys(params).forEach((key) => {
    if (params[key]) {
      parsedParams[key] = params[key]
    }
  })

  return parsedParams as T
}
