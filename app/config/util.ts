export const getItemByCookie = (req: any, name = 'token') => {
  const cookie = req.headers.cookie
  const arrcookie = cookie.split("; ")
  for (let i = 0; i < arrcookie.length; i++) {
    const arr = arrcookie[i].split("=")
    if (arr[0] == name) return arr[1]
  }
  return "";
}