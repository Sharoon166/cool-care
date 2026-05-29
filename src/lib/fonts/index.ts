import latoRegularB64 from './lato-regular-b64.txt?raw';
import latoItalicB64 from './lato-italic-b64.txt?raw';
import montserratBoldB64 from './montserrat-bold-b64.txt?raw';
import montserratExtraBoldB64 from './montserrat-extrabold-b64.txt?raw';

export const LatoRegular = Buffer.from(latoRegularB64, 'base64');
export const LatoItalic = Buffer.from(latoItalicB64, 'base64');
export const MontserratBold = Buffer.from(montserratBoldB64, 'base64');
export const MontserratExtraBold = Buffer.from(montserratExtraBoldB64, 'base64');
