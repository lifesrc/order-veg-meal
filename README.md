# order-veg-meal

## 订素餐项目
- 初衷：让更多人更方便选择素食☘🍀🌱🌾🌽🥬🍎希望为推广素食略尽绵薄之力✨
- 愿景：借助互联网的力量推广素食。项目属于公益性质，欢迎有兴趣的小伙伴加入💫

## 程序入口
- 核心代码: index.html index.js chn2number style.css
- codepen: 
- 运行试一试: https://codepen.io/messfairy/full/qBOKzqW
（拷贝接龙到输入框，点击各区统计即可得运行结果）
- 线上源码编辑: https://codepen.io/messfairy/pen/qBOKzqW
（提示登录则输入用户名/密码，公共账号: lifesrc/lifesrc123)
CODING 开放平台：
https://messfairy-01.coding.net/p/order-veg-meal/d/order-veg-meal/git


```javascript
// 错误的正则，eval之后丢失了\反引号
const _GAP_CHAR_ = `[ \-—_~～+,，]*`
// 匹配格式如：H区小妍Fanni🌟
// const USER_AREA_ECMIX = eval(`/^\d+\.\s+(([A-Ma-m][区东西南北\d](门岗)?|云谷\s*\d+栋|[云微]谷(\d?[A-Da-d])?座?|华为(地铁)?站?[Aa]出口)|金荣达[ \-—_~～+,，]*([\u4e00-\u9fa5A-Za-z]+|\d+|$)[🌱🍀🍃🌵🌻🌼🌸🍉🍭🎈🐟🦋🐝🌈🌟✨🎀💋💤💦● ོ་]*)/`)
const USER_AREA_ECMIX = eval(`/^\d+\.\s+(([A-Ma-m][区东西南北\d](门岗)?|云谷\s*\d+栋|[云微]谷(\d?[A-Da-d])?座?|华为(地铁)?站?[Aa]出口|金荣达)[ \-—_~～+,，]*([\u4e00-\u9fa5A-Za-z]+|$)[🌱🍀🍃🌵🌻🌼🌸🍉🍭🎈🐟🦋🐝🌈🌟✨🎀💋💤💦● ོ་]*)/`)
// 匹配格式如：小妍 H区，Fanni🌟 H3
const USER_NAME_AREA = eval(`/^\d+\.\s+((ଳ|Uwangzuge🥨|💋YG_廖✨🌟|🌙 Moonlion|🍀Mʚ💋ɞ🍬|🍭オゥシュゥ🍭|喵喵张😝|🍋 易湘娇|尐霏|🍀 杨茜|_Carina..💭|\^点点滴滴\^|Going. down. this. road|L~i~n|Cindy。|Nancy。|641℃|[\u4e00-\u9fa5]+|[A-Z a-z]+)[🌱🍀🍃🌵🌻🌼🌸🍉🍭🎈🐟🦋🐝🌈🌟✨🎀💋💤💦🍼● ོ་]*[ \-—_~～+,，]*([A-Ma-m][区东西南北\d](门岗)?|云谷\s*\d+栋|[云微]谷(\d?[A-Da-d])?座?|华为(地铁)?站?[Aa]出口|金荣达))/`)  // ([，, -—_]?([多少]饭|不要米饭))?
// 匹配格式如：小妍 Fanni🌟H区
const USER_CENAME_AREA = eval(`/^\d+\.\s+(([\u4e00-\u9fa5]+ *([A-Z a-z]*|\d*))[🌱🍀🍃🌵🌻🌼🌸🍉🍭🎈🐟🦋🐝🌈🌟✨🎀💋💤💦● ོ་]*[ \-—_~～+,，]*([A-Ma-m][区东西南北\d](门岗)?|云谷\s*\d+栋|[云微]谷(\d?[A-Da-d])?座?|华为(地铁)?站?[Aa]出口|金荣达))/`)
// 匹配格式如：Fanni 小妍🌟H区
const USER_ECNAME_AREA = eval(`/^\d+\.\s+(([A-Za-z]+(\([A-Z a-z●–]+\))? *[\u4e00-\u9fa5]*)[🌱🍀🍃🌵🌻🌼🌸🍉🍭🎈🐟🦋🐝🌈🌟✨🎀💋💤💦● ོ་]*[ \-—_~～+,，]*([A-Ma-m][区东西南北\d](门岗)?|云谷\s*\d+栋|[云微]谷(\d?[A-Da-d])?座?|华为(地铁)?站?[Aa]出口|金荣达))/`)
// 匹配格式如：Fanni 小FF妍🌟H区
const USER_ECMIX_AREA = eval(`/^\d+\.\s+(([\u4e00-\u9fa5A-Z a-z]+|\d+)[🌱🍀🍃🌵🌻🌼🌸🍉🍭🎈🐟🦋🐝🌈🌟✨🎀💋💤💦● ོ་]*[ \-—_~～+,，]*([A-Ma-m][区东西南北\d](门岗)?|云谷\s*\d+栋|[云微]谷(\d?[A-Da-d])?座?|华为(地铁)?站?[Aa]出口|金荣达))/`)
// 匹配其它格式：无园区，列举特别格式的姓名
const USER_ESP_OTHER_NAME = eval(`/^\d+\.\s+(ଳ|Uwangzuge🥨|💋YG_廖✨🌟|🌙 Moonlion|🍀Mʚ💋ɞ🍬|喵喵张😝|🍋 易湘娇|尐霏|宝妹儿~|维 维|danna ²⁰²⁰|Cindy。|Nancy。|🍀 杨茜|_Carina..💭|🌱Carina|_Carina🌱|🌻Xue、|🍭オゥシュゥ🍭|春春——E区 少饭|sᴛᴀʀʀʏ.|D区门岗-赵金亮)/`)
// const USER_ECMIX_OTHER_NAME = eval(`/^\d+\.\s+([\u4e00-\u9fa5]+ *[A-Za-z]*|[A-Za-z]+ *[\u4e00-\u9fa5]*|\d+)/`)
const USER_ECMIX_OTHER_NAME = eval(`/^\d+\.\s+(([\u4e00-\u9fa5]+[ \-—_~～+,，]*[A-Za-z]*|[A-Za-z]+[ \-—_~～+,，]+[A-Za-z]+|[A-Za-z]+ga p[\u4e00-\u9fa5]*|\d+)[🌱🍀🍃🌵🌻🌼🌸🍉🍭🎈🐟🦋🐝🌈🌟✨🎀💋💤💦● ོ་]*)/`)

```