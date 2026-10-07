// Where the stories of the Watch screen get their times, paths and sentences. Shown as text,
// never fetched by the app.
import type { Source } from '../types';

export const USNO_MOON_PHASES: Source = {
  id: 'usno-moon-phases',
  title:
    'US Naval Observatory, Astronomical Applications — dates and times of the primary phases of the Moon from 2026-10-08',
  url: 'https://aa.usno.navy.mil/api/moon/phases/date?date=2026-10-08&nump=6',
  retrieved: '2026-10-07',
};

export const NASA_MOON_PHASES: Source = {
  id: 'nasa-moon-phases',
  title: 'NASA Science — Moon Phases',
  url: 'https://science.nasa.gov/moon/moon-phases/',
  retrieved: '2026-10-07',
};

export const JPL_HORIZONS_PATH_ARTEMIS_1_ORION: Source = {
  id: 'jpl-horizons-path-artemis1orion',
  title:
    'JPL Horizons — position and velocity of Artemis I (-1023, the Orion spacecraft, as flown, from NASA/JSC navigation) from the centre of Earth every 10 minutes, 2022-11-16 09:00 to 2022-12-11 17:00 TDB, ecliptic of J2000',
  url: 'https://ssd.jpl.nasa.gov/api/horizons.api?format=text&COMMAND=%27-1023%27&OBJ_DATA=%27NO%27&MAKE_EPHEM=%27YES%27&EPHEM_TYPE=%27VECTORS%27&CENTER=%27500%40399%27&REF_PLANE=%27ECLIPTIC%27&REF_SYSTEM=%27ICRF%27&OUT_UNITS=%27KM-S%27&VEC_TABLE=%272%27&CSV_FORMAT=%27YES%27&START_TIME=%272022-11-16+09%3A00%27&STOP_TIME=%272022-12-11+17%3A00%27&STEP_SIZE=%2710m%27',
  retrieved: '2026-10-07',
};

export const JPL_HORIZONS_PATH_ARTEMIS_1_MOON: Source = {
  id: 'jpl-horizons-path-artemis1moon',
  title:
    'JPL Horizons — position and velocity of the Moon (301) from the centre of Earth every 10 minutes, 2022-11-16 09:00 to 2022-12-11 17:00 TDB, ecliptic of J2000',
  url: 'https://ssd.jpl.nasa.gov/api/horizons.api?format=text&COMMAND=%27301%27&OBJ_DATA=%27NO%27&MAKE_EPHEM=%27YES%27&EPHEM_TYPE=%27VECTORS%27&CENTER=%27500%40399%27&REF_PLANE=%27ECLIPTIC%27&REF_SYSTEM=%27ICRF%27&OUT_UNITS=%27KM-S%27&VEC_TABLE=%272%27&CSV_FORMAT=%27YES%27&START_TIME=%272022-11-16+09%3A00%27&STOP_TIME=%272022-12-11+17%3A00%27&STEP_SIZE=%2710m%27',
  retrieved: '2026-10-07',
};

export const NASA_ARTEMIS_I: Source = {
  id: 'nasa-artemis-i',
  title: 'NASA — Artemis I',
  url: 'https://www.nasa.gov/mission/artemis-i/',
  retrieved: '2026-10-07',
};

export const NASA_ARTEMIS_I_SPLASHDOWN: Source = {
  id: 'nasa-artemis-i-splashdown',
  title: 'NASA — Splashdown! NASA’s Orion Returns to Earth After Historic Moon Mission',
  url: 'https://www.nasa.gov/missions/artemis/artemis-1/splashdown-nasas-orion-returns-to-earth-after-historic-moon-mission/',
  retrieved: '2026-10-07',
};

export const JPL_HORIZONS_PATH_ARTEMIS_2_ORION: Source = {
  id: 'jpl-horizons-path-artemis2orion',
  title:
    'JPL Horizons — position and velocity of Artemis II (-1024, the Orion spacecraft, from NASA/JSC navigation) from the centre of Earth every 10 minutes, 2026-04-02 02:10 to 2026-04-10 23:50 TDB, ecliptic of J2000',
  url: 'https://ssd.jpl.nasa.gov/api/horizons.api?format=text&COMMAND=%27-1024%27&OBJ_DATA=%27NO%27&MAKE_EPHEM=%27YES%27&EPHEM_TYPE=%27VECTORS%27&CENTER=%27500%40399%27&REF_PLANE=%27ECLIPTIC%27&REF_SYSTEM=%27ICRF%27&OUT_UNITS=%27KM-S%27&VEC_TABLE=%272%27&CSV_FORMAT=%27YES%27&START_TIME=%272026-04-02+02%3A10%27&STOP_TIME=%272026-04-10+23%3A50%27&STEP_SIZE=%2710m%27',
  retrieved: '2026-10-07',
};

