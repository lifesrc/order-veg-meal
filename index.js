const AREAS = [
    {
        name: '云谷',
        gate: '云谷',
        put: true,
        regex: /云谷\d?[A-Da-d]?座?/,
        word: '云',
        takers: [],
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
        gate: 'J南',
        put: true,
        regex: /[Jj][区南\d]/,
        word: 'J',
        takers: ['张斌-J区', '佳忠J区 多饭'],
        // takers: ['佳忠J区 多饭'],
        // takers: ['张斌-J区'],
        // takers: ['木水'],
        // takers: [],
    },
    {
        name: 'F区',
        gate: 'F南',
        put: true,
        regex: /[Ff][区南\d]/,
        word: 'F',
        takers: [],
    },
    {
        name: 'B区',
        gate: 'B东',
        put: true,
        regex: /[Bb][区东\d]/,
        word: 'B',
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
        regex: /微谷\d?[A-Da-d]?座?/,
        word: '微',
        takers: [],
    },
]
const OTHER = {
    name: '其它',
    gate: '其它',
    regex: /其它/,
    word: '其它',
    takers: [],
}

const strFinder = ({ jielong }, areaStr) => jielong.toUpperCase().indexOf(areaStr) > -1
const regFinder = ({ jielong }, areaReg) => areaReg.test(jielong)
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
            if (finder(jielongObj, AREA[findKey])) {
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

function groupAreaAll(jielongList, findKeys) {
    const totalGroup = {}
    let jielongLeft = jielongList
    findKeys.forEach((findKey, index) => {
        const areaGroup = groupByFinder(jielongLeft, findKey)
        jielongLeft = areaGroup[OTHER.name]
        for (const area in areaGroup) {
            if (index < findKeys.length - 1 && area === OTHER.name) {
                continue
            }
            let jielongAreaList
            if (totalGroup[area]) {
                jielongAreaList = totalGroup[area].concat(areaGroup[area])
            } else {
                jielongAreaList = areaGroup[area]
            }

            totalGroup[area] = jielongAreaList
        }
    })

    return totalGroup
}

const ID_REGEX = /^(\d+)\.\s+/
const MEAL_COUNT = /[^A-Ma-m]((\d+)|([零一二两三四五六七八九十百千万亿]+))[份分]/
const MEAL_PAID = /[^A-Ma-m](((\d+)|([零一二两三四五六七八九十百千万亿]+))[份分]?)?已支?付/
const MORE_RICE = /[^A-Ma-m](((\d+)|([零一二两三四五六七八九十百千万亿]+))[份分]?)?多(米?饭|主食|(?=\d|\s|$))/g
const LESS_RICE_MORE_VEG = /[^A-Ma-m](((\d+)|([零一二两三四五六七八九十百千万亿]+))[份分]?)?少饭多菜/g
const LESS_RICE = /[^A-Ma-m](((\d+)|([零一二两三四五六七八九十百千万亿]+))[份分]?)?少(米?饭|主食|(?=\d|\s|$))/g
const NO_RICE = /[^A-Ma-m](((\d+)|([零一二两三四五六七八九十百千万亿]+))[份分]?)?(无|不需?要)(米?饭|主食)/g
const WHITE_RICE = /[^A-Ma-m](((\d+)|([零一二两三四五六七八九十百千万亿]+))份?)?(杂粮饭|主食)?[换換]?(白|白米)饭/g
const FRIED_RICE = /[^A-Ma-m](((\d+)|([零一二两三四五六七八九十百千万亿]+))份?)?(白?米饭|杂粮饭|主食)?[换換]?(炒饭|炒杂|杂粮炒?饭)([多少]?)/g
const RIVER_FLOUR = /[^A-Ma-m](((\d+)|([零一二两三四五六七八九十百千万亿]+))份?)?(白?米饭|杂粮饭|主食)?[换換]?炒?河粉?([多少]?)/g
const RICE_FLOUR = /[^A-Ma-m](((\d+)|([零一二两三四五六七八九十百千万亿]+))份?)?(白?米饭|杂粮饭|主食)?[换換]?(米粉|炒米?粉)([多少]?)/g
const NOODLES = /[^A-Ma-m](((\d+)|([零一二两三四五六七八九十百千万亿]+))份?)?(白?米饭|杂粮饭|主食)?[换換]?(面条|炒面条?)([多少]?)/g
const CHANGE_PUMPKIN = /[^A-Ma-m](((\d+)|([零一二两三四五六七八九十百千万亿]+))份?)?(白?米饭|杂粮饭|主食)?[换換]南瓜([多少]?)/g
const CHANGE_POTATO = /[^A-Ma-m](((\d+)|([零一二两三四五六七八九十百千万亿]+))份?)?(白?米饭|杂粮饭|主食)?[换換][红番]薯([多少]?)/g
const CHANGE_STAPLE = /[^A-Ma-m](((\d+)|([零一二两三四五六七八九十百千万亿]+))份?)?(白?米饭|杂粮饭|主食)[换換][\u4e0-\u6361\u6363-\u9fa5]+/g
const ADD_DISHES = /[^A-Ma-m](((\d+)|([零一二两三四五六七八九十百千万亿]+))份?)?(\+|加|➕\s*)?小菜/g
const ADD_PEPPER = /[^A-Ma-m](((\d+)|([零一二两三四五六七八九十百千万亿]+))份?)?(\+|加|➕\s*)?辣椒?酱/g
const ADD_SOUR_RADISH = /[^A-Ma-m](((\d+)|([零一二两三四五六七八九十百千万亿]+))份?)?(\+|加|➕\s*)?(萝|酸萝?)卜/g
const ADD_BAOZI = /[^A-Ma-m](((\d+)|([零一二两三四五六七八九十百千万亿]+))份?)?(\+|加|➕\s*)?(包子|馒头)/g
const ADD_SALAD = /[^A-Ma-m](((\d+)|([零一二两三四五六七八九十百千万亿]+))份?)?(\+|加|➕\s*)?[沙色]拉/g
const ADD_CONGEE = /[^A-Ma-m](((\d+)|([零一二两三四五六七八九十百千万亿]+))份?)?(\+|加|➕\s*)?粥/g
const ADD_FREE_SAUCE = /[^A-Ma-m](((\d+)|([零一二两三四五六七八九十百千万亿]+))份?)?(\+|加|➕)酱/g
const NO_PEPPER = /[^A-Ma-m](((\d+)|([零一二两三四五六七八九十百千万亿]+))份?)?(免|不要?)辣/g
const SELF_BOX = /[^A-Ma-m](((\d+)|([零一二两三四五六七八九十百千万亿]+))份?)?(自备)?饭?盒/g
// const CHANGE_VEG = /[^A-Ma-m](((\d+)|([零一二两三四五六七八九十百千万亿]+))份?)?[换換]菜/g
const CHANGE_VEG = /[^A-Ma-m](((\d+)|([零一二两三四五六七八九十百千万亿]+))份?)?(([\u4e00-\u4efc\u4efe-\u6361\u6363-\u63da\u63dc-\u9fa5]+[换換]|不要|飞)[\u4e00-\u4efc\u4efe-\u6361\u6363-\u63da\u63dc-\u9fa5]+)/g

const COUNT_REGEXP = {
    type: 'mealCount',
    search: MEAL_COUNT,
    output: '份',
}
const MARK_REGEXPS = [
    {
        type: 'moreRice',
        search: MORE_RICE,
        output: '多饭',
    },
    {
        type: 'lessRiceMoreVeg',
        search: LESS_RICE_MORE_VEG,
        output: '少饭多菜',
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
        output: '炒粉',
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
        type: 'changeStaple',
        search: CHANGE_STAPLE,
        output: '换主食',
    },
    {
        type: 'addDishes',
        search: ADD_DISHES,
        output: '加小菜',
    },
    {
        type: 'addPepper',
        search: ADD_PEPPER,
        output: '加辣酱',
    },
    {
        type: 'addSourRadish',
        search: ADD_SOUR_RADISH,
        output: '加酸萝卜',
    },
    {
        type: 'addBaozi',
        search: ADD_BAOZI,
        output: '加包子',
    },
    {
        type: 'addSalad',
        search: ADD_SALAD,
        output: '加沙拉',
    },
    {
        type: 'addCongee',
        search: ADD_CONGEE,
        output: '加粥',
    },
    {
        type: 'addFreeSauce',
        search: ADD_FREE_SAUCE,
        output: '加酱',
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
        type: 'changeVeg',
        search: CHANGE_VEG,
        output: '换菜',
    },
]

function countByTotal(jielongList, MARK_REGEXP) {
    const count = jielongList.reduce((total, { count }) => total + count, 0)
    const { type, output } = MARK_REGEXP
    return { type, count, output }
}

function countByMark(jielongList, MARK_REGEXP, jielongMap) {
    const { type, search: searchRegex, output } = MARK_REGEXP
    const replaceByArea = []
    let markCount = 0
    let moreCount = 0
    let lessCount = 0
    jielongList.forEach(({ id, jielong }) => {
        let result
        let matches = ''
        let count = 0
        let more = 0
        let less = 0
        while ((result = searchRegex.exec(jielong))) {
            const matched = result[0]
            if (searchRegex === MORE_RICE || searchRegex === LESS_RICE) {
              if (result[2] === undefined && result[5] === '') {
                 if (/[杂饭河粉面条瓜薯]/.test(matched[matched.length - 2])) {
                    continue
                 }
              }
            }
            let jcount  // 当前接龙每次匹配条件份数
            if (result[3]) {
                jcount = Number(result[3])
            } else if (result[4]) {
                jcount = ChineseToNumber(result[4])
            } else {
                jcount = 1
            }
            count += jcount
            markCount += jcount
            const suffix = result[result.length - 1]
            if (suffix === '多') {
                more += jcount
                moreCount += jcount
            } else if (suffix === '少') {
                less += jcount
                lessCount += jcount
            }
            // 匹配到的词语
            matches += matched.slice(1)
        }

        if (count > 0) {
            jielongMap[id].conditions.push({ type, count, more, less, output })
        }

        if (matches.length) {
            jielong = jielong.replace(matches, '')
        }
        replaceByArea.push({ id, jielong })
    })

    return {
        type,
        count: markCount,
        more: moreCount,
        less: lessCount,
        output,
        replaceByArea
    }
}

function countByChangeVegMark(jielongList, MARK_REGEXP, jielongMap) {
    const { type, search: searchRegex, output } = MARK_REGEXP
    const countList = []
    const replaceByArea = []
    jielongList.forEach(({ id, jielong }) => {
        const jcountList = []
        let result
        let matches = ''
        while ((result = searchRegex.exec(jielong))) {
            const matched = result[0]
            const text = result[5]
            let jcount // 当前接龙每次匹配条件份数
            if (result[3]) {
                jcount = Number(result[3])
            } else if (result[4]) {
                jcount = ChineseToNumber(result[4])
            } else {
                jcount = 1
            }
            const countObj = {
                text,
                count: jcount,
            }
            jcountList.push(countObj)
            countList.push(countObj)
            // 匹配到的词语
            matches += matched.slice(1)
        }

        if (jcountList.length) {
            jielongMap[id].conditions.push(countChangeVeg(jcountList, type, output))
        }
        
        if (matches.length) {
            jielong = jielong.replace(matches, '')
        }
        replaceByArea.push({ id, jielong })
    })

    const countObj = countChangeVeg(countList, type, output)
    return { ...countObj, replaceByArea }
}

function countChangeVeg(countList, type, output) {
    const combineList = combineByVegName(countList)
    const listSize = combineList.length
    let markCount = 0
    let markOutput = ''
    if (listSize > 0) {
        markOutput += `${output}(`
    }
    combineList.forEach(({ text, count }, index) => {
        markCount += count
        markOutput += `${count}${text}`
        if (index < listSize - 1) {
            markOutput += '、'
        }
    })
    if (listSize > 0) {
        markOutput += ')'
    }

    return {
        type,
        count: markCount,
        output: markOutput,
    }
}

/**
 * 按菜名合并每个菜几份
 * @param {换菜列表}} countList 
 */
function combineByVegName(countList) {
    const countObj = countList.reduce((mapObj, { text, count }) => {
        if (mapObj[text]) {
            mapObj[text] += count
        } else {
            mapObj[text] = count
        }
        return mapObj
    }, {})
    const resultList = []
    for(const text in countObj) {
        resultList.push({
            text,
            count: countObj[text],
        })
    }

    return resultList
}

function countAreaAll(areaGroup, jielongMap) {
    const countGroup = {}
    for (const area in areaGroup) {
        countGroup[area] = countByArea(areaGroup[area], jielongMap)
    }
    countGroup['合计'] = countAreaTotal(countGroup)
    console.log('countAreaAll', areaGroup, jielongMap, countGroup)
    return countGroup
}

function countByArea(jielongAreaList, jielongMap) {
    let jielongList = jielongAreaList
    const countMeal = countByTotal(jielongList, COUNT_REGEXP)
    const countMarks = MARK_REGEXPS.map(MARK_REGEXP => {
        let countObj
        if (MARK_REGEXP.type === 'changeVeg') {
            countObj = countByChangeVegMark(jielongList, MARK_REGEXP, jielongMap)
        } else {
            countObj = countByMark(jielongList, MARK_REGEXP, jielongMap)
        }
        jielongList = countObj.replaceByArea
        delete countObj.replaceByArea
        return countObj
    })
    return [countMeal, ...countMarks].filter(({ count }) => count > 0)
}

function countAreaTotal(countGroup) {
    let total = 0
    let moreRiceTotal = 0
    let lessRiceMoreVegTotal = 0
    let lessRiceTotal = 0
    let noRiceTotal = 0
    let friedRiceTotal = 0
    let changePumpkinTotal = 0
    let changePotatoTotal = 0
    let changeStapleTotal = 0
    let changeVegTotal = 0
    let selfBoxTotal = 0
    for (const area in countGroup) {
        countGroup[area].forEach(({ type, count }) => {
            if (type === 'mealCount') {
                total += count
            } else if (type === 'moreRice') {
                moreRiceTotal += count
            } else if (type === 'lessRiceMoreVeg') {
                lessRiceMoreVegTotal += count
            } else if (type === 'lessRice') {
                lessRiceTotal += count
            } else if (type === 'noRice') {
                noRiceTotal += count
            } else if (type === 'friedRice') {
                friedRiceTotal += count
            } else if (type === 'changePumpkin') {
                changePumpkinTotal += count
            } else if (type === 'changePotato') {
                changePotatoTotal += count
            } else if (type === 'changeStaple') {
                changeStapleTotal += count
            } else if (type === 'changeVeg') {
                changeVegTotal += count
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
        {
            type: 'moreRice',
            count: moreRiceTotal,
            output: '多饭',
        },
        {
            type: 'lessRiceMoreVeg',
            count: lessRiceMoreVegTotal,
            output: '少饭多菜',
        },
        {
            type: 'lessRice',
            count: lessRiceTotal,
            output: '少饭',
        },
        {
            type: 'noRice',
            count: noRiceTotal,
            output: '无饭',
        },
        {
            type: 'friedRice',
            count: friedRiceTotal,
            output: '炒饭',
        },
        {
            type: 'changePumpkin',
            count: changePumpkinTotal,
            output: '换南瓜',
        },
        {
            type: 'changePotato',
            count: changePotatoTotal,
            output: '换红薯',
        },
        {
            type: 'changeStaple',
            count: changeStapleTotal,
            output: '换主食',
        },
        {
            type: 'changeVeg',
            count: changeVegTotal,
            output: '换菜',
        },
        {
            type: 'selfBox',
            count: selfBoxTotal,
            output: '饭盒',
        },
    ].filter(({ count }) => count > 0)
}

// 匹配格式如：小妍 H区，Fanni🌟 H3
const USER_NAME_AREA = /^\d+\.\s+(([\u4e00-\u9fa5]+|[A-Z a-z]+)[🌈🦋🍉🌻💤🌟🌱🌻🍭🎈]*[ \-—_~～]([A-Ma-m][区\d]?|[云微]谷\d?[A-Da-d]?座?)([，, -—_]?([多少]饭|不要米饭))?)/
// 匹配格式如：小妍 Fanni🌟H区
const USER_CENAME_AREA = /^\d+\.\s+(([\u4e00-\u9fa5]+ *[A-Z a-z]*)[🌈🦋🍉🌻💤🌟🌱🌻🍭🎈]*[ \-—_~～]*([A-Ma-m][区\d]?|[云微]谷\d?[A-Da-d]?座?)([，, -—_]?([多少]饭|不要米饭))?)/
// 匹配格式如：Fanni 小妍🌟H区
const USER_ECNAME_AREA = /^\d+\.\s+(([A-Za-z]+(\([A-Z a-z]+\))? *[\u4e00-\u9fa5]*)[🌈🦋🍉🌻💤🌟🌱🌻🍭🎈]*[ \-—_~～]*([A-Ma-m][区\d]?|[云微]谷\d?[A-Da-d]?座?)([，, -—_]?([多少]饭|不要米饭))?)/
// 匹配格式如：Fanni 小FF妍🌟H区
const USER_ECMIX_AREA = /^\d+\.\s+(([\u4e00-\u9fa5A-Z a-z]+|\d+)[🌈🦋🍉🌻💤🌟🌱🌻🍭🎈]*[ \-—_~～]*([A-Ma-m][区\d]?|[云微]谷\d?[A-Da-d]?座?))/
// 匹配格式如：H区小妍Fanni🌟
const USER_AREA_ECMIX = /^\d+\.\s+(([A-Ma-m][区\d]?|[云微]谷\d?[A-Da-d]?座?)[ \-—_~～]*([\u4e00-\u9fa5A-Z a-z]+|\d+)[🌈🦋🍉🌻💤🌟🌱🌻🍭🎈]*)/
// 匹配其它格式：无园区，列举特别格式的姓名
const USER_ESP_OTHER_NAME = /^\d+\.\s+(宝妹儿~|维 维|danna ²⁰²⁰|果果lynn🌈|Han🦋|西瓜锦鲤🍉|灵芝🌻|嘟嘟💤|Fanni🌟|邮储银行_郑婷婷🎈18826672976|🌱Carina|🌻Xue、|🍭オゥシュゥ🍭 H3)/
const USER_ECMIX_OTHER_NAME = /^\d+\.\s+([\u4e00-\u9fa5]+ *[A-Za-z]*|[A-Za-z]+ *[\u4e00-\u9fa5]*|\d+)/

const USER_REGEXPS = [USER_NAME_AREA, USER_CENAME_AREA, USER_ECNAME_AREA, USER_ECMIX_AREA, USER_AREA_ECMIX, USER_ESP_OTHER_NAME, USER_ECMIX_OTHER_NAME]
const OTHER_REGEXPS = [USER_ESP_OTHER_NAME, USER_ECMIX_OTHER_NAME]

function deliveryAreaAll(areaGroup) {
    const deliveryGroup = {}
    const countGroup = {}
    let totalCount = 0
    for (const area in areaGroup) {
        let regexps
        if (area === OTHER.name) {
            regexps = OTHER_REGEXPS
        } else {
            regexps = USER_REGEXPS
        }
        let jielongList = areaGroup[area]
        deliveryGroup[area] = []
        countGroup[area] = 0
        // default takers
        const AREA = AREAS.find(AREA => AREA.name === area)
        if (AREA && AREA.takers && AREA.takers.length) {
            AREA.takers.forEach(taker => {
                deliveryGroup[area].push(`@${taker}`)
            })
        }
        regexps.forEach((regexp, regIndex) => {
            const jielongLeft = []
            for (const index in jielongList) {
                const jielongObj = jielongList[index]
                const result = regexp.exec(jielongObj.jielong)
                if (result && result[1]) {
                    deliveryGroup[area].push(`@${result[1]}`)
                    // console.log(regIndex, regexp, result[1])
                    countGroup[area]++
                    totalCount++
                } else {
                    jielongLeft.push(jielongObj)
                }
            }
            jielongList = jielongLeft
        })
    }
    // console.log('countGroup', JSON.stringify(countGroup))
    console.log('deliveryAreaAll poeple totalCount', totalCount)
    return deliveryGroup
}

/**
 * 解析原始接龙，生成接龙对象
 * @param {Array} jielongArray 
 */
function parseJielong(jielongArray) {
    const list = []
    const map = {}
    jielongArray.forEach(jielong => {
        if (!jielong||!ID_REGEX.test(jielong)) {
            return
        }
        const idMatched = ID_REGEX.exec(jielong)
        const cMatched = MEAL_COUNT.exec(jielong)
        const isPaid = MEAL_PAID.test(jielong)
        const id = idMatched[1]
        let count = 0
        if (cMatched) {
            if (cMatched[2]) {
                count = Number(cMatched[2])
            } else if (cMatched[3]) {
                count = ChineseToNumber(cMatched[3])
            } else {
                count = 1
            }
        } else {
            count = 1
        }
        const jielongObj = { id, jielong, count, isPaid, conditions: [] }
        list.push(jielongObj)
        map[id] = jielongObj
    })

    return { list, map }
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

function sortByOneMeal(jielongList) {
    const multiple = []
    const noMultiple = []
    jielongList.forEach(jielongObj => {
        const { count, conditions } = jielongObj
        if (count === 1 && conditions.length > 1) {
            multiple.push(jielongObj)
        } else {
            noMultiple.push(jielongObj)
        }
    })

    return [...multiple, ...noMultiple]
}

function printCountList(area, countList) {
    const countDisplay = countList
        .map(({ count, output, more, less }) => {
              let moreOrLess = ''
              if (more && more > 0) {
                  moreOrLess += `${more}多`
              }
              if (less && less > 0) {
                  moreOrLess += `${less}少`
              }
              moreOrLess = moreOrLess.length ? `(${moreOrLess})` : ''
              return `${count}${output}${moreOrLess}`
        })
        .join(' ')
    const result = `<div>## ${area}统计<br/><br/>${countDisplay}</div>`
    document.querySelector('.jielong-statistics').innerHTML = result
}

function printAreaGroup(areaGroup) {
    let result = '<div>## 接龙分区<br/><br/>'
    for (const area in areaGroup) {
        const sortedAreaList = sortByOneMeal(sortByPaid(areaGroup[area]))
        const jielongDisplay = sortedAreaList.length
            ? sortedAreaList.map(({ jielong, count, isPaid, conditions }) => {
                if (count === 1 && conditions.length > 1) {
                    return `<strong style="color: orange">${jielong}</strong>`
                }
                if (isPaid) {
                    return `<strong style="color: green">${jielong}</strong>`
                }
                return jielong
            }).join('<br/>')
            : ''
        result += `<span>${area}</span>：<br/><div>${jielongDisplay}</div><br/>`
    }
    result += '</div>'
    document.querySelector('.jielong-area').innerHTML = result
}

function printCountGroup(countGroup) {
    let result = '<div>## 各区统计<br/><br/>'
    for (const area in countGroup) {
        const countDisplay = countGroup[area]
            .map(({ type, count, output, more, less }) => {
                if (type === 'mealCount') {
                    return `<strong style="color: #1f78d1">${count}${output}</strong>`
                }
              
                let moreOrLess = ''
                if (more && more > 0) {
                  moreOrLess += `${more}多`
                }
                if (less && less > 0) {
                  moreOrLess += `${less}少`
                }
                moreOrLess = moreOrLess.length ? `(${moreOrLess})` : ''
                return `${count}${output}${moreOrLess}`
            })
            .join(' ')
        result += `${area}: ${countDisplay}<br/>`
    }
    result += '</div>'
    document.querySelector('.jielong-statistics').innerHTML = result
}

function printDeliveryGroup(deliveryGroup) {
    const pathDisplay = AREAS.map(AREA => AREA.gate).join('～')
    const putDisplay = AREAS.filter(AREA => AREA.put).map(AREA => AREA.gate).join('、')
    let result = `<div>## 送餐消息<br/><br/>7分钟到云谷<br/><br/>灰色本田～粤B89G18<br/><br/>`
    for (const area in deliveryGroup) {
        const AREA = [...AREAS, OTHER].find(AREA => AREA.name === area)
        result += `${AREA.gate}：${deliveryGroup[area].join(' ')}<br/>`
    }
    result += `<br/>路线：${pathDisplay}（${putDisplay}可以放餐）</div>`
    document.querySelector('.jielong-delivery').innerHTML = result
}

document.getElementById('button0').onclick = function() {
    const inputJielong = document.querySelector('.jielong-input > textarea').value
    const jielongContent = inputJielong.slice(inputJielong.indexOf('1. '))
    const { list, map } = parseJielong(jielongContent.split('\n'))
    const countList = countByArea(list, map)
    printCountList('J区', countList)
}

document.getElementById('button').onclick = function() {
    const inputJielong = document.querySelector('.jielong-input > textarea').value
    const jielongContent = inputJielong.slice(inputJielong.indexOf('1. '))
    const { list, map } = parseJielong(jielongContent.split('\n'))
    const areaGroup = groupAreaAll(list, ['name', 'regex'])
    const countGroup = countAreaAll(areaGroup, map)
    const deliveryGroup = deliveryAreaAll(areaGroup)
    printAreaGroup(areaGroup)
    printCountGroup(countGroup)
    printDeliveryGroup(deliveryGroup)
}
