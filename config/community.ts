/**
 * Lists in blackmatrix7/ios_rule_script that are not one service: region and proxy aggregates,
 * ad and privacy blocklists, and categories spanning many unrelated sites. Naming a query after
 * one of these says nothing about which app sent it
 */
export const EXCLUDED = new Set([
  // Ads, tracking and DNS hijacking
  "AdGuardSDNSFilter",
  "Advertising",
  "AdvertisingLite",
  "AdvertisingMiTV",
  "AdvertisingTest",
  "BlockHttpDNS",
  "EasyPrivacy",
  "Hijacking",
  "MIUIPrivacy",
  "Marketing",
  "Privacy",
  "ZhihuAds",
  // Region and routing aggregates
  "China",
  "ChinaDNS",
  "ChinaIPs",
  "ChinaIPsBGP",
  "ChinaMax",
  "ChinaMaxNoIP",
  "ChinaMaxNoMedia",
  "ChinaMedia",
  "ChinaNews",
  "ChinaNoMedia",
  "ChinaTest",
  "Direct",
  "Global",
  "GlobalMedia",
  "GovCN",
  "Lan",
  "Proxy",
  "ProxyLite",
  "AsianMedia",
  "UKMedia",
  "USMedia",
  "IPTVMainland",
  "IPTVOther",
  // Categories
  "Anime",
  "Cloud",
  "Crypto",
  "Cryptocurrency",
  "DNS",
  "Developer",
  "Download",
  "Game",
  "GlobalScholar",
  "Mail",
  "NTPService",
  "PrivateTracker",
  "RemoteDesktop",
  "STUN",
  "Scholar",
  "Speedtest",
  "SystemOTA",
]);

/**
 * Services cf-dns shipped before this catalog existed. Their IDs are stored in profiles, so they
 * must not change; names and groups are kept as they were
 */
export const OVERRIDES: Record<string, { id: string; name: string; group: string }> = {
  DouYin: { id: "douyin", name: "抖音", group: "social_network" },
  KuaiShou: { id: "kuaishou", name: "快手", group: "social_network" },
  BaiDuTieBa: { id: "baidu_tieba", name: "百度贴吧", group: "social_network" },
  Pinduoduo: { id: "pinduoduo", name: "拼多多", group: "shopping" },
  JingDong: { id: "jd", name: "京东", group: "shopping" },
  MeiTuan: { id: "meituan", name: "美团", group: "shopping" },
  Youku: { id: "youku", name: "优酷", group: "streaming" },
  TencentVideo: { id: "tencent_video", name: "腾讯视频", group: "streaming" },
  HunanTV: { id: "mango_tv", name: "芒果TV", group: "streaming" },
  NetEaseMusic: { id: "netease_music", name: "网易云音乐", group: "streaming" },
  KugouKuwo: { id: "kugou_kuwo", name: "酷狗 / 酷我", group: "streaming" },
  HuYa: { id: "huya", name: "虎牙", group: "streaming" },
  Douyu: { id: "douyu", name: "斗鱼", group: "streaming" },
  HoYoverse: { id: "hoyoverse", name: "米哈游", group: "gaming" },
};
