// Fotografías reales de portada, servidas desde Unsplash (licencia Unsplash:
// uso comercial gratuito; se da crédito al fotógrafo en la cabecera del curso).
// Tienen prioridad sobre courses.cover_url. Para volver a la imagen de la base,
// basta con quitar el curso de este mapa.

export type FotoPortada = {
  /** Imagen en images.unsplash.com (se recorta y optimiza vía next/image). */
  src: string;
  autor: string;
  /** Perfil del fotógrafo en Unsplash. */
  perfil: string;
  /** Página de la foto en Unsplash. */
  pagina: string;
};

const UTM = "utm_source=curseria&utm_medium=referral";

function foto(id: string, autor: string, usuario: string, slugFoto: string): FotoPortada {
  return {
    src: `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1600&q=80`,
    autor,
    perfil: `https://unsplash.com/@${usuario}?${UTM}`,
    pagina: `https://unsplash.com/photos/${slugFoto}?${UTM}`,
  };
}

export const FOTOS_PORTADA: Record<string, FotoPortada> = {
  "menu-con-link": foto("photo-1747835680062-94a22ca03ba7", "Matthew Stephenson", "matthewryanstephenson", "V5mN7urzwOc"),
  "whatsapp-que-contesta-solo": foto("photo-1753164597612-5e71b83fda91", "Vitaly Gariev", "silverkblack", "kk4J92iaSBk"),
  "cotiza-en-5-minutos": foto("photo-1687422810663-c316494f725a", "Ali Mkumbwa", "mkumbwajr", "PxlKOcj0a3Q"),
  "tu-negocio-en-google": foto("photo-1612878731576-1d9ca638b741", "Carl Campbell", "carlbcampbell", "vlXfvnpubYw"),
  "un-mes-de-publicaciones": foto("photo-1532635217-f70b2d225fc3", "Elevate", "elevatebeer", "RevN53V6tPk"),
  "monetiza-ia": foto("photo-1581387490232-2181c3736353", "Blake Wisz", "blakewisz", "7weXfu_XTSw"),
  "ventas-con-ia": foto("photo-1758524056062-138a1fcfb010", "Vitaly Gariev", "silverkblack", "jkmGPJ5noB4"),
};
