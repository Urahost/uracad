import { logger } from "./logger";

export type DiscordEmbed = {
  title?: string;
  description?: string;
  url?: string;
  color?: number;
  fields?: { name: string; value: string; inline?: boolean }[];
  author?: { name: string; url?: string; icon_url?: string };
  thumbnail?: { url: string };
  image?: { url: string };
  footer?: { text: string; icon_url?: string };
  timestamp?: string;
};

export type DiscordWebhookPayload = {
  content?: string;
  username?: string;
  avatar_url?: string;
  embeds?: DiscordEmbed[];
  allowed_mentions?: {
    parse?: ("users" | "roles" | "everyone")[];
    users?: string[];
    roles?: string[];
  };
};

/**
 * Envoie un message à un webhook Discord.
 * @param url L'URL du webhook Discord
 * @param payload Le contenu du message (content, embeds, etc)
 */
export async function sendDiscordWebhook(url: string, payload: DiscordWebhookPayload) {
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Erreur Discord webhook: ${res.status} - ${text}`);
    }
    return await res.json().catch(() => undefined); // Discord peut ne rien renvoyer
  } catch (error) {
    logger.error("Error sending Discord webhook:", error);
    throw error;
  }
} 