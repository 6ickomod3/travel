import type { Trip } from "../../src/data/types";

export default {
  "slug": "japan-2026",
  "title": "日本，秋日之旅",
  "country": "日本",
  "countryCode": "JP",
  "startDate": "2026-11-13",
  "endDate": "2026-11-21",
  "status": "upcoming",
  "language": "zh-CN",
  "travelers": 2,
  "itineraryStatus": "agreed",
  "summary": "大阪往返，经广岛、宫岛、熊野古道和川汤温泉，19号走新宫、那智、纪伊胜浦返回大阪；两天徒步约20.8公里。",
  "cover": "/images/trips/japan-2026/miyajima.webp",
  "coverAlt": "夕光下的宫岛严岛神社大鸟居，倒映在海水中。",
  "coverCredit": "图片：Jakub Hałun / Wikimedia Commons / CC BY 4.0",
  "routeSummary": [
    "大阪",
    "广岛 · 宫岛",
    "纪伊田边 · 熊野古道",
    "川汤温泉",
    "新宫 · 那智 · 纪伊胜浦",
    "大阪 · 奈良"
  ],
  "mapRoute": [
    "osaka",
    "hiroshima",
    "miyajima",
    "hiroshima",
    "osaka",
    "kii-tanabe",
    "kumano-kodo",
    "kawayu",
    "shingu",
    "nachi",
    "kii-katsuura",
    "osaka",
    "nara",
    "osaka"
  ],
  "destinations": [
    {
      "id": "osaka",
      "name": "大阪",
      "englishName": "Osaka",
      "lat": 34.6937,
      "lng": 135.5023,
      "description": "Hotel Hankyu RESPIRE Osaka两段入住已订；大箱14–19号跨5晚寄存仍需酒店明确同意。"
    },
    {
      "id": "hiroshima",
      "name": "广岛",
      "englishName": "Hiroshima",
      "lat": 34.3853,
      "lng": 132.4553,
      "description": "和平纪念公园、资料馆和连续两晚住宿，也是宫岛一日游的出发地。"
    },
    {
      "id": "miyajima",
      "name": "宫岛",
      "englishName": "Miyajima",
      "lat": 34.2955,
      "lng": 132.3199,
      "description": "上午缆车，中午严岛神社与水中鸟居，下午大圣院火渡；预约与潮汐时间需临近复核。"
    },
    {
      "id": "kii-tanabe",
      "name": "纪伊田边",
      "englishName": "Kii-Tanabe",
      "lat": 33.7331,
      "lng": 135.3777,
      "description": "16号入住Comfort Hotel Kii Tanabe，领取地图与章册、购买徒步补给；19号乘黑潮经过时留在车上。"
    },
    {
      "id": "kumano-kodo",
      "name": "熊野古道",
      "englishName": "Kumano Kodo",
      "lat": 33.8155,
      "lng": 135.6062,
      "description": "泷尻经高原徒步到近露；翌日乘车到发心门，再步行前往本宫。地图以近露附近作概略标记。"
    },
    {
      "id": "kawayu",
      "name": "川汤温泉",
      "englishName": "Kawayu Onsen",
      "lat": 33.8131,
      "lng": 135.7748,
      "description": "11月18日晚的温泉休息地；11月按旅馆温泉安排。"
    },
    {
      "id": "shingu",
      "name": "新宫",
      "englishName": "Shingu",
      "lat": 33.7242,
      "lng": 135.9928,
      "description": "19号主方案在新宫站换巴士去那智；熊野速玉大社仅在另列可选加强版中参拜。"
    },
    {
      "id": "nachi",
      "name": "那智",
      "englishName": "Nachi",
      "lat": 33.6689,
      "lng": 135.8907,
      "description": "巴士到那智山，参拜熊野那智大社、青岸渡寺与那智瀑布；下行有台阶。标记为那智山一带概略位置。"
    },
    {
      "id": "kii-katsuura",
      "name": "纪伊胜浦",
      "englishName": "Kii-Katsuura",
      "lat": 33.6292,
      "lng": 135.9413,
      "description": "19号14:23抵达车站，15:21乘全车指定席Kuroshio 30回大阪；保留58分钟换乘余量。"
    },
    {
      "id": "nara",
      "name": "奈良",
      "englishName": "Nara",
      "lat": 34.6851,
      "lng": 135.8048,
      "description": "大阪往返：东大寺、二月堂、春日大社、奈良公园与兴福寺，奈良町按时间短逛。"
    }
  ],
  "routeNote": "机票与大阪、纪伊田边、近露、川汤住宿按确认记录标为已订；广岛酒店两晚尚待确认。列车、巴士均为计划班次，不代表已出票。19号主方案经新宫、那智、纪伊胜浦回大阪；速玉大社与大门坂另列可选加强版。地图标记是目的地的大致位置。",
  "walkingSummary": {
    "distanceKm": 20.8,
    "days": 2
  },
  "flights": [
    {
      "id": "arrival-traveler-1",
      "flightNumber": "UA35",
      "travelerLabel": "旅客1",
      "status": "booked",
      "departure": {
        "airportCode": "SFO",
        "city": "旧金山",
        "date": "2026-11-12",
        "time": "11:25"
      },
      "arrival": {
        "airportCode": "KIX",
        "city": "关西",
        "date": "2026-11-13",
        "time": "16:45"
      },
      "notes": [
        "起飞和抵达时间分别为机场当地时间。",
        "入境、取行李后，到T1公共到达区域等旅客2。"
      ]
    },
    {
      "id": "arrival-traveler-2",
      "flightNumber": "MU8649",
      "operatedByFlightNumber": "FM821",
      "travelerLabel": "旅客2",
      "status": "booked",
      "departure": {
        "airportCode": "PVG",
        "city": "上海",
        "terminal": "T1",
        "date": "2026-11-13",
        "time": "14:55"
      },
      "arrival": {
        "airportCode": "KIX",
        "city": "关西",
        "terminal": "T1",
        "date": "2026-11-13",
        "time": "18:00"
      },
      "notes": [
        "预计18:45–19:15完成入境后会合，按实际排队情况调整机场列车。"
      ]
    },
    {
      "id": "return-flight",
      "flightNumber": "MU226",
      "travelerLabel": "两人",
      "status": "booked",
      "departure": {
        "airportCode": "KIX",
        "city": "关西",
        "terminal": "T1",
        "date": "2026-11-21",
        "time": "13:10"
      },
      "arrival": {
        "airportCode": "PVG",
        "city": "上海",
        "terminal": "T1",
        "date": "2026-11-21",
        "time": "15:10"
      },
      "notes": [
        "13:10为日本当地时间，15:10为上海当地时间；日本比中国快1小时。"
      ]
    }
  ],
  "stays": [
    {
      "id": "osaka",
      "name": "Hotel Hankyu RESPIRE Osaka",
      "location": "梅田／Yodobashi Umeda Tower · LINKS UMEDA",
      "checkIns": [
        {
          "checkIn": "2026-11-13",
          "checkOut": "2026-11-14"
        },
        {
          "checkIn": "2026-11-19",
          "checkOut": "2026-11-21"
        }
      ],
      "status": "booked",
      "notes": [
        "11/13–14一晚、11/19–21两晚，两段入住均已订；酒店前台在9楼。",
        "大阪站梅北地下口出闸后官网步行约6分钟；含出站与电梯预留15–25分钟。",
        "14号退房至19号再次入住跨5晚，大箱寄存必须得到酒店明确同意。",
        "19号随Kuroshio 30回大阪后领取大箱；不回纪伊田边酒店取物。"
      ]
    },
    {
      "id": "hiroshima",
      "name": "广岛酒店（名称待补充）",
      "location": "JR广岛站附近",
      "checkIns": [
        {
          "checkIn": "2026-11-14",
          "checkOut": "2026-11-16"
        }
      ],
      "status": "pending",
      "notes": [
        "11/14入住、11/16退房，两晚；尚未见最终订房确认，具体名称待补。",
        "14号10:40–11:15先寄存小包，正常入住一般在下午，以酒店订单为准。",
        "15号宫岛游览后返回同一家酒店。"
      ]
    },
    {
      "id": "kii-tanabe",
      "name": "Comfort Hotel Kii Tanabe",
      "location": "纪伊田边",
      "checkIns": [
        {
          "checkIn": "2026-11-16",
          "checkOut": "2026-11-17"
        }
      ],
      "status": "booked",
      "notes": [
        "11/16入住、11/17退房，已订；从纪伊田边站步行约5分钟。",
        "16号14:40前后先到酒店，如未到入住时间，先寄包。",
        "早餐06:30开始，17号主选巴士06:38发车；提前买好17号早餐、徒步午餐、饮水与能量补给。"
      ]
    },
    {
      "id": "kumano-kodo",
      "name": "近露旅馆（名称待补充）",
      "location": "近露",
      "checkIns": [
        {
          "checkIn": "2026-11-17",
          "checkOut": "2026-11-18"
        }
      ],
      "status": "booked",
      "notes": [
        "11/17入住、11/18退房，已订；具体旅馆名称尚待补充。",
        "确认17日下午从古道到旅馆的步行或接送，以及18号去美术馆前巴士站的路线。",
        "核对餐食是否包含、18号能否早供早餐或便当，以及晚餐最晚到店时间。"
      ]
    },
    {
      "id": "kawayu",
      "name": "川汤旅馆（名称待补充）",
      "location": "川汤温泉",
      "checkIns": [
        {
          "checkIn": "2026-11-18",
          "checkOut": "2026-11-19"
        }
      ],
      "status": "booked",
      "notes": [
        "11/18入住、11/19退房，已订；具体旅馆名称尚待补充。",
        "按旅馆位置决定18号在藤屋前、龟屋前或川汤温泉下车，以及19号上车站与准确发车分钟。",
        "核对餐食是否包含、早餐与晚餐最晚到达时间；选19号加强版需提前备早餐和退房。",
        "11月按旅馆温泉安排；大型河川露天浴场“仙人风吕”通常12月才开放。"
      ]
    }
  ],
  "ticketOptions": [
    {
      "id": "all-area-pass",
      "title": "JR-WEST All Area Pass：省事方案",
      "validFrom": "2026-11-13",
      "validThrough": "2026-11-19",
      "currency": "JPY",
      "price": 26000,
      "estimatedTotal": 27800,
      "description": "7日成人券，选11/13–19；加21号HARUKA单程优惠后，铁路票券估算每人27,800日元，不含20号奈良。",
      "includes": [
        "13号关西机场进大阪的HARUKA。",
        "14号、16号山阳新干线；15号JR电车和JR西日本宫岛渡轮。",
        "16号前往纪伊田边的Kuroshio 11，以及19号纪伊胜浦返回大阪的Kuroshio 30。"
      ],
      "excludes": [
        "20号奈良往返与市内交通。",
        "21号机场HARUKA需另买。",
        "宫岛访问税、宫岛缆车、广岛路面电车、熊野各家巴士。"
      ],
      "notes": [
        "适用于持外国护照、以Temporary Visitor短期滞在入境的旅客；持Pass仍需给指定席划位。",
        "估算总价26,000＋21号HARUKA优惠1,800＝27,800日元／人；不代表已经购买。",
        "与买到WEB早特7的5日券组合按同口径比较，差约780日元；若早特无票，需重新比较。",
        "HARUKA外国游客单程优惠需出发前在线购买，不作为到日本后现场购买价。"
      ],
      "sourceIds": [
        "jrwest-all-area",
        "haruka-oneway"
      ]
    },
    {
      "id": "kansai-hiroshima-combination",
      "title": "关西&广岛5日Pass：组合方案",
      "validFrom": "2026-11-14",
      "validThrough": "2026-11-18",
      "currency": "JPY",
      "price": 17000,
      "estimatedTotal": 27020,
      "description": "5日Pass加13号、21号HARUKA优惠及19号单独黑潮票；每人27,020日元以买到WEB早特7为前提，不含20号奈良。",
      "includes": [
        "11/14–18关西&广岛5日Pass，成人17,000日元；覆盖这期间适用的JR线路与渡轮。"
      ],
      "excludes": [
        "13号和21号HARUKA单程优惠各1,800日元，另买。",
        "19号Kuroshio 30必须另买；WEB早特7通常期胜浦→大阪基本运费与优惠特急费合计约6,420日元。",
        "20号奈良往返与市内交通；宫岛访问税、缆车、广岛路面电车与熊野巴士。"
      ],
      "notes": [
        "条件总价17,000＋1,800＋1,800＋6,420＝27,020日元／人；WEB早特7无余票时重新比较。",
        "与All Area加21号HARUKA的同口径估算相差约780日元，无需为这点价差改变路线。",
        "如已选择5日券，路线仍可使用，但19号黑潮必须另买；尚未确认本次最终票券选择。",
        "适用资格按官方外国游客／Temporary Visitor规则核对；HARUKA单程优惠出发前在线买。"
      ],
      "sourceIds": [
        "kansai-hiroshima-pass",
        "haruka-oneway",
        "web-hayatoku-7"
      ]
    }
  ],
  "bookingWindows": [
    {
      "id": "jr-nov-14",
      "label": "11/14 Nozomi 5指定席",
      "travelDate": "2026-11-14",
      "opensAt": "2026-10-14T10:00:00+09:00",
      "timeZone": "Asia/Tokyo",
      "sourceIds": [
        "nozomi-5-reference"
      ]
    },
    {
      "id": "jr-nov-16",
      "label": "11/16 Nozomi 14＋Kuroshio 11指定席",
      "travelDate": "2026-11-16",
      "opensAt": "2026-10-16T10:00:00+09:00",
      "timeZone": "Asia/Tokyo",
      "sourceIds": [
        "nozomi-14-reference",
        "kuroshio-11-reference"
      ]
    },
    {
      "id": "jr-nov-19",
      "label": "11/19 Kuroshio 30指定席",
      "travelDate": "2026-11-19",
      "opensAt": "2026-10-19T10:00:00+09:00",
      "timeZone": "Asia/Tokyo",
      "sourceIds": [
        "kuroshio-30-reference"
      ]
    },
    {
      "id": "jr-nov-21",
      "label": "11/21 HARUKA 11指定席",
      "travelDate": "2026-11-21",
      "opensAt": "2026-10-21T10:00:00+09:00",
      "timeZone": "Asia/Tokyo",
      "sourceIds": [
        "haruka-timetable"
      ]
    }
  ],
  "checklist": [
    {
      "id": "miyajima-ropeway",
      "kind": "todo",
      "title": "预约11/15宫岛缆车",
      "detail": "11/15须事前WEB预约，争取09:00附近；余位与预约结果尚未确认。",
      "sourceIds": [
        "miyajima-ropeway",
        "miyajima-ropeway-booking"
      ]
    },
    {
      "id": "rail-ticket-choice",
      "kind": "todo",
      "title": "选择并购买JR票券",
      "detail": "选7日All Area或5日券组合；后者19号黑潮另买，估价以WEB早特7余票为条件。HARUKA单程优惠出发前在线买。",
      "sourceIds": [
        "jrwest-all-area",
        "kansai-hiroshima-pass",
        "haruka-oneway",
        "web-hayatoku-7"
      ]
    },
    {
      "id": "long-distance-trains",
      "kind": "todo",
      "title": "预约JR指定席并取票",
      "detail": "14号Nozomi 5，16号Nozomi 14＋Kuroshio 11，19号Kuroshio 30，21号HARUKA 11；出票尚未确认，持Pass划位或单独购票二选一。",
      "sourceIds": [
        "nozomi-5-reference",
        "nozomi-14-reference",
        "kuroshio-11-reference",
        "kuroshio-30-reference",
        "haruka-timetable"
      ]
    },
    {
      "id": "peace-museum-ticket",
      "kind": "todo",
      "title": "购买11/14资料馆WEB票",
      "detail": "买11/14 14:00左右WEB入场票，对应14:00–16:00参观；购票尚未确认。",
      "sourceIds": [
        "peace-museum"
      ]
    },
    {
      "id": "hiroshima-hotel",
      "kind": "check",
      "title": "确认广岛酒店订单与名称",
      "detail": "11/14入住、11/16退房，两晚，JR广岛站附近；订房结果与酒店全名待确认。"
    },
    {
      "id": "ryokan-meals",
      "kind": "check",
      "title": "确认近露旅馆名称与接驳",
      "detail": "11/17–18已订，全名待补；确认17号到店步行／接送、18号早饭／便当、去美术馆前站路线及晚餐最晚到达时间。"
    },
    {
      "id": "kawayu-ryokan",
      "kind": "check",
      "title": "确认川汤旅馆名称与站点",
      "detail": "11/18–19已订，全名待补；确认18号下车站、19号上车站与发车时间、早餐／便当及晚餐最晚到达时间。选加强版还需提前退房。"
    },
    {
      "id": "osaka-hotel",
      "kind": "check",
      "title": "确认大阪酒店跨5晚寄存",
      "detail": "RESPIRE两段入住已订；仍需酒店明确同意11/14退房至11/19返回期间寄存大箱。",
      "sourceIds": [
        "respire-access"
      ]
    }
  ],
  "sources": [
    {
      "id": "haruka-timetable",
      "label": "HARUKA：关西机场列车时刻",
      "url": "https://www.westjr.co.jp/travel-information/en/train-usage-guide/howto/pdf/haruka_timetable.pdf"
    },
    {
      "id": "respire-access",
      "label": "Hotel Hankyu RESPIRE Osaka：交通与梅北地下口",
      "url": "https://www.hankyu-hotel.com/en/hotel/respire/osaka/access"
    },
    {
      "id": "nozomi-5-reference",
      "label": "Nozomi 5参考时刻（查询日期2026-10-12）",
      "url": "https://timetable.jr-odekake.net/train-timetable/69711?date=20261012"
    },
    {
      "id": "nozomi-14-reference",
      "label": "Nozomi 14参考时刻（2026年10月时刻资料）",
      "url": "https://timetables.jreast.co.jp/2610/train/000/004011.html"
    },
    {
      "id": "kuroshio-11-reference",
      "label": "Kuroshio 11参考时刻（查询日期2026-09-12）",
      "url": "https://timetable.jr-odekake.net/train-timetable/144311?date=20260912"
    },
    {
      "id": "kuroshio-30-reference",
      "label": "Kuroshio 30与11月运转日（查询日期2026-10-08）",
      "url": "https://timetable.jr-odekake.net/train-timetable/198532?date=20261008"
    },
    {
      "id": "jrwest-all-area",
      "label": "JR-WEST All Area Pass：范围、价格与资格",
      "url": "https://www.westjr.co.jp/travel-information/en/tickets-passes/jrwest-rail-pass/all/"
    },
    {
      "id": "kansai-hiroshima-pass",
      "label": "关西&广岛5日Pass：范围、价格与资格",
      "url": "https://www.westjr.co.jp/travel-information/en/tickets-passes/jrwest-rail-pass/kansai_hiroshima/"
    },
    {
      "id": "haruka-oneway",
      "label": "外国游客HARUKA单程优惠",
      "url": "https://www.westjr.co.jp/travel-information/en/tickets-passes/oneway/haruka/"
    },
    {
      "id": "web-hayatoku-7",
      "label": "WEB早特7：提前购票条件",
      "url": "https://tickets.jr-odekake.net/shohindb/view/consumer/tokutoku/detail.html?staticShnId=100019581"
    },
    {
      "id": "peace-museum",
      "label": "广岛和平纪念资料馆：开放时间与官方WEB售票链接",
      "url": "https://dive-hiroshima.com/explore/2675/"
    },
    {
      "id": "miyajima-ropeway",
      "label": "宫岛缆车：营业与预约规则",
      "url": "https://miyajima-ropeway.info/"
    },
    {
      "id": "miyajima-ropeway-booking",
      "label": "宫岛缆车：事前WEB预约",
      "url": "https://www.miyajima-rw.info/system/web_date_select/index"
    },
    {
      "id": "daisho-in-firewalking",
      "label": "大圣院秋季大祭：护摩与火渡常设流程",
      "url": "https://www.miyajima.or.jp/event/event_shiwatari.html"
    },
    {
      "id": "miyajima-tide",
      "label": "宫岛2026年11月潮表：11/15高潮13:12",
      "url": "https://miyajima.or.jp/sio/sio11.php"
    },
    {
      "id": "miyajima-ferry",
      "label": "JR西日本宫岛渡轮：时刻表",
      "url": "https://jr-miyajimaferry.co.jp/timetable/"
    },
    {
      "id": "kumano-bus-overview",
      "label": "熊野地区公交：运营商与线路总览",
      "url": "https://www.tb-kumano.jp/en/transport/bus/"
    },
    {
      "id": "tanabe-hongu-bus",
      "label": "纪伊田边、白滨至本宫：巴士总表",
      "url": "https://www2.tb-kumano.jp/en/transport/pdf/Tanabe-Shirahama-to-Hongu-bus.pdf"
    },
    {
      "id": "hongu-kawayu-bus",
      "label": "本宫至川汤、纪伊田边、白滨：巴士时刻",
      "url": "https://www2.tb-kumano.jp/en/transport/pdf/Hongu-to-Tanabe-Shirahama-bus.pdf"
    },
    {
      "id": "kumano-fast-bus",
      "label": "龙神2026秋季熊野古道快速：9/19–12/10运营公告",
      "url": "https://www.ryujinbus.com/article/5036/"
    },
    {
      "id": "kawayu-shingu-bus",
      "label": "川汤、本宫至新宫：54系統时刻",
      "url": "https://www2.tb-kumano.jp/en/transport/pdf/Gojo-Totsukawa-Hongu-to-Shingu-bus.pdf"
    },
    {
      "id": "shingu-nachi-bus",
      "label": "新宫、那智、胜浦：平日巴士时刻",
      "url": "https://www2.tb-kumano.jp/en/transport/pdf/Shingu-Nachi-Katsuura-bus.pdf"
    },
    {
      "id": "nachi-katsuura-bus",
      "label": "那智山、瀑布前、纪伊胜浦：巴士时刻",
      "url": "https://www2.tb-kumano.jp/en/transport/pdf/Nachi-Kii-Katsuura-bus.pdf"
    },
    {
      "id": "kumano-bus-payment",
      "label": "熊野公交：乘车与支付方式",
      "url": "https://www.tb-kumano.jp/en/transport/bus/how-to-ride-a-local-bus/"
    },
    {
      "id": "dual-pilgrim",
      "label": "盖章与Dual Pilgrim双朝圣规则",
      "url": "https://www.tb-kumano.jp/en/kumano-kodo/dual-pilgrim/"
    },
    {
      "id": "todaiji",
      "label": "东大寺：11月参拜与购票信息",
      "url": "https://www.todaiji.or.jp/en/information/haikan/"
    },
    {
      "id": "kasuga-taisha",
      "label": "春日大社：一般与特别参拜时间",
      "url": "https://www.kasugataisha.or.jp/en/about_en/basic/"
    },
    {
      "id": "takijiri-chikatsuyu",
      "label": "泷尻王子至近露王子：官方徒步路线参考",
      "url": "https://www.tb-kumano.jp/en/kumano-kodo/nakahechi/takijiri-oji-to-tsugizakura-oji/takijiri-oji-to-chikatsuyu-oji/"
    },
    {
      "id": "hosshinmon-hongu",
      "label": "发心门王子至熊野本宫大社：官方徒步路线参考",
      "url": "https://www.tb-kumano.jp/en/kumano-kodo/nakahechi/tsugizakura-oji-to-kumano-hongu-taisha/hosshinmon-oji-to-kumano-hongu-taisha/"
    },
    {
      "id": "kawayu-senninburo",
      "label": "川汤温泉“仙人风吕”：开放季节参考",
      "url": "https://www.hongu.jp/onsen/kawayu/senninburo/"
    }
  ],
  "practicalNotes": [
    "日本境内时间均为日本当地时间；航班起飞／抵达分别使用当地时间。列车、巴士按更新版计划班次安排，不代表已出票；步行、入境和游览时间为预留估计，出发前复核临时调整。",
    "11/13抵达与11/21返程不安排景点。机票与标为已订的酒店按确认记录；广岛酒店仍待确认。",
    "14号退房至19号再次入住，向大阪酒店确认跨5晚大箱寄存；离开大阪后只带5晚衣物、徒步装备、雨具与洗漱用品。19号不回田边酒店取物。",
    "16号在新大阪直接换乘去纪伊田边，不需先去大阪站追同一班黑潮；地图与章册当天领取，17号不等泷尻古道馆08:30开门。",
    "17号约13.3公里、累计爬升约1,010米，官方6–8小时；加盖章、拍照、休息需要更久。18号发心门至本宫约7.5公里、累计爬升约190米，官方2–3小时，含休息按3小时以上安排。两天共约20.8公里。",
    "18号快速不停“近露王子”，到美术馆前站候车；不接受预约、满员可能无法上车。错过或满员用另列公交备选，不临时改成长距离近露至本宫徒步。",
    "11月按旅馆温泉安排；大型河川露天浴场“仙人风吕”通常12月才开放。",
    "19号主方案川汤→新宫→那智站→那智山，安排两次公交换乘。那智山到瀑布下行仍有台阶；随身背包游览，不假设那智站必有可用寄存柜。",
    "19号14:23到胜浦、15:21黑潮发车，留58分钟；下山14:34–14:58只留23分钟，15:09下一班会错过列车。黑潮17:06到纪伊田边、17:08继续开，留在车上。",
    "JR指定席一般在乘车日前1个月、日本10:00开放。持Pass预约与单独购票二选一，避免重复付款；19号Kuroshio 30全车指定席。",
    "JR普通电车、奈良公交与广岛路面电车准备ICOCA／Suica，特殊服务以现场标识为准。",
    "17号明光95支持交通IC或现金；18号龙神不支持Suica／ICOCA，本宫线自2026/9/19起支持感应信用卡，也可现金。",
    "19号熊野御坊南海支持感应信用卡及Apple Pay／Google Pay，不支持交通IC；全程另备现金与1,000日元小额纸币。",
    "各站提前10–20分钟到，旺季快速可更早排队；上车告知司机目的地，按运营商规则刷卡或取整理券。普通／季节巴士不预约。",
    "东大寺大佛殿11月08:00–17:00，目前现场购票、只收现金；春日大社一般参拜07:00–17:00、特别参拜09:00–16:00。普通个人现场购票即可，特殊展览另看规则。",
    "如关心Dual Pilgrim，发心门至本宫步行加熊野三山参拜是熊野部分的一种合格方式；默认版不去速玉，不能按这一条件视为完成。正式资格、徽章与证书另需圣地亚哥条件，单来日本不会自动获得。"
  ],
  "days": [
    {
      "date": "2026-11-13",
      "destinationId": "osaka",
      "overnightId": "osaka",
      "type": "arrival",
      "title": "关西机场抵达 → 大阪",
      "description": "两人分别抵达KIX，在T1公共到达区会合后乘HARUKA去大阪；酒店入住、晚餐、整理小行李，不安排景点。",
      "ideas": [
        "机场入境、取行李、会合。",
        "乘HARUKA到大阪，入住Hotel Hankyu RESPIRE Osaka。",
        "附近晚餐、休息，整理14–19号小行李。"
      ],
      "schedule": [
        {
          "time": "16:45",
          "title": "旅客1乘UA35抵达KIX",
          "description": "入境、取行李后，在T1公共到达区域等旅客2。"
        },
        {
          "time": "18:00",
          "title": "旅客2乘MU8649／FM821抵达KIX T1",
          "description": "预留入境与取行李排队时间。"
        },
        {
          "time": "18:45–19:15预计",
          "title": "完成入境后会合",
          "description": "实际取决于排队；会合后从T1到2楼连廊步行至关西机场站，预留取票与找站台时间。"
        },
        {
          "time": "19:16–20:01",
          "title": "主选HARUKA 50：关西机场 → 大阪",
          "description": "参考班次，不代表已出票。晚一点备选HARUKA 52为19:46–20:31；排队更久则改后续班次，不压缩入境时间赶车。",
          "sourceIds": [
            "haruka-timetable"
          ]
        },
        {
          "time": "20:01到达后",
          "title": "梅北地下口 → 酒店",
          "description": "走“うめきた地下口／Umekita Underground Gate”去Yodobashi Umeda Tower／LINKS UMEDA。官网出闸后步行约6分钟，含出站与电梯预留15–25分钟；前台在9楼。",
          "sourceIds": [
            "respire-access"
          ]
        },
        {
          "time": "20:20–21:00左右",
          "title": "Hotel Hankyu RESPIRE Osaka办理入住",
          "description": "首段11/13–14已订，入住时间按实际机场列车调整。"
        },
        {
          "time": "入住后",
          "title": "附近晚餐、整理小行李、休息",
          "description": "准备14–19号所需衣物、徒步装备、雨具与洗漱用品，不安排景点。"
        }
      ],
      "notes": [
        "14号寄存大箱至19号，跨5晚必须酒店明确同意。",
        "两人机场会合后一起前往大阪；机票已确认，HARUKA仍为计划班次。"
      ],
      "sourceIds": [
        "haruka-timetable",
        "respire-access"
      ]
    },
    {
      "date": "2026-11-14",
      "destinationId": "hiroshima",
      "overnightId": "hiroshima",
      "type": "city",
      "title": "大阪 → 广岛市区",
      "description": "早餐、退房、寄存大箱后，经新大阪乘Nozomi 5到广岛；午后安排和平纪念公园和资料馆，河边与本通按体力散步。",
      "ideas": [
        "大阪站到新大阪换山阳新干线。",
        "午后原爆圆顶馆、和平纪念公园与资料馆。",
        "河边、本通散步，晚餐后回广岛站酒店。"
      ],
      "schedule": [
        {
          "time": "07:15–08:00",
          "title": "早餐、退房、寄存大箱",
          "description": "酒店确认接受寄存后再办理；大箱留在大阪至19号。"
        },
        {
          "time": "08:15",
          "title": "离开酒店，步行到JR大阪站",
          "description": "建议预留15分钟找入口和站台。"
        },
        {
          "time": "08:30前后",
          "title": "JR京都线：大阪 → 新大阪",
          "description": "乘往京都／新大阪方向的普通、快速或新快速，约4分钟。"
        },
        {
          "time": "08:35–09:00",
          "title": "新大阪换乘山阳新干线",
          "description": "走Shinkansen换乘闸口。"
        },
        {
          "time": "09:02–10:27",
          "title": "Nozomi／のぞみ5：新大阪 → 广岛",
          "description": "计划班次，普通车指定席建议提前订；参考页查询日期为2026-10-12。",
          "sourceIds": [
            "nozomi-5-reference"
          ]
        },
        {
          "time": "10:40–11:15",
          "title": "广岛站附近酒店寄存小包",
          "description": "正常入住一般在下午，依酒店订单；广岛两晚尚未见最终订房确认。"
        },
        {
          "time": "11:15–12:15",
          "title": "午餐"
        },
        {
          "time": "12:15前后",
          "title": "路面电车 → 原爆ドーム前",
          "description": "从广岛站南侧2楼路面电车站乘2号线（宫岛口／西广岛方向）或6号线（江波方向），乘车约15–25分钟，另留候车时间。"
        },
        {
          "time": "12:45–13:45",
          "title": "原爆圆顶馆、和平纪念公园、慰灵碑",
          "description": "外观与园区步行。"
        },
        {
          "time": "14:00–16:00",
          "title": "广岛和平纪念资料馆",
          "description": "建议提前买14:00左右WEB票。11月现行营业07:30–19:00，部分早晚时段需网络预约。",
          "sourceIds": [
            "peace-museum"
          ]
        },
        {
          "time": "16:00–17:30",
          "title": "河边、本通商店街散步",
          "description": "按体力延长或删减，不追加更多核心景点。"
        },
        {
          "time": "18:00左右",
          "title": "晚餐后回广岛站酒店",
          "description": "路面电车或出租车回酒店。"
        }
      ],
      "notes": [
        "10:27到广岛站，当日核心为和平公园与资料馆。",
        "广岛11/14–16两晚待确认，具体酒店名称待补。"
      ],
      "sourceIds": [
        "nozomi-5-reference",
        "peace-museum"
      ]
    },
    {
      "date": "2026-11-15",
      "destinationId": "miyajima",
      "overnightId": "hiroshima",
      "type": "excursion",
      "title": "宫岛：缆车、严岛神社与大圣院火渡",
      "description": "保持上午缆车、中午严岛神社和水中鸟居、下午大圣院火渡的顺序；山顶追加按体力与排队调整，傍晚回广岛。",
      "ideas": [
        "预约09:00附近缆车，上行后看獅子岩与弥山一带。",
        "中午严岛神社、水中鸟居，潮时有几分钟差异。",
        "下午大圣院火渡，傍晚渡轮与JR回广岛。"
      ],
      "schedule": [
        {
          "time": "06:45–07:00",
          "title": "从广岛站附近酒店出发"
        },
        {
          "time": "07:23–07:51",
          "title": "JR山阳本线：广岛 → 宫岛口",
          "description": "岩国方向，约28分钟。备选07:33–08:01；赶不上08:10船就乘08:25。"
        },
        {
          "time": "07:51到达后",
          "title": "步行到JR西日本宫岛渡轮码头",
          "description": "出站后预留约10分钟及排队。",
          "sourceIds": [
            "miyajima-ferry"
          ]
        },
        {
          "time": "08:10–约08:20",
          "title": "JR西日本宫岛渡轮：宫岛口 → 宫岛",
          "description": "后备发船08:25。持适用JR Pass选JR西日本渡轮，访问税100日元另付。",
          "sourceIds": [
            "miyajima-ferry"
          ]
        },
        {
          "time": "08:20–08:50",
          "title": "码头步行至红叶谷缆车站",
          "description": "经海边／红叶谷方向，约20–30分钟。"
        },
        {
          "time": "09:00",
          "title": "预约宫岛缆车上行",
          "description": "红叶谷→榧谷→獅子岩两段，纯乘车约10＋4分钟，另计换乘排队。09:00余位未核实；往返现行成人2,000日元另付。",
          "sourceIds": [
            "miyajima-ropeway",
            "miyajima-ropeway-booking"
          ]
        },
        {
          "time": "09:30–11:00",
          "title": "獅子岩展望、弥山一带散步",
          "description": "真正弥山山顶按体力与排队追加；山上缆车站至山顶往返另约1小时。"
        },
        {
          "time": "10:45–11:00前后",
          "title": "回獅子岩站排下行",
          "description": "目标11:30左右下到山脚。排队增长时缩短山上步行，留好严岛与火渡时间。"
        },
        {
          "time": "11:30–12:15",
          "title": "简单午餐、向严岛神社移动"
        },
        {
          "time": "12:15–13:10",
          "title": "严岛神社回廊、海边鸟居拍照",
          "description": "气象厅广岛港预测高潮13:13、307cm，宫岛协会表13:12；严岛当地略有差异，无需卡秒。中午至下午早段适合水中鸟居，离岛前不要期待退潮走到鸟居脚下。",
          "sourceIds": [
            "miyajima-tide"
          ]
        },
        {
          "time": "13:10–13:30",
          "title": "步行至大圣院",
          "description": "预留约20分钟及台阶。"
        },
        {
          "time": "13:30–15:00",
          "title": "大圣院秋季大祭、火渡",
          "description": "2026年度已确认11/15举办。常设介绍为11:00大般若法要、13:00柴灯大护摩、14:00火渡、约15:00结束；细分时刻临近复核。若要看13:00护摩全过程，严岛神社提前为12:00–12:45。",
          "sourceIds": [
            "daisho-in-firewalking"
          ]
        },
        {
          "time": "15:00–16:45",
          "title": "大圣院、红叶谷／町家通、表参道",
          "description": "按体力删减。"
        },
        {
          "time": "17:10–17:20",
          "title": "渡轮：宫岛 → 宫岛口",
          "description": "后备17:25–17:35，随后配合后备JR班次。",
          "sourceIds": [
            "miyajima-ferry"
          ]
        },
        {
          "time": "17:33–18:03",
          "title": "JR宫岛口 → 广岛",
          "description": "步行回JR站；后备17:49–18:20。"
        },
        {
          "time": "抵达广岛后",
          "title": "晚餐、回同一家酒店"
        }
      ],
      "notes": [
        "11/15是缆车必须事前WEB预约的特定日；争取09:00附近，不代表仍有余位或已经预约。不能沿用旧页“11月08:00开门”。",
        "JR西日本渡轮访问税100日元、缆车往返成人现价2,000日元均另付。",
        "广岛酒店仍待最终确认，15号与14号住同一家。"
      ],
      "sourceIds": [
        "miyajima-ropeway",
        "miyajima-ropeway-booking",
        "miyajima-tide",
        "daisho-in-firewalking",
        "miyajima-ferry"
      ]
    },
    {
      "date": "2026-11-16",
      "destinationId": "kii-tanabe",
      "overnightId": "kii-tanabe",
      "type": "transfer",
      "title": "广岛 → 新大阪 → 纪伊田边",
      "description": "在新大阪站内直接换乘Kuroshio 11到纪伊田边，先到已订Comfort Hotel Kii Tanabe寄包，再领地图、章册与买徒步补给。",
      "ideas": [
        "Nozomi 14到新大阪，直接换Kuroshio 11。",
        "纪伊田边酒店寄包，旅游咨询中心领地图与免费章册。",
        "买好17号早餐、午餐、饮水与能量补给。"
      ],
      "schedule": [
        {
          "time": "08:30–09:10",
          "title": "早餐、退房，步行至广岛站",
          "description": "09:20前到新干线候车区。"
        },
        {
          "time": "09:43–11:04",
          "title": "Nozomi／のぞみ14：广岛 → 新大阪",
          "description": "计划班次，不代表已出票。",
          "sourceIds": [
            "nozomi-14-reference"
          ]
        },
        {
          "time": "11:04–12:00",
          "title": "新大阪换乘、午餐、买饮水",
          "description": "直接换车，不需先去大阪站追同一班黑潮。"
        },
        {
          "time": "12:13–14:29",
          "title": "Kuroshio 11／特急くろしお11：新大阪 → 纪伊田边",
          "description": "计划班次；参考页查询日期为2026-09-12。14:29到和歌山县JR紀伊田辺／Kii-Tanabe。",
          "sourceIds": [
            "kuroshio-11-reference"
          ]
        },
        {
          "time": "14:40前后",
          "title": "步行到Comfort Hotel Kii Tanabe",
          "description": "距车站约5分钟；如未到入住时间，先寄包。住宿已订。"
        },
        {
          "time": "15:00–16:00",
          "title": "Tanabe Tourist Information Center",
          "description": "站旁领取地图、免费盖章册，确认次日巴士站与最新路况。",
          "sourceIds": [
            "kumano-bus-overview"
          ]
        },
        {
          "time": "16:00–18:00",
          "title": "超市／便利店备粮、晚餐",
          "description": "买17号早餐、午餐、能量补给与饮水。"
        },
        {
          "time": "晚上",
          "title": "整理背包、早点休息",
          "description": "酒店早餐06:30开始，次日06:38车不能从容吃早餐，提前买好。"
        }
      ],
      "notes": [
        "地图章册16号领取，17号不等泷尻古道馆08:30开门。",
        "不回梅田取大箱；19号大箱仍应在大阪酒店。",
        "Comfort Hotel Kii Tanabe已订11/16–17一晚。"
      ],
      "sourceIds": [
        "nozomi-14-reference",
        "kuroshio-11-reference",
        "kumano-bus-overview"
      ]
    },
    {
      "date": "2026-11-17",
      "destinationId": "kumano-kodo",
      "overnightId": "kumano-kodo",
      "type": "hike",
      "title": "泷尻 → 高原 → 近露",
      "description": "主选06:38明光95到泷尻，07:35开始约13.3公里山路，经高原、王子遗迹和牛马童子至近露；按全天山路安排，旅馆末段步行／接送待名称落实。",
      "ideas": [
        "明光95主选，龙神06:55快速作备选。",
        "泷尻盖章后经高原、十丈王子、大坂本王子与牛马童子。",
        "近露王子盖章后到已订旅馆，确认18号早饭和去美术馆站的路线。"
      ],
      "hike": {
        "distanceKm": 13.3,
        "duration": "官方步行6–8小时；盖章、拍照和休息另留时间",
        "ascentM": 1010,
        "route": "泷尻王子 → 高原熊野神社 → 十丈王子 → 大坂本王子 → 牛马童子 → 近露王子"
      },
      "schedule": [
        {
          "time": "05:45–06:10",
          "title": "起床、预备早餐、退房",
          "description": "吃16号提前买好的早餐。"
        },
        {
          "time": "06:15前后",
          "title": "纪伊田边站前2号巴士站排队"
        },
        {
          "time": "06:38–07:16",
          "title": "明光巴士95系統“栗栖川行”：纪伊田边 → 泷尻",
          "description": "Takijiri／滝尻，支持交通IC或现金。备选龙神熊野古道快速06:55–07:27，首到首得，不预约。",
          "sourceIds": [
            "tanabe-hongu-bus",
            "kumano-fast-bus",
            "kumano-bus-payment"
          ]
        },
        {
          "time": "07:16–07:35",
          "title": "厕所、整理装备、泷尻王子参拜盖章"
        },
        {
          "time": "07:35–10:00／10:30",
          "title": "古道上山至高原熊野神社、高原聚落",
          "description": "中途按脚程休息。",
          "sourceIds": [
            "takijiri-chikatsuyu"
          ]
        },
        {
          "time": "10:30–12:00",
          "title": "继续古道，在十丈王子一带午餐",
          "description": "自带午饭，时间按脚程调整。"
        },
        {
          "time": "12:30–15:00／16:00",
          "title": "大坂本王子、牛马童子 → 近露",
          "description": "到近露、近露王子，前往已订旅馆；末段步行／接送因旅馆名称待补而未落实。"
        },
        {
          "time": "傍晚",
          "title": "晚餐、洗澡，准备18号早班车",
          "description": "请旅馆确认早餐时间，以及去美术馆前站的路线。"
        }
      ],
      "notes": [
        "约13.3公里、累计爬升约1,010米，官方步行6–8小时；加盖章、拍照、休息要留更久，不按城市13公里估算。",
        "不等泷尻古道馆08:30开门；地图与章册16号已领取。",
        "近露旅馆已订，具体名称待补；17日下午到店、18号去车站的步行／接送仍需落实。"
      ],
      "sourceIds": [
        "tanabe-hongu-bus",
        "kumano-fast-bus",
        "takijiri-chikatsuyu",
        "kumano-bus-payment"
      ]
    },
    {
      "date": "2026-11-18",
      "destinationId": "kumano-kodo",
      "overnightId": "kawayu",
      "type": "hike",
      "title": "近露 → 发心门 → 本宫 → 川汤",
      "description": "美术馆前快速直达发心门，徒步约7.5公里经王子遗迹到本宫，再参拜大斋原、乘巴士去川汤。快速满员／错过备选另列。",
      "ideas": [
        "美术馆前07:51快速到发心门，注意不停近露王子。",
        "徒步发心门至本宫，参拜本宫与大斋原。",
        "按旅馆实际位置选择川汤下车站，入住泡汤。"
      ],
      "hike": {
        "distanceKm": 7.5,
        "duration": "官方步行2–3小时；含休息按3小时以上规划",
        "ascentM": 190,
        "route": "发心门王子 → 水吞王子 → 伏拝王子 → 三轩茶屋 → 祓殿王子 → 熊野本宫大社"
      },
      "schedule": [
        {
          "time": "06:30–07:10",
          "title": "早餐、退房",
          "description": "需与近露旅馆协调。"
        },
        {
          "time": "07:30",
          "title": "美术馆前站候车",
          "description": "站名“なかへち美術館前／Nakahechi Bijutsukan-mae”；旅馆至车站路线与出门时间待确认。"
        },
        {
          "time": "07:51–08:54",
          "title": "龙神熊野古道快速：美术馆前 → 发心门王子",
          "description": "直达発心門王子／Hosshinmon-oji；不停近露王子站。2026/9/19–12/10每天运营，不接受预约，满员可能无法上车。",
          "sourceIds": [
            "kumano-fast-bus"
          ]
        },
        {
          "time": "09:05–12:00／12:30",
          "title": "发心门经王子遗迹 → 熊野本宫大社",
          "description": "经水吞、伏拝、三轩茶屋、祓殿王子，沿途盖章；约7.5公里、爬升190米，含休息按3小时以上。",
          "sourceIds": [
            "hosshinmon-hongu"
          ]
        },
        {
          "time": "12:00／12:30–13:15",
          "title": "本宫大社参拜、盖本宫完成章",
          "sourceIds": [
            "dual-pilgrim"
          ]
        },
        {
          "time": "13:15–14:00",
          "title": "午饭"
        },
        {
          "time": "14:00–14:40",
          "title": "大斋原大鸟居、旧社地",
          "description": "单程步行约10分钟，留拍照时间，再返回本宫大社前巴士站。"
        },
        {
          "time": "14:50",
          "title": "本宫大社前候车"
        },
        {
          "time": "15:05–15:16",
          "title": "龙神80系統“紀伊田辺駅行”：本宫 → 川汤",
          "description": "15:05发车；藤屋前／ふじや前15:13、龟屋前／かめや前15:14、川汤温泉15:16，按所订旅馆位置下车。玩久些可改16:40发车：藤屋16:48、龟屋16:49、川汤16:51。",
          "sourceIds": [
            "hongu-kawayu-bus"
          ]
        },
        {
          "time": "入住后",
          "title": "川汤温泉旅馆泡汤、晚餐",
          "description": "住宿已订，名称待补；11月按旅馆温泉安排。"
        }
      ],
      "alternatives": [
        {
          "id": "missed-fast-bus",
          "title": "快速满员／错过时：经本宫转发心门",
          "description": "用明光93到本宫，再转龙神81到发心门，约11点开始徒步；下午行程调整，改16:40去川汤。",
          "schedule": [
            {
              "time": "09:42–10:12",
              "title": "明光93系統：美术馆前 → 本宫大社前",
              "sourceIds": [
                "tanabe-hongu-bus"
              ]
            },
            {
              "time": "10:30–10:45",
              "title": "龙神81系統：本宫 → 发心门王子",
              "sourceIds": [
                "kumano-bus-overview"
              ]
            },
            {
              "time": "11:00左右",
              "title": "开始发心门至本宫徒步",
              "description": "约7.5公里，按脚程调整下午参拜和拍照时间。",
              "sourceIds": [
                "hosshinmon-hongu"
              ]
            },
            {
              "time": "下午",
              "title": "本宫大社、大斋原",
              "description": "保留16:40巴士候车余量。"
            },
            {
              "time": "16:40–16:51",
              "title": "本宫 → 川汤",
              "description": "藤屋前16:48、龟屋前16:49、川汤温泉16:51；下车站按旅馆位置决定。",
              "sourceIds": [
                "hongu-kawayu-bus"
              ]
            }
          ],
          "notes": [
            "用于07:51快速满员或错过，整套行程按较晚开始调整。",
            "不临时改成从近露全程步行到本宫，那是另一种长距离行程。"
          ],
          "sourceIds": [
            "tanabe-hongu-bus",
            "kumano-bus-overview",
            "hongu-kawayu-bus",
            "hosshinmon-hongu"
          ]
        }
      ],
      "notes": [
        "快速不停近露王子，必须到美术馆前站。",
        "近露旅馆早饭、到站路线与川汤旅馆准确下车站仍需确认；不能在未知旅馆时固定某一站。",
        "川汤旅馆已订；11月按旅馆温泉，仙人风吕通常12月开放。"
      ],
      "sourceIds": [
        "kumano-fast-bus",
        "hosshinmon-hongu",
        "hongu-kawayu-bus",
        "kawayu-senninburo",
        "dual-pilgrim",
        "kumano-bus-payment"
      ]
    },
    {
      "date": "2026-11-19",
      "destinationId": "nachi",
      "overnightId": "osaka",
      "type": "excursion",
      "title": "川汤 → 新宫 → 那智 → 纪伊胜浦 → 大阪",
      "description": "默认较舒适版：08:39从川汤出发，经新宫与那智站两次换车到那智山，游那智核心后到纪伊胜浦乘Kuroshio 30，19:16回大阪。",
      "ideas": [
        "川汤经新宫、那智站换巴士到那智山终点。",
        "那智大社、青岸渡寺、飞泷神社与瀑布。",
        "13:59下山车接15:21黑潮，回大阪取大箱入住。"
      ],
      "schedule": [
        {
          "time": "07:15–08:00",
          "title": "早餐、退房"
        },
        {
          "time": "08:20前后",
          "title": "川汤温泉站候车",
          "description": "旅馆若靠藤屋／龟屋，需按实际上车站重核发车分钟。"
        },
        {
          "time": "08:39–09:37",
          "title": "熊野御坊南海54系統：川汤温泉 → 新宫站",
          "description": "新宮駅行，计划班次。支持感应信用卡及Apple Pay／Google Pay，不支持交通IC。",
          "sourceIds": [
            "kawayu-shingu-bus",
            "kumano-bus-payment"
          ]
        },
        {
          "time": "09:37–10:00",
          "title": "新宫站换车、厕所",
          "description": "留23分钟换乘。"
        },
        {
          "time": "10:00–10:39",
          "title": "熊野御坊南海15系統：新宫站 → 那智站",
          "description": "往胜浦方向；周四按平日10:39到达，不用周末10:30。",
          "sourceIds": [
            "shingu-nachi-bus"
          ]
        },
        {
          "time": "10:39–11:12",
          "title": "那智站换乘那智山线"
        },
        {
          "time": "11:12–11:31",
          "title": "31系統“那智山行”：那智站 → 那智山",
          "description": "经过大门坂11:23、那智瀑布前11:28；主方案坐到终点11:31。",
          "sourceIds": [
            "nachi-katsuura-bus"
          ]
        },
        {
          "time": "11:31–12:15",
          "title": "熊野那智大社"
        },
        {
          "time": "12:15–13:00",
          "title": "青岸渡寺、三重塔与瀑布远景",
          "description": "穿插简单午餐。"
        },
        {
          "time": "13:00–13:40",
          "title": "下行至飞泷神社、那智瀑布",
          "description": "下行仍有台阶。"
        },
        {
          "time": "13:45–13:50",
          "title": "回那智の滝前巴士站排队",
          "description": "Nachi-no-Taki-mae，留好下山车候车余量。"
        },
        {
          "time": "13:59–14:23",
          "title": "32系統“勝浦駅行”：瀑布前 → 纪伊胜浦",
          "description": "下山后备14:34–14:58，只留23分钟到列车；15:09下一班会错过15:21列车。",
          "sourceIds": [
            "nachi-katsuura-bus"
          ]
        },
        {
          "time": "14:23–15:00",
          "title": "确认列车、买便当与饮水",
          "description": "14:23到站至15:21发车共58分钟换乘余量。"
        },
        {
          "time": "15:21–19:16",
          "title": "Kuroshio 30／特急くろしお30：纪伊胜浦 → 大阪",
          "description": "全车指定席，运转日明确含2026/11/19；计划班次不代表已出票。17:06到纪伊田边、17:08继续开，留在车上，不下车换乘或取物。",
          "sourceIds": [
            "kuroshio-30-reference"
          ]
        },
        {
          "time": "19:16",
          "title": "大阪地下24站台下车，返回RESPIRE",
          "description": "走梅北地下口，取大箱并办理11/19–21第二段已订入住。",
          "sourceIds": [
            "respire-access"
          ]
        },
        {
          "time": "20:00左右",
          "title": "晚餐、休息"
        }
      ],
      "alternatives": [
        {
          "id": "hayatama-daimonzaka",
          "title": "可选加强版：速玉大社＋大门坂",
          "description": "提前06:54出发参拜熊野速玉大社，再从大门坂步行上山；强度与早起增加，和08:39默认版分开安排。",
          "schedule": [
            {
              "time": "06:54–07:48",
              "title": "54系統：川汤 → 速玉大社前",
              "sourceIds": [
                "kawayu-shingu-bus"
              ]
            },
            {
              "time": "07:48到达后",
              "title": "参拜熊野速玉大社"
            },
            {
              "time": "09:04–09:28",
              "title": "11系統：速玉大社前 → 那智站",
              "sourceIds": [
                "shingu-nachi-bus"
              ]
            },
            {
              "time": "09:57–10:08",
              "title": "31系統：那智站 → 大门坂",
              "sourceIds": [
                "nachi-katsuura-bus"
              ]
            },
            {
              "time": "10:10–11:10",
              "title": "大门坂步行上山"
            },
            {
              "time": "11:10以后",
              "title": "那智大社、青岸渡寺与瀑布",
              "description": "沿用13:59下山车与15:21黑潮衔接，按体力与脚程调整。"
            },
            {
              "time": "13:59–14:23",
              "title": "32系統：瀑布前 → 纪伊胜浦",
              "sourceIds": [
                "nachi-katsuura-bus"
              ]
            },
            {
              "time": "15:21–19:16",
              "title": "Kuroshio 30：纪伊胜浦 → 大阪",
              "description": "全车指定席，仍需落实车票。",
              "sourceIds": [
                "kuroshio-30-reference"
              ]
            }
          ],
          "notes": [
            "需川汤旅馆提前备早餐与退房；早起与强度明显增加，不与08:39默认行程混用。",
            "如按“发心门至本宫步行＋熊野三山参拜”申请熊野部分条件，此版补上速玉参拜；正式Dual Pilgrim资格、徽章和证书另需圣地亚哥条件。"
          ],
          "sourceIds": [
            "kawayu-shingu-bus",
            "shingu-nachi-bus",
            "nachi-katsuura-bus",
            "kuroshio-30-reference",
            "dual-pilgrim"
          ]
        }
      ],
      "notes": [
        "本宫至那智没有一辆普通公交直达；主方案走新宫、那智站两次换乘。",
        "11:31–13:59约2.5小时只排那智核心；整段大门坂另见可选加强版。",
        "必须保证大箱在大阪；不能利用纪伊田边17:06–17:08的2分钟停车回酒店取箱。",
        "这天背随身包游览，不假设那智站一定有可用寄存柜。",
        "默认版不去速玉，不能按“发心门至本宫步行＋熊野三山参拜”条件视为完成；正式双朝圣资格仍另需圣地亚哥条件。"
      ],
      "sourceIds": [
        "kawayu-shingu-bus",
        "shingu-nachi-bus",
        "nachi-katsuura-bus",
        "kuroshio-30-reference",
        "kumano-bus-payment",
        "dual-pilgrim"
      ]
    },
    {
      "date": "2026-11-20",
      "destinationId": "nara",
      "overnightId": "osaka",
      "type": "excursion",
      "title": "奈良一日游 → 大阪",
      "description": "09:42大和路快速直达奈良，安排东大寺、二月堂、春日大社、公园与兴福寺；奈良町时间够再短逛，17:10参考区间快速回大阪。",
      "ideas": [
        "大阪直达JR奈良，市内公交或出租车到东大寺外围。",
        "东大寺、二月堂、春日大社、奈良公园与兴福寺。",
        "奈良町按时间短逛，傍晚直达回大阪。"
      ],
      "schedule": [
        {
          "time": "09:10前后",
          "title": "从大阪酒店出发，步行至JR大阪站"
        },
        {
          "time": "09:42–10:33",
          "title": "大和路快速：大阪 → JR奈良",
          "description": "计划班次，直达不换乘。"
        },
        {
          "time": "10:40前后",
          "title": "市内循环公交 → 东大寺外围",
          "description": "到“東大寺大仏殿・春日大社前”，下车后步行入寺；候车与步行预留20–30分钟，累了可打车。"
        },
        {
          "time": "11:00–12:15",
          "title": "东大寺南大门、大佛殿",
          "description": "11月08:00–17:00；大佛殿目前现场购票、只收现金。普通个人现场购票即可，特殊展览另看规则。",
          "sourceIds": [
            "todaiji"
          ]
        },
        {
          "time": "12:15–12:45",
          "title": "二月堂一带"
        },
        {
          "time": "12:45–13:30",
          "title": "午饭"
        },
        {
          "time": "13:30–14:45",
          "title": "步行到春日大社参拜",
          "description": "一般参拜07:00–17:00，特别参拜09:00–16:00；进入特别参拜区域看回廊、吊灯笼。",
          "sourceIds": [
            "kasuga-taisha"
          ]
        },
        {
          "time": "14:45–15:30",
          "title": "奈良公园看鹿，向兴福寺走"
        },
        {
          "time": "15:30–16:15",
          "title": "兴福寺：国宝馆／中金堂选一重点",
          "description": "五重塔修缮中，东金堂也受工程影响。"
        },
        {
          "time": "16:15–16:40",
          "title": "奈良町短逛",
          "description": "时间够再去，否则直接往JR奈良站。",
          "optional": true
        },
        {
          "time": "17:10–18:10",
          "title": "JR区间快速：奈良 → 大阪",
          "description": "回程参考，直达约60分钟；晚一些可乘后续直达班次。"
        },
        {
          "time": "18:30后",
          "title": "梅田晚餐、整理行李"
        }
      ],
      "notes": [
        "东大寺大佛殿现场购票、只收现金；春日大社特别参拜16:00结束。",
        "兴福寺五重塔修缮、东金堂受工程影响，选择国宝馆或中金堂一重点。",
        "住宿为Hotel Hankyu RESPIRE Osaka，11/19–21第二段已订。"
      ],
      "sourceIds": [
        "todaiji",
        "kasuga-taisha"
      ]
    },
    {
      "date": "2026-11-21",
      "destinationId": "osaka",
      "type": "departure",
      "title": "大阪 → 关西机场 → 上海",
      "description": "08:15带全部行李离开RESPIRE，主选08:50 HARUKA 11去KIX T1；两人13:10乘已订MU226回上海，不安排景点。",
      "ideas": [
        "早餐、退房，带齐全部行李。",
        "08:50 HARUKA 11主选到机场T1国际出发层。",
        "13:10 MU226起飞、上海当地15:10抵达。"
      ],
      "schedule": [
        {
          "time": "07:00–07:45",
          "title": "早餐、整理、退房"
        },
        {
          "time": "08:15",
          "title": "带全部行李离开RESPIRE",
          "description": "到JR大阪站梅北地下口，含电梯、进站与步行预留30分钟以上。",
          "sourceIds": [
            "respire-access"
          ]
        },
        {
          "time": "08:50–09:34",
          "title": "主选HARUKA 11：大阪 → 关西机场",
          "description": "大阪地下21站台为现行安排，现场再看；计划班次不代表已出票。后备HARUKA 13为09:19–10:04，到T1出发层约10:15，主方案不主动依赖后备。",
          "sourceIds": [
            "haruka-timetable"
          ]
        },
        {
          "time": "09:34–约09:50",
          "title": "机场站连廊 → T1国际出发层",
          "description": "到4楼东航／上海航空柜台。"
        },
        {
          "time": "13:10–15:10",
          "title": "已订MU226：关西KIX T1 → 上海PVG T1",
          "description": "13:10日本当地起飞，15:10上海当地抵达；日本／中国时差1小时。"
        }
      ],
      "notes": [
        "当天不安排景点。",
        "主选08:50 HARUKA 11，09:19 HARUKA 13仅作后备；机场列车与站台出发前复核。"
      ],
      "sourceIds": [
        "haruka-timetable",
        "respire-access"
      ]
    }
  ]
} satisfies Trip;
