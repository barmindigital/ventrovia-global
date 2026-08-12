/** Cloudflare Worker entry point for the «Индустрия поставок» catalog. */
import {
  DEFAULT_DEVICE_SIZES,
  DEFAULT_IMAGE_SIZES,
  handleImageOptimization,
} from "vinext/server/image-optimization";
import handler from "vinext/server/app-router-entry";
import {
  PRODUCT_CATALOG_PUBLIC_ENABLED,
  catalogPublicEnabledFrom,
  isPublicProductDataPath,
} from "../app/lib/catalog-visibility";
import {
  ADMIN_COOKIE_NAME,
  verifyAdminSessionWithSecret,
} from "../app/lib/admin-session";

interface AssetFetcher {
  fetch(request: Request): Promise<Response>;
}

interface Env {
  ASSETS: AssetFetcher;
  ADMIN_SESSION_SECRET?: string;
  PRODUCT_CATALOG_PUBLIC_ENABLED?: string;
  IMAGES: {
    input(stream: ReadableStream): {
      transform(options: Record<string, unknown>): {
        output(options: {
          format: string;
          quality: number;
        }): Promise<{ response(): Response }>;
      };
    };
  };
}

interface ExecutionContext {
  waitUntil(promise: Promise<unknown>): void;
  passThroughOnException(): void;
}

// Image security config. SVG sources with .svg extension auto-skip the
// optimization endpoint on the client side (served directly, no proxy).
// To route SVGs through the optimizer (with security headers), set
// dangerouslyAllowSVG: true in next.config.js and uncomment below:
// const imageConfig: ImageConfig = { dangerouslyAllowSVG: true };

const worker = {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext,
  ): Promise<Response> {
    const url = new URL(request.url);

    if (isPublicProductDataPath(url.pathname)) {
      const runtimePublicEnabled =
        env.PRODUCT_CATALOG_PUBLIC_ENABLED === undefined
          ? PRODUCT_CATALOG_PUBLIC_ENABLED
          : catalogPublicEnabledFrom(env.PRODUCT_CATALOG_PUBLIC_ENABLED);
      if (runtimePublicEnabled) {
        return env.ASSETS.fetch(request);
      }

      const cookie = request.headers
        .get("cookie")
        ?.split(";")
        .map((part) => part.trim())
        .find((part) => part.startsWith(`${ADMIN_COOKIE_NAME}=`))
        ?.slice(ADMIN_COOKIE_NAME.length + 1);
      const adminAuthenticated = await verifyAdminSessionWithSecret(
        cookie ? decodeURIComponent(cookie) : undefined,
        env.ADMIN_SESSION_SECRET ?? process.env.ADMIN_SESSION_SECRET,
      );

      if (!adminAuthenticated) {
        return new Response("Not found", {
          status: 404,
          headers: {
            "Cache-Control": "private, no-store, max-age=0",
            "Content-Type": "text/plain; charset=utf-8",
            "X-Content-Type-Options": "nosniff",
            "X-Robots-Tag": "noindex, nofollow",
          },
        });
      }

      const response = await env.ASSETS.fetch(request);
      const headers = new Headers(response.headers);
      headers.set("Cache-Control", "private, no-store, max-age=0");
      headers.set("Vary", "Cookie");
      headers.set("X-Content-Type-Options", "nosniff");
      headers.set("X-Robots-Tag", "noindex, nofollow");
      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers,
      });
    }

    if (url.pathname === "/_vinext/image") {
      const allowedWidths = [...DEFAULT_DEVICE_SIZES, ...DEFAULT_IMAGE_SIZES];
      return handleImageOptimization(
        request,
        {
          fetchAsset: (path) =>
            env.ASSETS.fetch(new Request(new URL(path, request.url))),
          transformImage: async (body, { width, format, quality }) => {
            const result = await env.IMAGES.input(body)
              .transform(width > 0 ? { width } : {})
              .output({ format, quality });
            return result.response();
          },
        },
        allowedWidths,
      );
    }

    return handler.fetch(request, env, ctx);
  },
};

export default worker;
