import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
import os from "os";
import { translateTextWithDeepseek } from "./translate";
import { synthesizeSpeechWithAzure } from "./ttsAzure";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// 为所有请求启用 JSON 解析和基础中间件
app.use(express.json());
app.use(
  cors({
    origin: "*",
  }),
);

/**
 * 统一错误处理中间件，确保接口返回结构化错误信息。
 */
function errorHandler(
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  console.error("Unexpected error:", err);
  res.status(500).json({
    error: "INTERNAL_SERVER_ERROR",
    message: "服务器内部错误，请稍后重试。",
  });
}

/**
 * 翻译接口：接收原文和语言参数，调用 DeepSeek 完成翻译。
 */
app.post("/api/translate", async (req: Request, res: Response) => {
  const { text, sourceLang, targetLang } = req.body ?? {};

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

  try {
    const translatedText = await translateTextWithDeepseek(
      text,
      sourceLang || "auto",
      targetLang,
    );
    res.json({ translatedText });
  } catch (error: any) {
    console.error("Translate error:", error?.response?.data || error);
    res.status(502).json({
      error: "TRANSLATE_FAILED",
      message: "调用 DeepSeek 翻译失败，请稍后重试。",
    });
  }
});

/**
 * 朗读接口：接收文本和语言信息，调用 Azure TTS 返回音频流。
 */
app.post("/api/tts", async (req: Request, res: Response) => {
  const { text, lang, voice } = req.body ?? {};

  if (!text || typeof text !== "string") {
    return res.status(400).json({
      error: "INVALID_TEXT",
      message: "请求参数 text 不能为空，并且必须为字符串。",
    });
  }

  try {
    const audioBuffer = await synthesizeSpeechWithAzure(text, lang, voice);
    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("Content-Length", audioBuffer.length.toString());
    res.send(audioBuffer);
  } catch (error: any) {
    console.error("TTS error:", error?.response?.data || error);
    res.status(502).json({
      error: "TTS_FAILED",
      message: "调用语音合成失败，请稍后重试。",
    });
  }
});

app.use(errorHandler);

/** 获取本机局域网 IP，用于在启动时打印外部可访问地址 */
function getLocalIp(): string | null {
  const nets = os.networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const info of nets[name]) {
      if (info.family === "IPv4" && !info.internal) return info.address;
    }
  }
  return null;
}

app.listen(Number(port), "0.0.0.0", () => {
  const local = `http://localhost:${port}`;
  const ip = getLocalIp();
  const lan = ip ? `http://${ip}:${port}` : null;
  console.log(`Backend server is running on ${local}`);
  if (lan) console.log(`  LAN access: ${lan}`);
});

