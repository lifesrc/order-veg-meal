# order-veg-meal

## 华为订素餐项目

- 初衷：让更多人更方便选择素食 ☘🍀🌱🌾🌽🥬🍎 希望为推广素食略尽绵薄之力 ✨
- 愿景：借助互联网的力量推广素食。项目属于公益性质，欢迎有兴趣的小伙伴加入 💫

## 程序入口

- 功能介绍：为素餐群店方提供了以下功能：各区统计（接龙分区、各区份数、各区金额、送餐路线），单区统计，核对账单（接龙、账单手动或自动匹配）。
- 功能预览: https://codepen.io/messfairy/full/qBOKzqW；主功能试用步骤：
  拷贝微信接龙、点击各区统计，即可统计分区、各区金额、送餐路线；
  拷贝微信接龙、选取当日微信账单、点击核对账单，即可统计接龙费用和收款账单，支持“用户接龙-账单”自动匹配和手动匹配。
- 线上源码:
  github: https://codepen.io/messfairy/pen/qBOKzqW（提示登录则输入用户名/密码，公共账号: lifesrc/lifesrc123)
  CODING 开放平台：https://messfairy-01.coding.net/p/order-veg-meal/d/order-veg-meal/git
- 核心代码: el-index.html el-index.js index.html index.js chn2number style.css

```javascript
// 错误的正则，eval之后丢失了\反引号
const _GAP_CHAR_ = `[ \-—_~～+,，]*`
// 匹配格式如：H区小妍Fanni🌟
// const USER_AREA_ECMIX = eval(`/^\d+\.\s+(([A-Ma-m][区东西南北\d](门岗)?|云谷\s*\d+栋|[云微]谷(\d?[A-Da-d])?座?|华为(地铁)?站?[Aa]出口)|金荣达[ \-—_~～+,，]*([\u4e00-\u9fa5A-Za-z]+|\d+|$)[🌱🍀🍃🌵🌻🌼🌸🍉🍭🎈🐟🦋🐝🌈🌟✨🎀💋💤💦● ོ་]*)/u`)
const USER_AREA_ECMIX = eval(
	`/^\d+\.\s+(([A-Ma-m][区东西南北\d](门岗)?|云谷\s*\d+栋|[云微]谷(\d?[A-Da-d])?座?|华为(地铁)?站?[Aa]出口|金荣达)[ \-—_~～+,，]*([\u4e00-\u9fa5A-Za-z]+|$)[🌱🍀🍃🌵🌻🌼🌸🍉🍭🎈🐟🦋🐝🌈🌟✨🎀💋💤💦● ོ་]*)/u`,
)
// 匹配格式如：小妍 H区，Fanni🌟 H3
const USER_NAME_AREA = eval(
	`/^\d+\.\s+((ଳ|Uwangzuge🥨|💋YG_廖✨🌟|🌙 Moonlion|🍀Mʚ💋ɞ🍬|🍭オゥシュゥ🍭|喵喵张😝|🍋 易湘娇|尐霏|🍀 杨茜|_Carina..💭|\^点点滴滴\^|Going. down. this. road|L~i~n|Cindy。|Nancy。|641℃|[\u4e00-\u9fa5]+|[A-Z a-z]+)[🌱🍀🍃🌵🌻🌼🌸🍉🍭🎈🐟🦋🐝🌈🌟✨🎀💋💤💦🍼● ོ་]*[ \-—_~～+,，]*([A-Ma-m][区东西南北\d](门岗)?|云谷\s*\d+栋|[云微]谷(\d?[A-Da-d])?座?|华为(地铁)?站?[Aa]出口|金荣达))/u`,
) // ([，, -—_]?([多少]饭|不要米饭))?
// 匹配格式如：小妍 Fanni🌟H区
const USER_CENAME_AREA = eval(
	`/^\d+\.\s+(([\u4e00-\u9fa5]+ *([A-Z a-z]*|\d*))[🌱🍀🍃🌵🌻🌼🌸🍉🍭🎈🐟🦋🐝🌈🌟✨🎀💋💤💦● ོ་]*[ \-—_~～+,，]*([A-Ma-m][区东西南北\d](门岗)?|云谷\s*\d+栋|[云微]谷(\d?[A-Da-d])?座?|华为(地铁)?站?[Aa]出口|金荣达))/u`,
)
// 匹配格式如：Fanni 小妍🌟H区
const USER_ECNAME_AREA = eval(
	`/^\d+\.\s+(([A-Za-z]+(\([A-Z a-z●–]+\))? *[\u4e00-\u9fa5]*)[🌱🍀🍃🌵🌻🌼🌸🍉🍭🎈🐟🦋🐝🌈🌟✨🎀💋💤💦● ོ་]*[ \-—_~～+,，]*([A-Ma-m][区东西南北\d](门岗)?|云谷\s*\d+栋|[云微]谷(\d?[A-Da-d])?座?|华为(地铁)?站?[Aa]出口|金荣达))/u`,
)
// 匹配格式如：Fanni 小FF妍🌟H区
const USER_ECMIX_AREA = eval(
	`/^\d+\.\s+(([\u4e00-\u9fa5A-Z a-z]+|\d+)[🌱🍀🍃🌵🌻🌼🌸🍉🍭🎈🐟🦋🐝🌈🌟✨🎀💋💤💦● ོ་]*[ \-—_~～+,，]*([A-Ma-m][区东西南北\d](门岗)?|云谷\s*\d+栋|[云微]谷(\d?[A-Da-d])?座?|华为(地铁)?站?[Aa]出口|金荣达))/u`,
)
// 匹配其它格式：无园区，列举特别格式的姓名
const USER_ESP_OTHER_NAME = eval(
	`/^\d+\.\s+(ଳ|Uwangzuge🥨|💋YG_廖✨🌟|🌙 Moonlion|🍀Mʚ💋ɞ🍬|喵喵张😝|🍋 易湘娇|尐霏|宝妹儿~|维 维|danna ²⁰²⁰|Cindy。|Nancy。|🍀 杨茜|_Carina..💭|🌱Carina|_Carina🌱|🌻Xue、|🍭オゥシュゥ🍭|春春——E区 少饭|sᴛᴀʀʀʏ.|D区门岗-赵金亮)/u`,
)
// const USER_ECMIX_OTHER_NAME = eval(`/^\d+\.\s+([\u4e00-\u9fa5]+ *[A-Za-z]*|[A-Za-z]+ *[\u4e00-\u9fa5]*|\d+)/u`)
const USER_ECMIX_OTHER_NAME = eval(
	`/^\d+\.\s+(([\u4e00-\u9fa5]+[ \-—_~～+,，]*[A-Za-z]*|[A-Za-z]+[ \-—_~～+,，]+[A-Za-z]+|[A-Za-z]+ga p[\u4e00-\u9fa5]*|\d+)[🌱🍀🍃🌵🌻🌼🌸🍉🍭🎈🐟🦋🐝🌈🌟✨🎀💋💤💦● ོ་]*)/u`,
)
```
