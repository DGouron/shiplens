const faviconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#6366f1"/><stop offset="100%" stop-color="#a855f7"/></linearGradient></defs><rect width="32" height="32" rx="8" fill="url(#g)"/><circle cx="14" cy="14" r="7" fill="none" stroke="#fff" stroke-width="2.5"/><line x1="19" y1="19" x2="26" y2="26" stroke="#fff" stroke-width="2.5" stroke-linecap="round"/></svg>`;

const encodedSvg = Buffer.from(faviconSvg).toString('base64');

export const faviconLink = `<link rel="icon" type="image/svg+xml" href="data:image/svg+xml;base64,${encodedSvg}">`;
