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
        takers: [],
        hiddenIfNone: true,
    },
    {
        name: 'E区',
        gate: 'E东',
        regex: /[Ee][区东\d]/,
        word: 'E',
        takers: [],
    },
    {
        name: 'J区',
        gate: 'J西',
        regex: /[Jj][区西\d]/,
        word: 'J',
        put: true,
        // takers: ['张斌-J区', '佳忠J区 多饭'],
        // takers: ['佳忠J区 多饭'],
        // takers: ['张斌-J区'],
        // takers: ['何浩-J区-少饭'],
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
        word: 'D东',
        takers: [],
    },
    {
        name: 'H区',
        gate: 'H西',
        regex: /[Hh][区西\d]/,
        word: 'H',
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

const AREA_MAP = AREAS.reduce((MAP, AREA) => {
    MAP[AREA.name] = AREA
    return MAP
}, { [OTHER.name]: OTHER })
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
            totalGroup[area] = jielongList
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
const SEPARATE_REGEX = /[\s;；,，、]/
// const CANCEL_OMIT_REGEX = /[\s;；,，、](取消|CANCEL|\-) *$/i
const CANCEL_CURRENT = /[\s;；,，、\)）](取消|CANCEL)/i
const CANCEL_REGEX = /[\s;；,，、\)）](取消\-?|CANCEL) *(\d+[份分个]|[零一二两三四五六七八九十百千万亿]+[份分个]|\s*|$)/i
const MEAL_COUNT = /(^|[^A-Ma-m])((\d+)|([零一二两三四五六七八九十百千万亿]+))([份分个]|$)/
const ADD_COUNT = /(^|[^A-Ma-m])[加\+]((\d+)|([零一二两三四五六七八九十百千万亿]+))/
const MEAL_PAID = /(^|[^A-Ma-m])(((\d+)|([零一二两三四五六七八九十百千万亿]+))[份分个]?)?(已支?付)/
// const MORE_RICE = /(^|[^A-Ma-m])(((\d+)|([零一二两三四五六七八九十百千万亿]+))[份分个]?)?(多(米?饭|主食|(?=\d|\s|$)))/g
const MORE_RICE = /(^|[^A-Ma-m])(((\d+)|([零一二两三四五六七八九十百千万亿]+))[份分个]?)?(多([米菜]?饭|主食))/g
// const LESS_RICE_MORE_VEG = /(^|[^A-Ma-m])(((\d+)|([零一二两三四五六七八九十百千万亿]+))[份分个]?)?(少饭多菜)/g
// const LESS_RICE = /(^|[^A-Ma-m])(((\d+)|([零一二两三四五六七八九十百千万亿]+))[份分个]?)?(少(米?饭|主食|(?=\d|\s|$)))/g
const LESS_LESS_RICE = /(^|[^A-Ma-m])(((\d+)|([零一二两三四五六七八九十百千万亿]+))[份分个]?)?(少少([米菜]?饭|主食))/g
const LESS_RICE = /(^|[^A-Ma-m])(((\d+)|([零一二两三四五六七八九十百千万亿]+))[份分个]?)?(少([米菜]?饭|主食))(((\d+)|([零一二两三四五六七八九十百千万亿]+))[份分个]?)?/g
const NO_RICE = /(^|[^A-Ma-m])(((\d+)|([零一二两三四五六七八九十百千万亿]+))[份分个]?)?((不(需?要|用)|[免无飞走去])(白?米?饭|杂粮饭|主食))/g
const WHITE_RICE = /(^|[^A-Ma-m])(((\d+)|([零一二两三四五六七八九十百千万亿]+))[份分个]?)?((杂粮饭|主食)?[换換]?(白米?)饭)[\(（且]?([多少]?)/g
const FRIED_RICE = /(^|[^A-Ma-m])(((\d+)|([零一二两三四五六七八九十百千万亿]+))[份分个]?)?((白?米饭|杂粮饭|主食)?[换換]?成?(炒饭|炒杂|杂粮炒?饭))[\(（且]?([多少]?)/g
const RIVER_FLOUR = /(^|[^A-Ma-m])(((\d+)|([零一二两三四五六七八九十百千万亿]+))[份分个]?)?((白?米饭|杂粮饭|主食)?[换換]?成?炒?河粉?)[\(（且]?([多少]?)/g
const RICE_FLOUR = /(^|[^A-Ma-m])(((\d+)|([零一二两三四五六七八九十百千万亿]+))[份分个]?)?((白?米饭|杂粮饭|主食)?[换換]?成?(炒?米[粉线]|炒粉))[\(（且]?([多少]?)/g
const NOODLES = /(^|[^A-Ma-m])(((\d+)|([零一二两三四五六七八九十百千万亿]+))[份分个]?)?((白?米饭|杂粮饭|主食)?[换換]?成?(面条|炒面条?))[\(（且]?([多少]?)/g
const CHANGE_PUMPKIN = /(^|[^A-Ma-m])(((\d+)|([零一二两三四五六七八九十百千万亿]+))[份分个]?)?((白?米饭|杂粮饭|主食)?[换換]?蒸?南[瓜关])[\(（且]?([多少]?)/g
const CHANGE_POTATO = /(^|[^A-Ma-m])(((\d+)|([零一二两三四五六七八九十百千万亿]+))[份分个]?)?((白?米饭|杂粮饭|主食)?[换換]?蒸?[红番]薯)[\(（且]?([多少]?)/g
const ADD_BAOZI = /(^|[^A-Ma-m])(((\d+)|([零一二两三四五六七八九十百千万亿]+))[份分个]?)?((\+|加|➕\s*)?(包子|馒头))/g
const ADD_DISHES = /(^|[^A-Ma-m])(((\d+)|([零一二两三四五六七八九十百千万亿]+))[份分个]?)?((\+|加|➕\s*)?小菜)/g
const ADD_APPETITE = /(^|[^A-Ma-m])(((\d+)|([零一二两三四五六七八九十百千万亿]+))[份分个]?)?((\+|加|➕\s*)?(自制)?下饭菜)/g
const ADD_SOUR_RADISH = /(^|[^A-Ma-m])(((\d+)|([零一二两三四五六七八九十百千万亿]+))[份分个]?)?((\+|加|➕\s*)?((开胃)?萝|酸萝?)卜)/g
const ADD_SALAD = /(^|[^A-Ma-m])(((\d+)|([零一二两三四五六七八九十百千万亿]+))[份分个]?)?((\+|加|➕\s*)?((水果)?[沙色]拉|水果))/g
const ADD_WATERMELON = /(^|[^A-Ma-m])(((\d+)|([零一二两三四五六七八九十百千万亿]+))[份分个]?)?((\+|加|➕\s*)?(西瓜🍉+|西瓜|🍉+))/g
const ADD_CONGEE = /(^|[^A-Ma-m])(((\d+)|([零一二两三四五六七八九十百千万亿]+))[份分个]?)?((\+|加|➕\s*)?白?粥)/g
const ADD_BEAN_JELLY = /(^|[^A-Ma-m])(((\d+)|([零一二两三四五六七八九十百千万亿]+))[份分个]?)?((\+|加|➕\s*)?(黑?凉粉|黑凉))/g
const ADD_FREE_SAUCE = /(^|[^A-Ma-m])(((\d+)|([零一二两三四五六七八九十百千万亿]+))[份分个]?)?((\+|加|➕\s*)酱)/g
const ADD_PEPPER = /(^|[^A-Ma-m])(((\d+)|([零一二两三四五六七八九十百千万亿]+))[份分个]?)?((\+|加|➕\s*)?辣椒?酱)/g
const NO_PEPPER = /(^|[^A-Ma-m])(((\d+)|([零一二两三四五六七八九十百千万亿]+))[份分个]?)?((不(需?要?|用?)|[免无飞走去])辣)/g
const SELF_BOX = /(^|[^A-Ma-m])(((\d+)|([零一二两三四五六七八九十百千万亿]+))[份分个]?)?((自备)?饭?盒)/g
const CHANGE_STAPLE = /(^|[^A-Ma-m])(((\d+)|([零一二两三四五六七八九十百千万亿]+))[份分个]?)?((白?米饭|杂粮饭|主食)[换換][\u4e00-\u4e13\u4e15-\u4efc\u4efe-\u6361\u6363-\u63da\u63dc-\u9fa5]+)[\(（且]?([多少]?)/g
// const CHANGE_VEG = /(^|[^A-Ma-m])(((\d+)|([零一二两三四五六七八九十百千万亿]+))[份分个]?)?([换換]菜)/g
const CHANGE_VEG = /(^|[^A-Ma-m])(((\d+)|([零一二两三四五六七八九十百千万亿]+))[份分个]?|都是)?([多少]菜|([\u4e00-\u4e13\u4e15-\u4efc\u4efe-\u6361\u6363-\u63da\u63dc-\u9fa5]+([换換改]|都要)|不(需?要|用)|[换換免无飞走去])[\u4e00-\u4e13\u4e15-\u4efc\u4efe-\u6361\u6363-\u63da\u63dc-\u9fa5]+)/g

const COUNT_REGEXP = {
    type: 'mealCount',
    search: MEAL_COUNT,
    add: ADD_COUNT,
    output: '份',
}
const COND_REGEXPS = [
    {
        type: 'moreRice',
        search: MORE_RICE,
        output: '多饭',
        noReplace: true,
    },
    // {
    //     type: 'lessRiceMoreVeg',
    //     search: LESS_RICE_MORE_VEG,
    //     output: '少饭多菜',
    // },
    {
        type: 'lessLessRice',
        search: LESS_LESS_RICE,
        output: '少少饭',
    },
    {
        type: 'lessRice',
        search: LESS_RICE,
        output: '少饭',
    },
    {
        type: 'noRice',
        search: NO_RICE,
        output: '无饭',
    },
    {
        type: 'whiteRice',
        search: WHITE_RICE,
        output: '白饭',
    },
    {
        type: 'friedRice',
        search: FRIED_RICE,
        output: '炒饭',
    },
    {
        type: 'riverFlour',
        search: RIVER_FLOUR,
        output: '炒河',
    },
    {
        type: 'riceFlour',
        search: RICE_FLOUR,
        output: '炒米粉',
    },
    {
        type: 'noodles',
        search: NOODLES,
        output: '炒面',
    },
    {
        type: 'changePumpkin',
        search: CHANGE_PUMPKIN,
        output: '换南瓜',
    },
    {
        type: 'changePotato',
        search: CHANGE_POTATO,
        output: '换红薯',
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
    },
    {
        type: 'addCongee',
        search: ADD_CONGEE,
        output: '白粥',
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
        type: 'selfBox',
        search: SELF_BOX,
        output: '饭盒',
    },
    {
        type: 'changeStaple',
        search: CHANGE_STAPLE,
        output: '换主食',
    },
    { 
        type: 'changeVeg',
        search: CHANGE_VEG,
        output: '换菜',
    },
]

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

function maxCount(conditions) {
    return conditions.reduce((maxValue, condition) => Math.max(maxValue, condition.count), -Infinity)
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
                if (startCond.next) {
                    complexCount += startCond.next.count || 0
                }
                const startCount = startCond.count
                const complexOutput = complexConds
                    .sort((a, b) => b.count - a.count)
                    .map(({ type, count, word, output }) => {
                        if (type === 'changeVeg') {
                            return startCount === 1 ? word : `${count}${word}`
                        }
                        return startCount === 1 ? output : `${count}${output}`
                    })
                    .join('•')
                return startCount === 1 ? `${startCount}${complexOutput}` : complexOutput
            })
            complexObj[id] = {
                count: complexCount,
                outputs: complexOutputs,
            }
        }
    })

    const countConds = COND_REGEXPS.filter(({ type }) => conditionMap[type])
        .map(({ type, output }) => {
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
    jielongList.forEach(({ factor, conditions }) => {
        if (factor === 0 || conditions.length === 0) {
            return
        }
        const output = conditions.map(({ count, word }, index) => {
            if (index > 0 && count === 1) {
                return word
            }
            return `${count}${word}`
        }).join('•')
        countConds.push({
            conditions,
            output,
        })
    })

    return countConds
}

/**
 * 旧版换菜统计
 * @param {*} conditions 
 * @param {*} type 
 * @param {*} output 
 */
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
    for(const word in countObj) {
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

function countAreaTotal(countGroup) {
    let total = 0
    // let moreRiceTotal = 0
    // let lessRiceMoreVegTotal = 0
    // let lessRiceTotal = 0
    // let noRiceTotal = 0
    // let friedRiceTotal = 0
    // let riverFlourTotal = 0
    // let changePumpkinTotal = 0
    // let changePotatoTotal = 0
    // let changeStapleTotal = 0
    // let changeVegTotal = 0
    let selfBoxTotal = 0
    for (const area in countGroup) {
        countGroup[area].forEach(({ type, count }) => {
            if (type === 'mealCount') {
                total += count
            // } else if (type === 'moreRice') {
            //     moreRiceTotal += count
            // } else if (type === 'lessRiceMoreVeg') {
            //     lessRiceMoreVegTotal += count
            // } else if (type === 'lessRice') {
            //     lessRiceTotal += count
            // } else if (type === 'noRice') {
            //     noRiceTotal += count
            // } else if (type === 'friedRice') {
            //     friedRiceTotal += count
            // } else if (type === 'riverFlour') {
            //     riverFlourTotal += count
            // } else if (type === 'changePumpkin') {
            //     changePumpkinTotal += count
            // } else if (type === 'changePotato') {
            //     changePotatoTotal += count
            // } else if (type === 'changeStaple') {
            //     changeStapleTotal += count
            // } else if (type === 'changeVeg') {
            //     changeVegTotal += count
            } else if (type === 'selfBox') {
                selfBoxTotal += count
            }
        })
    }
    return [
        {
            type: 'mealCount',
            count: total,
            output: '份',
        },
        // {
        //     type: 'moreRice',
        //     count: moreRiceTotal,
        //     output: '多饭',
        // },
        // {
        //     type: 'lessRiceMoreVeg',
        //     count: lessRiceMoreVegTotal,
        //     output: '少饭多菜',
        // },
        // {
        //     type: 'lessRice',
        //     count: lessRiceTotal,
        //     output: '少饭',
        // },
        // {
        //     type: 'noRice',
        //     count: noRiceTotal,
        //     output: '无饭',
        // },
        // {
        //     type: 'friedRice',
        //     count: friedRiceTotal,
        //     output: '炒饭',
        // },
        // {
        //     type: 'riverFlour',
        //     count: riverFlourTotal,
        //     output: '炒河',
        // },
        // {
        //     type: 'changePumpkin',
        //     count: changePumpkinTotal,
        //     output: '换南瓜',
        // },
        // {
        //     type: 'changePotato',
        //     count: changePotatoTotal,
        //     output: '换红薯',
        // },
        // {
        //     type: 'changeStaple',
        //     count: changeStapleTotal,
        //     output: '换主食',
        // },
        // {
        //     type: 'changeVeg',
        //     count: changeVegTotal,
        //     output: '换菜',
        // },
        {
            type: 'selfBox',
            count: selfBoxTotal,
            output: '饭盒',
        },
    ]
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
        list.push(jielongObj)
        map[id] = jielongObj
    }

    jielongArray.forEach(setupJielong)
    return { list, map }
}

function getId(jielong) {
    if (!jielong || !ID_REGEX.test(jielong)) {
        return null
    }
    const idMatched = ID_REGEX.exec(jielong)
    return idMatched[1]
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
// const USER_AREA_ECMIX = /^\d+\.\s+(([A-Ma-m][区东西南北\d](门岗)?|[云微]谷(\d?[A-Da-d])?座?|华为(地铁)?站?[Aa]出口)|金荣达[ \-—_~～+]*([\u4e00-\u9fa5A-Za-z]+|\d+|$)[🌱🍀🍃🌵🌻🌼🌸🍉🍭🎈🐟🦋🐝🌈🌟✨🎀💋💤💦● ོ་]*)/
const USER_AREA_ECMIX = /^\d+\.\s+(([A-Ma-m][区东西南北\d](门岗)?|[云微]谷(\d?[A-Da-d])?座?|华为(地铁)?站?[Aa]出口|金荣达)[ \-—_~～+]*([\u4e00-\u9fa5A-Za-z]+|$)[🌱🍀🍃🌵🌻🌼🌸🍉🍭🎈🐟🦋🐝🌈🌟✨🎀💋💤💦● ོ་]*)/
// 匹配格式如：小妍 H区，Fanni🌟 H3
const USER_NAME_AREA = /^\d+\.\s+((尐霏|_Carina|🍀 杨茜|\^点点滴滴\^|Going. down. this. road|L~i~n|Cindy。|Nancy。|641℃|[\u4e00-\u9fa5]+|[A-Z a-z]+)[🌱🍀🍃🌵🌻🌼🌸🍉🍭🎈🐟🦋🐝🌈🌟✨🎀💋💤💦● ོ་]*[ \-—_~～+]*([A-Ma-m][区东西南北\d](门岗)?|[云微]谷(\d?[A-Da-d])?座?|华为(地铁)?站?[Aa]出口|金荣达))/  // ([，, -—_]?([多少]饭|不要米饭))?
// 匹配格式如：小妍 Fanni🌟H区
const USER_CENAME_AREA = /^\d+\.\s+(([\u4e00-\u9fa5]+ *([A-Z a-z]*|\d*))[🌱🍀🍃🌵🌻🌼🌸🍉🍭🎈🐟🦋🐝🌈🌟✨🎀💋💤💦● ོ་]*[ \-—_~～+]*([A-Ma-m][区东西南北\d](门岗)?|[云微]谷(\d?[A-Da-d])?座?|华为(地铁)?站?[Aa]出口|金荣达))/
// 匹配格式如：Fanni 小妍🌟H区
const USER_ECNAME_AREA = /^\d+\.\s+(([A-Za-z]+(\([A-Z a-z●–]+\))? *[\u4e00-\u9fa5]*)[🌱🍀🍃🌵🌻🌼🌸🍉🍭🎈🐟🦋🐝🌈🌟✨🎀💋💤💦● ོ་]*[ \-—_~～+]*([A-Ma-m][区东西南北\d](门岗)?|[云微]谷(\d?[A-Da-d])?座?|华为(地铁)?站?[Aa]出口|金荣达))/
// 匹配格式如：Fanni 小FF妍🌟H区
const USER_ECMIX_AREA = /^\d+\.\s+(([\u4e00-\u9fa5A-Z a-z]+|\d+)[🌱🍀🍃🌵🌻🌼🌸🍉🍭🎈🐟🦋🐝🌈🌟✨🎀💋💤💦● ོ་]*[ \-—_~～+]*([A-Ma-m][区东西南北\d](门岗)?|[云微]谷(\d?[A-Da-d])?座?|华为(地铁)?站?[Aa]出口|金荣达))/
// 匹配其它格式：无园区，列举特别格式的姓名
const USER_ESP_OTHER_NAME = /^\d+\.\s+(尐霏|宝妹儿~|维 维|danna ²⁰²⁰|Cindy。|Nancy。|🍀 杨茜|🌱Carina|_Carina🌱|🌻Xue、|🍭オゥシュゥ🍭|春春——E区 少饭|sᴛᴀʀʀʏ.|D区门岗-赵金亮)/
// const USER_ECMIX_OTHER_NAME = /^\d+\.\s+([\u4e00-\u9fa5]+ *[A-Za-z]*|[A-Za-z]+ *[\u4e00-\u9fa5]*|\d+)/
const USER_ECMIX_OTHER_NAME = /^\d+\.\s+(([\u4e00-\u9fa5]+[\-—_~～+ ]*[A-Za-z]*|[A-Za-z]+[\-—_~～+ ]+[A-Za-z]+|[A-Za-z]+[\-—_~～+]*[\u4e00-\u9fa5]*|\d+)[🌱🍀🍃🌵🌻🌼🌸🍉🍭🎈🐟🦋🐝🌈🌟✨🎀💋💤💦● ོ་]*)/

const USER_REGEXPS = [USER_AREA_ECMIX, USER_NAME_AREA, USER_CENAME_AREA, USER_ECNAME_AREA, USER_ECMIX_AREA, USER_ESP_OTHER_NAME, USER_ECMIX_OTHER_NAME]
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
            findName = result[1]
            console.log(i, regexps[i], findName)
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
        if (cancelMatched[2] === '') { // 当未匹配到取消份数
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
        if (cMatched[3]) {
            count = Number(cMatched[3])
        } else if (cMatched[4]) {
            count = ChineseToNumber(cMatched[4])
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
    // 三: '鲜',
    三: '杯杏鲍菇',
    // 四: '棱豆',
    四: '季豆',
    九: '层塔',
}

function hasChnNumInName(countNum, word) {
    for (const chnNum in chnNumInVegName) {
        if (countNum === chnNum && word.startsWith(chnNumInVegName[chnNum])) {
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
        let count  // 当前接龙每次匹配条件份数
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
function printAreaGroup(areaGroup) {
    let result = '<div>## 接龙分区<br/><br/>'
    for (const area in areaGroup) {
        const areaList = areaGroup[area]
        let jielongDisplay
        if (areaList.length) {
            jielongDisplay = sortByComplex(sortByPaid(areaList)).map(jielongObj => {
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
                
                if (maxCount(conditions) > count) { // count === 1 && conditions.length > 1 && 
                    return `<strong style="color: purple">${jielong}（条件份数超过接龙）</strong>`
                }
                if (hasComplex(conditions)) {
                    return `<strong style="color: orange">${jielong}</strong>`
                }
                if (isPaid) {
                    return `<strong style="color: green">${jielong}</strong>`
                }
                return jielong
            }).join('<br/>')
        } else {
            jielongDisplay = ''
        }
        result += `<span>${area}</span>：<br/><div>${jielongDisplay}</div><br/>`
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
        // return `<span style="color: orange"><br/>${complexTotal}复合{${complexOutputs.join(' ')}}</span>`
        return `<span style="color: orange">${complexTotal}复合{${complexOutputs.join(' ')}}</span>` //【】
    }
    return ''
}

function printCountObj(countObj) {
    const { type, count, output, more, less, complex } = countObj
    // if (type === 'complexConds') {
    //     return printComplexObj(countObj)
    // }
    // 统计为0或负数都不打印
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
        let display = `${count}${output}${moreOrLess}`
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
function printCountList(area, countList) {
    const countDisplay = countList
        .map(printCountObj)
        .join(' ')
    const result = `<div>## ${area}统计<br/><br/>${countDisplay}</div>`
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
    countList.map(printCountObj2)
        .forEach((output, index) => {
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
    const result = `<div>## ${area}统计<br/><br/>${countDisplay}</div>`
    document.querySelector('.jielong-statistics').innerHTML = result
}

/**
 * 显示各区统计
 * @param {*} countGroup 
 */
function printCountGroup(countGroup) {
    let result = '<div>## 各区统计<br/><br/>'
    const complexList = []
    for (const area in countGroup) {
        let areaIcon
        if (area === '合计') {
            areaIcon = '💫'
        } else {
            areaIcon = '✨'
            const complexObj = countGroup[area].pop()
            if (Object.keys(complexObj).length > 1) {
                const complexDisplay = printComplexObj(complexObj)
                complexList.push(`🌟${area}: ${complexDisplay}`)
            }
        }
        const countDisplay = countGroup[area].map(printCountObj).join(' ')
        result += `${areaIcon}${area}: ${countDisplay}<br/>`
    }
    result += '<br/>' + complexList.join('<br/>') + '</div>'
    document.querySelector('.jielong-statistics').innerHTML = result
}

function printDeliveryGroup(deliveryGroup) {
    let result = `<div>## 送餐消息<br/><br/>7分钟到云谷<br/><br/>灰色本田～粤B89G18<br/><br/>`
    // let result = `<div>## 送餐消息<br/><br/>7分钟到云谷<br/><br/>银色五菱～粤B598J7<br/><br/>`
    const pathList = []
    const putList = []
    for (const area in deliveryGroup) {
        const { gate, put } = findAREAByName(area)
        result += `✨${gate}：${deliveryGroup[area].join(' ')}<br/>`
        pathList.push(gate)
        if (put) {
            putList.push(gate)
        }
    }
    result += `<br/>💫路线：${pathList.join('～')}（${putList.join('、')}可放餐）</div>`
    document.querySelector('.jielong-delivery').innerHTML = result
}

document.getElementById('button0').onclick = function() {
    const inputJielong = document.querySelector('.jielong-input > textarea').value
    const jielongContent = inputJielong.slice(inputJielong.indexOf('1. '))
    const { list, map } = parseJielong(jielongContent.split('\n'))
    console.log('parseJielong list, map: ', list, map)
    // const countList = countByArea(list)
    // printCountList('J区', countList)
    const countList2 = countByArea2(list)
    printCountList2('J区', countList2)
}

document.getElementById('button').onclick = function() {
    const inputJielong = document.querySelector('.jielong-input > textarea').value
    const jielongContent = inputJielong.slice(inputJielong.indexOf('1. '))
    const { list, map } = parseJielong(jielongContent.split('\n'))
    console.log('parseJielong list, map: ', list, map)
    const areaGroup = groupAreaAll(list, ['name', 'regex'])
    const deliveryGroup = deliveryAreaAll(areaGroup)
    const countGroup = countAreaAll(areaGroup)
    printAreaGroup(areaGroup)
    printDeliveryGroup(deliveryGroup)
    printCountGroup(countGroup)
}
