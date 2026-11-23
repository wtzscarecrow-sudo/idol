// 剧情剧本数据层：把飞书台本 + 关键帧原型落成可玩的剧本结构。
//
// 剧本结构：
//   scenario = { id, title, book, summary, endCard, acts:[ act... ] }
//   act = {
//     type: 'puzzle'（默认，排戏过关）| 'performance'（纯演出幕，点击开演即可）
//     name, place,              // 幕名 / 场景（对应 stage.js 的 venueSkies）
//     narration:[{who,text}],   // 台本，逐句播放；who 命中 cueNames 则追光对应木偶
//     // —— puzzle 幕 ——
//     pool: [id...],            // 本幕可选木偶池
//     locked: [{slot,id}],      // 锁定站位（戏班原有，不可移动）
//     backdrops: [id...],       // 可切背景幕（未选 = null「未挂」）
//     gauzes: [id...],          // 可切前景纱幕
//     openSlots, maxPuppets,     // 开放位置和容量，锁定人物也计入
//     requires: [{kind,id/type,n,failLine}],  // 要素条件（遇仙用）
//     judge: {...},             // 分支判定（风雪归人用），见下
//     hint,
//   }
//
// judge（分支判定）：true/official 是两条完整演出，其余按序命中 flops 的提示。
//   judge = {
//     true:    { when:{backdrop,gauze,slot2,slot3} },   // 真实版本
//     official:{ when:{...} },                          // 官方版本（有意义的错版）
//     flops:   [{ when:{...}, line:'班主提示' }],        // 按序匹配第一条
//     branches:{ official:{narration,clue}, true:{narration} },
//   }
//   when 取值：backdrop/gauze = 选项 id；'!x' = 非 x；null = 未选；
//             slot2/slot3 = 木偶 id；'empty' = 空；'!empty' = 非空。
//
// 同一套 scoreAct 数值引擎，同一套要素条件，只是判定结果从二值扩展为多分支。

export const yuXian = {
  id: 'yuxian',
  title: '遇仙',
  book: '钧州旧事 · 一',
  summary: '钧州民间传说：风雪迷途，忽入仙境，醒来却在自家门前，却忘尽途中所见。',
  opening: {
    title: '遇仙',
    poem: ['刻木牵丝作老翁，鸡皮鹤发与真同。', '须臾弄罢寂无事，还似人生一梦中。'],
    from: '—— 唐·《咏木老人》',
  },
  endCard: {
    title: '《遇仙》· 三幕已成',
    quote: '那阮樵再想不起仙宫里的半点光景，只道是做了一场雪夜大梦。',
    stamp: '戏簿 +1 ｜ 钧州旧事 1 / 5',
  },
  acts: [
    {
      type: 'puzzle',
      name: '第一幕 · 迷途',
      place: '雪山',
      requires: [
        { kind: 'cast', id: 'woodcutter', failLine: '风雪里得先让樵夫登台立住。' },
      ],
      pool: ['woodcutter', 'florist', 'rain'],
      narration: [
        { who: '旁白', text: '话说钧州地界，终年风雪不歇。老人们常说，雪落三尺，山中便多三分怪事。' },
        { who: '旁白', text: '这一日，阮樵上山打柴，谁知天公忽变了脸，顷刻间飞雪蔽日，狂风迷途。' },
        { who: '樵夫', text: '怪哉！怎的不见来时路？这雪越下越大，怕是不好。' },
        { who: '旁白', text: '不多时，天地一白，东西莫辨。阮樵哆嗦着拢紧衣襟，忽见风雪尽头，隐隐几点灯火。' },
        { who: '樵夫', text: '前不着村，后不着店，怎的这深山里还有人家？风雪难行，今日怕是下不了山，不若向他们借宿一宿。' },
      ],
      hint: '让樵夫登场。其他木偶可帮忙招客，不设单幕分数门槛。',
    },
    {
      type: 'puzzle',
      name: '第二幕 · 遇仙',
      place: '仙境',
      requires: [
        { kind: 'cast', id: 'immortal', failLine: '这一折，仙人得登场。' },
        { kind: 'produce', type: 'flower', n: 1, failLine: '本幕得让台上开出一朵花来。' },
      ],
      pool: ['woodcutter', 'immortal', 'florist', 'flowerShow'],
      narration: [
        { who: '旁白', text: '说来也奇，行不过半里，风雪渐收——云洒金，鸟鸣呤，但见一座通体莹白、朱栏玉砌的宫殿浮于雪雾之间。' },
        { who: '樵夫', text: '嘶……这是走到仙境里头了？莫非是哪位仙家怜我受冻，特意引路？' },
        { who: '仙人', text: '山中风寒，且进来避一避吧。' },
        { who: '旁白', text: '那声清越，不似凡人。白玉铺地，明珠悬顶，又闻殿中瑞香袅袅，不多时，却叫他眼皮发沉，呵欠连天。' },
        { who: '樵夫', text: '仙长……敢问此处是何方仙境？待小人明日醒来，也好记着仙家恩德。' },
        { who: '仙人', text: '此间所见，不必记挂。风雪既停，你便归家吧。' },
      ],
      hint: '仙境有琪花瑞草。除了让仙人登场，本幕还得让台上开出一朵花来。',
    },
    {
      type: 'puzzle',
      name: '第三幕 · 归家',
      place: '城门外',
      requires: [
        { kind: 'cast', id: 'woodcutter', failLine: '樵夫得在场。' },
        { kind: 'cast', id: 'wife', failLine: '妻子得在场。' },
      ],
      pool: ['woodcutter', 'wife', 'florist', 'flowerShow'],
      narration: [
        { who: '旁白', text: '那阮樵恍恍惚惚，酣眠一场，如坠云中，再一睁眼，竟已至钧州城门前。' },
        { who: '樵夫', text: '我……我不是睡在仙境里么？' },
        { who: '妻子', text: '你这人，打柴打了一夜，倒把自家门认不得了？好端端的发什么癫？' },
        { who: '樵夫', text: '什么胡话！我真见到了仙人，我明明记着……记着……' },
        { who: '旁白', text: '到底真是仙家渡人，还是山精摄魂、雪夜一梦？真耶幻耶，梦耶醒耶，不过作一故事，说与列位看官。' },
      ],
      hint: '归家的戏，樵夫与妻子都得在场。上一幕留下的花，也许正用得上。',
    },
  ],
};

