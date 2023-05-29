import { loadScript } from './script';

interface RenderOptions {
  sitekey: string;
  retry: string;
  callback: (token: string) => void;
  'error-callback': (err: any) => void;
}

declare global {
  export interface Window {
    turnstile: { execute: (container?: string | HTMLElement | null, params?: RenderOptions) => void };
  }
}

const SCRIPT_URL = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
const SITE_KEY = '0x4AAAAAAAFHxLeVBtmN8VhF';

export async function loadCaptcha() {
  return new Promise(resolve => {
    resolve(
      loadScript(SCRIPT_URL, {
        defer: true,
        globalObject: window.turnstile,
      }),
    );
  }).then(() => window.turnstile);
}

export const getCaptchaToken = async () => {
  let captchaToken = '';

  const div = document.createElement('div');
  div.classList.add('clerk-captcha');
  document.body.appendChild(div);
  const captcha = await loadCaptcha();

  const handleCaptchaTokenGeneration = (): Promise<string> => {
    return new Promise((resolve, reject) => {
      return captcha.execute('.clerk-captcha', {
        sitekey: SITE_KEY,
        retry: 'never',
        callback: function (token: string) {
          resolve(token);
        },
        'error-callback': function (err) {
          reject(err);
        },
      });
    });
  };

  try {
    captchaToken = await handleCaptchaTokenGeneration();
  } catch (e) {
    console.warn(e);
  } finally {
    document.body.removeChild(div);
  }

  return captchaToken;
};
