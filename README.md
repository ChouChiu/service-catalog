# service-catalog

每天从上游同步一次服务域名目录，供 [cf-dns](https://github.com/ChouChiu/cf-dns) 识别和屏蔽服务使用。上游各自的许可证不同，所以分成两个独立文件，不合并成一个。

| 文件 | 来源 | 许可证 |
| :--- | :--- | :--- |
| [`output/adguard.json`](output/adguard.json) | [AdGuard HostlistsRegistry](https://github.com/AdguardTeam/HostlistsRegistry) 的 blocked services | [GPL-3.0](LICENSES/GPL-3.0.txt) |
| [`output/community.json`](output/community.json) | [blackmatrix7/ios_rule_script](https://github.com/blackmatrix7/ios_rule_script) 的 Clash 规则集 | [GPL-2.0](LICENSES/GPL-2.0.txt) |

两个文件结构相同：

```json
{
  "source": "上游地址",
  "license": "GPL-3.0",
  "services": [{ "id": "github", "name": "GitHub", "group": "other", "icon": "", "rules": ["||github.com^"] }]
}
```

`rules` 是 AdGuard 过滤语法。社区规则集只转换 `DOMAIN`（`|a.com^`）和 `DOMAIN-SUFFIX`（`||a.com^`），关键字、IP 和进程规则在 DNS 层没有对应写法，直接丢弃；没有域名规则的列表不输出。

社区服务的分组、中文名和图标在 [`config/meta.ts`](config/meta.ts) 里维护：`GROUPS` 按目录名分组（前 12 个沿用 AdGuard 的分组 ID，其余为补充分组，未列出的归入 `other`），`NAMES` 给拼音或缩写目录起显示名，`ICONS` 指定 [Simple Icons](https://simpleicons.org)（CC0-1.0）的图标；名称与图标标题一致的服务会自动匹配，不需要写。

汇总类、广告类和品类列表（ChinaMax、Proxy、Advertising、Game、STUN 等）不是单个服务，在 [`config/community.ts`](config/community.ts) 的 `EXCLUDED` 里排除。`OVERRIDES` 固定了 cf-dns 早先已经用过的服务 ID 和中文名，不能改。

任一上游下载失败时整次构建失败，不会提交残缺的目录。

```bash
bun install
bun run start
```
