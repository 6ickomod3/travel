export type TripStatus = "planning" | "upcoming" | "completed";

export interface TripDestination {
  id: string;
  name: string;
  lat: number;
  lng: number;
  description: string;
  englishName?: string;
}

export interface TripScheduleItem {
  time: string;
  title: string;
  description?: string;
  sourceIds?: string[];
  optional?: boolean;
}

export interface TripDay {
  /** YYYY-MM-DD 格式的日历日期。 */
  date: string;
  destinationId: string;
  title: string;
  description: string;
  ideas: string[];
  overnightId?: string;
  schedule?: TripScheduleItem[];
  notes?: string[];
  sourceIds?: string[];
  hike?: {
    distanceKm: number;
    duration: string;
    ascentM?: number;
    route: string;
  };
  type?: "arrival" | "city" | "excursion" | "transfer" | "hike" | "departure";
}

export interface TripSource {
  id: string;
  label: string;
  url: string;
}

export interface TripStay {
  id: string;
  name: string;
  location: string;
  checkIns: Array<{ checkIn: string; checkOut: string }>;
  status: "booked" | "pending";
  notes: string[];
}

export interface TripChecklistItem {
  id: string;
  title: string;
  detail: string;
  sourceIds?: string[];
}

export interface Trip {
  slug: string;
  title: string;
  country: string;
  countryCode: string;
  /** YYYY-MM-DD 格式，首尾日期均计入行程。 */
  startDate: string;
  endDate: string;
  status: TripStatus;
  summary: string;
  cover: string;
  coverAlt: string;
  coverCredit: string;
  destinations: TripDestination[];
  routeNote: string;
  days: TripDay[];
  language?: "zh-CN" | "en";
  travelers?: number;
  itineraryStatus?: "agreed" | "draft";
  routeSummary?: string[];
  /** 按顺序记录目的地，包括返回和换乘段；连线不是实际徒步轨迹。 */
  mapRoute?: string[];
  stays?: TripStay[];
  checklist?: TripChecklistItem[];
  sources?: TripSource[];
  practicalNotes?: string[];
  walkingSummary?: { distanceKm: number; days: number };
}