export const fengXueGuiRen = {
  id: 'fengxue',
  title: '风雪归人',
  book: '钧州旧事 · 二',
  summary: '钧州守将风雪迷途，传说是仙人引他归家。戏班里第三折缺了一只偶——你在大世界里找回的那只，手里提着一盏灯。',
  opening: {
    title: '风雪归人',
    poem: ['刻木牵丝作老翁，鸡皮鹤发与真同。', '须臾弄罢寂无事，还似人生一梦中。'],
    from: '—— 唐·《咏木老人》',
  },
  peak: {
    prompt: '拉绳 · 揭开后幕',
    lines: [
      { who: '班主', text: '（压低声）这块后幕……二十年没人拉开过。' },
      { who: '旁白', text: '（后幕透光，剪影浮现）风雪夜里，提灯的老妪把将军送到了城下——' },
      { who: '旁白', text: '——然后自己转身，回到了风雪里。' },
      { who: '将军', text: '（回望后幕）……原来，是你。' },
    ],
  },
  endCard: {
    title: '《风雪归人》· 全本已补全',
    quote: '老艺人：“这出戏我演了二十年，今天，头一回演完整。”',
    stamp: '戏簿 +1 ｜ 钧州旧事 2 / 5',
  },
  acts: [
    {
      type: 'performance',
      name: '第一折 · 亮相',
      place: '雪山',
      cast: ['general'],
      narration: [
        { who: '旁白', text: '第一折 · 亮相 —— 钧州守将，奉命出城。' },
        { who: '将军', text: '天色将晚，速去速回。' },
      ],
    },
    {
      type: 'performance',
      name: '第二折 · 迷途',
      place: '雪山',
      cast: ['general'],
      narration: [
        { who: '旁白', text: '第二折 · 迷途 —— 风雪骤起，雪深三尺。' },
        { who: '将军', text: '此处……是何处？城在哪边？' },
        { who: '班主', text: '（翻戏本）……第三折「遇仙」这页被撕了，还缺一只偶。' },
      ],
    },
    {
      type: 'puzzle',
      name: '第三折 · 遇仙',
      place: '雪山',
      locked: [{ slot: 0, id: 'general' }],
      backdrops: ['snow', 'gate', 'tent'],
      gauzes: ['none', 'snow', 'moon'],
      pool: ['granny', 'immortal', 'soldier'],
      maxPuppets: 2,
      openSlots: [0,2],
      // 光环系统（统一规则）：布景/纱幕自带光环，加成作用于「对路的角色或生成物」。
      // 布景仅影响贡献，故事推进由人物与台本要素判定。
      auras: [
        { kind: 'backdrop', id: 'snow', effect: { target: 'resource', type: 'lamp', per: 1 }, note: '风雪中灯火最显眼：每盏灯 +1 喝彩' },
        { kind: 'backdrop', id: 'gate', effect: { target: 'card', id: 'immortal', per: 1 }, note: '城门显仙迹：仙人 +1 喝彩' },
        { kind: 'backdrop', id: 'tent', effect: { target: 'card', id: 'soldier', per: 2 }, note: '军帐是兵营：兵卒 +2 喝彩' },
        { kind: 'gauze', id: 'snow', effect: { target: 'prop', prop: 'lamp', per: 1 }, note: '风雪夜里灯最亮：持灯木偶 +1 喝彩' },
        { kind: 'gauze', id: 'moon', effect: { target: 'card', id: 'immortal', per: 1 }, note: '月夜显仙气：仙人 +1 喝彩' },
      ],
      judge: {
        true: { when: { slot3: 'granny' } },
        official: { when: { slot3: 'immortal' } },
        branches: {
          official: {
            narration: [
              { who: '仙人', text: '凡人迷途，吾送汝归。' },
              { who: '旁白', text: '看客喝彩——好！神仙显灵咯！' },
              { who: '班主', text: '大家都是这么演的，演了二十年，看客最爱这一段。' },
              { who: '班主', text: '……可你找回来的那只偶，手里为什么提着一盏灯？' },
            ],
            clue: '已看过 · 官方版本：仙人送将军归城——看客都信这一版。',
          },
          true: {
            narration: [
              { who: '老妪', text: '将军，城在这边。跟着这盏灯走。' },
              { who: '将军', text: '老人家……您是？' },
              { who: '旁白', text: '一盏灯，引着将军走出了风雪。' },
            ],
          },
        },
      },
      narration: [
        { who: '班主', text: '第三折「遇仙」——幕布木偶都散了。布景纱幕各有各的光环，只帮对路的木偶和灯盏。劳驾帮我排回来。' },
      ],
      hint: '本折只演两人：将军固定在开场，过场封闭。选一只木偶放到收场，补回引路的人；布景只加分，不挡故事。',
    },
    {
      type: 'performance',
      name: '第四折 · 归家',
      place: '城门外',
      cast: ['general'],
      dark: 0.6,
      narration: [
        { who: '旁白', text: '第四折 · 归家 —— 回过神时，将军已站在城门下。' },
        { who: '将军', text: '方才……是谁引我回来的？' },
        { who: '旁白', text: '城里人都说，那是仙人。二十年过去，再没人提起那盏灯。' },
      ],
    },
  ],
};

export const scenarios = [yuXian, fengXueGuiRen];

// 要素条件里的道具类型 → 展示名
export const typeLabels = { flower: '花', bloom: '盛花', firework: '烟花', bonsai: '盆景', butterfly: '蝶', audience: '观众', coin: '赏钱', applause: '喝彩', lamp: '灯盏' };

// 旁白里的称呼 → 木偶 id（谁说话，追光就打给谁）
export const cueNames = { 樵夫: 'woodcutter', 仙人: 'immortal', 妻子: 'wife', 将军: 'general', 老妪: 'granny' };

// 幕布 / 纱幕选项与展示名
export const backdropNames = { snow: '雪原', gate: '城门', tent: '军帐' };
export const gauzeNames = { none: '无', snow: '风雪纱', moon: '月夜纱' };
// 幕布 id → stage.js 场景名（未挂幕 = 空幕）
export const venueOf = backdrop => backdrop === null ? '空幕' : ({ snow: '雪山', gate: '城门外', tent: '军帐' })[backdrop] ?? '空幕';