export const JPL_HORIZONS_PATH_ARTEMIS_2_MOON: Source = {
  id: 'jpl-horizons-path-artemis2moon',
  title:
    'JPL Horizons — position and velocity of the Moon (301) from the centre of Earth every 10 minutes, 2026-04-02 02:10 to 2026-04-10 23:50 TDB, ecliptic of J2000',
  url: 'https://ssd.jpl.nasa.gov/api/horizons.api?format=text&COMMAND=%27301%27&OBJ_DATA=%27NO%27&MAKE_EPHEM=%27YES%27&EPHEM_TYPE=%27VECTORS%27&CENTER=%27500%40399%27&REF_PLANE=%27ECLIPTIC%27&REF_SYSTEM=%27ICRF%27&OUT_UNITS=%27KM-S%27&VEC_TABLE=%272%27&CSV_FORMAT=%27YES%27&START_TIME=%272026-04-02+02%3A10%27&STOP_TIME=%272026-04-10+23%3A50%27&STEP_SIZE=%2710m%27',
  retrieved: '2026-10-07',
};

export const JPL_HORIZONS_ARTEMIS_2: Source = {
  id: 'jpl-horizons-artemis-2',
  title:
    'JPL Horizons — data sheet for Artemis II (-1024): background and major events with their times',
  url: 'https://ssd.jpl.nasa.gov/api/horizons.api?format=text&COMMAND=%27-1024%27&OBJ_DATA=%27YES%27&MAKE_EPHEM=%27NO%27',
  retrieved: '2026-10-07',
};

export const NASA_ARTEMIS_II: Source = {
  id: 'nasa-artemis-ii',
  title: 'NASA — Artemis II',
  url: 'https://www.nasa.gov/mission/artemis-ii/',
  retrieved: '2026-10-07',
};

export const NASA_SP4029_APOLLO_11_ASCENT: Source = {
  id: 'nasa-sp4029-apollo11-ascent',
  title:
    'NASA SP-2000-4029, Apollo by the Numbers — Apollo 11 ascent phase: time, altitude, latitude and longitude at each event of the climb to orbit',
  url: 'https://www.nasa.gov/wp-content/uploads/static/history/SP-4029/Apollo_11d_Ascent_Phase.htm',
  retrieved: '2026-10-07',
};

export const JPL_HORIZONS_EARTH_TURN_APOLLO_11_ASCENT: Source = {
  id: 'jpl-horizons-earth-turn-apollo11ascent',
  title:
    'JPL Horizons — where the point at latitude 0, longitude 0 on Earth was, from Earth’s centre, at Apollo 11’s liftoff (1969-07-16 13:32:00.63 UTC), ecliptic of J2000',
  url: 'https://ssd.jpl.nasa.gov/api/horizons.api?format=text&COMMAND=%27c%3A+0%2C+6378.13700%2C+0.00000+%40399%27&OBJ_DATA=%27NO%27&MAKE_EPHEM=%27YES%27&EPHEM_TYPE=%27VECTORS%27&CENTER=%27500%40399%27&REF_PLANE=%27ECLIPTIC%27&OUT_UNITS=%27KM-S%27&VEC_TABLE=%271%27&CSV_FORMAT=%27YES%27&TLIST=%272440419.064356217%27',
  retrieved: '2026-10-07',
};

export const NASA_SATURN_V_STUDENTS: Source = {
  id: 'nasa-saturn-v-students',
  title: 'NASA — What Was the Saturn V? (Grades 5-8)',
  url: 'https://www.nasa.gov/learning-resources/for-kids-and-students/what-was-the-saturn-v-grades-5-8/',
  retrieved: '2026-10-07',
};

