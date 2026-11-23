# 《Vampire Crawlers》Combo 规则核对

研究日期：2026-11-23。只核对参考游戏，不实施《灯下偶戏》玩法。

## 最重要的结论

原游戏基础 Combo 按**卡牌 Mana 费用的连续递增**建立，不是按颜色，也不是单纯“随便打一张就永久涨倍率”。Wild 是保持当前链条、允许接任意费用的桥接牌。奖励由官方称为**放大卡牌效果**，不能直接改写成“重复整张卡的全部触发”。

## 一手来源与版本

主证据是 poncle 官方教学 [Let’s Explore Vampire Crawlers — Episode 2][ep2]，发布时间 2026-01-29，时长 118 秒。本次已读取官方英语字幕，并查看官方录像的关键画面；它是发布前教学，不代表所有后续 Arcana/Gem 例外。

2026-02-06 的 [官方 Steam 公告][episode-news]明确链接该集并概述 Combo。2026-04-21 [正式发布公告][release]仍将“ascending mana order，每步放大下一张效果”列为基础系统。2026 年后续公告用来补足新卡与抽弃边界。

## 1. 递增的是什么，必须加一吗

**官方说明／EP2 29–38 秒**：按从低到高的 Mana 顺序打牌，链条越深，当前牌效果的倍率越高。

**官方说明／49–65 秒**：示范先打 0、再 1、再 2，接 Peachone；短链 `0→1` 与 `1→2` 也有效。

**官方说明／75–78 秒**：明确说“有 1，但没有 2 来继续 Combo，因此卡住”。这支持连续 `+1`，不支持把 `1→3` 当作正常续链。

**实际画面／约 50–57 秒**：费用链 `0→1→2→3` 的后续卡分别出现 `×2、×3、×4`。这是示例计数的观察，不是对所有改造卡的全量公式验收。

**官方说明／2026-10-05**：新卡 Karoma’s Mana 的 Adaptability 会将其费用变为上一个加入 Combo 的牌的费用 `+1`，进一步印证这个连接条件。[开发更新][oct-preview]

**结论边界**：颜色可用于其他卡牌类型/角色规则，但这些官方 Combo 来源没有把同色连续列为基础条件。《灯下偶戏》若采用同色连续，应作为本作设计，不能声称照搬该游戏。

## 2. Combo 奖励是什么

**官方说明／EP2 35–38 秒、Steam 教学公告**：放大牌的 effect/effectiveness。官方发布与商店同样称“each step multiplies the next card’s effect”。[episode-news] [release] [store]

**实际画面**：攻击牌的效果区与右侧链条显示倍率；后续演示也能看到 Mana、Armor 等非纯伤害卡与高倍率链条共存。因此把官方描述缩窄成“仅伤害最终乘倍”也不充分。

**尚未核实**：每一种效果的精确倍率应用、整数舍入、持续效果怎样放大、触发型卡是否重复执行，以及一张卡多项效果是否全部重放。本次没有拿到完整效果引擎规则；不能把“效果乘倍”自动翻译成“整张牌再演 N 次”。

## 3. Wild 如何延续与重置

**官方说明／EP2 81–90 秒**：费用显示 `W` 的 Wild 不收 Mana，允许接任意牌。

**官方说明／92–100 秒**：给出 `0→1→2→W→0→1→2`，并明确倍率继续上升。Wild 不是把当前 Combo 清零，而是保留累积、重开下一段费用递增。

**尚未核实**：连续多张 W 的全部边界、W 自身的效果如何套倍率、普通错误顺序是否必然重开 `×1`、全部特殊 Gem/Arcana 是否改变重置规则。

官方 2026-06-23 公告把 Gem “Easy Combo”改名为“Combo Breaker”，理由正是玩家没有理解“使用这个 Gem 会结束 Combo”。这证明存在与 Wild 不同的断链机制，不能把所有“帮助续链”的牌都合并描述。[QOL 公告][qol]

## 4. 抽牌、一个回合与跨回合

**官方说明／EP2 67–69 秒**：一个 round 里可以发动多个独立 Combo。官方将长链例子描述为推动单个 turn 到 10、20、30 张。[ep2] [release]

**官方说明／2026-10-05**：Chair Game 每 turn 可发动一次 Switch，弃掉最多四张无法续链的牌并抽替代牌，以保持 Combo，哪怕当前仅 `×1`；弃牌还可触发 Afterlife、Scavenge 等效果。[oct-preview]

**官方说明／2026-10-12**：把 Handsize 文案改成 Deal Count，明确它是**turn 开始时发牌的数量**，不是手中牌数的绝对上限。[更新][oct-release]

这些证据支持“用抽牌与替换避免链条卡死”。**本次没有直接核实**标准 Combo 在 End Turn 的具体清零时点、能否通过特殊 Arcana 跨 turn 保留、跨 encounter 规则、初始 Mana/抽牌数与牌堆耗尽规则。不能由单回合爽快长链，推成整场自动持续涨倍率。

## 5. 对参考使用的边界

可确认的原机制是“安排连续费用 → 提升即时效果 → Wild 桥接 → 抽牌/换牌找到续链”，系统允许快速排入动作，后台按顺序结算。它同时包含连锁奖励与续链限制。

用户提出的“按顺序演出增加观众”或“同色连续增加观众”可以借用这种连贯感；但观众是否跨幕保留、换色如何处理、是否累积整场热度，是本作需要确认的规则，不是上述官方资料已经给出的答案。

[ep2]: https://www.youtube.com/watch?v=0XRi8ddiK34
[episode-news]: https://steamcommunity.com/games/3265700/announcements/detail/1823825466499178
[release]: https://steamcommunity.com/games/3265700/announcements/detail/1830163047268999
[store]: https://store.steampowered.com/app/3265700/Vampire_Crawlers_The_Turbo_Wildcard_from_Vampire_Survivors/
[oct-preview]: https://steamcommunity.com/games/3265700/announcements/detail/1845383656393898
[oct-release]: https://steamcommunity.com/games/3265700/announcements/detail/1846018067941244
[qol]: https://steamcommunity.com/games/3265700/announcements/detail/1835871199315612
