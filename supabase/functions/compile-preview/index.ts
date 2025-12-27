import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

interface CompileRequest {
  files: Array<{ name: string; content: string }>
}

serve(async (req) => {
  // CORS headers
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    })
  }

  try {
    const { files }: CompileRequest = await req.json()

    // Find HTML entry point
    const htmlFile = files.find((f) => f.name === "index.html" || f.name.endsWith(".html"))
    if (!htmlFile) {
      return new Response(JSON.stringify({ error: "No HTML file found" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    let html = htmlFile.content

    // Step 1: Inline local CSS files
    const cssFiles = files.filter((f) => f.name.endsWith(".css"))
    cssFiles.forEach((cssFile) => {
      const cssLinkRegex = new RegExp(
        `<link[^>]*href=["'](\\.\\/)?(${cssFile.name})["'][^>]*>`,
        "gi"
      )
      const inlinedCss = `<style data-file="${cssFile.name}">\n${cssFile.content}\n</style>`
      html = html.replace(cssLinkRegex, inlinedCss)
    })

    // Step 2: Inline local JS files (except socket.js)
    const jsFiles = files.filter((f) => f.name.endsWith(".js") && f.name !== "socket.js")
    jsFiles.forEach((jsFile) => {
      const jsScriptRegex = new RegExp(
        `<script[^>]*src=["'](\\.\\/)?(${jsFile.name})["'][^>]*>\\s*</script>`,
        "gi"
      )
      const inlinedJs = `<script data-file="${jsFile.name}">\n${jsFile.content}\n</script>`
      html = html.replace(jsScriptRegex, inlinedJs)
    })

    // Step 3: Add console proxy for debugging
    const consoleProxy = `
<script>
(function() {
  if (window.__cs_compiled) return;
  window.__cs_compiled = true;
  
  const nativeConsole = {
    log: console.log.bind(console),
    warn: console.warn.bind(console),
    error: console.error.bind(console)
  };
  
  function send(level, args) {
    const payload = args.map((a) => {
      try {
        return typeof a === "object" ? JSON.stringify(a) : String(a);
      } catch (e) {
        return String(a);
      }
    });
    window.parent.postMessage({ type: "SANDBOX_LOG", level, payload }, "*");
    nativeConsole[level].apply(console, args);
  }
  
  console.log = function() { send("log", Array.from(arguments)); };
  console.warn = function() { send("warn", Array.from(arguments)); };
  console.error = function() { send("error", Array.from(arguments)); };
  
  window.onerror = function(msg, url, line, col, error) {
    const payload = [msg, "@ " + (url ? url.split('/').pop() : 'unknown') + ":" + line + ":" + col];
    window.parent.postMessage({ type: "SANDBOX_LOG", level: "error", payload }, "*");
    return false;
  };
  
  window.addEventListener("unhandledrejection", function(e) {
    window.parent.postMessage({ type: "SANDBOX_LOG", level: "error", payload: ["Unhandled Rejection:", String(e.reason)] }, "*");
  });
  
  window.addEventListener("load", function() {
    const waitForFonts = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
    waitForFonts.then(function() {
      setTimeout(function() {
        window.parent.postMessage({ type: "SANDBOX_CONTENT_READY" }, "*");
      }, 100);
    });
  });
})();
</script>
`

    // Inject console proxy at the start of <head>
    if (/<head[^>]*>/i.test(html)) {
      html = html.replace(/<head[^>]*>/i, (match) => `${match}\n${consoleProxy}`)
    } else {
      html = `<!DOCTYPE html><html><head>${consoleProxy}</head>` + html
    }

    return new Response(JSON.stringify({ html, success: true }), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    })
  } catch (error) {
    console.error("[Compile Error]", error)
    return new Response(
      JSON.stringify({
        error: "Compilation failed",
        details: String(error),
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    )
  }
})
