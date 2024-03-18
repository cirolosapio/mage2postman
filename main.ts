import { parseArgs } from 'https://deno.land/std@0.220.1/cli/parse_args.ts'
import { parse } from 'https://deno.land/x/xml@2.1.3/mod.ts'
import { fixFileName, parseRoute, recursiveReaddir, wrap } from './functions.ts'
import { PostmanCollection, PostmanFolder, Route, XmlRoute } from './types.ts'

let { path, name } = parseArgs(Deno.args, {
	string: ['path', 'name'],
})

if (!name) name = (path ?? Deno.cwd()).split('/').at(-1)!
if (!path) path = '.'

const time = performance.now()

const files: Record<string, Route[]> = {}
for await (const file of recursiveReaddir(path)) {
	if (file.endsWith('webapi.xml') && !file.startsWith('../../app/dev')) {
		const content = new TextDecoder().decode(await Deno.readFile(file))
		const { route } = parse(content).routes as unknown as { route: XmlRoute | XmlRoute[] }
		const key = fixFileName(file)
		files[key] = []
		wrap(route).forEach((r) => {
			r && files[key].push({
				class: r.service ? r.service['@class'] : undefined,
				type: r['@method'],
				method: r.service ? r.service['@method'] : undefined,
				url: r['@url'],
				data: r.data?.parameter ? r.data.parameter['@name'] : undefined,
				auth: r.resources?.resource ? r.resources.resource['@ref'] : undefined,
			})
		})
	}
}

const sorted: Record<string, Route[]> = {}
for (const key of Object.keys(files).sort()) sorted[key] = files[key]

const info: PostmanCollection['info'] = {
	name,
	schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json',
}

const collection = Object.entries(sorted).reduce((res, [file, routes]) => {
	let current = res.item

	const parts = file.split('/')

	parts.forEach((name, idx) => {
		const existing = current.find((item) => item.name === name) as PostmanFolder | undefined

		if (existing) current = existing.item
		else {
			const newItem: PostmanFolder = { name, item: [] }
			if (parts.length - 1 === idx) newItem.item.push(...routes.map((route) => parseRoute(route)))
			current.push(newItem)
			current = newItem.item
		}
	})

	return res
}, { info, item: [] } as PostmanCollection)


const filename = `${info.name}.postman_collection.json`

await Deno.writeFile(filename, new TextEncoder().encode(JSON.stringify(collection)))

console.log(`generated ${filename} in ${performance.now() - time} ms`)
