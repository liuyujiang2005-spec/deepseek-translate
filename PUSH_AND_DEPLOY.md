# 推送到 GitHub 并部署为固定网址

**第一步已完成**，仓库地址：https://github.com/liuyujiang2005-spec/deepseek-translate  
请按下面 **第二步（Render）** 和 **第三步（Vercel）** 在浏览器中操作（已为你打开网站），即可得到随时可访问的固定前端地址。

---

## 第一步：推送到 GitHub（已完成）

- 仓库已创建并推送：**https://github.com/liuyujiang2005-spec/deepseek-translate**
- 若之后改代码，推送命令：`cd D:\deepseek-translate` → `git add .` → `git commit -m "说明"` → `git push`

---

## 第二步：在 Render 部署后端

1. 打开 https://render.com ，用 GitHub 登录。
2. 点击 **New +** → **Web Service**。
3. **Connect a repository** 里选你刚推送的 `deepseek-translate`。
4. 配置：
   - **Name**：`deepseek-translate-backend`（或任意）
   - **Root Directory**：填 `backend`
   - **Runtime**：Node
   - **Build Command**：`npm install && npm run build`
   - **Start Command**：`npm start`
   - **Instance Type**：选 Free
5. **Environment** 里点 **Add Environment Variable**：
   - `DEEPSEEK_API_KEY` = 你的 DeepSeek API Key（必填）
6. 点 **Create Web Service**，等部署完成（约 2～3 分钟）。
7. 在页面顶部复制 **你的服务 URL**，形如：  
   `https://deepseek-translate-backend.onrender.com`  
   **保存这个地址**，下一步要用。

---

## 第三步：在 Vercel 部署前端

1. 打开 https://vercel.com ，用 GitHub 登录。
2. 点击 **Add New…** → **Project**。
3. 在列表里选 **Import** 你的 `deepseek-translate` 仓库。
4. 配置：
   - **Root Directory** 点 **Edit**，填 `frontend`，确认。
   - **Build Command**：保持 `npm run build`
   - **Output Directory**：保持 `dist`
5. **Environment Variables** 点 **Add**：
   - Name：`VITE_API_BASE_URL`
   - Value：填**第二步里复制的后端地址**（如 `https://deepseek-translate-backend.onrender.com`），**不要**加末尾斜杠。
6. 点 **Deploy**，等构建完成。
7. 部署完成后会显示 **Visit** 或项目地址，形如：  
   `https://deepseek-translate-xxx.vercel.app`  
   这就是**随时可访问的固定前端网址**。

---

## 完成

- 把 Vercel 给的地址发给别人或自己收藏即可长期使用。
- 翻译会走你在 Render 上的后端；朗读仍是浏览器语音，无需配置。
- 若之后改了代码，推送 `git push` 后，Render 和 Vercel 一般会自动重新部署（若已连接同一仓库）。
