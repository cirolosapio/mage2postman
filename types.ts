export interface XmlRoute {
	'@url': string
	'@method': 'GET' | 'POST' | 'PUT'
	service?: {
		'@class': string
		'@method': string
	}
	resources: {
		resource: {
			'@ref': string
		}
	}
	data?: {
		parameter?: {
			'@name': string
		}
	}
}

export interface Route {
	type: XmlRoute['@method']
	url: string
	class?: string
	method?: string
	data?: string
	auth?: string
}

interface PostmanEvent {
	listen: string
	script: {
		type: string
		exec: string[]
	}
}

interface KeyValue {
	key: string
	value: string
}

export interface PostmanItem {
	name: string
	event?: PostmanEvent[]
	response?: []
	request: {
		auth?: {
			type: 'bearer'
			bearer: {
				key: 'token'
				value: '{{customer_token}}' | '{{admin_token}}'
				type: 'string'
			}[]
		}
		method: XmlRoute['@method']
		header?: string[]
		description?: string
		body?: {
			mode: 'raw'
			raw: string
			options?: {
				raw: {
					language: 'json'
				}
			}
		}
		url: {
			raw: string
			host: string[]
			path: string[]
			query?: KeyValue[]
		}
	}
}

type Folder<T> = {
	name: string
	item: T[]
}

export type PostmanFolder = Folder<PostmanItem>

export interface PostmanCollection {
	event?: PostmanEvent[]
	variabile?: KeyValue[]
	info: {
		name: string
		_postman_id?: string
		description?: string
		schema?: string
		_exporter_id?: string
	}
	item: (PostmanItem | PostmanFolder)[]
}
