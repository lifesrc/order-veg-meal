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

window.ChineseToNumber = ChineseToNumber
