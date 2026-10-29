import { describe, expect, it } from "bun:test";
import {
  adguardCatalog,
  clashToAdblock,
  communityCatalog,
  communityDirs,
  communityId,
} from "../src/catalog.ts";

describe("clashToAdblock", () => {
  it("converts domain rules and drops the rest", () => {
    const text = [
      "# NAME: Test",
      "DOMAIN,API.Example.com",
      "DOMAIN-SUFFIX,example.net",
      "DOMAIN-SUFFIX,example.net",
      "DOMAIN-KEYWORD,example",
      "IP-CIDR,1.2.3.0/24,no-resolve",
      "DOMAIN-SUFFIX,bad domain",
      "",
    ].join("\r\n");
    expect(clashToAdblock(text)).toEqual(["|api.example.com^", "||example.net^"]);
  });
});

describe("community catalog", () => {
  it("skips aggregates and keeps IDs stored by cf-dns", () => {
    expect(communityDirs(["ChinaMax", "GitHub", "Advertising", "DouYin"])).toEqual([
      "DouYin",
      "GitHub",
    ]);
    expect(communityId("TencentVideo")).toBe("tencent_video");
    expect(communityId("Assassin'sCreed")).toBe("assassinscreed");
  });

  it("drops lists without domain rules and names overrides", () => {
    const catalog = communityCatalog([
      { dir: "DouYin", text: "DOMAIN-SUFFIX,douyin.com" },
      { dir: "AmazonIP", text: "IP-CIDR,1.2.3.0/24" },
      { dir: "GitHub", text: "DOMAIN-SUFFIX,github.com" },
    ]);
    expect(catalog.license).toBe("GPL-2.0");
    expect(catalog.services).toEqual([
      { id: "douyin", name: "抖音", group: "social_network", icon: "", rules: ["||douyin.com^"] },
      { id: "github", name: "GitHub", group: "other", icon: "", rules: ["||github.com^"] },
    ]);
  });

  it("rejects two lists with one ID", () => {
    const lists = [
      { dir: "Abc", text: "DOMAIN,a.com" },
      { dir: "ABC", text: "DOMAIN,b.com" },
    ];
    expect(() => communityCatalog(lists)).toThrow("share the ID abc");
  });
});

describe("AdGuard catalog", () => {
  it("keeps valid services", () => {
    const catalog = adguardCatalog({
      blocked_services: [
        {
          id: "tiktok",
          name: "TikTok",
          group: "social_network",
          icon_svg: "<svg/>",
          rules: ["||tiktok.com^"],
        },
        { id: "Bad ID", name: "x", rules: ["||x.com^"] },
        { id: "empty", name: "Empty", rules: [] },
      ],
    });
    expect(catalog.services).toEqual([
      {
        id: "tiktok",
        name: "TikTok",
        group: "social_network",
        icon: "<svg/>",
        rules: ["||tiktok.com^"],
      },
    ]);
  });

  it("fails on an unexpected shape", () => {
    expect(() => adguardCatalog({})).toThrow("unexpected shape");
  });
});
