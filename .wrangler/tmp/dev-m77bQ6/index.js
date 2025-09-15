var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// src/fetcher.ts
var playaaaaas = ["Le-Sillon"];
var fetcher = /* @__PURE__ */ __name(async () => {
  return await Promise.all(
    playaaaaas.map(async (playa) => {
      const url = `https://fr.surf-forecast.com/breaks/${playa}/forecasts/latest/six_day`;
      const res = await fetch(url);
      const html = await res.text();
      return {
        playa,
        html,
        url
      };
    })
  );
}, "fetcher");

// src/parser.ts
var parser = /* @__PURE__ */ __name((html) => {
  const events = [];
  let current = /* @__PURE__ */ new Date();
  const extractedData = extractDataFromHTML(html);
  extractedData.intervals.forEach((interval) => {
    events.push({
      day: current.toISOString().split("T")[0],
      interval,
      rating: ""
    });
    if (interval === "soir") {
      current.setDate(current.getDate() + 1);
    }
  });
  extractedData.ratings.forEach((rating, index) => {
    if (events[index]) {
      events[index].rating = rating;
    }
  });
  return {
    surf: !!events.find((e) => e.rating !== "0"),
    formattedEvents: Object.entries(
      events.reduce((eventsPerDate, event) => {
        eventsPerDate[event.day] = {
          //@ts-ignore
          ...eventsPerDate[event.day] || {},
          [event.interval]: event
        };
        return eventsPerDate;
      }, {})
    ).map(([day, events2]) => {
      const weekday = `${getWeekDay(new Date(day)).slice(0, 2)} ${getMonthDay(
        new Date(day)
      )}`;
      const f = [
        //@ts-ignore
        events2["matin"]?.rating ?? "0",
        //@ts-ignore
        events2["apr\xE8s-midi"]?.rating ?? "0",
        //@ts-ignore
        events2["soir"]?.rating ?? "0"
      ].join("\u30FB");
      if (f !== "0\u30FB0\u30FB0") {
        return `${weekday} : ${f}`;
      }
      return "(...)";
    })
  };
}, "parser");
function extractDataFromHTML(html) {
  const intervals = [];
  const ratings = [];
  const intervalMatches = html.matchAll(/<span[^>]*class="[^"]*forecast-table__value[^"]*"[^>]*>([^<]+)<\/span>/gi);
  for (const match of intervalMatches) {
    const text = match[1].trim().replace("<br>", "");
    intervals.push(text);
  }
  const ratingMatches = html.matchAll(/<div[^>]*class="[^"]*star-rating__rating[^"]*"[^>]*>([^<]*)<\/div>/gi);
  for (const match of ratingMatches) {
    const text = match[1].trim();
    ratings.push(text);
  }
  return { intervals, ratings };
}
__name(extractDataFromHTML, "extractDataFromHTML");
var getWeekDay = /* @__PURE__ */ __name((d) => new Intl.DateTimeFormat("fr-FR", { weekday: "long" }).format(d), "getWeekDay");
var getMonthDay = /* @__PURE__ */ __name((d) => new Intl.DateTimeFormat("fr-FR", { day: "2-digit" }).format(d), "getMonthDay");

// src/sender.ts
var homeserver = "https://matrix.org";
var bret = "!cNnlHVMpiveQFVMhkp:matrix.org";
var send = /* @__PURE__ */ __name(async (body, accessToken) => {
  const url = `${homeserver}/_matrix/client/r0/rooms/${encodeURIComponent(bret)}/send/m.room.message`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${accessToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      msgtype: "m.text",
      format: "org.matrix.custom.html",
      formatted_body: body,
      body
    })
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to send message to Matrix: ${response.status} ${errorText}`);
  }
  console.log("Message sent successfully to Matrix");
}, "send");

// src/index.ts
var src_default = {
  async scheduled(event, env, ctx) {
    console.log("Surf monitoring cron job started");
    try {
      const playas = await fetcher();
      for (const { html, playa, url } of playas) {
        const { surf, formattedEvents } = parser(html);
        if (!surf) {
          continue;
        }
        const body = `
<div>
<h2>\u{1F6A8} swell alert - ${playa}</h2>
<br/>
<div>${formattedEvents.filter((a, index) => {
          if (a === "(...)" && index > 0 && formattedEvents[index - 1] === "(...)") {
            return false;
          }
          return true;
        }).join("</div><div>")}</div>
<br/>
<a href="${url}">\u{1F449} en savoir plus</a>
<div>
`;
        console.log("Sending surf alert:", body);
        await send(body, env.MATRIX_ACCESS_TOKEN);
      }
    } catch (error) {
      console.error("Error in surf monitoring:", error);
    }
  }
};

// ../../.nvm/versions/node/v24.8.0/lib/node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
var drainBody = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;

// ../../.nvm/versions/node/v24.8.0/lib/node_modules/wrangler/templates/middleware/middleware-scheduled.ts
var scheduled = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  const url = new URL(request.url);
  if (url.pathname === "/__scheduled") {
    const cron = url.searchParams.get("cron") ?? "";
    await middlewareCtx.dispatch("scheduled", { cron });
    return new Response("Ran scheduled event");
  }
  const resp = await middlewareCtx.next(request, env);
  if (request.headers.get("referer")?.endsWith("/__scheduled") && url.pathname === "/favicon.ico" && resp.status === 500) {
    return new Response(null, { status: 404 });
  }
  return resp;
}, "scheduled");
var middleware_scheduled_default = scheduled;

// ../../.nvm/versions/node/v24.8.0/lib/node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError(e);
    return Response.json(error, {
      status: 500,
      headers: { "MF-Experimental-Error-Stack": "true" }
    });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;

// .wrangler/tmp/bundle-C5EgnN/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_scheduled_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = src_default;

// ../../.nvm/versions/node/v24.8.0/lib/node_modules/wrangler/templates/middleware/common.ts
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");

// .wrangler/tmp/bundle-C5EgnN/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class ___Facade_ScheduledController__ {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  static {
    __name(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name((request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name((type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;
export {
  __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default as default
};
//# sourceMappingURL=index.js.map
