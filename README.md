# 灯下偶戏

当前 v17 试玩。巡演提供默认五选三和逐席三选一，两种模式分别保存。直接开演使用花蝶，可在选戏班中试其他基础预设和自由构筑。

## 本地试玩

在本项目目录运行：

```powershell
python scripts/local_site.py --port 43182
```

[巡演入口](http://127.0.0.1:43182/) · [剧情入口](http://127.0.0.1:43182/story.html) · [版本记录](VERSIONS.md) · [规则说明](DESIGN.md)。端口43181可能仍运行旧目录，当前最新版使用43182。也可双击「启动剧情戏台.bat」，再从页面切换巡演。

## 离线HTML

`Dengxia-Ouxi-v17.html` 为巡演，`Dengxia-Ouxi-v17-story.html` 为剧情。用浏览器打开，放在同一目录时可互相切换。

生成已冻结版本的两份文件：

```powershell
python scripts/standalone.py v17 exports/Dengxia-Ouxi-v17.html
python scripts/standalone.py v17 exports/Dengxia-Ouxi-v17-story.html --page story.html
```

## 代码与验证

- dist/rules.js拥有卡牌、颜色和共享结算；dist/deck.js拥有戏班与局内副本。
- dist/game.js 与 dist/story.js 使用同一结算。dist/scenarios.js 保存台本、固定或开放席、人物与产出条件。剧情戏簿沿用 dengxia-books，巡演两种模式分别保存进度。
- 巡演有四派，每派八种木偶，另有八种通用木偶。同一套牌的所有副本在每局开始时随机分色。
- node --test scripts/rules.test.mjs验证结算、调色、跨幕、容量等契约。
- node scripts/playtest.mjs 200 按两种模式比较配色优先与即时得分优先策略。
- node scripts/card-balance.mjs 600 评估全部巡演卡。逐席策略按已揭候选选牌，用随机样本估计后续席位。第二个参数可传历史版本 rules.js 的路径，用该版本的戏班和同一套随机种子复跑。
- 加上 --details 查看各色候选实际入同色席和技能触发的次数、烟花释放时间，以及同阵容开启调色后的分差。
- [历次试玩快照](VERSIONS.md) 可用于对比。快照由 scripts/local_site.py --backup 创建。

本次交付网页试玩。后续Godot原生接入、世界取得木偶和永久故事进度仍待实施。
