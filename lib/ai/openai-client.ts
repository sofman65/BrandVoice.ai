"use server";
import "server-only";
import type OpenAI from "openai";

let cachedClient: OpenAI | null = null;

export async function getOpenAI() {
  if (cachedClient) return cachedClient;
  if (!process.env.OPENAI_API_KEY) return null;

  const { default: OpenAISdk } = await import("openai");
  cachedClient = new OpenAISdk({ apiKey: process.env.OPENAI_API_KEY });
  return cachedClient;
}

export async function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), ms);
  return new Promise<T>((resolve, reject) => {
    promise
      .then(resolve)
      .catch((e) => {
        if ((e as any)?.name === "AbortError") {
          reject(new Error(`${label} timed out after ${ms}ms`));
          return;
        }
        reject(e);
      })
      .finally(() => clearTimeout(t));
  });
}
