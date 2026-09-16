const TIME_ZONE = "America/El_Salvador";

// "Hoy" se calcula en la zona horaria de El Salvador, no en UTC, para que el
// servidor y el navegador coincidan en qué día es "hoy" sin importar la hora.
export function todayInTZ() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TIME_ZONE }).format(new Date());
}