export const NASA_APOLLO_11_MISSION_REPORT: Source = {
  id: 'nasa-apollo11-mission-report',
  title:
    'NASA Manned Spacecraft Center — Apollo 11 Mission Report, MSC-00171 (November 1969), Table 7-II, trajectory parameters: latitude, longitude and heading at each event in lunar orbit',
  url: 'https://www.nasa.gov/wp-content/uploads/static/apollo50th/pdf/A11_MissionReport.pdf',
  retrieved: '2026-10-07',
};

export const NASA_SP4029_APOLLO_11_TIMELINE: Source = {
  id: 'nasa-sp4029-apollo11-timeline',
  title: 'NASA SP-2000-4029, Apollo by the Numbers — Apollo 11 timeline: each event with its time',
  url: 'https://www.nasa.gov/wp-content/uploads/static/history/SP-4029/Apollo_11i_Timeline.htm',
  retrieved: '2026-10-07',
};

export const NASA_SP4029_APOLLO_11_SUMMARY: Source = {
  id: 'nasa-sp4029-apollo11-summary',
  title:
    'NASA SP-2000-4029, Apollo by the Numbers — Apollo 11: the seventh mission, the first lunar landing',
  url: 'https://www.nasa.gov/wp-content/uploads/static/history/SP-4029/Apollo_11a_Summary.htm',
  retrieved: '2026-10-07',
};

export const JPL_HORIZONS_PATH_ECLIPSE_2027_MOON: Source = {
  id: 'jpl-horizons-path-eclipse2027moon',
  title:
    'JPL Horizons — position and velocity of the Moon (301) from the centre of Earth every 2 minutes, 2027-08-02 07:00 to 2027-08-02 13:30 TDB, ecliptic of J2000',
  url: 'https://ssd.jpl.nasa.gov/api/horizons.api?format=text&COMMAND=%27301%27&OBJ_DATA=%27NO%27&MAKE_EPHEM=%27YES%27&EPHEM_TYPE=%27VECTORS%27&CENTER=%27500%40399%27&REF_PLANE=%27ECLIPTIC%27&REF_SYSTEM=%27ICRF%27&OUT_UNITS=%27KM-S%27&VEC_TABLE=%272%27&CSV_FORMAT=%27YES%27&START_TIME=%272027-08-02+07%3A00%27&STOP_TIME=%272027-08-02+13%3A30%27&STEP_SIZE=%272m%27',
  retrieved: '2026-10-07',
};

export const JPL_HORIZONS_PATH_ECLIPSE_2027_EARTH: Source = {
  id: 'jpl-horizons-path-eclipse2027earth',
  title:
    'JPL Horizons — position and velocity of Earth (399) from the centre of the Sun every 2 minutes, 2027-08-02 07:00 to 2027-08-02 13:30 TDB, ecliptic of J2000',
  url: 'https://ssd.jpl.nasa.gov/api/horizons.api?format=text&COMMAND=%27399%27&OBJ_DATA=%27NO%27&MAKE_EPHEM=%27YES%27&EPHEM_TYPE=%27VECTORS%27&CENTER=%27500%4010%27&REF_PLANE=%27ECLIPTIC%27&REF_SYSTEM=%27ICRF%27&OUT_UNITS=%27KM-S%27&VEC_TABLE=%272%27&CSV_FORMAT=%27YES%27&START_TIME=%272027-08-02+07%3A00%27&STOP_TIME=%272027-08-02+13%3A30%27&STEP_SIZE=%272m%27',
  retrieved: '2026-10-07',
};

export const JPL_HORIZONS_PATH_ECLIPSE_2028_MOON: Source = {
  id: 'jpl-horizons-path-eclipse2028moon',
  title:
    'JPL Horizons — position and velocity of the Moon (301) from the centre of Earth every 2 minutes, 2028-12-31 13:00 to 2028-12-31 21:00 TDB, ecliptic of J2000',
  url: 'https://ssd.jpl.nasa.gov/api/horizons.api?format=text&COMMAND=%27301%27&OBJ_DATA=%27NO%27&MAKE_EPHEM=%27YES%27&EPHEM_TYPE=%27VECTORS%27&CENTER=%27500%40399%27&REF_PLANE=%27ECLIPTIC%27&REF_SYSTEM=%27ICRF%27&OUT_UNITS=%27KM-S%27&VEC_TABLE=%272%27&CSV_FORMAT=%27YES%27&START_TIME=%272028-12-31+13%3A00%27&STOP_TIME=%272028-12-31+21%3A00%27&STEP_SIZE=%272m%27',
  retrieved: '2026-10-07',
};