/** 主页与行程页共用此集合；可继续添加新的旅行。 */
export const trips: Trip[] = [
  {
    slug: "japan-2026",
    title: "日本，秋日之旅",
    country: "日本",
    countryCode: "JP",
    startDate: "2026-11-13",
    endDate: "2026-11-21",
    status: "upcoming",
    language: "zh-CN",
    travelers: 2,
    itineraryStatus: "agreed",
    summary:
      "两个人的九日行程：大阪进出，经广岛、宫岛走入熊野古道，再到川汤温泉和奈良。两天古道徒步合计约20.8公里，沿途安排好换乘、温泉和休息。",
    cover: "/images/japan-miyajima.webp",
    coverAlt: "夕光下的宫岛严岛神社大鸟居，倒映在海水中。",
    coverCredit: "图片：Jakub Hałun / Wikimedia Commons / CC BY 4.0",
    routeSummary: [
      "大阪",
      "广岛 · 宫岛",
      "纪伊田边",
      "熊野古道",
      "川汤温泉",
      "大阪 · 奈良",
    ],
    mapRoute: [
      "osaka",
      "hiroshima",
      "miyajima",
      "hiroshima",
      "osaka",
      "kii-tanabe",
      "kumano-kodo",
      "kawayu",
      "kii-tanabe",
      "osaka",
      "nara",
      "osaka",
    ],
    destinations: [
      {
        id: "osaka",
        name: "大阪",
        englishName: "Osaka",
        lat: 34.6937,
        lng: 135.5023,
        description:
          "以梅田／JR大阪站附近酒店为基地，关西机场进出；大件行李在此寄存。",
      },
      {
        id: "hiroshima",
        name: "广岛",
        englishName: "Hiroshima",
        lat: 34.3853,
        lng: 132.4553,
        description:
          "和平纪念公园、资料馆和连续两晚住宿，也是宫岛一日游的出发地。",
      },
      {
        id: "miyajima",
        name: "宫岛",
        englishName: "Miyajima",
        lat: 34.2955,
        lng: 132.3199,
        description:
          "上午缆车与弥山，中午满潮鸟居，下午大圣院火渡，傍晚返回广岛。",
      },
      {
        id: "kii-tanabe",
        name: "纪伊田边",
        englishName: "Kii-Tanabe",
        lat: 33.7331,
        lng: 135.3777,
        description:
          "古道准备与交通接驳：领取地图和集章册，确认巴士及路线情况。",
      },
      {
        id: "kumano-kodo",
        name: "熊野古道",
        englishName: "Kumano Kodo",
        lat: 33.8155,
        lng: 135.6062,
        description:
          "泷尻经高原徒步到近露；翌日乘车到发心门，再步行前往本宫。地图以近露附近作概略标记。",
      },
      {
        id: "kawayu",
        name: "川汤温泉",
        englishName: "Kawayu Onsen",
        lat: 33.8131,
        lng: 135.7748,
        description:
          "11月18日晚的温泉休息地；11月按旅馆温泉安排。",
      },
      {
        id: "nara",
        name: "奈良",
        englishName: "Nara",
        lat: 34.6851,
        lng: 135.8048,
        description:
          "从大阪往返的一日游：东大寺、二月堂、春日大社、奈良公园和奈良町。",
      },
    ],
    routeNote:
      "这是双方已确定的行程。列车时刻仅为计划参考，不代表已购票；大阪与广岛酒店待确认，纪伊田边、近露和川汤三处住宿已有预订记录。地图标记是目的地的大致位置。",
    walkingSummary: { distanceKm: 20.8, days: 2 },
    stays: [
      {
        id: "osaka",
        name: "大阪梅田酒店（名称待补充）",
        location: "梅田／JR大阪站附近",
        checkIns: [
          { checkIn: "2026-11-13", checkOut: "2026-11-14" },
          { checkIn: "2026-11-19", checkOut: "2026-11-21" },
        ],
        status: "pending",
        notes: [
          "两段计划住同一家酒店：首段一晚，返大阪后两晚；尚未收到已订确认。",
          "14号退房时寄存大件行李，19号回酒店领取；订房时确认这五晚的寄存。",
        ],
      },
      {
        id: "hiroshima",
        name: "广岛酒店（名称待补充）",
        location: "JR广岛站附近",
        checkIns: [
          { checkIn: "2026-11-14", checkOut: "2026-11-16" },
        ],
        status: "pending",
        notes: [
          "计划连续住两晚；尚未收到已订确认。",
          "14号先去酒店寄存小行李；15号宫岛游览后返回同一家酒店。",
        ],
      },
      {
        id: "kii-tanabe",
        name: "Comfort Hotel Kii Tanabe",
        location: "纪伊田边",
        checkIns: [
          { checkIn: "2026-11-16", checkOut: "2026-11-17" },
        ],
        status: "booked",
        notes: [
          "已有预订记录，住一晚。",
          "16号购买17号早餐、徒步午餐、饮水和零食；17号清晨退房。",
        ],
      },
      {
        id: "kumano-kodo",
        name: "近露旅馆（名称待补充）",
        location: "近露",
        checkIns: [
          { checkIn: "2026-11-17", checkOut: "2026-11-18" },
        ],
        status: "booked",
        notes: [
          "已有预订记录，具体旅馆名称尚未提供。",
          "确认餐食是否包含、18号早餐能否提前，以及到巴士站的走法。",
        ],
      },
      {
        id: "kawayu",
        name: "川汤旅馆（名称待补充）",
        location: "川汤温泉",
        checkIns: [
          { checkIn: "2026-11-18", checkOut: "2026-11-19" },
        ],
        status: "booked",
        notes: [
          "已有预订记录，具体旅馆名称尚未提供。",
          "确认餐食是否包含和早餐时间；按旅馆位置选择下车及翌日上车站。",
          "11月按旅馆温泉安排；大型河川露天浴场“仙人风吕”通常12月才开放。",
        ],
      },
    ],
    checklist: [
      {
        id: "osaka-hotel",
        title: "确认大阪酒店与行李寄存",
        detail:
          "预订11/13–14一晚、11/19–21两晚，计划住同一家梅田／JR大阪站附近酒店；同时确认14号退房至19号返回期间的五晚大件行李寄存。",
      },
      {
        id: "hiroshima-hotel",
        title: "确认广岛酒店",
        detail: "预订JR广岛站附近酒店，11/14–16连续两晚。",
      },
      {
        id: "miyajima-ropeway",
        title: "预约11/15宫岛缆车",
        detail:
          "选择09:00左右的乘车时段；原行程注明11/15属于必须提前预约的日期，尚未确认预约完成。",
        sourceIds: ["miyajima-ropeway"],
      },
      {
        id: "long-distance-trains",
        title: "落实长途列车车票",
        detail:
          "14号新干线、16号新干线＋Kuroshio、19号Kuroshio。现有班次是计划参考，不代表已经买票；预订时核对旅行当日时刻，19号提前取好票。",
        sourceIds: ["kuroshio-11-reference", "kuroshio-16-reference"],
      },
      {
        id: "peace-museum-ticket",
        title: "购买11/14资料馆网络票",
        detail:
          "广岛和平纪念资料馆安排13:00–15:30，预留约2–2.5小时；建议提前购买网络票以减少现场购票排队。",
        sourceIds: ["peace-museum"],
      },
      {
        id: "ryokan-meals",
        title: "确认近露、川汤旅馆餐食",
        detail:
          "确认餐食是否包含、早餐时间，以及近露旅馆18号能否提前提供早餐；补充两家旅馆具体名称。",
      },
    ],
    sources: [
      {
        id: "peace-museum",
        label: "广岛和平纪念资料馆：参观与购票参考",
        url: "https://peace-tourism.com/en/spot/entry-40.html",
      },
      {
        id: "shukkeien",
        label: "缩景园：入园与关闭时间",
        url: "https://shukkeien.jp/guide/",
      },
      {
        id: "miyajima-tide",
        label: "宫岛11月潮汐表：11/15预测满潮13:12",
        url: "https://www.miyajima.or.jp/sio/sio11.php",
      },
      {
        id: "daisho-in-firewalking",
        label: "大圣院护摩、火渡仪式",
        url: "https://www.miyajima.or.jp/event/event_shiwatari.html",
      },
      {
        id: "miyajima-ropeway",
        label: "宫岛缆车：预约与营业信息",
        url: "https://miyajima-ropeway.info/",
      },
      {
        id: "kuroshio-11-reference",
        label: "Kuroshio 11号参考时刻（原查询日期2026-09-07）",
        url: "https://timetable.jr-odekake.net/train-timetable/9801?date=20260907",
      },
      {
        id: "kumano-fast-bus",
        label: "熊野古道快速巴士时刻表（原行程提供的2026年7月文件）",
        url: "https://www.tb-kumano.jp/en/wp-content/uploads/sites/2/2026/07/c5c8c28c6f27eed1cc35eb86792e7629.pdf",
      },
      {
        id: "takijiri-chikatsuyu",
        label: "泷尻王子至近露王子：官方徒步路线参考",
        url: "https://www.tb-kumano.jp/en/kumano-kodo/nakahechi/takijiri-oji-to-tsugizakura-oji/takijiri-oji-to-chikatsuyu-oji/",
      },
      {
        id: "hongu-kawayu-bus",
        label: "本宫、川汤、汤峰温泉巴士时刻表",
        url: "https://www2.tb-kumano.jp/en/transport/pdf/Hongu-Kawayu-Yunomine-bus.pdf",
      },
      {
        id: "hosshinmon-hongu",
        label: "发心门王子至熊野本宫大社：官方徒步路线参考",
        url: "https://www.tb-kumano.jp/en/kumano-kodo/nakahechi/tsugizakura-oji-to-kumano-hongu-taisha/hosshinmon-oji-to-kumano-hongu-taisha/",
      },
      {
        id: "kawayu-senninburo",
        label: "川汤温泉“仙人风吕”：开放季节参考",
        url: "https://www.hongu.jp/onsen/kawayu/senninburo/",
      },
      {
        id: "kawayu-tanabe-bus",
        label: "本宫、川汤至纪伊田边／白滨巴士时刻表",
        url: "https://www2.tb-kumano.jp/en/transport/pdf/Hongu-to-Tanabe-Shirahama-bus.pdf",
      },
      {
        id: "kuroshio-16-reference",
        label: "Kuroshio 16号参考时刻（原查询日期2026-09-27）",
        url: "https://timetable.jr-odekake.net/train-timetable/144541?date=20260927",
      },
      {
        id: "todaiji",
        label: "东大寺：参拜与购票信息",
        url: "https://www.todaiji.or.jp/information/haikan/",
      },
    ],
    practicalNotes: [
      "11/13和11/21不安排景点。",
      "列车时刻仅为计划参考，不代表已经买票；JR引用保留原查询日期参数，预订时核对出行日实际时刻。",
      "大件行李14号退房时留在大阪酒店，19号返回领取；订酒店时确认这五晚的寄存。",
      "14–19号携带小行李：换洗衣物、徒步装备、雨具、洗漱用品。",
      "16号在新大阪换车直接去纪伊田边，大件行李继续留在梅田，19号再取。",
      "17号约13.3公里，官方参考6–8小时，累计上升约1,010米；按全天山路安排，途中时间以实际步速为准。",
      "18号近露至发心门坐车，徒步约7.5公里，官方参考2–3小时；两天古道徒步合计约20.8公里。",
      "11月按旅馆温泉安排；大型河川露天浴场“仙人风吕”通常12月才开放。",
      "19号纪伊田边只有27分钟换乘，提前取好车票，换乘期间不安排其他活动。",
      "东大寺大佛殿目前现场购票、只收现金；春日大社特别参拜开放至16:00。",
      "21号按航班时间倒推，建议起飞前约4小时离开梅田酒店，目标提前约3小时到关西机场航站楼。",
    ],
    days: [
      {
        date: "2026-11-13",
        destinationId: "osaka",
        overnightId: "osaka",
        type: "arrival",
        title: "抵达关西机场 → 大阪",
        description:
          "下午抵达后前往梅田，整理14–19号的小行李，在酒店附近吃饭休息。当天不安排景点。",
        ideas: [
          "入境、取行李，乘HARUKA到大阪站",
          "整理换洗衣物、徒步装备、雨具和洗漱用品",
          "酒店附近晚餐、休息；不安排景点",
        ],
        schedule: [
          {
            time: "下午",
            title: "抵达关西机场",
            description: "入境、取行李。",
          },
          {
            time: "抵达后",
            title: "HARUKA → 大阪站",
            description: "乘HARUKA到大阪站，前往梅田酒店。",
          },
          {
            time: "入住后",
            title: "整理14–19号的小行李",
            description: "准备换洗衣物、徒步装备、雨具、洗漱用品。",
          },
          {
            time: "晚上",
            title: "酒店附近晚餐、休息",
            description: "不安排景点。",
          },
        ],
        notes: [
          "住宿为大阪梅田酒店，预订待确认。",
          "14号退房时寄存大件行李，19号返回领取；需向酒店确认五晚寄存。",
        ],
        sourceIds: [],
      },
      {
        date: "2026-11-14",
        destinationId: "hiroshima",
        overnightId: "hiroshima",
        type: "city",
        title: "大阪 → 广岛市区",
        description:
          "早上寄存大件行李后乘新干线到广岛，参观和平纪念公园和资料馆；缩景园按体力与时间决定。",
        ideas: [
          "退房并寄存大件行李，乘新干线到广岛",
          "参观原爆圆顶馆、和平纪念公园与资料馆",
          "缩景园可选；晚上吃广岛烧、逛本通",
        ],
        schedule: [
          {
            time: "07:30–08:15",
            title: "早餐、退房、寄存大件行李",
          },
          {
            time: "09:00左右",
            title: "新大阪 → 广岛",
            description:
              "从新大阪站乘新干线，目标10:30左右抵达。时刻为计划参考，不代表已购票。",
          },
          {
            time: "10:30–11:15",
            title: "酒店寄存小行李",
            description: "先去广岛酒店，再前往和平纪念公园。",
          },
          {
            time: "11:15–12:15",
            title: "原爆圆顶馆、和平纪念公园、慰灵碑",
          },
          {
            time: "12:15–13:00",
            title: "午餐",
          },
          {
            time: "13:00–15:30",
            title: "广岛和平纪念资料馆",
            description:
              "留约2–2.5小时。建议提前买网络票，减少现场购票排队。",
            sourceIds: ["peace-museum"],
          },
          {
            time: "16:00–17:00",
            title: "缩景园",
            description:
              "可选。资料馆看得久或累了就直接回酒店；11月16:30停止入园，17:00关闭。",
            optional: true,
            sourceIds: ["shukkeien"],
          },
          {
            time: "晚上",
            title: "广岛烧、本通商店街",
          },
        ],
        notes: [
          "广岛酒店计划在JR广岛站附近，预订待确认；11/14–16连续住两晚。",
        ],
        sourceIds: ["peace-museum", "shukkeien"],
      },
      {
        date: "2026-11-15",
        destinationId: "miyajima",
        overnightId: "hiroshima",
        type: "excursion",
        title: "宫岛全天 → 返回广岛",
        description:
          "已确定的顺序：上午缆车和弥山，中午看预测13:12满潮鸟居，下午看大圣院火渡，傍晚返回广岛。",
        ideas: [
          "上午：宫岛缆车、狮子岩展望台／弥山",
          "中午：严岛神社、大鸟居海岸，预测满潮13:12",
          "下午：大圣院护摩、火渡仪式，再逛表参道与海边",
        ],
        schedule: [
          {
            time: "07:00–07:30左右",
            title: "广岛 → 宫岛口 → 宫岛",
            description: "从酒店出发，JR到宫岛口站，再转渡轮上岛。",
          },
          {
            time: "08:30左右",
            title: "步行前往红叶谷缆车站",
            description: "上岛后前往缆车站，给09:00乘车留出余量。",
          },
          {
            time: "09:00–11:45",
            title: "缆车上山、狮子岩展望台／弥山",
            description:
              "若排队较久，缩短山上步行，保证中午回到神社一带。缆车计划预约09:00左右。",
            sourceIds: ["miyajima-ropeway"],
          },
          {
            time: "11:45–12:30",
            title: "午餐",
          },
          {
            time: "12:30–13:15",
            title: "严岛神社、大鸟居海岸",
            description:
              "当天预测满潮为13:12，适合看海上神社与水中鸟居。",
            sourceIds: ["miyajima-tide"],
          },
          {
            time: "13:30–15:00左右",
            title: "大圣院护摩、火渡仪式",
            description:
              "常规流程为13:00护摩、14:00左右实际火渡；具体以当天安排为准。",
            sourceIds: ["daisho-in-firewalking"],
          },
          {
            time: "15:00以后",
            title: "表参道商店街、海边散步",
          },
          {
            time: "17:00左右",
            title: "渡轮返回宫岛口，再回广岛",
            description: "返回广岛吃晚饭。",
          },
        ],
        notes: [
          "宫岛缆车选11/15 09:00左右；原行程注明这天必须提前预约，尚未确认预约完成。",
          "住宿与14号相同的广岛酒店，酒店预订待确认。",
        ],
        sourceIds: [
          "miyajima-ropeway",
          "miyajima-tide",
          "daisho-in-firewalking",
        ],
      },
      {
        date: "2026-11-16",
        destinationId: "kii-tanabe",
        overnightId: "kii-tanabe",
        type: "transfer",
        title: "广岛 → 新大阪 → 纪伊田边",
        description:
          "在新大阪站内换车直接去纪伊田边，领取古道地图与集章册，准备第二天徒步。大件行李继续留在梅田。",
        ideas: [
          "参考Nozomi 14号与Kuroshio 11号，在新大阪换乘",
          "领取古道地图、免费集章册，确认巴士及路线",
          "入住Comfort Hotel Kii Tanabe，购买徒步补给",
        ],
        schedule: [
          {
            time: "08:00–09:00",
            title: "早餐、退房，前往广岛站",
          },
          {
            time: "09:43–11:04",
            title: "Nozomi 14号：广岛 → 新大阪",
            description: "参考班次，不代表已购票。",
          },
          {
            time: "11:04–12:00",
            title: "新大阪站内午餐、换乘",
          },
          {
            time: "12:13–14:29",
            title: "Kuroshio 11号：新大阪 → 纪伊田边",
            description:
              "参考班次，不代表已购票；原JR参考页的查询日期为2026-09-07。",
            sourceIds: ["kuroshio-11-reference"],
          },
          {
            time: "14:40–15:20",
            title: "车站旁旅游咨询中心",
            description:
              "领取古道地图、免费集章册，确认翌日巴士及路线情况。",
          },
          {
            time: "15:30左右",
            title: "酒店入住",
            description: "Comfort Hotel Kii Tanabe已有预订记录。",
          },
          {
            time: "16:00–17:30",
            title: "购买徒步补给、整理背包",
            description: "准备17号早餐、徒步午餐、饮水和零食。",
          },
          {
            time: "18:00左右",
            title: "晚餐、早点休息",
          },
        ],
        notes: [
          "这天在新大阪换车直接去田边，不回梅田取行李；大件行李19号再取。",
          "住宿：Comfort Hotel Kii Tanabe，11/16入住、11/17退房，已订。",
        ],
        sourceIds: ["kuroshio-11-reference"],
      },
      {
        date: "2026-11-17",
        destinationId: "kumano-kodo",
        overnightId: "kumano-kodo",
        type: "hike",
        title: "泷尻 → 高原 → 近露",
        description:
          "约13.3公里的全天山路，经高原、牛马童子像到近露，官方参考6–8小时、累计上升约1,010米；中途时间以实际步速为准。",
        ideas: [
          "快速巴士到泷尻王子，参观、盖章后出发",
          "经高原熊野神社、林道和山口，途中吃自带午餐",
          "经过牛马童子像，到近露王子盖章并入住旅馆",
        ],
        hike: {
          distanceKm: 13.3,
          duration: "官方参考6–8小时",
          ascentM: 1010,
          route: "泷尻王子 → 高原 → 牛马童子像 → 近露王子",
        },
        schedule: [
          {
            time: "05:45–06:20",
            title: "起床、早餐、退房",
            description: "吃16号提前买好的早餐。",
          },
          {
            time: "06:30–06:40",
            title: "到纪伊田边站巴士乘车处排队",
          },
          {
            time: "06:55–07:27",
            title: "熊野古道快速巴士：纪伊田边 → 泷尻",
            sourceIds: ["kumano-fast-bus"],
          },
          {
            time: "07:30–07:50",
            title: "泷尻王子参观、盖章",
            description: "准备开始徒步。",
          },
          {
            time: "上午",
            title: "爬升至高原村",
            description: "参观高原熊野神社，休息、看山景。",
          },
          {
            time: "中午",
            title: "途中午餐、继续徒步",
            description: "吃自带午餐，继续走林道和山口。",
          },
          {
            time: "下午",
            title: "牛马童子像 → 近露王子",
            description: "经过牛马童子像，到近露王子盖章。",
          },
          {
            time: "15:00–16:00左右",
            title: "目标抵达近露，前往旅馆",
          },
          {
            time: "傍晚",
            title: "洗澡、晚餐、休息",
            description: "确认18号早餐时间及到巴士站的走法。",
          },
        ],
        notes: [
          "按全天山路安排，中途时间以实际步速为准。",
          "近露旅馆已订，11/17入住、11/18退房；具体名称尚未提供。",
        ],
        sourceIds: ["kumano-fast-bus", "takijiri-chikatsuyu"],
      },
      {
        date: "2026-11-18",
        destinationId: "kumano-kodo",
        overnightId: "kawayu",
        type: "hike",
        title: "近露 → 发心门 → 本宫 → 川汤",
        description:
          "近露至发心门坐车，再徒步约7.5公里到本宫，参观大斋原后乘巴士去川汤。两天古道徒步合计约20.8公里。",
        ideas: [
          "从中边路美术馆前乘快速巴士到发心门王子",
          "经水吞王子、伏拝王子、三轩茶屋徒步到本宫",
          "参观本宫大社、大斋原，再去川汤温泉入住",
        ],
        hike: {
          distanceKm: 7.5,
          duration: "官方参考2–3小时",
          route: "发心门王子 → 水吞王子 → 伏拝王子 → 三轩茶屋 → 熊野本宫大社",
        },
        schedule: [
          {
            time: "06:30–07:15",
            title: "早餐、退房",
            description: "早餐能否提前，需要向近露旅馆确认。",
          },
          {
            time: "07:30左右",
            title: "到中边路美术馆前站候车",
            description:
              "站名：なかへち美術館前／中边路美术馆前；离开旅馆的时间按实际位置调整。",
          },
          {
            time: "07:51–08:54",
            title: "熊野古道快速巴士 → 发心门王子",
            sourceIds: ["kumano-fast-bus"],
          },
          {
            time: "09:00–12:00左右",
            title: "发心门 → 水吞王子 → 伏拝王子 → 三轩茶屋 → 本宫",
            description: "沿路看村落、茶田、森林并盖章。",
            sourceIds: ["hosshinmon-hongu"],
          },
          {
            time: "12:00–13:00",
            title: "熊野本宫大社",
            description: "参观、盖章。",
          },
          {
            time: "13:00–13:45",
            title: "本宫附近午餐",
          },
          {
            time: "13:45–14:30",
            title: "大斋原旧社地、巨大鸟居",
            description: "步行前往参观。",
          },
          {
            time: "15:05–15:16",
            title: "本宫大社前 → 川汤温泉巴士",
            description: "下车站按旅馆位置调整。",
            sourceIds: ["hongu-kawayu-bus"],
          },
          {
            time: "15:30以后",
            title: "入住、泡温泉、晚餐",
          },
        ],
        notes: [
          "徒步约7.5公里，官方参考2–3小时；近露至发心门坐车。",
          "川汤旅馆已订，11/18入住、11/19退房；具体名称尚未提供。",
          "11月按旅馆温泉安排；大型河川露天浴场“仙人风吕”通常12月才开放。",
        ],
        sourceIds: [
          "kumano-fast-bus",
          "hosshinmon-hongu",
          "hongu-kawayu-bus",
          "kawayu-senninburo",
        ],
      },
      {
        date: "2026-11-19",
        destinationId: "osaka",
        overnightId: "osaka",
        type: "transfer",
        title: "川汤 → 纪伊田边 → 大阪",
        description:
          "从川汤乘巴士到纪伊田边，再乘Kuroshio直接到大阪站。回梅田酒店领取大件行李，下午休息、洗衣、恢复体力。",
        ideas: [
          "巴士到纪伊田边，27分钟换乘不安排其他活动",
          "参考Kuroshio 16号，直接在大阪站下车",
          "回梅田领取大件行李、入住，休息和洗衣",
        ],
        schedule: [
          {
            time: "07:00–07:45",
            title: "早餐、退房，前往旅馆附近巴士站",
          },
          {
            time: "08:15–10:10",
            title: "川汤温泉站 → 纪伊田边站",
            description:
              "若在“ふじや前”或“かめや前”上车，分别为08:13、08:14。",
            sourceIds: ["kawayu-tanabe-bus"],
          },
          {
            time: "10:37–12:46",
            title: "Kuroshio 16号：纪伊田边 → 大阪站",
            description:
              "参考班次，不代表已购票；直接在大阪站下车。提前取好票，27分钟换乘期间不再安排其他活动。原JR参考页查询日期为2026-09-27。",
            sourceIds: ["kuroshio-16-reference"],
          },
          {
            time: "13:00–15:00",
            title: "午餐、领取大件行李、办理入住",
            description: "回梅田酒店领取14号寄存的行李。",
          },
          {
            time: "下午",
            title: "休息、洗衣，恢复体力",
          },
          {
            time: "晚上",
            title: "梅田附近吃饭、轻松购物",
          },
        ],
        notes: [
          "大阪梅田酒店计划与13号同一家，预订待确认；11/19–21住两晚。",
          "纪伊田边换乘时间仅27分钟，车票提前取好。",
        ],
        sourceIds: ["kawayu-tanabe-bus", "kuroshio-16-reference"],
      },
      {
        date: "2026-11-20",
        destinationId: "nara",
        overnightId: "osaka",
        type: "excursion",
        title: "奈良一日游 → 大阪",
        description:
          "从大阪往返奈良，依次参观东大寺、二月堂、春日大社，逛奈良公园与奈良町。晚上返回大阪，整理返程行李。",
        ideas: [
          "JR大和路快速到奈良，再乘市内巴士去公园一带",
          "东大寺南大门、大佛殿、二月堂与春日大社",
          "奈良公园看鹿、奈良町散步，傍晚返回大阪",
        ],
        schedule: [
          {
            time: "08:30–09:30左右",
            title: "大阪站 → 奈良",
            description:
              "乘JR大和路快速；抵达后搭市内巴士去公园一带。",
          },
          {
            time: "10:00–11:30",
            title: "东大寺南大门、大佛殿",
            description: "大佛殿目前现场购票、只收现金。",
            sourceIds: ["todaiji"],
          },
          {
            time: "11:30–12:15",
            title: "二月堂回廊、奈良市景",
          },
          {
            time: "12:15–13:15",
            title: "午餐、休息",
          },
          {
            time: "13:30–14:30",
            title: "春日大社特别参拜",
            description:
              "进入特别参拜区域看回廊和吊灯笼；特别参拜开放至16:00。",
          },
          {
            time: "14:30–15:15",
            title: "奈良公园散步、看鹿",
          },
          {
            time: "15:30–16:30",
            title: "奈良町老街、咖啡、小店",
            description: "累了可以提前返回。",
          },
          {
            time: "17:00–18:00左右",
            title: "回大阪、晚餐、整理返程行李",
          },
        ],
        notes: [
          "东大寺大佛殿目前现场购票、只收现金；春日大社特别参拜开放至16:00。",
          "住宿与19号相同的大阪酒店，预订待确认。",
        ],
        sourceIds: ["todaiji"],
      },
      {
        date: "2026-11-21",
        destinationId: "osaka",
        type: "departure",
        title: "大阪 → 关西机场 → 上海",
        description:
          "按航班时间倒推安排退房与机场交通，建议起飞前约4小时离开梅田酒店。当天不安排景点。",
        ideas: [
          "按航班时间安排退房与出发",
          "乘HARUKA去关西机场，目标提前约3小时到航站楼",
          "返程到上海；不安排景点",
        ],
        schedule: [
          {
            time: "起飞前约4小时",
            title: "退房、离开梅田酒店",
            description: "按航班时间倒推安排。",
          },
          {
            time: "起飞前约3小时",
            title: "目标抵达关西机场航站楼",
            description: "乘HARUKA去关西机场。",
          },
          {
            time: "按航班时间",
            title: "关西机场 → 上海",
            description: "机场、返程，不安排景点。",
          },
        ],
        notes: ["不安排景点；出发和到机场时间按实际航班倒推。"],
        sourceIds: [],
      },
    ],
  },
];
