import { crc32 } from 'node:zlib'

// ZIP sin compresión (los PNG ya vienen comprimidos). Nombres ASCII, < 4 GB.
export function zip(files: { name: string; data: Buffer }[]): Buffer {
  const parts: Buffer[] = [], central: Buffer[] = []
  let offset = 0
  for (const f of files) {
    const name = Buffer.from(f.name), crc = crc32(f.data), size = f.data.length
    const local = Buffer.alloc(30)
    local.writeUInt32LE(0x04034b50, 0); local.writeUInt16LE(20, 4)
    local.writeUInt32LE(crc, 14); local.writeUInt32LE(size, 18); local.writeUInt32LE(size, 22)
    local.writeUInt16LE(name.length, 26)
    const dir = Buffer.alloc(46)
    dir.writeUInt32LE(0x02014b50, 0); dir.writeUInt16LE(20, 4); dir.writeUInt16LE(20, 6)
    dir.writeUInt32LE(crc, 16); dir.writeUInt32LE(size, 20); dir.writeUInt32LE(size, 24)
    dir.writeUInt16LE(name.length, 28); dir.writeUInt32LE(offset, 42)
    parts.push(local, name, f.data); central.push(dir, name)
    offset += 30 + name.length + size
  }
  const cd = Buffer.concat(central), end = Buffer.alloc(22)
  end.writeUInt32LE(0x06054b50, 0); end.writeUInt16LE(files.length, 8); end.writeUInt16LE(files.length, 10)
  end.writeUInt32LE(cd.length, 12); end.writeUInt32LE(offset, 16)
  return Buffer.concat([...parts, cd, end])
}
