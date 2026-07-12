# pb · 京东 BP 反解工坊

粘贴京东 bp 文案 → 自动反解为 `trade.m.jd.com/pay?commlist=...` 结算链接。

## 本地开发

```bash
npm install
npm run dev      # 同时启动前端 (5173) + 后端 (3001)
```

## 生产构建

```bash
npm run build    # 构建前端到 dist/
npm run start    # 启动单端口生产服务 (默认 3001)
```

## 技术栈

- 前端：React 18 + Vite + Tailwind CSS
- 后端：Express + tsx (Node 18+ 原生 fetch)
- 部署：Docker / Sealos

## 部署

详见 [DEPLOY.md](./DEPLOY.md)
