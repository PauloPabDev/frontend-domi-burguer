// Los precios se consultan a la API al compilar para no tenerlos fijos en el código.
// Build: si la API falla, la compilación se detiene (no se vende a un precio viejo o 0).
// Dev (--dev): usa prices.mock.json, reintenta cada 30 s y arranca `next dev`.
import { spawn } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const dev = process.argv.includes('--dev')
const root = join(import.meta.dirname, '..')
const mode = dev ? 'development' : 'production'
// loadEnvFile no pisa variables ya definidas: se carga primero el de mayor precedencia.
for (const file of [`.env.${mode}.local`, '.env.local', `.env.${mode}`, '.env']) {
  try { process.loadEnvFile(join(root, file)) } catch {}
}

// El mock es también la lista de ids obligatorios.
const mock = JSON.parse(readFileSync(join(root, 'src/data/prices.mock.json'), 'utf8'))
const write = (source, prices) =>
  writeFileSync(join(root, 'src/data/prices.generated.json'), JSON.stringify({ source, prices }, null, 2) + '\n')

async function sync() {
  const base = process.env.NEXT_PUBLIC_API_URL
  if (!base) throw new Error('falta la variable NEXT_PUBLIC_API_URL')
  const token = process.env.PRODUCTS_API_TOKEN
  const res = await fetch(new URL('api/v2/products?page=1&limit=500', base), {
    signal: AbortSignal.timeout(10_000),
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  })
  if (!res.ok) throw new Error(`la API respondió ${res.status}`)
  const { body } = await res.json()
  const prices = {}
  for (const id of Object.keys(mock)) {
    const price = Array.isArray(body) ? body.find((p) => p.id === id)?.price : undefined
    if (typeof price !== 'number' || !(price > 0)) throw new Error(`el producto ${id} no viene con un precio válido`)
    prices[id] = price
  }
  write('api', prices)
}

try {
  await sync()
  console.log('[precios] Precios sincronizados desde la API.')
} catch (error) {
  const motivo = error.cause?.code || error.cause?.message || error.message
  if (!dev) {
    console.error(`[precios] No se pudieron consultar los precios en la API: ${motivo}. Compilación detenida.`)
    process.exit(1)
  }
  write('mock', mock)
  console.warn(`[precios] API no disponible (${motivo}). Usando precios de prueba (prices.mock.json); reintento cada 30 s.`)
  const timer = setInterval(() => sync().then(() => {
    clearInterval(timer)
    console.log('[precios] API disponible: precios reales cargados.')
  }, () => {}), 30_000)
}

if (dev) {
  const argsExtra = process.argv.slice(2).filter((arg) => arg !== '--dev')
  spawn('next', ['dev', '--webpack', ...argsExtra], { stdio: 'inherit' }).on('exit', (code) => process.exit(code ?? 1))
}
