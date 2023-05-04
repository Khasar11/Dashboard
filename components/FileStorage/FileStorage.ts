import { fileDir } from "../../server"
import readdirRecursive from 'fs-readdir-recursive'

export const getFileStorage = async (id: string) => {
  try {
    let walked = readdirRecursive(fileDir+`\\public\\storage\\${id}`)
    return walked
  } catch (err) { console.log(err) }
}