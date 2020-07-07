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
        // takers: ['张斌-J区', '佳忠J区 多饭'],
        // takers: ['佳忠J区 多饭'],
        takers: ['张斌-J区'],
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
const strFinder = (jielong, area) => jielong.toUpperCase().indexOf(area) > -1
const regFinder = (jielong, area) => area.test(jielong)
const FINDERS = {
    name: strFinder,
    regex: regFinder,
    word: strFinder,
    default: strFinder,
}

function sortByPaid(jielongList) {
    const paid = []
    const noPaid = []
    jielongList.forEach(jielong => {
        if (MEAL_PAID.test(jielong)) {
            paid.push(jielong)
        } else {
            noPaid.push(jielong)
        }
    })

    return paid.concat(noPaid)
}

function groupByFinder(jielongList, findKey) {
    const finder = FINDERS[findKey] || FINDERS.default
    const areaGroup = {}
    let jielongLeft = jielongList
    AREAS.forEach(area => {
        const areaList = []
        const areaLeft = []
        jielongLeft.forEach(jielong => {
            if (finder(jielong, area[findKey])) {
                areaList.push(jielong)
            } else {
                areaLeft.push(jielong)
            }
        })

        areaGroup[area.name] = areaList
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
            let jielongByArea
            if (totalGroup[area]) {
                jielongByArea = totalGroup[area].concat(areaGroup[area])
            } else {
                jielongByArea = areaGroup[area]
            }

            totalGroup[area] = sortByPaid(jielongByArea)
        }
    })

    return totalGroup
}

const MEAL_COUNT = /[^A-Ma-m]((\d+)|([零一二两三四五六七八九十百千万亿]+))[份分]/
const MEAL_PAID = /[^A-Ma-m](((\d+)|([零一二两三四五六七八九十百千万亿]+))份?)?已支?付/
const MORE_RICE = /[^A-Ma-m](((\d+)|([零一二两三四五六七八九十百千万亿]+))份?)?多(米?饭|主食|(?=\d|\s|$))/g
const LESS_RICE_MORE_VEG = /[^A-Ma-m](((\d+)|([零一二两三四五六七八九十百千万亿]+))份?)?少饭多菜/g
const LESS_RICE = /[^A-Ma-m](((\d+)|([零一二两三四五六七八九十百千万亿]+))份?)?少(米?饭|主食|(?=\d|\s|$))/g
const NO_RICE = /[^A-Ma-m](((\d+)|([零一二两三四五六七八九十百千万亿]+))份?)?(无|不要)(米?饭|主食)/g
const FRIED_RICE = /[^A-Ma-m](((\d+)|([零一二两三四五六七八九十百千万亿]+))份?)?(白?米饭|杂粮饭|主食)?[换換]?(炒饭|炒杂|杂粮炒?饭)([多少]?)/g
const RIVER_FLOUR = /[^A-Ma-m](((\d+)|([零一二两三四五六七八九十百千万亿]+))份?)?(白?米饭|杂粮饭|主食)?[换換]?炒?河粉?([多少]?)/g
const RICE_FLOUR = /[^A-Ma-m](((\d+)|([零一二两三四五六七八九十百千万亿]+))份?)?(白?米饭|杂粮饭|主食)?[换換]?(米粉|炒米?粉)([多少]?)/g
const NOODLES = /[^A-Ma-m](((\d+)|([零一二两三四五六七八九十百千万亿]+))份?)?(白?米饭|杂粮饭|主食)?[换換]?(面条|炒面条?)([多少]?)/g
const CHANGE_PUMPKIN = /[^A-Ma-m](((\d+)|([零一二两三四五六七八九十百千万亿]+))份?)?(白?米饭|杂粮饭|主食)?[换換]南瓜([多少]?)/g
const CHANGE_POTATO = /[^A-Ma-m](((\d+)|([零一二两三四五六七八九十百千万亿]+))份?)?(白?米饭|杂粮饭|主食)?[换換][红番]薯([多少]?)/g
const CHANGE_STAPLE = /[^A-Ma-m](((\d+)|([零一二两三四五六七八九十百千万亿]+))份?)?(白?米饭|杂粮饭|主食)[换換][\u4e0-\u6361\u6363-\u9fa5]+/g
const CHANGE_WHITE = /[^A-Ma-m](((\d+)|([零一二两三四五六七八九十百千万亿]+))份?)?(杂粮饭|主食)?[换換]?(白|米|白米)饭/g
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

