import { join } from 'https://deno.land/std@0.220.1/path/mod.ts'
import { PostmanItem, Route } from './types.ts'
import { unflatten } from 'npm:flat'
import { destr } from 'npm:destr'

export async function* recursiveReaddir(
	path: string,
): AsyncGenerator<string, void> {
	for await (const dirEntry of Deno.readDir(path)) {
		if (dirEntry.isDirectory) {
			yield* recursiveReaddir(join(path, dirEntry.name))
		} else if (dirEntry.isFile) {
			yield join(path, dirEntry.name)
		}
	}
}

export function wrap<T>(val: T | T[]) {
	return Array.isArray(val) ? val : [val]
}

export function colonToVariable(route: string) {
	return route.replace(/:([^/]+)/g, `{{$1}}`)
}

// export function toFolder(path: string) {
// 	return path.split('/').reduce((res, name) => {
// 		res[name] =
// 		return res
// 	}, {})
// }

export function fixFileName(file: string) {
	return file
		.replace(/\.\.\//g, '')
		.replace('/etc/webapi.xml', '')
		.replace('app/vendor/', 'vendor/')
		.replace('app/app', 'app')
}

const customer_token: PostmanItem['request']['auth'] = {
	type: 'bearer',
	bearer: [
		{
			key: 'token',
			type: 'string',
			value: '{{customer_token}}',
		},
	],
}

export function parseRoute(route: Route) {
	const url = `{{base_url}}/rest${colonToVariable(route.url)}`
	const [host, ...path] = url.split('/')

	if (route.auth !== 'anonymous') route.url += ` (${route.auth})`

	const item: PostmanItem = {
		name: route.url,
		request: {
			description: `${route.class}@${route.method}`,
			method: route.type,
			url: {
				raw: url,
				host: [host],
				path,
			},
		},
	}

	if (route.data) {
		item.request.body = {
			mode: 'raw',
			raw: JSON.stringify(unflatten(destr(`{ "${route.data}": "<insert_value_here>" }`)), null, 2),
			options: { raw: { language: 'json' } },
		}
	}

	if (route.auth === 'self') item.request.auth = customer_token

	return item
}
