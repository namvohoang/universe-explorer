/**
 * Defined constants, from JPL Solar System Dynamics "Astrodynamic Parameters"
 * (ssd.jpl.nasa.gov/astro_par.html, read 2026-10-04).
 */

/** Astronomical unit, exact by IAU 2012 Resolution B1 (149597870700 m). */
export const KM_PER_AU = 149_597_870.7;

/** Speed of light in vacuum, exact (299792458 m/s). */
export const SPEED_OF_LIGHT_KM_PER_S = 299_792.458;

export const SECONDS_PER_DAY = 86_400;
export const DAYS_PER_JULIAN_YEAR = 365.25;
export const DAYS_PER_JULIAN_CENTURY = 36_525;

/**
 * J2000.0 as a Julian date: the epoch JPL's planetary elements count centuries from
 * (ssd.jpl.nasa.gov/planets/approx_pos.html, read 2026-10-04).
 */
export const J2000_JD = 2_451_545.0;

/** One parsec in km: the distance at which one AU spans one arcsecond (IAU 2015 definition). */
export const KM_PER_PARSEC = (KM_PER_AU * 648_000) / Math.PI;
/** One light-year in km: how far light goes in a Julian year. */
export const KM_PER_LIGHT_YEAR = SPEED_OF_LIGHT_KM_PER_S * SECONDS_PER_DAY * DAYS_PER_JULIAN_YEAR;
export const LIGHT_YEARS_PER_PARSEC = KM_PER_PARSEC / KM_PER_LIGHT_YEAR;
