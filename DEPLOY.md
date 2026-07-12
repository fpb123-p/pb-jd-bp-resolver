# pb · 京东 BP 反解工坊 · 部署指南

国内免费部署方案，无需外国手机号，微信扫码即可。

---

## ✦ 推荐方案：Sealos 云平台

- 国内访问快，自动分配 HTTPS 域名
- 微信扫码登录，注册即送免费额度（足够个人小工具长期运行）
- 支持 Node.js 容器，部署后公网任何人都能访问

---

## 方式 A：DevBox 拖拽部署（最简单，推荐）

### 1. 登录 Sealos

打开 https://cloud.sealos.run/
→ 点击「微信登录」扫码
→ 进入桌面

### 2. 创建 DevBox

桌面点击「DevBox」图标
→ 新建 DevBox：
  - 名称：`pb-bp-resolver`
  - 语言：**Node.js**
  - 版本：**20**
  - CPU / 内存：1 核 1G（免费额度够用）
  - 端口：`3001`
→ 创建，等待 30 秒

### 3. 上传代码

DevBox 创建完成后会给你一个 SSH 地址和网页终端：
→ 打开 DevBox 网页终端
→ 拖拽 `pb-jd-bp-deploy.zip` 到终端窗口（自动上传到 `/home/dev`）
→ 执行解压与安装：

```bash
cd /home/dev
unzip -o pb-jd-bp-deploy.zip -d app
cd app
npm install --production=false
npm run build
```

### 4. 启动服务

```bash
npm run start
```

看到如下输出即成功：
```
  ✦ pb · JD BP Resolver API
  ➜  Local:  http://localhost:3001
  ➜  Health: http://localhost:3001/api/health
```

### 5. 发布上线（拿公网域名）

DevBox 页面点「发布」按钮
→ 自动生成公网 HTTPS 地址，例如：
  `https://pb-bp-resolver-cloud.sealos.run`
→ 任何人打开即可使用 ✦

---

## 方式 B：Docker 镜像部署（适合熟悉 Docker）

项目已自带 Dockerfile。

### 1. 登录 Sealos → 进入「应用管理」

### 2. 新建应用
- 镜像地址：先用 Docker Hub 或 Sealos 内置镜像仓库构建并推送镜像
- 端口：`3001`
- CPU / 内存：1 核 1G
- 开启外网访问

### 3. 一键部署
部署完成即拿到 `*.sealos.run` 公网域名。

---

## 本地验证（部署前自测）

```bash
npm install
npm run build      # 构建前端
npm run start      # 启动生产服务（单端口 3001 同时提供 API + 前端）
```

浏览器打开 http://localhost:3001/ 应能看到「pb · BP 反解工坊」。

---

## 项目结构

```
api/index.ts          Express 后端（短链解析 + 静态托管）
src/                  React 前端
Dockerfile            多阶段构建（构建前端 + 运行 Node）
dist/                 构建产物（npm run build 生成）
```

## 关键接口

- `GET  /api/health`   健康检查
- `POST /api/resolve`  解析 bp 文案，返回 commlist 链接
- `GET  /`              前端页面

## 免费额度说明

Sealos 注册即送免费额度，1 核 1G 容器 24 小时运行每月约 5-10 元额度，
个人小工具日均几十次调用完全够用。额度耗尽服务会暂停，充值或等下月刷新即可。
