/**
 * Vercel Serverless：翻译接口，与 backend 逻辑一致。
 * 需在 Vercel 项目 Environment Variables 中配置 DEEPSEEK_API_KEY。
 */

import axios from "axios";

const DEEPSEEK_API_URL =
  process.env.DEEPSEEK_API_URL || "https://api.deepseek.com/chat/completions";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "METHOD_NOT_ALLOWED", message: "仅支持 POST" });
  }

  const { text, sourceLang, targetLang } = req.body || {};
  if (!text || typeof text !== "string") {
    return res.status(400).json({
      error: "INVALID_TEXT",
      message: "请求参数 text 不能为空，并且必须为字符串。",
    });
  }
  if (!targetLang || typeof targetLang !== "string") {
    return res.status(400).json({
      error: "INVALID_TARGET_LANG",
      message: "请求参数 targetLang 不能为空，并且必须为字符串。",
    });
  }

  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      error: "CONFIG_ERROR",
      message: "未配置 DEEPSEEK_API_KEY，请在 Vercel 项目 Settings → Environment Variables 中添加。",
    });
  }

  const langFrom = sourceLang || "auto";
  const systemPrompt = `你是一名专业的翻译助手。请将用户提供的文本从 ${langFrom} 翻译成 ${targetLang}，只输出翻译后的内容，不要添加任何解释或额外文字。`;

  try {
    const response = await axios.post(
      DEEPSEEK_API_URL,
      {
        model: "deepseek-chat",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: text },
        ],
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        timeout: 30000,
      }
    );

    const content = response.data?.choices?.[0]?.message?.content?.trim() ?? "";
    if (!content) {
      return res.status(502).json({
        error: "TRANSLATE_FAILED",
        message: "DeepSeek 返回为空。",
      });
    }

    return res.status(200).json({ translatedText: content });
  } catch (err) {
    const msg = err.response?.data?.message || err.message || "翻译请求失败";
    return res.status(502).json({ error: "TRANSLATE_FAILED", message: msg });
  }
}
