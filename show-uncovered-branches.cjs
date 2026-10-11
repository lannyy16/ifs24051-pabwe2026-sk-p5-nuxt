const fs = require('node:fs')

const file = 'coverage/coverage-final.json'

if (!fs.existsSync(file)) {
  console.log('Coverage belum tersedia. Jalankan bun run test:coverage terlebih dahulu.')
  process.exit(1)
}

const data = JSON.parse(fs.readFileSync(file, 'utf8'))
let total = 0

for (const [filename, item] of Object.entries(data)) {
  for (const [id, hits] of Object.entries(item.b || {})) {
    const branch = item.branchMap[id]

    hits.forEach((count, index) => {
      if (count === 0) {
        total++
        console.log(
          `${filename} | baris ${branch.line} | tipe ${branch.type} | cabang ${index}`
        )
      }
    })
  }
}

console.log(`\nTotal cabang yang belum teruji: ${total}`)
