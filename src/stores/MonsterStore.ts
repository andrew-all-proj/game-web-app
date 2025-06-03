import { makeAutoObservable, runInAction } from 'mobx'
import client from '../api/apolloClient'
import { MONSTERS } from '../api/graphql/query'
import userStore from './UserStore'
import { th } from 'framer-motion/client'

export interface File {
	id: string
	name: string
	url: string
	description: string
	fileType: string
	contentType: string
}

export interface Monster {
	id: string
	name: string
	level: number
	files?: File[]
}

class MonsterStore {
	monsters: Monster[] = []
	selectedMonster: Monster | null = null
	error: string | null = null

	constructor() {
		makeAutoObservable(this)
	}

	setMonsters(monsters: Monster[]) {
		this.monsters = monsters
	}

	setSelectedMonster(monsterId: string) {
		const monster = this.monsters.find((monster) => monster.id === monsterId)
		this.selectedMonster = monster || null
	}

	clearMonsters() {
		this.monsters = []
		this.selectedMonster = null
	}

	async fetchMonsters(userId = userStore.user?.id) {
		this.error = null

		try {
			const { data } = await client.query({
				query: MONSTERS,
				variables: {
					limit: 10,
					offset: 0,
					userId: { eq: userId },
				},
				fetchPolicy: 'no-cache',
			})

			runInAction(() => {
				this.monsters = data.Monsters.items || []
			})
		} catch (err: any) {
			runInAction(() => {
				this.error = err.message
			})
			console.error('Failed to fetch monsters:', err)
		}
	}
}

const monsterStore = new MonsterStore()
export default monsterStore
