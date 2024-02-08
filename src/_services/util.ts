import { nanoid } from 'nanoid';
export function totalWordCount(str: string): number {
  return (str.match(/\w+/g) || []).length;
}

export function humanizeTime(time) {
  if (time < 0.5) {
    return 'less than a minute';
  }
  if (time >= 0.5 && time < 1.5) {
    return '1 minute';
  }
  return `${Math.ceil(time)} minutes`;
}

export function generateRandom() {
  return nanoid(10);
}

export function generateSignInMessage(wallet_address: string) {
  return `Welcome to CuaCaChain!\n\nClick to Link account and accept the Snews Terms of Service and Privacy Policy.\n\nThis request will not trigger a blockchain transaction or cost any gas fees.`;
}
