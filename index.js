const AREAS = [
	{
		name: '华为地铁A出口',
		gate: '华为地铁A出口',
		regex: /华为(地铁)?站?[Aa]出口/,
		word: '华为站A',
		takers: [],
		hiddenIfNone: true,
	},
	{
		name: 'H区',
		gate: 'H西',
		regex: /[Hh][区西\d]/,
		word: 'H',
		put: true,
		takers: [],
	},
	{
		name: 'J区',
		gate: 'J西',
		regex: /[Jj][区西\d]/,
		word: 'J',
		put: true,
		// takers: ['刘展-J区'],
		takers: [],
	},
	{
		name: '云谷',
		gate: '云谷',
		regex: /云谷(\d?[A-Da-d])?座?/,
		word: '云',
		put: true,
		takers: [],
	},
	{
		name: '金荣达',
		gate: '金荣达',
		regex: /金[荣蓉]达/,
		word: '金荣达',
		put: true,
		takers: [],
		hiddenIfNone: true,
	},
	{
		name: 'E区',
		gate: 'E东',
		regex: /[Ee][区东\d]/,
		word: 'E',
		put: true,
		takers: [],
	},
	{
		name: 'F区',
		gate: 'F南',
		regex: /[Ff][区南\d]/,
		word: 'F',
		put: true,
		takers: [],
	},
	{
		name: 'A区',
		gate: 'A东',
		regex: /[Aa][区东\d]/,
		word: 'A',
		put: true,
		takers: [],
		hiddenIfNone: true,
	},
	{
		name: 'G区',
		gate: 'G东',
		regex: /[Gg][区东\d]/,
		word: 'G',
		takers: [],
	},
	{
		name: 'B区',
		gate: 'B东',
		regex: /[Bb][区东\d]/,
		word: 'B',
		put: true,
		takers: [],
	},
	{
		name: 'D区',
		gate: 'D东',
		regex: /[Dd][区东\d]/,
		word: 'D',
		put: true,
		takers: [],
	},
	{
		name: '微谷',
		gate: '微谷北',
		regex: /微谷(\d?[A-Da-d])?座?/,
		word: '微',
		takers: [],
	},
	{
		name: 'K区',
		gate: 'K东南',
		regex: /[Kk][区东南\d]/,
		word: 'K',
		takers: [],
		hiddenIfNone: true,
	},
]
const OTHER = {
	name: '其它',
	gate: '其它',
	regex: /其它/,
	word: '其它',
	takers: [],
	hiddenIfNone: true,
}

const AREA_MAP = AREAS.reduce(
	(MAP, AREA) => {
		MAP[AREA.name] = AREA
		return MAP
	},
	{ [OTHER.name]: OTHER },
)
function findAREAByName(area) {
	return AREA_MAP[area] || OTHER
}

const strFinder = (jielong, areaStr) => jielong.toUpperCase().indexOf(areaStr) > -1
const regFinder = (jielong, areaReg) => areaReg.test(jielong)
const FINDERS = {
	name: strFinder,
	regex: regFinder,
	word: strFinder,
	default: strFinder,
}

function groupByFinder(jielongList, findKey) {
	const finder = FINDERS[findKey] || FINDERS.default
	const areaGroup = {}
	let jielongLeft = jielongList
	AREAS.forEach(AREA => {
		const areaList = []
		const areaLeft = []
		jielongLeft.forEach(jielongObj => {
			if (finder(jielongObj.jielong, AREA[findKey])) {
				areaList.push(jielongObj)
			} else {
				areaLeft.push(jielongObj)
			}
		})
		areaGroup[AREA.name] = areaList
		jielongLeft = areaLeft
	})

	areaGroup[OTHER.name] = jielongLeft
	return areaGroup
}

function groupAreaAll(jielongLeft, findKeys) {
	const totalGroup = {}
	findKeys.forEach((findKey, index) => {
		const areaGroup = groupByFinder(jielongLeft, findKey)
		jielongLeft = areaGroup[OTHER.name]
		for (const area in areaGroup) {
			if (index < findKeys.length - 1 && area === OTHER.name) {
				continue
			}
			let jielongList
			if (totalGroup[area]) {
				jielongList = totalGroup[area].concat(areaGroup[area])
			} else {
				jielongList = areaGroup[area]
			}
			// totalGroup[area] = jielongList
			totalGroup[area] = sortById(jielongList)
		}
	})

	for (const area in totalGroup) {
		const AREA = findAREAByName(area)
		const areaList = totalGroup[area]
		if (AREA.hiddenIfNone && !areaList.length) {
			delete totalGroup[area]
		}
	}
	return totalGroup
}

const ID_REGEX = /^(\d+)\.\s+/
const SEPARATE_REGEX = /[\s;；,，、:：]/
// const CANCEL_OMIT_REGEX = /[\s;；,，、\)）](取消|CANCEL|\-) *$/i
const CANCEL_CURRENT = /[\s;；,，、\)）](取消|CANCEL)/i
const CANCEL_REGEX =
	/[\s;；,，、\)）](取消\-?|CANCEL) *(\d+ *[份分个]|[零一二两三四五六七八九十百千万亿]+ *[份分个]|\s*|$)/i
const MEAL_COUNT = /(^|[^A-Ma-m])((\d+)|([零一二两三四五六七八九十百千万亿]+))( *[份分个](单点)?|$)/
const ADD_COUNT = /(^|[^A-Ma-m])[加\+]((\d+)|([零一二两三四五六七八九十百千万亿]+))/
const MEAL_PAID = /(^|[^A-Ma-m])(((\d+)|([零一二两三四五六七八九十百千万亿]+))[份分个]?)?(已支?付)/
// const MORE_RICE = /(^|[^A-Ma-m])(((\d+)|([零一二两三四五六七八九十百千万亿]+))[份分个]?)?(多(米?饭|主食|(?=\d|\s|$)))/g
const MORE_RICE = /(^|[^A-Ma-m])(((\d+)|([零一二两三四五六七八九十百千万亿]+))[份分个]?)?(多([米菜]?饭|主食))/g
// const LESS_RICE_MORE_VEG = /(^|[^A-Ma-m])(((\d+)|([零一二两三四五六七八九十百千万亿]+))[份分个]?)?(少饭多菜)/g
// const LESS_RICE = /(^|[^A-Ma-m])(((\d+)|([零一二两三四五六七八九十百千万亿]+))[份分个]?)?(少(米?饭|主食|(?=\d|\s|$)))/g
const LESS_LESS_RICE =
	/(^|[^A-Ma-m])(((\d+)|([零一二两三四五六七八九十百千万亿]+))[份分个]?)?([很少]少([米菜]?[饭飯]|主食)?)/g
const LESS_RICE =
	/(^|[^A-Ma-m])(((\d+)|([零一二两三四五六七八九十百千万亿]+))[份分个]?)?(少([米菜]?[饭飯]|主食))(((\d+)|([零一二两三四五六七八九十百千万亿]+))[份分个]?)?/g
const NO_RICE =
	/(^|[^A-Ma-m])(((\d+)|([零一二两三四五六七八九十百千万亿]+))[份分个]?)?((不(需?要|用)|[免无飞走去])(白?米?饭|杂粮饭|主食))/g
