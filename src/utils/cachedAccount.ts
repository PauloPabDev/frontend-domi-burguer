// Último usuario conocido. Sirve para pintar el botón de cuenta antes de que Firebase resuelva la sesión.
// El estado visual vive en <html data-account> / --account-photo (lo decide el CSS), no en React,
// para que esté correcto desde el primer pintado, incluso antes de hidratar.
const KEY = 'domi:cached-account';

export interface CachedAccount {
  displayName: string | null;
  photoURL: string | null;
}

export const readCachedAccount = (): CachedAccount | null => {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as CachedAccount) : null;
  } catch {
    return null;
  }
};

const applyAccountToDom = (account: CachedAccount | null) => {
  const root = document.documentElement;
  if (!account) {
    delete root.dataset.account;
    root.style.removeProperty('--account-photo');
    return;
  }
  root.dataset.account = account.photoURL ? 'photo' : 'user';
  if (account.photoURL) root.style.setProperty('--account-photo', `url(${JSON.stringify(account.photoURL)})`);
  else root.style.removeProperty('--account-photo');
};

export const writeCachedAccount = (account: CachedAccount | null) => {
  applyAccountToDom(account);
  try {
    if (account) localStorage.setItem(KEY, JSON.stringify(account));
    else localStorage.removeItem(KEY);
  } catch {
    // localStorage no disponible (modo privado): solo se pierde el caché
  }
};

// Script bloqueante para <head>: mismo efecto que applyAccountToDom, pero antes del primer pintado.
export const ACCOUNT_BOOT_SCRIPT = `try{var a=JSON.parse(localStorage.getItem(${JSON.stringify(KEY)}));if(a){var r=document.documentElement;r.dataset.account=a.photoURL?'photo':'user';if(a.photoURL)r.style.setProperty('--account-photo','url('+JSON.stringify(a.photoURL)+')')}}catch(e){}`;
