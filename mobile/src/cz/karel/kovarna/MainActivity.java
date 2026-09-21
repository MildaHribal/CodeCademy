package cz.karel.kovarna;

import android.app.Activity;
import android.graphics.Bitmap;
import android.net.Uri;
import android.os.Bundle;
import android.content.Intent;
import android.webkit.CookieManager;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

/**
 * Tenký obal nad webovou aplikací. Všechno — obsah, postup i rozepsaný kód — žije na
 * serveru v počítači, takže telefon a počítač ukazují totéž. Adresa serveru včetně
 * párovacího tokenu se do aplikace zapéká při sestavení (build.sh).
 */
public class MainActivity extends Activity {
    private static final String OFFLINE_PAGE =
        "<!doctype html><meta charset='utf-8'><meta name='viewport' content='width=device-width, initial-scale=1'>"
        + "<body style='margin:0;min-height:100vh;display:grid;place-items:center;background:#090b10;color:#f2f0ea;"
        + "font-family:sans-serif;text-align:center;padding:24px'>"
        + "<div><h1 style='font-size:22px'>Počítač neodpovídá</h1>"
        + "<p style='color:#a9aebb;max-width:32ch;line-height:1.5'>Zkontroluj, že na počítači běží <b>./start-telefon.sh</b> "
        + "a že je na obou zařízeních zapnutý Tailscale.</p>"
        + "<p><a href='kovarna://retry' style='display:inline-block;margin-top:12px;padding:12px 22px;border-radius:12px;"
        + "background:#f2b84b;color:#1a1204;font-weight:700;text-decoration:none'>Zkusit znovu</a></p></div>";

    private WebView web;
    private String serverUrl;

    @Override
    protected void onCreate(Bundle state) {
        super.onCreate(state);
        serverUrl = getString(R.string.server_url);
        final String serverHost = Uri.parse(serverUrl).getHost();

        web = new WebView(this);
        web.setBackgroundColor(0xFF090B10);
        setContentView(web);

        WebSettings settings = web.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setMediaPlaybackRequiresUserGesture(false);
        settings.setTextZoom(100);
        CookieManager.getInstance().setAcceptCookie(true);

        web.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                Uri uri = request.getUrl();
                if ("kovarna".equals(uri.getScheme())) {
                    view.loadUrl(serverUrl);
                    return true;
                }
                if (serverHost != null && serverHost.equals(uri.getHost())) return false;
                // Odkazy ven (MDN, dokumentace) patří do prohlížeče, ne do kurzu.
                startActivity(new Intent(Intent.ACTION_VIEW, uri));
                return true;
            }

            @Override
            public void onReceivedError(WebView view, WebResourceRequest request, WebResourceError error) {
                if (request.isForMainFrame()) view.loadDataWithBaseURL(null, OFFLINE_PAGE, "text/html", "utf-8", null);
            }

            @Override
            public void onPageFinished(WebView view, String url) {
                CookieManager.getInstance().flush();
            }
        });

        if (state != null) web.restoreState(state);
        else web.loadUrl(serverUrl);
    }

    @Override
    protected void onSaveInstanceState(Bundle state) {
        super.onSaveInstanceState(state);
        web.saveState(state);
    }

    @Override
    public void onBackPressed() {
        if (web.canGoBack()) web.goBack();
        else super.onBackPressed();
    }
}