export const JPL_HORIZONS_PATH_ECLIPSE_2028_EARTH: Source = {
  id: 'jpl-horizons-path-eclipse2028earth',
  title:
    'JPL Horizons — position and velocity of Earth (399) from the centre of the Sun every 2 minutes, 2028-12-31 13:00 to 2028-12-31 21:00 TDB, ecliptic of J2000',
  url: 'https://ssd.jpl.nasa.gov/api/horizons.api?format=text&COMMAND=%27399%27&OBJ_DATA=%27NO%27&MAKE_EPHEM=%27YES%27&EPHEM_TYPE=%27VECTORS%27&CENTER=%27500%4010%27&REF_PLANE=%27ECLIPTIC%27&REF_SYSTEM=%27ICRF%27&OUT_UNITS=%27KM-S%27&VEC_TABLE=%272%27&CSV_FORMAT=%27YES%27&START_TIME=%272028-12-31+13%3A00%27&STOP_TIME=%272028-12-31+21%3A00%27&STEP_SIZE=%272m%27',
  retrieved: '2026-10-07',
};

export const JPL_HORIZONS_TURN_ECLIPSE_2027_EARTH: Source = {
  id: 'jpl-horizons-turn-eclipse2027earthturn',
  title:
    'JPL Horizons — where the point at latitude 0, longitude 0 on Earth was, from Earth’s centre, at 2027-08-02 08:00:00 UTC, ecliptic of J2000',
  url: 'https://ssd.jpl.nasa.gov/api/horizons.api?format=text&COMMAND=%27c%3A+0%2C+6378.13700%2C+0.00000+%40399%27&OBJ_DATA=%27NO%27&MAKE_EPHEM=%27YES%27&EPHEM_TYPE=%27VECTORS%27&CENTER=%27500%40399%27&REF_PLANE=%27ECLIPTIC%27&OUT_UNITS=%27KM-S%27&VEC_TABLE=%271%27&CSV_FORMAT=%27YES%27&TLIST=%272461619.834134066%27',
  retrieved: '2026-10-07',
};

export const NASA_ECLIPSE_TYPES: Source = {
  id: 'nasa-eclipse-types',
  title: 'NASA Science — Types of Solar Eclipses',
  url: 'https://science.nasa.gov/eclipses/types/',
  retrieved: '2026-10-07',
};

export const NASA_MOON_ECLIPSES: Source = {
  id: 'nasa-moon-eclipses',
  title: 'NASA Science — Moon: Eclipses',
  url: 'https://science.nasa.gov/moon/eclipses/',
  retrieved: '2026-10-07',
};

export const USNO_SEASONS_2027: Source = {
  id: 'usno-seasons-2027',
  title:
    'US Naval Observatory, Astronomical Applications — Earth’s seasons for 2027: dates and times of the equinoxes and solstices',
  url: 'https://aa.usno.navy.mil/api/seasons?year=2027',
  retrieved: '2026-10-07',
};

export const NASA_SPACE_PLACE_SEASONS: Source = {
  id: 'nasa-space-place-seasons',
  title: 'NASA Space Place — What Causes the Seasons?',
  url: 'https://spaceplace.nasa.gov/seasons/en/',
  retrieved: '2026-10-07',
};

export const NASA_EARTH_FACTS: Source = {
  id: 'nasa-earth-facts',
  title: 'NASA Science — Earth: Facts',
  url: 'https://science.nasa.gov/earth/facts/',
  retrieved: '2026-10-07',
};

// The same page as the catalogue's source of that id, set down again here so the stories pull
// in none of the catalogue's code.
export const JPL_SBDB_HALLEY: Source = {
  id: 'jpl-sbdb-halley',
  title: 'JPL Small-Body Database — 1P/Halley (orbit solution 75)',
  url: 'https://ssd.jpl.nasa.gov/tools/sbdb_lookup.html#/?sstr=1P',
  retrieved: '2026-10-04',
};

export const NASA_COMETS: Source = {
  id: 'nasa-comets',
  title: 'NASA Science — Comets',
  url: 'https://science.nasa.gov/solar-system/comets/',
  retrieved: '2026-10-07',
};

export const NASA_COMETS_FACTS: Source = {
  id: 'nasa-comets-facts',
  title: 'NASA Science — Comets: Facts',
  url: 'https://science.nasa.gov/solar-system/comets/facts/',
  retrieved: '2026-10-07',
};

