const myLoader = ({ src, width, quality }: { src: string, width: number, quality?: number }) => {
  return `https://ik.imagekit.io/at4uyufqd9s/tr:w-${width}${src}?w=${width}&q=${quality || 75}`
}
export default myLoader