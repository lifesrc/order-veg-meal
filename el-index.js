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

const chnNumChar = {
	零: 0,
	一: 1,
	二: 2,
	三: 3,
	四: 4,
	五: 5,
	六: 6,
	七: 7,
	八: 8,
	九: 9,
	两: 2,
	壹: 1,
	贰: 2,
	叁: 3,
	肆: 4,
	伍: 5,
	陆: 6,
	柒: 7,
	捌: 8,
	玖: 9,
}

const chnNameValue = {
	十: { value: 10, secUnit: false },
	百: { value: 100, secUnit: false },
	千: { value: 1000, secUnit: false },
	拾: { value: 10, secUnit: false },
	佰: { value: 100, secUnit: false },
	仟: { value: 1000, secUnit: false },
	万: { value: 1000, secUnit: true },
	亿: { value: 1000000, secUnit: true },
}

function ChineseToNumber(chnStr) {
	let rtn = 0
	let section = 0
	let number = 0
	const chnList = chnStr.split('')
	if (chnList[0] === '十' || chnList[0] === '拾') {
		chnList.unshift('一')
	}

	for (let i = 0; i < chnList.length; i++) {
		const num = chnNumChar[chnList[i]]
		if (typeof num !== 'undefined') {
			number = num
			if (i === chnList.length - 1) {
				section += number
			}
		} else {
			const unit = chnNameValue[chnList[i]].value
			const secUnit = chnNameValue[chnList[i]].secUnit
			if (secUnit) {
				section = (section + number) * unit
				rtn += section
				section = 0
			} else {
				section += number * unit
			}
			number = 0
		}
	}
	return rtn + section
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
				count = ChineseToNumber(cMatched[4])
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
				count = ChineseToNumber(aMatched[4])
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
				count = ChineseToNumber(result[5])
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
			count = ChineseToNumber(result[5] || chnFollow)
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
function printAreaGroup(areaGroup, vm) {
	let result = '<div><strong>## 接龙分区</strong><br><br>'
	for (const area in areaGroup) {
		const areaList = areaGroup[area]
		let jielongDisplay
		if (areaList.length) {
			// jielongDisplay = sortByComplex(sortByPaid(areaList)).map(jielongObj => {
			jielongDisplay = areaList
				.map(jielongObj => {
					const { jielong, count, isPaid, conditions, factor, parent } = jielongObj
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
	vm.jielong.areaHTML = result
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
 * 打印各区份数
 * @param {*} countGroup
 */
function printCountGroup(countGroup, vm) {
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
	vm.jielong.statisticsHTML = result
}

/**
 * 打印各区金额
 * @param {*} countGroup
 */
function printAmountGroup(countGroup, vm) {
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
	vm.jielong.amountHTML = result
}

/**
 * 打印各区送餐消息
 * @param {*} deliveryGroup
 */
function printDeliveryGroup(deliveryGroup, vm) {
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
	vm.jielong.deliveryHTML = result
}

/**
 * 显示账单列表区域
 */
function showPaidList(vm) {
	vm.showJielongArea = false
	vm.showJielongOutput = false
	vm.showBeneficList = true
}

/**
 * 显示统计结算区域
 */
function showAreaOutput(vm) {
	vm.showJielongArea = true
	vm.showJielongOutput = true
	vm.showBeneficList = false
}

/**
 * 各区统计
 */
function handleAll() {
	const vm = this
	const inputJielong = vm.inputJielong
	if (!inputJielong) {
		alert('请输入接龙')
		return
	}
	showAreaOutput(vm)
	const jielongContent = inputJielong.slice(inputJielong.indexOf('1. '))
	const { list, map } = parseJielong(jielongContent.split('\n'))
	console.log('parseJielong list, map: ', list, map)
	const areaGroup = groupAreaAll(list, ['name', 'regex'])
	const deliveryGroup = deliveryAreaAll(areaGroup)
	const countGroup = countAreaAll(areaGroup)
	printAreaGroup(areaGroup, vm)
	printDeliveryGroup(deliveryGroup, vm)
	printCountGroup(countGroup, vm)
	printAmountGroup(countGroup, vm)
}

/**
 * 核对账单 check-button
 */
async function handleCheck() {
	const vm = this
	const inputPaidFile = vm.files[0]
	if (!inputPaidFile) {
		alert('请选择微信支付账单')
		return
	}
	const inputJielong = vm.inputJielong
	if (!inputJielong) {
		alert('请输入接龙')
		return
	}
	showPaidList(vm)
	try {
		const jielongContent = inputJielong.slice(inputJielong.indexOf('1. '))
		// const jielongOutput = jielongContent
		// 	.split('\n')
		// 	.filter(lineContent => {
		// 		return getId(lineContent)
		// 	})
		// 	.join('\n')
		// vm.inputJielong = jielongOutput
		// 计算接龙总金额
		const { list, map } = parseJielong(jielongContent.split('\n'))
		console.log('parseJielong list, map: ', list, map)
		const options = []
		list.forEach(({ id, name, jielong, amount, factor }, index) => {
			if (factor > 0) {
				let label = jielong
				if (amount !== undefined) {
					label += ` (金额: ¥${amount})`
				}
				const jump = false
				options.push({
					label,
					value: id,
					jielongName: `${id}. ${name}`,
					amount,
					jump,
				})
			}
		})
		vm.options = options
		vm.showJielongInput = false
		vm.showJielongChecked = true
		console.log('options', options)
		// 计算接龙应收款和支付已收款，并对应人数统计
		const countList = countByArea(list)
		const jielongAmount = countJielongAmount(countList)
		const paidFileData = await readPaidFile(inputPaidFile)
		vm.tableData = parsePaidRecords(paidFileData)
		const paidAmount = countPaidAmount(vm.tableData)
		const checkedAmount = countCheckedAmount(vm.selection)
		vm.totalAmount = {
			jielongAmount,
			paidAmount,
			checkedAmount,
			jielongCount: vm.options.length,
			paidCount: vm.tableData.length,
			checkedCount: vm.selection.length,
		}
	} catch (err) {
		console.error(err)
	}
}

// ====todo====
// eslint-disable-next-line no-unused-vars
// function renderName({ index, name, adder, remover }) {
// 	return `<span style="font-weight: 500; color: orange" onclick="${adder}(this, ${index}, ${name})">${name}</span>`
// }
// undo todo history 加入 vuex store?
// function undoSettle() {}
// ====todo====

function countPaidAmount(paidRecords) {
	let paidAmount = 0
	for (let i = 0; i < paidRecords.length; i++) {
		const record = paidRecords[i]
		paidAmount += record.amount
	}
	return paidAmount
}

function countCheckedAmount(selection) {
	return selection.reduce((total, record) => total + record.amount, 0)
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

// eslint-disable-next-line no-unused-vars
const HEAD_TITLES = [
	'交易时间',
	'交易类型',
	'交易对方',
	'备注留言/接龙名称',
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
function parsePaidRecords(paidFileData) {
	const allRows = paidFileData.split(/\r?\n|\r/)
	const headIndex = allRows.findIndex(row => row.startsWith('交易时间'))
	const recordRows = allRows.slice(headIndex, allRows.length)
	const records = []
	for (let i = 1; i < recordRows.length; i++) {
		// 从第一行开始
		const singleRow = recordRows[i].replace(/\t|\"/g, '')
		const rowCells = singleRow.split(',')
		const record = { id: i }
		for (let j = 0; j < rowCells.length; j++) {
			record[HEAD_PROPS[j]] = rowCells[j]
			if (HEAD_PROPS[j] === 'amountDisplay') {
				record.amount = Number(rowCells[j].slice(1))
			}
		}
		records.push(record)
	}
	const paidRecords = records
		.filter(record => PAY_TYPES.includes(record.exchangeType) && record.incomeOrExpenses === '收入')
		.reverse()
	let payAmount = 0
	paidRecords.forEach((paidRecord, index) => {
		paidRecord.id = `${index + 1}`
		payAmount += paidRecord.amount
	})
	console.log('paidRecords, payAmount', paidRecords, payAmount)
	console.log(
		paidRecords.map(({ id, exchangeUser, amount, merchandise }) => ({
			id,
			exchangeUser,
			amount,
			merchandise,
		})),
	)
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
// eslint-disable-next-line no-unused-vars
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

function handleSelectionChange(selection) {
	const vm = this
	let difference, flag
	if (selection.length > vm.selection.length) {
		// eslint-disable-next-line no-undef
		difference = _.difference(selection, vm.selection)
		flag = true
	} else {
		// eslint-disable-next-line no-undef
		difference = _.difference(vm.selection, selection)
		flag = false
	}
	vm.selection = selection
	vm.currentSelection = { difference, flag }

	const paidAmount = countPaidAmount(vm.tableData)
	const checkedAmount = countCheckedAmount(selection)
	vm.totalAmount = {
		...vm.totalAmount,
		paidAmount,
		checkedAmount,
		checkedCount: selection.length,
	}
}

function handleCheckSelect(checkSelectDiff, flag) {
	const vm = this
	if (flag) {
		checkSelectDiff.forEach(checkSelect => {
			const select = vm.selection.find(select => select.id === checkSelect.selectId)
			select._merchandise = select.merchandise // 保存 merchandise
			select.merchandise = checkSelect.jielongName // merchandise 改成 jielongName
		})
		vm.checkSelectList = vm.checkSelectList.concat(checkSelectDiff)
	} else {
		checkSelectDiff.forEach(checkSelect => {
			const row = vm.tableData.find(row => row.id === checkSelect.selectId)
			row.merchandise = row._merchandise // 回退 merchandise
		})
		// eslint-disable-next-line no-undef
		vm.checkSelectList = _.differenceWith(vm.checkSelectList, checkSelectDiff, _.isEqual)
	}
}

function handleHeadClick() {
	const vm = this
	vm.$refs.paidTable.toggleAllSelection()
}

function handleRowClick(row) {
	const vm = this
	vm.$refs.paidTable.toggleRowSelection(row)
}

function currentSelectionWatch({ difference, flag }) {
	const vm = this
	const options = vm.options
	const checkedList = vm.checkedList
	if (flag) {
		const checkSelectDiff = []
		const checkedMsgList = []
		for (let i = 0, j = 0; i < options.length && j < difference.length; i++) {
			const option = options[i]
			if (option.jump) {
				continue
			}
			const checkId = option.value
			const foundIndex = checkedList.indexOf(checkId)
			if (foundIndex === -1) {
				checkedList.push(checkId)
				const diff = difference[j++]
				const selectId = diff.id
				// checkedList.splice(foundIndex, 0, checkId)
				checkSelectDiff.push({ checkId, selectId, jielongName: `${option.jielongName}(¥${option.amount})` })
				if (option.amount !== diff.amount) {
					const checkedMsg = `<span>💰金额不匹配！接龙名：${option.jielongName}，应收款：¥${option.amount}；支付名：${diff.exchangeUser}，已收款：¥${diff.amount}</span>`
					checkedMsgList.push(checkedMsg)
				}
			}
		}
		if (checkedMsgList.length) {
			this.$message({
				type: 'warning',
				showClose: true,
				dangerouslyUseHTMLString: true,
				message: checkedMsgList.join('<br />'),
			})
		}
		vm.$emit('check-select', checkSelectDiff, flag)
	} else {
		const selectionDiffMap = {}
		difference.forEach(diff => {
			selectionDiffMap[diff.id] = true
		})
		const checkSelectDiff = vm.checkSelectList.filter(item => selectionDiffMap[item.selectId])
		for (let i = 0; i < checkSelectDiff.length; i++) {
			const checkSelect = checkSelectDiff[i]
			const foundIndex = checkedList.indexOf(checkSelect.checkId)
			if (foundIndex > -1) {
				checkedList.splice(foundIndex, 1)
			}
		}
		vm.$emit('check-select', checkSelectDiff, flag)
	}
}

/**
 * ==============分割线 Vue + Element 代码===============
 */
const Vue = window.Vue
const ElementUI = window.ELEMENT
console.log('ElementUI', ElementUI)

Vue.component('amount-total', {
	template: '#amount-total-template',
	props: {
		jielongAmount: {
			type: Number,
			default: 0,
		},
		paidAmount: {
			type: Number,
			default: 0,
		},
		checkedAmount: {
			type: Number,
			default: 0,
		},
		jielongCount: {
			type: Number,
			default: 0,
		},
		paidCount: {
			type: Number,
			default: 0,
		},
		checkedCount: {
			type: Number,
			default: 0,
		},
	},
})

Vue.component('paid-table', {
	template: '#paid-table-template',
	data() {
		return {
			head: [
				{ label: '', type: 'selection', width: 36 },
				{ label: '序', type: 'index', width: 40 },
				{ label: '交易对方', prop: 'exchangeUser', width: 116 },
				{ label: '金额(元)', prop: 'amountDisplay', width: 76 },
				{ label: '备注留言/接龙名称', prop: 'merchandise', width: 170 },
				{ label: '交易类型', prop: 'exchangeType', width: 94 },
				{ label: '交易时间', prop: 'exchangeTime', width: 155 },
				{ label: '收/支', prop: 'incomeOrExpenses', width: 60 },
			],
		}
	},
	props: {
		tableData: {
			type: Array,
			default() {
				return []
			},
		},
	},
	methods: {
		handleRowClick,
		handleHeadClick,
		getColumnClass(index) {
			if (index === 2) {
				return 'table__column--black'
			}
			if (index === 3) {
				return 'table__column--green'
			}
			if (index === 4) {
				return 'table__column--blue'
			}
			return ''
		},
	},
})

Vue.component('jielong-checkgroup', {
	template: '#jielong-checkgroup-template',
	data() {
		return {
			checkedList: [],
		}
	},
	props: {
		options: {
			type: Array,
			default() {
				return []
			},
		},
		currentSelection: {
			type: Object,
			default() {
				return {
					difference: [],
					flag: false,
				}
			},
		},
		checkSelectList: {
			type: Array,
			default() {
				return []
			},
		},
	},
	methods: {
		handleCheckedChange(checkedList) {
			// const checkedOptions = checkedList.map(checkId => {
			// 	return this.options.find(option => option.value === checkId)
			// })
			this.$emit('checkgroup-change', checkedList)
			this.checkedList = this.oldCheckList
			// const vm = this
			// let difference, flag
			// if (checkedList.length > vm.checkedList.length) {
			// 	difference = checkedList[checkedList.length - 1]
			// 	flag = true
			// } else {
			// 	difference = vm.checkedList[vm.checkedList.length - 1]
			// 	flag = false
			// }
			// vm.currentChecked = { difference, flag }
			// vm.checkedList = checkedList
		},
	},
	watch: {
		currentSelection: currentSelectionWatch,
		checkedList(value, oldValue) {
			this.oldCheckList = oldValue
		},
	},
})

const inputJielong = window.inputJielong
const files = []
const vueApp = new Vue({
	el: '#app',
	data() {
		return {
			options: [],
			checkedValue: {},
			totalAmount: {},
			tableData: [],
			selection: [],
			currentChecked: {
				difference: [],
				flag: false,
			},
			currentSelection: {
				difference: [],
				flag: false,
			},
			checkSelectList: [],
			files,
			inputJielong,
			showJielongInput: true,
			showJielongArea: true,
			showJielongOutput: true,
			showJielongChecked: false,
			showBeneficList: false,
			jielong: {
				input: inputJielong,
				areaHTML: '',
				amountHTML: '',
				deliveryHTML: '',
				statisticsHTML: '',
			},
		}
	},
	methods: {
		handleAll,
		handleCheck,
		handleSelectionChange,
		handleCheckSelect,
		handleCheckedChange(checkedList) {
			const checkedId = checkedList[checkedList.length - 1]
			const curOption = this.options.find(option => option.value === checkedId)
			if (curOption.jump) {
				curOption.jump = false
			}
		},
		jumpNext() {
			const options = this.options
			const checkedList = this.$refs.jielongCheckgroup.checkedList
			for (let i = 0; i < options.length; i++) {
				const option = options[i]
				if (option.jump) {
					continue
				}
				const foundIndex = checkedList.indexOf(option.value)
				// 未勾选option(-1)，标记为跳过
				if (foundIndex === -1) {
					option.jump = true
					break
				}
			}
		},
	},
	watch: {
		checkedValue({ id, checked }) {},
	},
})

console.log('vueApp', vueApp)
window.vueApp = vueApp