export const NASA_APOD_SATURN_RING_PLANE: Source = {
  id: 'nasa-apod-saturn-ring-plane',
  title: 'NASA Astronomy Picture of the Day, 2025 November 16 — Crossing Saturn’s Ring Plane',
  url: 'https://apod.nasa.gov/apod/ap251116.html',
  retrieved: '2026-10-07',
};

export const NASA_APOD_DIONE_RHEA: Source = {
  id: 'nasa-apod-dione-rhea-ring-transit',
  title: 'NASA Astronomy Picture of the Day, 2025 November 22 — Dione and Rhea Ring Transit',
  url: 'https://apod.nasa.gov/apod/ap251122.html',
  retrieved: '2026-10-07',
};

export const NASA_SATURN_FACTS: Source = {
  id: 'nasa-saturn-facts',
  title: 'NASA Science — Saturn: Facts',
  url: 'https://science.nasa.gov/saturn/facts/',
  retrieved: '2026-10-07',
};

export const JPL_HORIZONS_PATH_SUPERMOON_FAR: Source = {
  id: 'jpl-horizons-path-supermoonfar',
  title:
    'JPL Horizons — position and velocity of the Moon (301) from the centre of Earth every 10 minutes, 2026-05-31 08:30 to 15:30 TDB, ecliptic of J2000',
  url: 'https://ssd.jpl.nasa.gov/api/horizons.api?format=text&COMMAND=%27301%27&OBJ_DATA=%27NO%27&MAKE_EPHEM=%27YES%27&EPHEM_TYPE=%27VECTORS%27&CENTER=%27500%40399%27&REF_PLANE=%27ECLIPTIC%27&REF_SYSTEM=%27ICRF%27&OUT_UNITS=%27KM-S%27&VEC_TABLE=%272%27&CSV_FORMAT=%27YES%27&START_TIME=%272026-05-31+08%3A30%27&STOP_TIME=%272026-05-31+15%3A30%27&STEP_SIZE=%2710m%27',
  retrieved: '2026-10-07',
};

export const JPL_HORIZONS_PATH_SUPERMOON_NEAR: Source = {
  id: 'jpl-horizons-path-supermoonnear',
  title:
    'JPL Horizons — position and velocity of the Moon (301) from the centre of Earth every 10 minutes, 2026-12-24 01:10 to 08:10 TDB, ecliptic of J2000',
  url: 'https://ssd.jpl.nasa.gov/api/horizons.api?format=text&COMMAND=%27301%27&OBJ_DATA=%27NO%27&MAKE_EPHEM=%27YES%27&EPHEM_TYPE=%27VECTORS%27&CENTER=%27500%40399%27&REF_PLANE=%27ECLIPTIC%27&REF_SYSTEM=%27ICRF%27&OUT_UNITS=%27KM-S%27&VEC_TABLE=%272%27&CSV_FORMAT=%27YES%27&START_TIME=%272026-12-24+01%3A10%27&STOP_TIME=%272026-12-24+08%3A10%27&STEP_SIZE=%2710m%27',
  retrieved: '2026-10-07',
};

export const USNO_MOON_PHASES_2026: Source = {
  id: 'usno-moon-phases-2026',
  title:
    'US Naval Observatory, Astronomical Applications — dates and times of the primary phases of the Moon in 2026',
  url: 'https://aa.usno.navy.mil/api/moon/phases/year?year=2026',
  retrieved: '2026-10-07',
};

export const NASA_SUPERMOONS: Source = {
  id: 'nasa-supermoons',
  title: 'NASA Science — Supermoons',
  url: 'https://science.nasa.gov/moon/supermoons/',
  retrieved: '2026-10-07',
};

export const NASA_ORIONIDS: Source = {
  id: 'nasa-orionids',
  title: 'NASA Science — Orionids Meteor Shower',
  url: 'https://science.nasa.gov/solar-system/meteors-meteorites/orionids/',
  retrieved: '2026-10-07',
};

export const NASA_ETA_AQUARIIDS: Source = {
  id: 'nasa-eta-aquariids',
  title: 'NASA Science — Eta Aquarids Meteor Shower',
  url: 'https://science.nasa.gov/solar-system/meteors-meteorites/eta-aquarids/',
  retrieved: '2026-10-07',
};