const MARK_REGEXPS = [
    {
        type: 'mealCount',
        search: MEAL_COUNT,
        output: '份',
    },
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
        type: 'changeWhite',
        search: CHANGE_WHITE,
        output: '白饭',
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

// const chnNumChar = {
//     零: 0, 一: 1, 二: 2, 三: 3, 四: 4, 五: 5, 六: 6, 七: 7, 八: 8, 九: 9,
//     两: 2, 壹: 1, 贰: 2, 叁: 3, 肆: 4, 伍: 5, 陆: 6, 柒: 7, 捌: 8, 玖: 9,
// }

// const chnNameValue = {
//     十: { value: 10, secUnit: false },
//     百: { value: 100, secUnit: false },
//     千: { value: 1000, secUnit: false },
//     拾: { value: 10, secUnit: false },
//     佰: { value: 100, secUnit: false },
//     仟: { value: 1000, secUnit: false },
//     万: { value: 1000, secUnit: true },
//     亿: { value: 1000000, secUnit: true },
// }

// function ChineseToNumber(chnStr) {
//     let rtn = 0
//     let section = 0
//     let number = 0
//     const chnList = chnStr.split('')
//     if (chnList[0] === '十' || chnList[0] === '拾') {
//         chnList.unshift('一')
//     }

//     for (let i = 0; i < chnList.length; i++) {
//         const num = chnNumChar[chnList[i]]
//         if (typeof num !== 'undefined') {
//             number = num
//             if (i === chnList.length - 1) {
//                 section += number
//             }
//         } else {
//             const unit = chnNameValue[chnList[i]].value
//             const secUnit = chnNameValue[chnList[i]].secUnit
//             if (secUnit) {
//                 section = (section + number) * unit
//                 rtn += section
//                 section = 0
//             } else {
//                 section += number * unit
//             }
//             number = 0
//         }
//     }
//     return rtn + section
// }

function countBy(jielongByArea) {
    let count = 0
    jielongByArea.forEach(jielong => {
        const result = MEAL_COUNT.exec(jielong)
        // if (result && !isNaN(Number(result[1]))) {
        //     count += Number(result[1])
        // } else {
        //     count++
        // }
        if (result) {
            if (result[2]) {
                count += Number(result[2])
            } else if (result[3]) {
                count += ChineseToNumber(result[3])
            } else {
                count++
            }
        } else {
            count++
        }
    })
    return count
}

function countByMark(jielongByArea, searchRegex) {
    let markCount = 0
    let more = 0
    let less = 0
    const replaceByArea = []
    jielongByArea.forEach(originJielong => {
        let jielong = originJielong
        // const result = searchRegex.exec(jielong)
        // if (result) {
        //     if (!isNaN(Number(result[2]))) {
        //         markCount += Number(result[2])
        //     } else {
        //         markCount++
        //     }
        //     jielongByArea.push(jielong.replace(result[0], ''))
        // } else {
        //     replaceByArea.push(jielong)
        // }
        let result, matched
        while ((result = searchRegex.exec(jielong))) {
            matched = result[0]
            if (searchRegex === MORE_RICE || searchRegex === LESS_RICE) {
              if (result[2] === undefined && result[5] === '') {
                 if (/[杂饭河粉面条瓜薯]/.test(matched[matched.length - 2])) {
                    continue
                 }
              }
            }
            // if (!isNaN(Number(result[2]))) {
            //     markCount += Number(result[2])
            // } else {
            //     markCount++
            // }
            let add
            if (result[3]) {
                add = Number(result[3])
            } else if (result[4]) {
                add = ChineseToNumber(result[4])
            } else {
                add = 1
            }
            markCount += add
            const suffix = result[result.length - 1]
            if (suffix === '多') {
              more += add
            } else if (suffix === '少') {
              less += add
            }
            jielong = jielong.replace(matched.slice(1), '')
        }
        replaceByArea.push(jielong)
    })
    return {
        markCount,
        more,
        less,
        replaceByArea
    }
}

function countByChangeVegMark(jielongByArea, searchRegex) {
    const countList = []
    jielongByArea.forEach(jielong => {
        let result
        while ((result = searchRegex.exec(jielong))) {
            const text = result[5]
            let count
            // if (!isNaN(Number(result[2]))) {
            //     count = Number(result[2])
            // } else {
            //     count = 1
            // }
            if (result[3]) {
                count = Number(result[3])
            } else if (result[4]) {
                count = ChineseToNumber(result[4])
            } else {
                count = 1
            }
            countList.push({
                text,
                count,
            })
        }
    })
    return combineByVegName(countList)
}

/**
 * 按菜名合并每个菜几份
 * @param {换菜列表}} countList 
 */
function combineByVegName(countList) {
    const countObj = countList.reduce((mapObj, {count, text}) => {
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

function countAreaAll(areaGroup) {
    const countGroup = {}
    for (const area in areaGroup) {
        countGroup[area] = countByArea(areaGroup[area])
    }
    countGroup['合计'] = countAreaTotal(countGroup)
    return countGroup
}

function countByArea(jielongByArea) {
    let jielongList = jielongByArea
    return MARK_REGEXPS.map(({ type, search, output }) => {
        if (type === 'mealCount') {
            const count = countBy(jielongList)
            return {
                type,
                count,
                output,
            }
        }
        if (type === 'changeVeg') {
            const countList = countByChangeVegMark(jielongList, search)
            const listSize = countList.length
            let markCount = 0
            let markOutput = ''
            if (listSize > 0) {
                markOutput += `${output}(`
            }
            countList.forEach(({ text, count }, index) => {
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
        const { markCount, more, less, replaceByArea } = countByMark(jielongList, search)
        jielongList = replaceByArea
        return {
            type,
            count: markCount,
            more,
            less,
            output,
        }
    }).filter(({ count }) => count > 0)
}

function countAreaTotal(countGroup) {
    let total = 0
    let moreRiceTotal = 0
    let lessRiceMoreVegTotal = 0
    let lessRiceTotal = 0
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
              moreOrLess = moreOrLess.length > 0 ? `(${moreOrLess})` : ''
              return `${count}${output}${moreOrLess}`
        })
        .join(' ')
    const result = `<div>## ${area}统计<br/><br/>${countDisplay}</div>`
    document.querySelector('.jielong-statistics').innerHTML = result
}

function printAreaGroup(areaGroup) {
    let result = '<div>## 接龙分区<br/><br/>'
    for (const area in areaGroup) {
        result += `<span>${area}</span>：<br/>
                  ${areaGroup[area]
                      .map(jielong => {
                          if (MEAL_PAID.test(jielong)) {
                              return `<strong style="color: green">${jielong}</strong>`
                          }
                          return jielong
                      })
                      .join('<br/>')}`
        result += '<br/><br/>'
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
                moreOrLess = moreOrLess.length > 0 ? `(${moreOrLess})` : ''
                return `${count}${output}${moreOrLess}`
            })
            .join(' ')
        result += `${area}: ${countDisplay}<br/>`
    }
    result += '</div>'
    document.querySelector('.jielong-statistics').innerHTML = result
}

// 匹配格式如：小妍 H区，Fanni🌟 H3
const USER_NAME_AREA = /^\d+\.\s+(([\u4e00-\u9fa5]+|[A-Za-z]+)[🌈🦋🍉🌻💤🌟🎈]*[ \-—_~～]([A-Ma-m][区\d]?|[云微]谷\d?[A-Da-d]?座?)([，, -—_]?([多少]饭|不要米饭))?)/
// 匹配格式如：小妍 Fanni🌟H区
const USER_CENAME_AREA = /^\d+\.\s+(([\u4e00-\u9fa5]+ *[A-Za-z]*)[🌈🦋🍉🌻💤🌟🎈]*[ \-—_~～]*([A-Ma-m][区\d]?|[云微]谷\d?[A-Da-d]?座?)([，, -—_]?([多少]饭|不要米饭))?)/
// 匹配格式如：Fanni 小妍🌟H区
const USER_ECNAME_AREA = /^\d+\.\s+(([A-Za-z]+ *[\u4e00-\u9fa5]*)[🌈🦋🍉🌻💤🌟🎈]*[ \-—_~～]*([A-Ma-m][区\d]?|[云微]谷\d?[A-Da-d]?座?)([，, -—_]?([多少]饭|不要米饭))?)/
// 匹配格式如：Fanni 小FF妍🌟H区
const USER_ECMIX_AREA = /^\d+\.\s+(([\u4e00-\u9fa5A-Za-z ]+|\d+)[🌈🦋🍉🌻💤🌟🎈]*[ \-—_~～]*([A-Ma-m][区\d]?|[云微]谷\d?[A-Da-d]?座?))/
// 匹配格式如：H区小妍Fanni🌟
const USER_AREA_ECMIX = /^\d+\.\s+(([A-Ma-m][区\d]?|[云微]谷\d?[A-Da-d]?座?)[ \-—_~～]*([\u4e00-\u9fa5A-Za-z ]+|\d+)[🌈🦋🍉🌻💤🌟🎈]*)/

const USER_ESP_OTHER_NAME = /^\d+\.\s+(宝妹儿~|维 维|danna ²⁰²⁰|果果lynn🌈|Han🦋|西瓜锦鲤🍉|灵芝🌻|嘟嘟💤|Fanni🌟|邮储银行_郑婷婷🎈18826672976|🌱Carina|🌻Xue、)/
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
        if (AREA && AREA.takers && AREA.takers.length > 0) {
            AREA.takers.forEach(taker => {
                deliveryGroup[area].push(`@${taker}`)
            })
        }
        regexps.forEach((regexp, regIndex) => {
            const jielongLeft = []
            for (const index in jielongList) {
                const jielong = jielongList[index]
                const result = regexp.exec(jielong)
                if (result && result[1]) {
                    deliveryGroup[area].push(`@${result[1]}`)
                    console.log(regIndex, regexp, result[1])
                    countGroup[area]++
                    totalCount++
                } else {
                    jielongLeft.push(jielong)
                }
            }
            jielongList = jielongLeft
        })
    }
    console.log('countGroup', JSON.stringify(countGroup))
    console.log('totalCount', totalCount)
    return deliveryGroup
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
    const jielongList = jielongContent.split('\n')
    const countList = countByArea(jielongList)
    printCountList('J区', countList)
}

document.getElementById('button').onclick = function() {
    const inputJielong = document.querySelector('.jielong-input > textarea').value
    const jielongContent = inputJielong.slice(inputJielong.indexOf('1. '))
    const jielongList = jielongContent.split('\n')
    const areaGroup = groupAreaAll(jielongList, ['name', 'regex'])
    const countGroup = countAreaAll(areaGroup)
    const deliveryGroup = deliveryAreaAll(areaGroup)
    printAreaGroup(areaGroup)
    printCountGroup(countGroup)
    printDeliveryGroup(deliveryGroup)
}