const WHITE_RICE =
	/(^|[^A-Ma-m])(((\d+)|([零一二两三四五六七八九十百千万亿]+))[份分个]?)?((杂粮饭|主食)?[换換]?(白米?)饭)[\(（且]?([多少]?)/g
const FRIED_RICE =
	/(^|[^A-Ma-m])(((\d+)|([零一二两三四五六七八九十百千万亿]+))[份分个]?)?((白?米[饭飯]|杂粮[饭飯]|主食)?[换換]?成?(炒米?[饭飯]|炒杂|杂粮炒?[饭飯]))[\(（且]?([多少]?)/g
const SINGLE_RIVER_FLOUR =
	/(^|[^A-Ma-m])(((\d+)|([零一二两三四五六七八九十百千万亿]+))[份分个]?)?(单点(炒河粉?|河粉))[\(（且]?([多少]?)/g
const RIVER_FLOUR =
	/(^|[^A-Ma-m])(((\d+)|([零一二两三四五六七八九十百千万亿]+))[份分个]?)?((白?米饭|杂粮饭|主食)?[换換]?成?(炒河粉?|河粉))[\(（且]?([多少]?)/g
const RICE_FLOUR =
	/(^|[^A-Ma-m])(((\d+)|([零一二两三四五六七八九十百千万亿]+))[份分个]?)?((白?米饭|杂粮饭|主食)?[换換]?成?(炒?米[粉线]|炒粉))[\(（且]?([多少]?)/g
const NOODLES =
	/(^|[^A-Ma-m])(((\d+)|([零一二两三四五六七八九十百千万亿]+))[份分个]?)?((白?米饭|杂粮饭|主食)?[换換]?成?(面条|炒面条?))[\(（且]?([多少]?)/g
const CHANGE_PUMPKIN =
	/(^|[^A-Ma-m])(((\d+)|([零一二两三四五六七八九十百千万亿]+))[份分个]?)?((白?米饭|杂粮饭|主食)?[换換]?蒸?南[瓜关])[\(（且]?([多少]?)/g
const CHANGE_POTATO =
	/(^|[^A-Ma-m])(((\d+)|([零一二两三四五六七八九十百千万亿]+))[份分个]?)?((白?米饭|杂粮饭|主食)?[换換]?蒸?[红番]薯)[\(（且]?([多少]?)/g
const ADD_BAOZI = /(^|[^A-Ma-m])(((\d+)|([零一二两三四五六七八九十百千万亿]+))[份分个]?)?((\+|加|➕\s*)?(包子|馒头))/g
const ADD_DISHES = /(^|[^A-Ma-m])(((\d+)|([零一二两三四五六七八九十百千万亿]+))[份分个]?)?((\+|加|➕\s*)?小菜)/g
const ADD_APPETITE =
	/(^|[^A-Ma-m])(((\d+)|([零一二两三四五六七八九十百千万亿]+))[份分个]?)?((\+|加|➕\s*)?(自制)?下饭菜)/g
const ADD_SOUR_RADISH =
	/(^|[^A-Ma-m])(((\d+)|([零一二两三四五六七八九十百千万亿]+))[份分个]?)?((\+|加|➕\s*)?((开胃)?萝|酸萝?)卜)/g
const ADD_SALAD =
	/(^|[^A-Ma-m])(((\d+)|([零一二两三四五六七八九十百千万亿]+))[份分个]?)?((\+|加|➕\s*)?((水果)?[沙色]拉|水果))/g
const ADD_WATERMELON =
	/(^|[^A-Ma-m])(((\d+)|([零一二两三四五六七八九十百千万亿]+))[份分个]?)?((\+|加|➕\s*)?(西瓜🍉+|西瓜|🍉+))/g
const ADD_CONGEE = /(^|[^A-Ma-m])(((\d+)|([零一二两三四五六七八九十百千万亿]+))[份分个]?)?((\+|加|➕\s*)?白?粥)/g
const ADD_BEAN_JELLY =
	/(^|[^A-Ma-m])(((\d+)|([零一二两三四五六七八九十百千万亿]+))[份分个]?)?((\+|加|➕\s*)?(黑?凉粉|黑凉))/g
const ADD_FREE_SAUCE = /(^|[^A-Ma-m])(((\d+)|([零一二两三四五六七八九十百千万亿]+))[份分个]?)?((\+|加|➕\s*)酱)/g
const ADD_PEPPER = /(^|[^A-Ma-m])(((\d+)|([零一二两三四五六七八九十百千万亿]+))[份分个]?)?((\+|加|➕\s*)?辣椒?酱)/g
const NO_PEPPER =
	/(^|[^A-Ma-m])(((\d+)|([零一二两三四五六七八九十百千万亿]+))[份分个]?)?((不(需?要?|用?)|[免无飞走去])辣)/g
const SELF_BOX = /(^|[^A-Ma-m])(((\d+)|([零一二两三四五六七八九十百千万亿]+))[份分个]?)?((自备)?饭?盒)/g
const CHANGE_STAPLE =
	/(^|[^A-Ma-m])(((\d+)|([零一二两三四五六七八九十百千万亿]+))[份分个]?)?([换換]主食|(白?米饭|杂粮饭|主食)[换換][\u4e00-\u4e13\u4e15-\u4efc\u4efe-\u6361\u6363-\u63da\u63dc-\u9fa5]+)[\(（且]?([多少]?)/g
// const CHANGE_VEG = /(^|[^A-Ma-m])(((\d+)|([零一二两三四五六七八九十百千万亿]+))[份分个]?)?([换換]菜)/g
const CHANGE_VEG =
	/(^|[^A-Ma-m])(((\d+)|([零一二两三四五六七八九十百千万亿]+))[份分个]?|都是)?([多少]菜|([\u4e00-\u4e13\u4e15-\u4efc\u4efe-\u6361\u6363-\u63da\u63dc-\u9fa5]+([换換改]|都要)|不(需?要|用)|[换換免无飞走去])[\u4e00-\u4e13\u4e15-\u4efc\u4efe-\u6361\u6363-\u63da\u63dc-\u9fa5]+)/g

const MEAL_PRICE = 16 // 素套餐单价
const SINGLE_PRICE = 8 // 单点炒饭粉面单价
const JELLY_PRICE = 3 // 黑凉粉单价
const CHANGE_PRICE = 2 // 换主食单价
const ADD_PRICE = 1 // 加小食单价
const COUNT_REGEXP = {
	type: 'mealCount',
	search: MEAL_COUNT,
	add: ADD_COUNT,
	output: '份',
	price: MEAL_PRICE,
}
const COND_REGEXPS = [
	{
		type: 'moreRice',
		search: MORE_RICE,
		output: '多饭',
		noReplace: true,
		isPackage: true,
	},
	// {
	// 	type: 'lessRiceMoreVeg',
	// 	search: LESS_RICE_MORE_VEG,
	// 	output: '少饭多菜',
	// 	isPackage: true,
	// },
	{
		type: 'lessLessRice',
		search: LESS_LESS_RICE,
		output: '少少饭',
		isPackage: true,
	},
	{
		type: 'lessRice',
		search: LESS_RICE,
		output: '少饭',
		isPackage: true,
	},
	{
		type: 'noRice',
		search: NO_RICE,
		output: '无饭',
		isPackage: true,
	},
	{
		type: 'whiteRice',
		search: WHITE_RICE,
		output: '白饭',
		isPackage: true,
	},
	{
		type: 'friedRice',
		search: FRIED_RICE,
		output: '炒饭',
		price: CHANGE_PRICE,
		isPackage: true,
	},
	{
		type: 'singleRiverFlour',
		search: SINGLE_RIVER_FLOUR,
		output: '单点炒河',
		price: SINGLE_PRICE,
	},
	{
		type: 'riverFlour',
		search: RIVER_FLOUR,
		output: '炒河',
		price: CHANGE_PRICE,
		isPackage: true,
	},
	{
		type: 'riceFlour',
		search: RICE_FLOUR,
		output: '炒粉',
		price: CHANGE_PRICE,
		isPackage: true,
	},
	{
		type: 'noodles',
		search: NOODLES,
		output: '炒面',
		price: CHANGE_PRICE,
		isPackage: true,
	},
	{
		type: 'changePumpkin',
		search: CHANGE_PUMPKIN,
		output: '换南瓜',
		price: CHANGE_PRICE,
		isPackage: true,
	},
	{
		type: 'changePotato',
		search: CHANGE_POTATO,
		output: '换红薯',
		price: CHANGE_PRICE,
		isPackage: true,
	},
	{
		type: 'addBaozi',
		search: ADD_BAOZI,
		output: '加包子',
	},
	{
		type: 'addDishes',
		search: ADD_DISHES,
		output: '加小菜',
	},
	{
		type: 'addAppetite',
		search: ADD_APPETITE,
		output: '下饭菜',
	},
	{
		type: 'addSourRadish',
		search: ADD_SOUR_RADISH,
		output: '开胃萝卜',
	},
	{
		type: 'addSalad',
		search: ADD_SALAD,
		output: '沙拉',
	},
	{
		type: 'addWatermelon',
		search: ADD_WATERMELON,
		output: '西瓜🍉',
	},
	{
		type: 'addBeanJelly',
		search: ADD_BEAN_JELLY,
		output: '黑凉',
		price: JELLY_PRICE,
	},
	{
		type: 'addCongee',
		search: ADD_CONGEE,
		output: '白粥',
		price: ADD_PRICE,
	},
	{
		type: 'addFreeSauce',
		search: ADD_FREE_SAUCE,
		output: '加酱',
	},
	{
		type: 'addPepper',
		search: ADD_PEPPER,
		output: '加辣酱',
	},
	{
		type: 'noPepper',
		search: NO_PEPPER,
		output: '免辣',
	},
	{
		type: 'changeStaple',
		search: CHANGE_STAPLE,
		output: '换主食',
		isPackage: true,
	},
	{
		type: 'changeVeg',
		search: CHANGE_VEG,
		output: '换菜',
		isPackage: true,
	},
	{
		type: 'selfBox',
		search: SELF_BOX,
		output: '饭盒',
		isPackage: true,
	},
]

const CONDITION_TYPE_MAP = COND_REGEXPS.reduce(
	(conditionMap, CONDITION) => {
		conditionMap[CONDITION.type] = CONDITION
		return conditionMap
	},
	{ [COUNT_REGEXP.type]: COUNT_REGEXP },
)
const PRICE_TYPE_MAP = COND_REGEXPS.reduce(
	(priceTypeMap, { type, price }) => {
		if (price) {
			priceTypeMap[type] = price
		}
		return priceTypeMap
	},
	{ [COUNT_REGEXP.type]: COUNT_REGEXP.price },
)
console.log('CONDITION_TYPE_MAP, PRICE_TYPE_MAP', CONDITION_TYPE_MAP, PRICE_TYPE_MAP)

function getUserCount(jielongObj) {
	let current = jielongObj
	let userTotal = 0 // 用户接龙总份数
	while (current) {
		const { count, factor, parent } = current
		userTotal += count * factor
		current = parent
	}
	return userTotal
}

function getPackTypes() {
	return COND_REGEXPS.filter(({ isPackage }) => isPackage).map(({ type }) => type)
}

function maxCount(conditions) {
	const packTypes = getPackTypes()
	return conditions.reduce((maxValue, condition) => {
		const { type, count } = condition
		// 单点不计套餐份数
		// if (type.startsWith('single')) {
		//     return maxValue
		// }
		// 仅当condition isPackage为true时记录套餐份数，如单点、加黑凉粉等不算套餐
		if (packTypes.indexOf(type) === -1) {
			return maxValue
		}
		return Math.max(maxValue, count)
	}, -Infinity)
}

function countByTotal(jielongList) {
	const count = jielongList.reduce((total, jielongObj) => {
		const { count, factor, conditions } = jielongObj
		const condCount = maxCount(conditions)
		let perCount
		// 当未标记份数时取条件最大值 TODO 未标记份数如何判断？
		if (condCount > count) {
			perCount = condCount
		} else {
			perCount = count
		}
		if (getUserCount(jielongObj) >= 0) {
			total += perCount * factor
		}
		return total
	}, 0)
	const { type, output } = COUNT_REGEXP
	return { type, count, output }
}

/**
 * 所有园区汇总统计
 * @param {*} jielongList
 */
function countByConditions(jielongList) {
	const conditionMap = {}
	const complexObj = { type: 'complexConds' }
	jielongList.forEach(jielongObj => {
		const { id, count, factor, conditions } = jielongObj
		if (factor === 0) {
			return
		}
		conditions.forEach(condition => {
			const type = condition.type
			if (conditionMap[type]) {
				conditionMap[type].push(condition)
			} else {
				conditionMap[type] = [condition]
			}
		})

		if (count * factor === 1) {
			if (conditions.length > 1) {
				const complexCount = count * factor
				const complexOutput = conditions
					.sort((a, b) => b.count - a.count)
					.map(({ type, count, word, output }, index) => {
						let text
						if (type === 'changeVeg') {
							text = word
						} else {
							text = output
						}
						if (index === 0) {
							return `${count}${text}`
						}
						return count === 1 ? text : `${count}${text}`
					})
					.join('•')
				complexObj[id] = {
					count: complexCount,
					outputs: [complexOutput],
				}
			}
		} else if (hasComplex(conditions)) {
			const startConds = conditions.filter(condition => !condition.prev && condition.next)
			let complexCount = 0
			const complexOutputs = startConds.map(startCond => {
				const complexConds = []
				let nextCond = startCond
				while (nextCond) {
					complexConds.push(nextCond)
					nextCond = nextCond.next
				}
				complexConds.sort((a, b) => b.count - a.count)
				const firstCount = complexConds[0].count
				complexCount += firstCount || 0
				const complexOutput = complexConds
					.map(({ type, count, word, output }) => {
						if (type === 'changeVeg') {
							return firstCount === 1 ? word : `${count}${word}`
						}
						return firstCount === 1 ? output : `${count}${output}`
					})
					.join('•')
				return firstCount === 1 ? `${firstCount}${complexOutput}` : complexOutput
			})
			complexObj[id] = {
				count: complexCount,
				outputs: complexOutputs,
			}
		}
	})

	const countConds = COND_REGEXPS.filter(({ type }) => conditionMap[type]).map(({ type, output }) => {
		const conditions = conditionMap[type]
		if (type === 'changeVeg') {
			return countChangeVeg(conditions, type, output)
		}

		let condCount = 0
		let moreCount = 0
		let lessCount = 0
		let complexCount = 0
		conditions.forEach(({ count, more, less, isComplex }) => {
			condCount += count
			if (more && more > 0) {
				moreCount += more
			}
			if (less && less > 0) {
				lessCount += less
			}
			if (isComplex) {
				complexCount += count
			}
		})
		return {
			type,
			conditions,
			count: condCount,
			more: moreCount,
			less: lessCount,
			complex: complexCount,
			output,
		}
	})

	countConds.push(complexObj)
	return countConds
}

/**
 * 各园区分别统计
 * @param {*} jielongList
 */
function countByConditions2(jielongList) {
	const countConds = []
	jielongList.forEach(({ count, factor, conditions }) => {
		if (factor === 0 || conditions.length === 0) {
			return
		}
		if (count * factor === 1) {
			const output = conditions
				.map(({ count, word }, index) => {
					if (index > 0 && count === 1) {
						return word
					}
					return `${count}${word}`
				})
				.join('•')
			countConds.push({
				conditions,
				output,
			})
		} else if (hasComplex(conditions)) {
			const complexOutput = getComplexOutput2(conditions)
			countConds.push({
				conditions,
				output: complexOutput,
			})
		} else {
			const output = conditions.map(({ count, word }) => `${count}${word}`).join(' ')
			countConds.push({
				conditions,
				output,
			})
		}
	})

	return countConds
}

/**
 * 带复合条件时输出，各园区分别统计
 * @param {*} conditions
 * @returns
 */
function getComplexOutput2(conditions) {
	const plainConds = [] // 普通条件
	const startConds = [] // 复合条件头指针
	conditions.forEach(condition => {
		if (!condition.prev) {
			if (condition.next) {
				startConds.push(condition)
			} else {
				plainConds.push(condition)
			}
		}
	})
	const complexOutputs = startConds.map(startCond => {
		const complexConds = []
		let nextCond = startCond
		while (nextCond) {
			complexConds.push(nextCond)
			nextCond = nextCond.next
		}
		complexConds.sort((a, b) => b.count - a.count)
		const firstCount = complexConds[0].count
		return complexConds
			.map(({ count, word }, index) => {
				if (index > 0 && count === 1 && firstCount === 1) {
					return word
				}
				return `${count}${word}`
			})
			.join('•')
	})
	const plainOutputs = plainConds.map(({ count, word }) => `${count}${word}`)
	return complexOutputs.concat(plainOutputs).join(' ')
}

/**
 * 旧版换菜统计
 * @param {*} conditions
 * @param {*} type
 * @param {*} output
 */
// eslint-disable-next-line no-unused-vars
function countChangeVeg0(conditions, type, output) {
	const combineList = combineByVegName(conditions)
	const listSize = combineList.length
	let condCount = 0
	let condOutput = ''
	if (listSize > 0) {
		condOutput += `${output}(`
	}
	combineList.forEach(({ word, count }, index) => {
		condCount += count
		condOutput += listSize === 1 ? word : `${count}${word}`
		if (index < listSize - 1) {
			condOutput += '、'
		}
	})
	if (listSize > 0) {
		condOutput += ')'
	}

	const complexList = conditions.filter(({ isComplex }) => isComplex)
	return {
		type,
		count: condCount,
		complex: complexList.length,
		output: condOutput,
	}
}

/**
 * 新版换菜统计（简化）
 * @param {*} conditions
 * @param {*} type
 * @param {*} output
 */
function countChangeVeg(conditions, type, output) {
	const combineList = combineByVegName(conditions)
	const listSize = combineList.length
	let condCount = 0
	let condOutput = ''
	if (listSize > 0) {
		condOutput += output
	}
	combineList.forEach(({ count }) => {
		condCount += count
	})

	const complexList = conditions.filter(({ isComplex }) => isComplex)
	return {
		type,
		count: condCount,
		complex: complexList.length,
		output: condOutput,
	}
}

/**
 * 按菜名合并每个菜几份
 * @param {换菜列表}} conditions
 */
function combineByVegName(conditions) {
	const countObj = conditions.reduce((vegNameMap, { word, count }) => {
		if (vegNameMap[word]) {
			vegNameMap[word] += count
		} else {
			vegNameMap[word] = count
		}
		return vegNameMap
	}, {})
	const resultList = []
	for (const word in countObj) {
		resultList.push({
			word,
			count: countObj[word],
		})
	}

	return resultList
}

function countByArea(jielongList) {
	return [countByTotal(jielongList), ...countByConditions(jielongList)]
}

function countByArea2(jielongList) {
	return [countByTotal(jielongList), ...countByConditions2(jielongList)]
}

function countAreaAll(areaGroup) {
	const countGroup = {}
	for (const area in areaGroup) {
		countGroup[area] = countByArea(areaGroup[area])
	}
	countGroup['合计'] = countAreaTotal(countGroup)
	console.log('countAreaAll: areaGroup, countGroup', areaGroup, countGroup)
	return countGroup
}

/**
 * 各区条件总份数计数
 * @param {*} countGroup
 * @returns 各区条件总份数
 */
function countAreaTotal(countGroup) {
	const condTypes = [
		'mealCount',
		'moreRice',
		// 'lessRiceMoreVeg',
		'lessRice',
		'noRice',
		'friedRice',
		'singleRiverFlour',
		'riverFlour',
		'riceFlour',
		'noodles',
		'changePumpkin',
		'changePotato',
		'changeStaple',
		'changeVeg',
		'addBeanJelly',
		'addCongee',
		'selfBox',
	]
	const shownTypes = ['mealCount', 'singleRiverFlour', 'selfBox']
	const condTotalMap = condTypes.reduce((map, condType) => {
		map[condType] = 0
		return map
	}, {})

	for (const area in countGroup) {
		countGroup[area].forEach(({ type, count }) => {
			if (!isNaN(condTotalMap[type])) {
				condTotalMap[type] += count
			}
		})
	}

	return condTypes.map(type => {
		const count = condTotalMap[type]
		const { output } = CONDITION_TYPE_MAP[type]
		return {
			type,
			count,
			output,
			hidden: shownTypes.indexOf(type) === -1,
		}
	})
}

function deliveryAreaAll(areaGroup) {
	const deliveryGroup = {}
	for (const area in areaGroup) {
		const jielongList = areaGroup[area]
		deliveryGroup[area] = []
		// default takers
		const { takers } = findAREAByName(area)
		if (takers && takers.length) {
			takers.forEach(taker => {
				deliveryGroup[area].push(`@${taker}`)
			})
		}
		for (const index in jielongList) {
			const { parent, factor, name } = jielongList[index]
			if (!parent && factor === 1) {
				deliveryGroup[area].push(`@${name}`)
			}
		}
	}

	return deliveryGroup
}

/**
 * 解析原始接龙，生成接龙对象
 * @param {Array} jielongArray
 */
function parseJielong(jielongArray) {
	const userNameMap = {}
	function setupParent(jielongObj) {
		const name = jielongObj.name
		// 相同用户时，设置接龙的 parent
		if (userNameMap[name]) {
			jielongObj.parent = userNameMap[name] // 当前接龙 parent 指向同一用户的前一条接龙
		}
		userNameMap[name] = jielongObj // 保存当前接龙
	}

	function setupConditions(jielongObj) {
		let rjielong = jielongObj.rjielong
		COND_REGEXPS.forEach(COND_REGEXP => {
			if (COND_REGEXP.type === 'changeVeg') {
				rjielong = getChangeVegConds(COND_REGEXP, rjielong, jielongObj)
			} else {
				rjielong = getPlainConds(COND_REGEXP, rjielong, jielongObj)
			}
		})

		getComplexConds(jielongObj)
	}

	function getAmount(jielongObj) {
		const type = 'mealCount'
		const { count, conditions } = jielongObj
		const price = PRICE_TYPE_MAP[type] || 0
		const amount =
			price * count +
			conditions
				.map(({ type, count }) => {
					const price = PRICE_TYPE_MAP[type] || 0
					return price * count
				})
				.reduce((total, paying) => total + paying, 0)
		jielongObj.amount = amount
	}

	const list = []
	const map = {}
	function setupJielong(jielong) {
		const id = getId(jielong)
		if (!id) {
			return
		}
		const area = getArea(jielong, ['name', 'regex'])
		const name = getName(jielong, area)
		const factor = getFactor(jielong)
		const rjielong = jielong.replace(ID_REGEX, '').replace(name, '')
		const count = getCount(rjielong)
		const isPaid = MEAL_PAID.test(rjielong)
		const jielongObj = { id, jielong, rjielong, area, name, count, factor, conditions: [], isPaid }
		setupParent(jielongObj)
		setupConditions(jielongObj)
		getAmount(jielongObj)
		list.push(jielongObj)
		if (!map[id]) {
			map[id] = jielongObj
		} else if (ofType(map[id], 'Array')) {
			map[id] = [...map[id], jielongObj]
		} else {
			map[id] = [map[id], jielongObj]
		}
	}

	jielongArray.forEach(setupJielong)
	return { list, map }
}

const idPrefixMap = {}
function getId(jielong) {
	if (!jielong || !ID_REGEX.test(jielong)) {
		return null
	}
	const idMatched = ID_REGEX.exec(jielong)
	const id = idMatched[1]
	if (idPrefixMap[id] === undefined) {
		idPrefixMap[id] = 0
	} else {
		idPrefixMap[id]++
	}
	return idPrefixMap[id] > 0 ? `${idPrefixMap[id]}-${id}` : id
}

function getArea(jielong, findKeys) {
	let findArea = OTHER
	for (const i in findKeys) {
		const findKey = findKeys[i]
		const finder = FINDERS[findKey] || FINDERS.default
		for (const j in AREAS) {
			const AREA = AREAS[j]
			if (finder(jielong, AREA[findKey])) {
				findArea = AREA
				break
			}
		}
		if (findArea !== OTHER) {
			break
		}
	}

	return findArea
}

// 匹配格式如：H区小妍Fanni🌟
/* eslint-disable no-misleading-character-class */
// const USER_AREA_ECMIX = /^\d+\.\s+(([A-Ma-m][区东西南北\d](门岗)?|云谷\s*\d+栋|[云微]谷(\d?[A-Da-d])?座?|华为(地铁)?站?[Aa]出口)|金荣达[ \-—_~～+]*([\u4e00-\u9fa5A-Za-z]+|\d+|$)[🌱🍀🍃🌵🌻🌼🌸🍉🍭🎈🐟🦋🐝🌈🌟✨🎀💋💤💦● ོ་]*)/u
const USER_AREA_ECMIX =
	/^\d+\.\s+(([A-Ma-m][区东西南北\d](门岗)?|云谷\s*\d+栋|[云微]谷(\d?[A-Da-d])?座?|华为(地铁)?站?[Aa]出口|金荣达)[ \-—_~～+]*(🐟李红|[\u4e00-\u9fa5]+[ \-—_~～+]+[A-Za-z]*|[\u4e00-\u9fa5A-Za-z]+|$)[🌱🍀🍃🌵🌻🌼🌸🍉🍭🎈🐟🦋🐝🌈🌟✨🎀💋💤💦● ོ་]*)/u
// 匹配格式如：小妍 H区，Fanni🌟 H3
const USER_NAME_AREA =
	/^\d+\.\s+((皮卡丘\*梅|Uwangzuge🦌|🐈 一周|教练焦雅琴-华为|At.|Linli.z|馮青菊（Lynette）🍜|痴迷、淡然|懒喵喵╮|倩倩Amoe💛|玲火火🔥|卷猫猫🐱|葫芦大侠_欢|。|WF🎵|@宋宋|ଳ|Uwangzuge🥨|💋YG_廖✨🌟|🌙 Moonlion|🍀Mʚ💋ɞ🍬|🍭オゥシュゥ🍭|喵喵张😝|🍋 易湘娇|尐霏|🍀 杨茜|\^点点滴滴\^|_Carina..💭|L~i~n|Cindy。|Nancy。|641℃|[\u4e00-\u9fa5]+|[A-Z a-z]+)[🌱🍀🍃🌵🌻🌼🌸🍉🍭🎈🐟🦋🐝🌈🌟✨🎀💋💤💦🍼● ོ་]*[ \-—_~～+,，]*([A-Ma-m][区东西南北\d](门岗)?|云谷一栋B座|云谷\s*\d+栋|[云微]谷(\d?[A-Da-d])?座?|华为(地铁)?站?[Aa]出口|金荣达))/u // ([，, -—_]?([多少]饭|不要米饭))?
// 匹配格式如：小妍 Fanni🌟H区
const USER_CENAME_AREA =
	/^\d+\.\s+(([\u4e00-\u9fa5]+ *([A-Z a-z]*|\d*))[🌱🍀🍃🌵🌻🌼🌸🍉🍭🎈🐟🦋🐝🌈🌟✨🎀💋💤💦● ོ་]*[ \-—_~～+]*([A-Ma-m][区东西南北\d](门岗)?|云谷\s*\d+栋|[云微]谷(\d?[A-Da-d])?座?|华为(地铁)?站?[Aa]出口|金荣达))/u
// 匹配格式如：Fanni 小妍🌟H区
const USER_ECNAME_AREA =
	/^\d+\.\s+(([A-Za-z]+(\([A-Z a-z●–]+\))? *[\u4e00-\u9fa5]*)[🌱🍀🍃🌵🌻🌼🌸🍉🍭🎈🐟🦋🐝🌈🌟✨🎀💋💤💦● ོ་]*[ \-—_~～+]*([A-Ma-m][区东西南北\d](门岗)?|云谷\s*\d+栋|[云微]谷(\d?[A-Da-d])?座?|华为(地铁)?站?[Aa]出口|金荣达))/u
// 匹配格式如：Fanni 小FF妍🌟H区
const USER_ECMIX_AREA =
	/^\d+\.\s+(([\u4e00-\u9fa5A-Z a-z]+|\d+)[🌱🍀🍃🌵🌻🌼🌸🍉🍭🎈🐟🦋🐝🌈🌟✨🎀💋💤💦● ོ་]*[ \-—_~～+]*([A-Ma-m][区东西南北\d](门岗)?|云谷\s*\d+栋|[云微]谷(\d?[A-Da-d])?座?|华为(地铁)?站?[Aa]出口|金荣达))/u
// 匹配其它格式：无园区，列举特别格式的姓名
const USER_ESP_OTHER_NAME =
	/^\d+\.\s+((Linli.z|馮青菊（Lynette）🍜|痴迷、淡然|懒喵喵╮|倩倩Amoe💛|玲火火🔥|卷猫猫🐱|葫芦大侠_欢|。|WF🎵|@宋宋|ଳ|Uwangzuge🥨|💋YG_廖✨🌟|🌙 Moonlion|🍀Mʚ💋ɞ🍬|喵喵张😝|🍋 易湘娇|尐霏|宝妹儿~|维 维|danna ²⁰²⁰|Cindy。|Nancy。|🍀 杨茜|_Carina..💭|🌱Carina|_Carina🌱|🌻Xue、|🍭オゥシュゥ🍭|春春——E区 少饭|sᴛᴀʀʀʏ.|D区门岗-赵金亮)[ \-—_~～+]*[A-Ma-m]?)/u
// const USER_ECMIX_OTHER_NAME = /^\d+\.\s+(([\u4e00-\u9fa5]+ *[A-Za-z]*|[A-Za-z]+ *[\u4e00-\u9fa5]*|\d+)[ \-—_~～+]*[A-Ma-m]?)/u
const USER_ECMIX_OTHER_NAME =
	/^\d+\.\s+(([\u4e00-\u9fa5]+[ \-—_~～+]*[A-Za-z]*|[A-Za-z]+[ \-—_~～+]+[A-Za-z]+|[A-Za-z]+[ \-—_~～+]*[\u4e00-\u9fa5]*|\d+)[🌱🍀🍃🌵🌻🌼🌸🍉🍭🎈🐟🦋🐝🌈🌟✨🎀💋💤💦● ོ་]*[ \-—_~～+]*[A-Ma-m]?)/u
/* eslint-enable no-misleading-character-class */

const USER_REGEXPS = [
	USER_AREA_ECMIX,
	USER_NAME_AREA,
	USER_CENAME_AREA,
	USER_ECNAME_AREA,
	USER_ECMIX_AREA,
	USER_ESP_OTHER_NAME,
	USER_ECMIX_OTHER_NAME,
]
const OTHER_REGEXPS = [USER_ESP_OTHER_NAME, USER_ECMIX_OTHER_NAME]

function getName(jielong, area) {
	// 当存在大写份数时截取份数之前的文本
	const cResult = /[零一二两三四五六七八九十百千万亿]+[份分个]/.exec(jielong)
	if (cResult) {
		jielong = jielong.slice(0, cResult.index)
	}
	let regexps
	if (area === OTHER) {
		regexps = OTHER_REGEXPS
	} else {
		regexps = USER_REGEXPS
	}

	let findName
	for (const i in regexps) {
		const result = regexps[i].exec(jielong)
		if (result && result[1]) {
			findName = result[1].trim()
			// console.log(i, findName, regexps.length, regexps[i])
			break
		}
	}
	if (findName === undefined) {
		console.log('当前接龙未匹配到用户', jielong)
		findName = ''
	}

	return findName
}

function getFactor(jielong) {
	// 匹配是否有取消操作(负操作)
	const cancelMatched = CANCEL_REGEX.exec(jielong)
	let factor // 正负操作因子，对应份数操作
	if (cancelMatched && cancelMatched[1]) {
		if (cancelMatched[2] === '') {
			// 当未匹配到取消份数
			factor = 0
		} else {
			factor = -1
		}
	} else {
		factor = 1
	}

	return factor
}

function getCount(jielong) {
	const cMatched = COUNT_REGEXP.search.exec(jielong)
	let count
	if (cMatched) {
		if (cMatched[6] === '单点') {
			count = 0 // 单点不算套餐份数
		} else if (cMatched[3]) {
			count = Number(cMatched[3])
		} else if (cMatched[4]) {
			if (cMatched[1] === '第') {
				// 出现第...份，算一份
				count = 1
			} else {
				count = window.ChineseToNumber(cMatched[4])
			}
		} else {
			count = 1
		}
	} else {
		const aMatched = COUNT_REGEXP.add.exec(jielong)
		if (aMatched) {
			if (aMatched[3]) {
				count = Number(aMatched[3])
			} else if (aMatched[4]) {
				count = window.ChineseToNumber(aMatched[4])
			} else {
				count = 1
			}
		} else {
			count = 1
		}
	}

	return count
}

const chnNumInVegName = {
	三: ['鲜', '色', '色蔬', '杯杏鲍菇'],
	四: ['季豆', '棱豆'],
	九: ['芽', '层塔'],
}

function hasChnNumInName(countNum, word) {
	function isChnNumName(word, vegNames) {
		return vegNames.some(vegName => word.startsWith(vegName))
	}

	for (const chnNum in chnNumInVegName) {
		if (countNum === chnNum && isChnNumName(word, chnNumInVegName[chnNum])) {
			return true
		}
	}
	return false
}

function getChangeVegConds(COND_REGEXP, rjielong, jielongObj) {
	const { type, search: searchRegex, output } = COND_REGEXP
	const { jielong, factor, conditions } = jielongObj
	const matchWords = []
	let fromIndex = 0
	let result
	while ((result = searchRegex.exec(rjielong))) {
		const matched = result[0]
		if (!matched) {
			continue
		}
		let hasCount
		let count // 当前接龙每次匹配条件份数
		let word = result[6]
		if (result[2] === '都是') {
			hasCount = false
			count = jielongObj.count
		} else if (result[4]) {
			hasCount = true
			count = Number(result[4])
		} else if (result[5]) {
			if (hasChnNumInName(result[5], word)) {
				hasCount = false
				count = 1
				word = `${result[5]}${word}`
			} else {
				hasCount = true
				count = window.ChineseToNumber(result[5])
			}
		} else {
			hasCount = false
			count = 1
		}
		count *= factor
		// 原始 jielong 中找到所在位置
		// const word = matched.slice(1)
		const start = jielong.indexOf(word, fromIndex)
		const end = start + word.length
		conditions.push({ type, hasCount, count, output, word, start, end })
		fromIndex = end
		matchWords.push(word) // 需要被替换的匹配词
	}

	// 在 while 匹配过程中不能直接 replace，因为 searchRegex lastIndex 有状态
	return matchWords.reduce((replaced, word) => replaced.replace(word, ''), rjielong)
}

function getPlainConds(COND_REGEXP, rjielong, jielongObj) {
	const { jielong, factor, conditions } = jielongObj
	const { type, search: searchRegex, output, noReplace } = COND_REGEXP
	const matchWords = []
	let fromIndex = 0
	let result
	while ((result = searchRegex.exec(rjielong))) {
		const matched = result[0]
		// 检查接龙目标词后一位置是否有换字，有则放弃此次匹配
		if (!matched || /[换換]/.test(rjielong[result.index + matched.length])) {
			continue
		}
		if (searchRegex === MORE_RICE || searchRegex === LESS_RICE) {
			if (result[3] === undefined && result[6] === '') {
				if (/[杂饭河粉面条瓜薯]/.test(matched[matched.length - 2])) {
					continue
				}
			}
		}
		if (searchRegex === SELF_BOX) {
			// [飯餐饭]盒：当盒字前有汉字时，若不是[飯餐饭]则放弃此次匹配
			if (/[\u4e00-\u98ee\u98f0-\u9909\u9911-\u996c\u996e-\u9fa5]/.test(matched[matched.length - 2])) {
				continue
			}
		}
		if (searchRegex === NOODLES) {
			// 如果是炒面筋，则放弃此次匹配
			if (/筋/.test(rjielong[result.index + matched.length])) {
				continue
			}
		}
		let more = 0
		let less = 0
		let hasCount
		let count // 当前接龙每次匹配条件份数
		let numFollow
		let chnFollow
		if (searchRegex === LESS_RICE) {
			numFollow = result[result.length - 3]
			chnFollow = result[result.length - 2]
		}
		if (result[4] || numFollow) {
			hasCount = true
			count = Number(result[4] || numFollow)
		} else if (result[5] || chnFollow) {
			hasCount = true
			count = window.ChineseToNumber(result[5] || chnFollow)
		} else {
			hasCount = false
			count = 1
		}
		count *= factor
		const suffix = result[result.length - 1]
		if (suffix === '多') {
			more = count
		} else if (suffix === '少') {
			less = count
		}
		// 原始 jielong 中找到所在位置
		// const word = matched.slice(1)
		const word = result[6]
		const start = jielong.indexOf(word, fromIndex)
		const end = start + word.length
		conditions.push({ type, hasCount, count, more, less, output, word, start, end })
		fromIndex = end
		matchWords.push(word) // 需要被替换的匹配词
	}

	if (noReplace) {
		return rjielong
	}
	// 在 while 匹配过程中不能直接 replace，因为 searchRegex lastIndex 有状态
	return matchWords.reduce((replaced, word) => replaced.replace(word, ''), rjielong)
}

/**
 * 复合条件判定
 * @param {object} param0
 */
function getComplexConds({ jielong, count, conditions }) {
	if (count === 1 && conditions.length > 1) {
		conditions.forEach(condition => {
			condition.isComplex = true
		})
	} else {
		const conditionMap = {}
		let starts = []
		let ends = []
		conditions.map(condition => {
			const { start, end } = condition
			conditionMap[start] = condition
			starts.push(start)
			ends.push(end)
		})
		starts = starts.sort((a, b) => a - b)
		ends = ends.sort((a, b) => a - b)
		for (let i = 0; i < starts.length - 1; i++) {
			// 检查各条件两两之间是否有空格等分割字符，若没有则判定该接龙存在复合条件
			const current = starts[i]
			const next = starts[i + 1]
			const betweenCond = jielong.slice(current, next)
			if (!SEPARATE_REGEX.test(betweenCond)) {
				conditionMap[current].isComplex = true
				conditionMap[next].isComplex = true
				conditionMap[current].next = conditionMap[next]
				conditionMap[next].prev = conditionMap[current]
			}
		}
	}
}

function hasComplex(conditions) {
	return conditions.some(condition => condition.isComplex)
}

// eslint-disable-next-line no-unused-vars
function sortById(jielongList) {
	return jielongList.sort((a, b) => {
		if (Number(a.id) < Number(b.id)) {
			return -1
		}
		if (Number(a.id) > Number(b.id)) {
			return 1
		}
		return 0
	})
}

// eslint-disable-next-line no-unused-vars
function sortByPaid(jielongList) {
	const paid = []
	const noPaid = []
	jielongList.forEach(jielongObj => {
		if (jielongObj.isPaid) {
			paid.push(jielongObj)
		} else {
			noPaid.push(jielongObj)
		}
	})

	return [...paid, ...noPaid]
}

// eslint-disable-next-line no-unused-vars
function sortByComplex(jielongList) {
	const complexList = []
	const noComplexList = []
	jielongList.forEach(jielongObj => {
		const { conditions } = jielongObj
		if (hasComplex(conditions)) {
			complexList.push(jielongObj)
		} else {
			noComplexList.push(jielongObj)
		}
	})

	return [...complexList, ...noComplexList]
}

/**
 * 打印接龙分区数据
 * @param {*} areaGroup
 */
function printAreaGroup(areaGroup, isSettling) {
	let result = '<div><strong>## 接龙分区</strong><br><br>'
	for (const area in areaGroup) {
		const areaList = areaGroup[area]
		let jielongDisplay
		if (areaList.length) {
			// jielongDisplay = sortByComplex(sortByPaid(areaList)).map(jielongObj => {
			jielongDisplay = areaList
				.map(jielongObj => {
					const { jielong, count, isPaid, amount, isSettled, conditions, factor, parent } = jielongObj
					if (factor === 0) {
						if (CANCEL_CURRENT.test(jielong)) {
							return `<strong style="color: red">${jielong}（不计数）</strong>`
						}
						const display = `${jielong}（取消失败，格式请标明：取消n份、-n份、-n份[条件]、-n[条件]）`
						return `<strong style="color: red">${display}</strong>`
					} else if (factor === -1) {
						let display = jielong
						if (getUserCount(jielongObj) < 0) {
							if (parent) {
								display += '（取消失败，超过取消份数）'
							} else {
								display += '（取消失败，不可取消他人）'
							}
						}
						return `<strong style="color: red">${display}</strong>`
					}

					if (isSettling) {
						let display = jielong
						if (amount !== undefined) {
							display += `（金额: ¥${amount}）`
						}
						if (isSettled) {
							// return `<span style="color: darkolivegreen">${display}</span>`
							return `<span style="color: green">${display}</span>`
						}
						return `<span style="color: orange">${display}</span>`
					}

					if (maxCount(conditions) > count) {
						// count === 1 && conditions.length > 1 &&
						return `<strong style="color: purple">${jielong}（条件份数超过订餐份数，计${maxCount(
							conditions,
						)}份）</strong>`
					}
					if (hasComplex(conditions)) {
						return `<strong style="color: orange">${jielong}</strong>`
					}
					if (isPaid) {
						return `<strong style="color: green">${jielong}</strong>`
					}
					return jielong
				})
				.join('<br>')
		} else {
			jielongDisplay = ''
		}
		result += `<span>${area}</span>：<br><div>${jielongDisplay}</div><br>`
	}
	result += '</div>'
	document.querySelector('.jielong-area').innerHTML = result
}

function printComplexObj(complexObj) {
	let complexOutputs = []
	let complexTotal = 0
	for (const key in complexObj) {
		if (key !== 'type') {
			const { count, outputs } = complexObj[key]
			complexOutputs = complexOutputs.concat(outputs)
			complexTotal += count
		}
	}

	if (complexOutputs.length) {
		// return `<span style="color: orange"><br>${complexTotal}复合{${complexOutputs.join(' ')}}</span>`
		return `<span style="color: orange">${complexTotal}复合{${complexOutputs.join(' ')}}</span>` // 【】
	}
	return ''
}

function printPriceObj(countObj) {
	const { type, count, output } = countObj
	const price = PRICE_TYPE_MAP[type]
	// 数量和价格均大于0时打印
	if (count > 0 && price > 0) {
		let countDisplay
		if (type === 'mealCount') {
			countDisplay = `<strong style="color: #1f78d1">${count}${output}</strong>`
		} else {
			countDisplay = `<span>${count}${output}</span>`
		}
		const priceDisplay = `<span style="color: grey">(${price}×${count}=${price * count}元)</span>`
		return `${countDisplay}${priceDisplay}`
	}
	return ''
}

function printCountObj(countObj) {
	if (countObj.hidden) {
		return ''
	}
	// eslint-disable-next-line no-unused-vars
	const { type, count, output, more, less, complex } = countObj
	// if (type === 'complexConds') {
	//     return printComplexObj(countObj)
	// }
	// 数量为0或负数时不打印
	if (count > 0) {
		if (type === 'mealCount') {
			return `<strong style="color: #1f78d1">${count}${output}</strong>`
		}
		let moreOrLess = ''
		if (more && more > 0) {
			moreOrLess += `${count === 1 && more === 1 ? '' : more}多`
		}
		if (less && less > 0) {
			moreOrLess += `${count === 1 && less === 1 ? '' : less}少`
		}
		moreOrLess = moreOrLess.length ? `(${moreOrLess})` : ''
		const display = `${count}${output}${moreOrLess}`
		// if (complex) {
		//     display = `${display}<span style="color: orange">{${complex}}</span>`
		// }
		return display
	}
	return ''
}

/**
 * 显示某区统计
 * @param {*} area
 * @param {*} countList
 */
// eslint-disable-next-line no-unused-vars
function printCountList(area, countList) {
	const countDisplay = countList.map(printCountObj).join(' ')
	const result = `<div><strong>## ${area}统计</strong><br><br>${countDisplay}<br><br></div>`
	document.querySelector('.jielong-statistics').innerHTML = result
}

function printCountObj2(countObj) {
	const { type, count, output } = countObj
	if (type === 'mealCount') {
		return `<strong style="color: #1f78d1">${count}${output}</strong>`
	}
	return output
}

/**
 * 显示某区统计2
 * @param {*} area
 * @param {*} countList
 */
function printCountList2(area, countList) {
	let countDisplay = ''
	countList.map(printCountObj2).forEach((output, index) => {
		if (index === 0) {
			countDisplay += output
		} else if (index === 1) {
			countDisplay += ` (${output}`
		} else {
			countDisplay += ` ${output}`
		}

		if (index === countList.length - 1) {
			countDisplay += ')'
		}
	})
	const result = `<div><strong>## ${area}统计</strong><br><br>${countDisplay}<br><br></div>`
	document.querySelector('.jielong-statistics').innerHTML = result
}

/**
 * 打印各区份数
 * @param {*} countGroup
 */
function printCountGroup(countGroup) {
	let result = '<div><strong>## 各区份数</strong><br><br>'
	const complexList = []
	for (const area in countGroup) {
		const countList = countGroup[area]
		let areaIcon
		if (area === '合计') {
			areaIcon = '💫'
		} else {
			areaIcon = '✨'
			const complexObj = countList[countList.length - 1]
			if (Object.keys(complexObj).length > 1) {
				const complexDisplay = printComplexObj(complexObj)
				complexList.push(`🌟${area}: ${complexDisplay}`)
			}
		}
		const countDisplay = countList.map(printCountObj).join(' ')
		result += `${areaIcon}${area}: ${countDisplay}<br>`
	}
	result += `<br>${complexList.join('<br>')}<br><br></div>`
	document.querySelector('.jielong-statistics').innerHTML = result
}

/**
 * 打印各区金额
 * @param {*} countGroup
 */
function printAmountGroup(countGroup) {
	let result = '<div><strong>## 各区金额</strong><br><br>'
	for (const area in countGroup) {
		const countObjs = countGroup[area]
		const [mealCount] = countObjs
		if (mealCount.count > 0 || countObjs.length > 1) {
			let areaIcon
			if (area === '合计') {
				areaIcon = '💫'
			} else {
				areaIcon = '✨'
			}
			const countPrintList = []
			const amountList = []
			countObjs.forEach(countObj => {
				const { type, count } = countObj
				const price = PRICE_TYPE_MAP[type]
				// 数量和价格均大于0时打印
				if (count > 0 && price > 0) {
					countPrintList.push(printPriceObj(countObj))
					amountList.push(price * count)
				}
			})
			const countDisplay = countPrintList.join(' ')
			const amountDisplay = `<strong style="color: green">共${amountList.reduce((a, b) => a + b, 0)}元</strong>`
			result += `${areaIcon}${area}: ${countDisplay} ${amountDisplay}<br>`
		}
	}
	result += '<br></div>'
	document.querySelector('.jielong-amount').innerHTML = result
}

/**
 * 打印各区送餐消息
 * @param {*} deliveryGroup
 */
function printDeliveryGroup(deliveryGroup) {
	let result = `<div><strong>## 送餐消息</strong><br><br>7分钟到云谷<br><br>灰色本田～粤B89G18<br><br>`
	// let result = `<div><strong>## 送餐消息</strong><br><br>7分钟到云谷<br><br>银色五菱～粤B598J7<br><br>`
	const pathList = []
	const putList = []
	for (const area in deliveryGroup) {
		const { gate, put } = findAREAByName(area)
		result += `✨${gate}：${deliveryGroup[area].join(' ')}<br>`
		// result += `✨${gate}：${deliveryGroup[area].sort().join(' ')}<br>`
		// result += `✨${gate}：${sortByMixWords(deliveryGroup[area]).join(' ')}<br>`
		// 送餐路线仅展示有订餐的区
		if (deliveryGroup[area].length) {
			pathList.push(gate)
			if (put) {
				putList.push(gate)
			}
		}
	}
	result += `<br>💫路线：${pathList.join('～')}（${putList.join('、')}可放餐）</div>`
	document.querySelector('.jielong-delivery').innerHTML = result
}

/**
 * 显示账单列表区域
 */
function showPaidList() {
	document.querySelector('.jielong-area').style.display = 'none'
	document.querySelector('.jielong-output').style.display = 'none'
	document.querySelector('.benefic-list').style.display = 'block'
}

/**
 * 显示统计结算区域
 */
function showAreaOutput() {
	document.querySelector('.jielong-area').style.display = 'block'
	document.querySelector('.jielong-output').style.display = 'block'
	document.querySelector('.benefic-list').style.display = 'none'
}

/**
 * 单区统计
 */
document.querySelector('#single-button').onclick = function handleSingle() {
	const inputJielong = document.querySelector('.jielong-input > textarea').value
	if (!inputJielong) {
		alert('请输入接龙')
		return
	}
	showAreaOutput()
	document.querySelector('.daily-settle').innerHTML = ''
	const jielongContent = inputJielong.slice(inputJielong.indexOf('1. '))
	const { list, map } = parseJielong(jielongContent.split('\n'))
	console.log('parseJielong list, map: ', list, map)
	// const countList = countByArea(list)
	// printCountList('单区', countList)
	const countList2 = countByArea2(list)
	console.log('countByArea2: countList2', countList2)
	printCountList2('单区', countList2)
}

/**
 * 各区统计
 */
document.querySelector('#all-button').onclick = function handleAll() {
	const inputJielong = document.querySelector('.jielong-input > textarea').value
	if (!inputJielong) {
		alert('请输入接龙')
		return
	}
	showAreaOutput()
	document.querySelector('.daily-settle').innerHTML = ''
	const jielongContent = inputJielong.slice(inputJielong.indexOf('1. '))
	const { list, map } = parseJielong(jielongContent.split('\n'))
	console.log('parseJielong list, map: ', list, map)
	const areaGroup = groupAreaAll(list, ['name', 'regex'])
	const deliveryGroup = deliveryAreaAll(areaGroup)
	const countGroup = countAreaAll(areaGroup)
	printAreaGroup(areaGroup)
	printDeliveryGroup(deliveryGroup)
	printCountGroup(countGroup)
	printAmountGroup(countGroup)
}

document.querySelector('#check-button').onclick = async function handleCheck() {
	const inputPaidFile = document.querySelector('input[type="file"]').files[0]
	if (!inputPaidFile) {
		alert('请选择微信支付账单')
		return
	}
	const inputJielong = document.querySelector('.jielong-input > textarea').value
	if (!inputJielong) {
		alert('请输入接龙')
		return
	}
	showPaidList()
	try {
		const jielongContent = inputJielong.slice(inputJielong.indexOf('1. '))
		const jielongOutput = jielongContent
			.split('\n')
			.filter(lineContent => {
				return getId(lineContent)
			})
			.join('\n')
		document.querySelector('.jielong-input > textarea').value = jielongOutput

		// 计算收款总金额和table
		const paidFileData = await readPaidFile(inputPaidFile)
		const paidCheckList = (window.paidCheckList = parseCSVContent(paidFileData))
		console.log('paidCheckList', paidCheckList)
		const table = renderPaidTable(paidCheckList)
		const paidAmount = countPaidAmount(paidCheckList)
		const checkedList = paidCheckList.filter((arr, index) => index > 0 && arr[0])
		const checkedAmount = countCheckedAmount(checkedList)
		// 计算接龙总金额
		const { list, map } = parseJielong(jielongContent.split('\n'))
		console.log('parseJielong list, map: ', list, map)
		const countList = countByArea(list)
		const jielongAmount = (window.jielongAmount = countJielongAmount(countList))
		console.log('jielongAmount', jielongAmount)
		document.querySelector('.amount-total').innerHTML = `
		<span style="color: orange; font-size: 13px">💰应收款：¥${jielongAmount}元；</span>
		<span style="color: green; font-size: 14px">已收款：¥${paidAmount}元；</span>
		<span style="color: #69a5f2; font-size: 15px">已核对：¥${checkedAmount}元。</span>`
		document.querySelector('.paid-table').innerHTML = table
	} catch (err) {
		console.error(err)
	}
}

document.querySelector('#settle-button').onclick = async function onSettleAccounts() {
	const inputJielong = document.querySelector('.jielong-input > textarea').value
	if (!inputJielong) {
		alert('请输入接龙')
		return
	}
	const inputPaidFile = document.querySelector('input[type="file"]').files[0]
	if (!inputPaidFile) {
		alert('请选择微信支付账单')
		return
	}
	showAreaOutput()
	const jielongContent = inputJielong.slice(inputJielong.indexOf('1. '))
	const { list } = parseJielong(jielongContent.split('\n'))
	console.log('支付结算，parseJielong list:', list)
	try {
		const paidFileData = await readPaidFile(inputPaidFile)
		if (list && list.length > 0) {
			const settleResult = settleAccounts(list, paidFileData)
			const areaGroup = groupAreaAll(list, ['name', 'regex'])
			printAreaGroup(areaGroup, true)
			printDailySettle(settleResult)
		} else {
			alert('接龙列表为空')
		}
	} catch (err) {
		console.error(err)
	}
}

document.querySelector('.daily-settle').addEventListener('click', event => {
	const el = event.target
	if (el.parentNode.parentNode.className.includes('not-paid-list')) {
		const index = el.getAttribute('data-index')
		notPaidOnSelect(Number(index), el)
	} else if (el.parentNode.parentNode.className.includes('not-settle-list')) {
		const index = el.getAttribute('data-index')
		notSettleOnSelect(Number(index), el)
	}

	event.preventDefault()
	event.stopPropagation()
})

const SETTLE_TEMPLATE = `<strong>## 每日结算</strong><br><br>
<div class="not-paid-list">
  <span>
    <i class="el-icon-question"></i>
    接龙未付：
  </span>
  <div class="name-list"></div>
</div>
<div class="not-settle-list">
  <span>
    <i class="el-icon-question"></i>
    支付未核：
  </span>
  <div class="name-list"></div>
</div>
<br>
<div class="jielong-paid-list">
  <span>
    <i class="el-icon-check"></i>
    接龙已付：
  </span>
  <div class="name-list"></div>
</div>
<div class="paid-settle-list">
  <span>
    <i class="el-icon-check"></i>
    支付已核：
  </span>
  <div class="name-list"></div>
</div>
<br>
<div class="jielong-user-list">
  <span>
    <i class="el-icon-s-order"></i>
    接龙名单：
  </span>
  <div class="name-list"></div>
</div>
<div class="paid-user-list">
  <span>
    <i class="el-icon-s-order"></i>
    支付名单：
  </span>
  <div class="name-list"></div>
</div>`
function printDailySettle({
	jielongUserList,
	jielongPaidList,
	jielongNotPaidList,
	paidUserList,
	paidSettleList,
	paidNotSettleList,
	notPaidIndex = -1,
	notSettleIndex = -1,
}) {
	document.querySelector('.jielong-amount').innerHTML = ''
	document.querySelector('.jielong-statistics').innerHTML = ''
	document.querySelector('.jielong-delivery').innerHTML = ''
	if (!document.querySelector('.daily-settle').innerHTML) {
		// <button onclick="undoSettle">撤销</button>
		document.querySelector('.daily-settle').innerHTML = SETTLE_TEMPLATE
	}
	if (ofType(jielongUserList, 'Array')) {
		document.querySelector('.daily-settle > .jielong-user-list > .name-list').innerHTML = jielongUserList
			.map(jielongObj => `<span style="color: #1f78d1">${jielongObj.name}</span>`)
			.join('，')
	}
	if (ofType(jielongPaidList, 'Array')) {
		document.querySelector('.daily-settle > .jielong-paid-list > .name-list').innerHTML = jielongPaidList
			.map(({ name, handSettled }) => {
				let settledClass = ''
				if (handSettled) {
					settledClass = 'handle-settled'
				}
				return `<span class="${settledClass}" style="color: green">${name}</span>`
			})
			.join('，')
	}
	if (ofType(jielongNotPaidList, 'Array')) {
		document.querySelector('.daily-settle > .not-paid-list > .name-list').innerHTML = jielongNotPaidList
			.map((jielongObj, index) => {
				let settlingClass = ''
				if (notPaidIndex === index) {
					settlingClass = 'settling'
				}
				return `<span class="${settlingClass}" data-index="${index}">${jielongObj.name}</span>`
			})
			.join('，')
	}
	if (ofType(paidUserList, 'Array')) {
		document.querySelector('.daily-settle > .paid-user-list > .name-list').innerHTML = paidUserList
			.map(paidRecord => `<span style="color: #1f78d1">${paidRecord.exchangeUser}</span>`)
			.join('，')
	}
	if (ofType(paidSettleList, 'Array')) {
		document.querySelector('.daily-settle > .paid-settle-list > .name-list').innerHTML = paidSettleList
			.map(({ exchangeUser, handSettled }) => {
				let settledClass = ''
				if (handSettled) {
					settledClass = 'handle-settled'
				}
				return `<span class="${settledClass}" style="color: green">${exchangeUser}</span>`
			})
			.join('，')
	}
	if (ofType(paidNotSettleList, 'Array')) {
		document.querySelector('.daily-settle > .not-settle-list > .name-list').innerHTML = paidNotSettleList
			.map((paidRecord, index) => {
				let settlingClass = ''
				if (notSettleIndex === index) {
					settlingClass = 'settling'
				}
				return `<span class="${settlingClass}" data-index="${index}">${paidRecord.exchangeUser}</span>`
			})
			.join('，')
	}
}

// ====todo====
// eslint-disable-next-line no-unused-vars
function renderName({ index, name, adder, remover }) {
	return `<span style="font-weight: 500; color: orange" onclick="${adder}(this, ${index}, ${name})">${name}</span>`
}
// undo todo history 加入 vuex store?
// function undoSettle() {}
// ====todo====

function checkAmount(jielongObj, paidRecord) {
	const matchOutput = `接龙名：${jielongObj.name}，应付金额：¥${jielongObj.amount}\n支付名：${paidRecord.exchangeUser}，已付金额：¥${paidRecord.amount}`
	console.log(matchOutput)
	if (jielongObj.amount !== paidRecord.amount) {
		return `💰金额不匹配！\n${matchOutput}`
	}
	return ''
}

let notPaidIndex = -1
let notSettleIndex = -1
function notPaidOnSelect(index, el) {
	const { jielongPaidList, jielongNotPaidList, paidSettleList, paidNotSettleList } = window.settleResult
	if (notSettleIndex > -1) {
		// const classList = el.className.split(' ')
		// if (classList.indexOf('settling') === -1) {
		//     el.className += ' settling'
		// }
		printDailySettle({
			jielongNotPaidList,
			notPaidIndex: index,
		})
		const jielongObj = jielongNotPaidList[index]
		const paidRecord = paidNotSettleList[notSettleIndex]
		let checkedMsg
		if ((checkedMsg = checkAmount(jielongObj, paidRecord))) {
			const d = setTimeout(() => {
				alert(checkedMsg)
				notPaidIndex = -1
				printDailySettle({
					jielongNotPaidList,
					notPaidIndex,
				})
				clearTimeout(d)
			}, 700)
			return
		}
		jielongObj.handSettled = true
		paidRecord.handSettled = true
		jielongPaidList.push(jielongObj)
		paidSettleList.push(paidRecord)
		jielongNotPaidList.splice(index, 1)
		paidNotSettleList.splice(notSettleIndex, 1)
		notPaidIndex = -1
		notSettleIndex = -1
		const d = setTimeout(() => {
			printDailySettle({
				jielongPaidList,
				jielongNotPaidList,
				paidSettleList,
				paidNotSettleList,
				notPaidIndex,
				notSettleIndex,
			})
			clearTimeout(d)
		}, 700)
	} else if (notPaidIndex === index) {
		notPaidIndex = -1
		printDailySettle({
			jielongNotPaidList,
			notPaidIndex,
		})
	} else {
		notPaidIndex = index
		printDailySettle({
			jielongNotPaidList,
			notPaidIndex,
		})
	}
}

function notSettleOnSelect(index, el) {
	const { jielongPaidList, jielongNotPaidList, paidSettleList, paidNotSettleList } = window.settleResult
	if (notPaidIndex > -1) {
		// const classList = el.className.split(' ')
		// if (classList.indexOf('settling') === -1) {
		//     el.className += ' settling'
		// }
		printDailySettle({
			paidNotSettleList,
			notSettleIndex: index,
		})
		const jielongObj = jielongNotPaidList[notPaidIndex]
		const paidRecord = paidNotSettleList[index]
		let checkedMsg
		if ((checkedMsg = checkAmount(jielongObj, paidRecord))) {
			const d = setTimeout(() => {
				alert(checkedMsg)
				notSettleIndex = -1
				printDailySettle({
					paidNotSettleList,
					notSettleIndex,
				})
				clearTimeout(d)
			}, 700)
			return
		}
		paidNotSettleList[index].handSettled = true
		jielongNotPaidList[notPaidIndex].handSettled = true
		paidSettleList.push(paidNotSettleList[index])
		jielongPaidList.push(jielongNotPaidList[notPaidIndex])
		paidNotSettleList.splice(index, 1)
		jielongNotPaidList.splice(notPaidIndex, 1)
		notSettleIndex = -1
		notPaidIndex = -1
		const d = setTimeout(() => {
			printDailySettle({
				jielongPaidList,
				jielongNotPaidList,
				paidSettleList,
				paidNotSettleList,
				notPaidIndex,
				notSettleIndex,
			})
			clearTimeout(d)
		}, 700)
	} else if (notSettleIndex === index) {
		notSettleIndex = -1
		printDailySettle({
			paidNotSettleList,
			notSettleIndex,
		})
	} else {
		notSettleIndex = index
		printDailySettle({
			paidNotSettleList,
			notSettleIndex,
		})
	}
}

function settleAccounts(jielongList, paidFileData) {
	const paidRecords = parseRecords(paidFileData)
	for (let i = 0; i < jielongList.length; i++) {
		for (let j = 0; j < paidRecords.length; j++) {
			const jielongObj = jielongList[i]
			const paidRecord = paidRecords[j]
			if (isSame(jielongObj.name, paidRecord.exchangeUser)) {
				jielongObj.isSettled = true
				jielongObj.paidName = paidRecord.exchangeUser
				paidRecord.isSettled = true
				paidRecord.i = i // 保存接龙顺序索引，用于排序
				break
			}
		}
	}

	let jielongUserList = []
	const jielongPaidList = []
	let jielongNotPaidList = []
	jielongList.forEach(jielongObj => {
		const { isSettled } = jielongObj
		jielongUserList.push(jielongObj)
		if (isSettled) {
			jielongPaidList.push(jielongObj)
		} else {
			jielongNotPaidList.push(jielongObj)
		}
	})

	let paidUserList = []
	let paidSettleList = []
	let paidNotSettleList = []
	paidRecords.filter(paidRecord => {
		const { isSettled } = paidRecord
		paidUserList.push(paidRecord)
		if (isSettled) {
			paidSettleList.push(paidRecord)
		} else {
			paidNotSettleList.push(paidRecord)
		}
	})

	// 按照接龙顺序索引排序
	paidSettleList = paidSettleList.sort((a, b) => {
		if (a.i < b.i) {
			return -1
		}
		if (a.i > b.i) {
			return 1
		}
		return 0
	})

	jielongUserList = sortByWords(jielongUserList, 'name')
	paidUserList = sortByWords(paidUserList, 'exchangeUser')
	jielongNotPaidList = sortByWords(jielongNotPaidList, 'name')
	paidNotSettleList = sortByWords(paidNotSettleList, 'exchangeUser')

	return (window.settleResult = {
		jielongUserList,
		jielongPaidList,
		jielongNotPaidList,
		paidUserList,
		paidSettleList,
		paidNotSettleList,
	})
}

// eslint-disable-next-line no-unused-vars
const HEAD_TITLES = [
	'交易时间',
	'交易类型',
	'交易对方',
	'备注留言',
	'收/支',
	'金额(元)',
	'支付方式',
	'当前状态',
	'交易单号',
	'商户单号',
	'备注',
]
const HEAD_PROPS = [
	'exchangeTime',
	'exchangeType',
	'exchangeUser',
	'merchandise',
	'incomeOrExpenses',
	'amountDisplay',
	'payType',
	'status',
	'exchangeNo',
	'merchantNo',
	'remark',
]
const PAY_TYPES = ['二维码收款', '转账', '微信红包']
function parseCSVContent(paidFileData) {
	const allRows = paidFileData.split(/\r?\n|\r/).filter(line => line)
	const headIndex = allRows.findIndex(row => row.startsWith('交易时间')) // 定位到表格Title行
	const recordRows = allRows.slice(headIndex, allRows.length)
	const array = []
	for (let i = 0; i < recordRows.length; i++) {
		const singleRow = recordRows[i].replace(/\t|\"/g, '')
		const rowCells = singleRow.split(',').slice(0, 6)
		if (i === 0 || (PAY_TYPES.includes(rowCells[1]) && rowCells[4] === '收入')) {
			const arr = []
			arr[0] = false // checkbox checked值
			arr[2] = rowCells[2] // 交易对方
			arr[3] = rowCells[5] // 金额(元)
			arr[4] = rowCells[1] // 交易类型
			arr[5] = rowCells[3] // 备注留言
			arr[6] = rowCells[0] // 交易时间
			arr[7] = rowCells[4] // 收/支
			array.push(arr)
		}
	}
	array.sort((a, b) => {
		if (a[6] === '交易时间') {
			return -1
		}
		if (b[6] === '交易时间') {
			return 1
		}
		if (a[6] < b[6]) {
			return -1
		}
		if (a[6] > b[6]) {
			return 1
		}
		return 0
	})
	array.forEach((arr, index) => (arr[1] = index === 0 ? '序' : index)) // 序号
	// array.sort((a, b) => {
	//     if (a[4] === '交易类型') {
	//         return -1
	//     }
	//     if (b[4] === '交易类型') {
	//         return 1
	//     }
	//     if (a[4] < b[4]) {
	//         return -1
	//     }
	//     if (a[4] > b[4]) {
	//         return 1
	//     }
	//     return 0
	// })
	console.log('csv array', array)
	return array
}

function renderPaidTable(array) {
	// let table = '<table border="1">'
	let table = '<table border="1" style="width: 720px">'
	for (let i = 0; i < array.length; i++) {
		const arr = array[i]
		if (i === 0) {
			table += '<thead>'
			table += '<tr>'
		} else {
			table += '<tr>'
		}
		// arr[6] = false // 是否选中
		for (let j = 0; j < arr.length; j++) {
			if (i === 0) {
				if (j === 2) {
					table += '<th style="width: 112px">'
				} else if (j === 3) {
					table += '<th style="width: 66px">'
				} else if (j === 4) {
					table += '<th style="width: 86px">'
				} else if (j === 5) {
					table += '<th style="width: 170px">'
				} else if (j === 6) {
					table += '<th style="width: 155px">'
				} else {
					table += '<th>'
				}
				if (j === 0) {
					table += `<input type="checkbox" value="${arr[1]}" ${arr[j] ? 'checked' : ''} />`
				} else {
					table += `<span>${arr[j]}</span>`
				}
				table += '</th>'
			} else {
				table += '<td>'
				if (j === 0) {
					table += `<input type="checkbox" value="${arr[1]}" ${arr[j] ? 'checked' : ''} />`
				} else {
					table += `<span>${arr[j]}</span>`
				}
				table += '</td>'
			}
		}
		if (i === 0) {
			table += '</tr>'
			table += '</thead>'
			table += '<tbody>'
		} else {
			table += '</tr>'
		}
	}
	table += '</tbody>'
	table += '</table>'
	return table
}

function countPaidAmount(array) {
	let paidAmount = 0
	for (let i = 1; i < array.length; i++) {
		const arr = array[i]
		paidAmount += Number(arr[3].slice(1))
	}
	return paidAmount
}

function countCheckedAmount(checkedList) {
	return checkedList.reduce((total, arr) => total + Number(arr[3].slice(1)), 0)
}

function countJielongAmount(countObjs) {
	const amountList = []
	countObjs.forEach(countObj => {
		const { type, count } = countObj
		const price = PRICE_TYPE_MAP[type]
		// 数量和价格均大于0时打印
		if (count > 0 && price > 0) {
			amountList.push(price * count)
		}
	})
	return amountList.reduce((a, b) => a + b, 0)
}

document.querySelector('.benefic-list').addEventListener('click', event => {
	const el = event.target
	if (el.type === 'checkbox') {
		if (el.parentNode.tagName === 'TH') {
			window.paidCheckList.forEach(arr => (arr[0] = el.checked))
			const paidAmount = countPaidAmount(window.paidCheckList)
			const checkedList = window.paidCheckList.filter((arr, index) => index > 0 && arr[0])
			const checkedAmount = countCheckedAmount(checkedList)
			const table = renderPaidTable(window.paidCheckList)
			document.querySelector('.amount-total').innerHTML = `
			<span style="color: orange; font-size: 13px">💰应收款：¥${window.jielongAmount}元；</span>
			<span style="color: green; font-size: 14px">已收款：¥${paidAmount}元；</span>
			<span style="color: #69a5f2; font-size: 15px">已核对：¥${checkedAmount}元。</span>`
			document.querySelector('.paid-table').innerHTML = table
		} else if (el.parentNode.tagName === 'TD') {
			// 找到目标行数组，存checkbox状态
			const arr = window.paidCheckList.find(arr => arr[1] === Number(el.value))
			arr[0] = el.checked
			const paidAmount = countPaidAmount(window.paidCheckList)
			const checkedList = window.paidCheckList.filter((arr, index) => index > 0 && arr[0])
			const checkedAmount = countCheckedAmount(checkedList)
			document.querySelector('.amount-total').innerHTML = `
			<span style="color: orange; font-size: 13px">💰应收款：¥${window.jielongAmount}元；</span>
			<span style="color: green; font-size: 14px">已收款：¥${paidAmount}元；</span>
			<span style="color: #69a5f2; font-size: 15px">已核对：¥${checkedAmount}元。</span>`

			const allCheckbox = document.querySelector('input[value="序"]')
			if (el.checked && checkedList.length === 1) {
				allCheckbox.indeterminate = true
			}
			if (!el.checked && checkedList.length === window.paidCheckList.length - 2) {
				allCheckbox.indeterminate = true
				allCheckbox.checked = false
			}
			if (!el.checked && checkedList.length === 0) {
				allCheckbox.indeterminate = false
			}
			if (el.checked && checkedList.length === window.paidCheckList.length - 1) {
				allCheckbox.indeterminate = false
				allCheckbox.checked = true
			}
		}
	}
	event.stopPropagation()
})

function isSame(userName, paidName) {
	return userName.indexOf(paidName) > -1 || paidName.indexOf(userName) > -1
}

function parseRecords(paidFileData) {
	const allRows = paidFileData.split(/\r?\n|\r/)
	const headIndex = allRows.findIndex(row => row.startsWith('交易时间'))
	const recordRows = allRows.slice(headIndex, allRows.length)
	const records = []
	for (let i = 1; i < recordRows.length; i++) {
		// 从第一行开始
		const singleRow = recordRows[i].replace(/\t|\"/g, '')
		const rowCells = singleRow.split(',')
		const record = {}
		for (let j = 0; j < rowCells.length; j++) {
			record[HEAD_PROPS[j]] = rowCells[j]
			if (HEAD_PROPS[j] === 'amountDisplay') {
				record.amount = Number(rowCells[j].slice(1))
			}
		}
		records.push(record)
	}
	const paidRecords = records.filter(
		record => PAY_TYPES.includes(record.exchangeType) && record.incomeOrExpenses === '收入',
	)
	console.log(
		paidRecords.map(({ exchangeUser, amount, merchandise }) => ({
			exchangeUser,
			amount,
			merchandise,
		})),
	)
	const payAmount = paidRecords.reduce((total, record) => record.amount + total, 0)
	// console.log('records, paidRecords, payAmount', records, paidRecords, payAmount)
	console.log('paidRecords, payAmount', paidRecords, payAmount)
	return paidRecords
}

function readPaidFile(inputPaidFile) {
	const reader = new FileReader()
	return new Promise((resolve, reject) => {
		reader.onload = function onFileLoad(event) {
			const paidFileData = event.target.result
			// console.log('paidFileData', paidFileData)
			resolve(paidFileData, event)
		}
		reader.onerror = function onFileError(event) {
			alert('请重新选择账单文件!')
			console.error('Failed to read file! The event:\n\n', reader.error, event)
			reader.abort() // (...does this do anything useful in an onerror handler?)
			reject(reader.error, event)
		}
		reader.readAsText(inputPaidFile)
	})
}

function ofType(variable, Type) {
	return Object.prototype.toString.call(variable) === `[object ${Type}]`
}

/**
 * 中英文混排序，混合字符串排序
 * 注：中文拼音首字母和英文字母混排序
 * @param {*} words
 * @returns
 */
// eslint-disable-next-line no-unused-vars
function sortByMixWords(words) {
	if (!window.cnchar) {
		// if cnchar library not available
		return words.sort()
	}
	return words
		.map(word => {
			let pinyin
			if (/[\u4e00-\u9fa5]/.test(word)) {
				pinyin = word.spell('first')
			} else {
				pinyin = word
			}
			return { word, pinyin }
		})
		.sort((a, b) => {
			if (a.pinyin < b.pinyin) {
				return -1
			}
			if (a.pinyin > b.pinyin) {
				return 1
			}
			return 0
		})
		.map(({ word }) => word)
}

/**
 * 中英文混排序，对象关键字排序
 * 注：中文拼音首字母和英文字母混排序
 * @param {*} list
 * @param {*} key
 * @returns
 */
function sortByWords(list, key) {
	if (!window.cnchar) {
		// if cnchar library not available
		return list.sort((a, b) => {
			if (a[key] < b[key]) {
				return -1
			}
			if (a[key] > b[key]) {
				return 1
			}
			return 0
		})
	}
	return list
		.map(item => {
			const word = item[key]
			if (/[\u4e00-\u9fa5]/.test(word)) {
				item.pinyin = word.spell('first')
			} else {
				item.pinyin = word
			}
			return item
		})
		.sort((a, b) => {
			if (a.pinyin < b.pinyin) {
				return -1
			}
			if (a.pinyin > b.pinyin) {
				return 1
			}
			return 0
		})
}

// const words = ['@苹🍎😄果', '@苹😄😄果', '苹🍎🍎果', '苹果', '@枇杷', '@ 枇杷', '香蕉', '梨子', '菠萝', '葡萄']
// console.log(sortByMixWords(words))

// // 获取6.2接龙mock数据，写在下方，上方更好开发代码
// async function getJielongExample() {
// 	const response = await fetch('jielong6.2.txt')
// 	const example = await response.txt()
// 	document.querySelector('.jielong-input > textarea').value = example
// }
// getJielongExample()

document.querySelector('.jielong-input > textarea').value = `6.2 接龙数据：
尖椒炒腐竹，秋葵炒木耳，清香芋头丝，清炒芥菜，杂粮饭

已定餐要取消的请于10点50前通知店里，再取消接龙哈，谢谢！

主食不支持换菜，一定要换请加价5元

换菜备选：香干，糖醋莲藕，椒盐土豆块🥔 ，虎皮尖椒，豆腐，凉拌豆皮，凉拌豆芽，椒盐金针菇，椒盐茄盒等（套餐里目前支持换一种）

主食备选：白饭，炒饭，炒米粉，炒河粉，炒面条，蒸红薯🍠 ，蒸南瓜，（白粥收1元餐盒费，换白饭免费，换其他主食加2元，单点主食8元每盒750毫升方盒）

黑凉粉3元（450毫升圆碗）
小菜1元：开胃萝卜，自制下饭菜（放饭盒里）

目前送餐路线：云谷～E东～J南～F南～B东～D东～H西～微谷北（J区F区可放餐）

1. Leon H区 少饭
2. 索菲娅-云谷2栋
3. 葫芦大侠_欢  H区  少饭
4. 妮，E区东门，少饭少菜
5. 真真-F区 少少饭
6. WF🎵 云谷 少饭
7. 廖乐玲 F区
8. 刘展-J区 2份（1自备饭盒）
9. 果篮 云谷
10. 云谷11栋-葛原 少饭
11. 果果lynn🌈 H区 少饭
12. 。 云谷，米饭换红薯🍠
13. 张涛 H1，少饭
14. 果堃 H区 少饭1份
15. 🍀 杨茜H区 2份，其中1份杂粮饭换白米饭+芋头丝换虎皮尖椒，另1份芥菜换虎皮尖椒
16. Stacey H3，少饭
17. 媛媛 H1，4份（芋头丝换虎皮尖椒），2份换主食：炒米粉、南瓜
18. M h区 少饭 芥菜换金针菇
19. 陈湘—云谷A座
20. 云谷B座 11份.
21. 你猜  E1 1份（芥菜换虎皮尖椒）
22. 世静 E1 1份（炒腐竹换糖醋莲藕）
23. 晓萍 E1份 尖椒换莲藕
24. Fanni🌟 H区少饭
25. 小芸 金荣达 腐竹换糖醋莲藕  杂粮饭换南瓜
26. 申佳-D1`
