import { App } from '@capacitor/app';
import { Browser } from '@capacitor/browser';

const CALLBACK_PREFIX = 'com.targetrank.official://login-callback';
const isNative = () => !!(window.Capacitor && typeof window.Capacitor.isNativePlatform === 'function' && window.Capacitor.isNativePlatform());

window.__trNativeAuth = {
  isNative,
  openOAuth: async (url) => Browser.open({ url }),
};

if (isNative()) {
  App.addListener('appUrlOpen', async ({ url }) => {
    if (!url || !url.startsWith(CALLBACK_PREFIX)) return;
    try {
      const callbackUrl = new URL(url);
      const client = window.__trSupabaseClient;
      if (!client) throw new Error('Login service unavailable. Please reopen the app.');
      const code = callbackUrl.searchParams.get('code');
      if (code) {
        const { data, error } = await client.auth.exchangeCodeForSession(code);
        if (error) throw error;
        if (data.session?.user) window.__trFinishLogin?.(data.session.user);
      } else {
        const params = new URLSearchParams(callbackUrl.hash.slice(1));
        const access_token = params.get('access_token');
        const refresh_token = params.get('refresh_token');
        if (access_token && refresh_token) {
          const { data, error } = await client.auth.setSession({ access_token, refresh_token });
          if (error) throw error;
          if (data.session?.user) window.__trFinishLogin?.(data.session.user);
        } else {
          throw new Error('Google login did not return a valid session. Please try again.');
        }
      }
      await Browser.close();
    } catch (err) {
      const msg = err?.message || 'Google login callback failed.';
      if (typeof window.__trSetAuthMessage === 'function') window.__trSetAuthMessage(msg, true);
      else console.error(msg);
      try { await Browser.close(); } catch (_) {}
    }
  });
}
