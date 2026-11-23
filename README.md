# 灯下偶戏

当前v12试玩：九只木偶、三幕演出、三色匹配招客。观众推动整数倍率增长，取消逐幕分数门槛；卡牌、六套预设和两本剧情一起适配。优先试「彩戏搭台」看杂耍调色与道具配合。

## 本地试玩

在本项目目录运行：

```powershell
python scripts/local_site.py --port 43182
```

[巡演入口](http://127.0.0.1:43182/) · [剧情入口](http://127.0.0.1:43182/story.html) · [版本记录](VERSIONS.md) · [规则说明](DESIGN.md)。端口43181可能仍运行旧目录，当前最新版使用43182。也可双击「启动剧情戏台.bat」，再从页面切换巡演。

## 离线HTML

exports/Dengxia-Ouxi-v12.html为巡演，exports/Dengxia-Ouxi-v12-story.html为剧情，分别可下载后用浏览器打开。两文件放在同一目录时可互相切换；不需要安装Node或启动服务器。飞书内置预览可能不执行游戏脚本，请下载到电脑后打开。

生成已冻结版本的两份文件：

```powershell
python scripts/standalone.py v12 exports/Dengxia-Ouxi-v12.html
python scripts/standalone.py v12 exports/Dengxia-Ouxi-v12-story.html --page story.html
```

## 代码与验证

- dist/rules.js拥有卡牌、颜色和共享结算；dist/deck.js拥有戏班与局内副本。
- dist/game.js与dist/story.js使用同一结算。dist/scenarios.js拥有台本、固定/开放席、人物与产出条件。剧情戏簿沿用dengxia-books，巡演v12进度使用独立存档键。
- 五派三十种木偶，每派朱/青/金各两种；剧情六种木偶不进入自由构筑池。
- node --test scripts/rules.test.mjs验证结算、调色、跨幕、容量等契约。
- node scripts/playtest.mjs 300检查六套戏班的可达性和配色排演；beam结果不是严格最优证明。
- versions/v11保留改前网页；versions/v12保留本次冻结版本。快照由scripts/local_site.py --backup创建，拒绝覆盖。

本次交付网页试玩。后续Godot原生接入、世界取得木偶和永久故事进度仍待实施。
