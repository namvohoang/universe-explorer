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

export const NASA_ARTEMIS_I_OUTBOUND_FLYBY: Source = {
  id: 'nasa-artemis-i-outbound-flyby',
  title:
    'NASA — Orion Successfully Completes Lunar Flyby, Re-acquires Signal With Earth (mission blog, 21 November 2022): the outbound powered flyby burn',
  url: 'https://www.nasa.gov/blogs/missions/2022/11/21/orion-successfully-completes-lunar-flyby-re-acquires-signal-with-earth/',
  retrieved: '2026-10-10',
};

export const NASA_ARTEMIS_I_DRO_INSERTION: Source = {
  id: 'nasa-artemis-i-dro-insertion',
  title:
    'NASA — Artemis I Flight Day 10: Orion Enters Distant Retrograde Orbit (mission blog, 25 November 2022): the insertion burn',
  url: 'https://www.nasa.gov/blogs/missions/2022/11/25/artemis-i-flight-day-10-orion-enters-distant-retrograde-orbit/',
  retrieved: '2026-10-10',
};

export const NASA_ARTEMIS_I_DRO_DEPARTURE: Source = {
  id: 'nasa-artemis-i-dro-departure',
  title:
    'NASA — Artemis I Flight Day 16: Orion Successfully Completes Distant Retrograde Departure Burn (mission blog, 1 December 2022)',
  url: 'https://www.nasa.gov/blogs/missions/2022/12/01/artemis-i-flight-day-16-orion-successfully-completes-distant-retrograde-departure-burn/',
  retrieved: '2026-10-10',
};

export const NASA_ARTEMIS_I_RETURN_FLYBY: Source = {
  id: 'nasa-artemis-i-return-flyby',
  title:
    'NASA — Artemis I Flight Day 20: Orion Conducts Return Powered Flyby (mission blog, 5 December 2022)',
  url: 'https://www.nasa.gov/blogs/missions/2022/12/05/artemis-i-flight-day-20-orion-conducts-return-powered-flyby/',
  retrieved: '2026-10-10',
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

export const JPL_HORIZONS_ARTEMIS_1: Source = {
  id: 'jpl-horizons-artemis-1',
  title:
    'JPL Horizons — data sheet for Artemis I (-1023): background, major events and the liftoff time',
  url: 'https://ssd.jpl.nasa.gov/api/horizons.api?format=text&COMMAND=%27-1023%27&OBJ_DATA=%27YES%27&MAKE_EPHEM=%27NO%27',
  retrieved: '2026-10-10',
};

export const NASA_ARTEMIS_I_LIFTOFF: Source = {
  id: 'nasa-artemis-i-liftoff',
  title:
    'NASA — Artemis I Liftoff (mission blog, 16 November 2022): the ascent milestones in mission elapsed time',
  url: 'https://www.nasa.gov/blogs/missions/2022/11/16/artemis-i-liftoff/',
  retrieved: '2026-10-10',
};

export const NASA_ARTEMIS_I_PRESS_KIT: Source = {
  id: 'nasa-artemis-i-press-kit',
  title: 'NASA — Artemis I Press Kit: the launch countdown and where the boosters fall',
  url: 'https://www.nasa.gov/artemis-i-press-kit/',
  retrieved: '2026-10-10',
};

export const NASA_SLS_REFERENCE_GUIDE_ASCENT: Source = {
  id: 'nasa-sls-reference-guide-ascent',
  title:
    'NASA — Space Launch System Reference Guide (2022): heights at booster separation and when the core stage separates',
  url: 'https://www.nasa.gov/wp-content/uploads/2022/03/sls_reference_guide_2022_web.pdf',
  retrieved: '2026-10-10',
};

export const NASA_SLS_STUDENTS: Source = {
  id: 'nasa-sls-students',
  title: 'NASA — What Is the Space Launch System? (Grades 5-8): how SLS launches, minute by minute',
  url: 'https://www.nasa.gov/learning-resources/for-kids-and-students/what-is-the-space-launch-system-grades-5-8/',
  retrieved: '2026-10-10',
};

export const NASA_SP4029_APOLLO_10_ASCENT: Source = {
  id: 'nasa-sp4029-apollo10-ascent',
  title:
    'NASA SP-2000-4029, Apollo by the Numbers — Apollo 10 ascent phase, from Launch Complex 39 Pad B: the pad, and how far down range at each event',
  url: 'https://www.nasa.gov/wp-content/uploads/static/history/SP-4029/Apollo_10d_Ascent_Phase.htm',
  retrieved: '2026-10-10',
};

export const JPL_HORIZONS_EARTH_TURN_ARTEMIS_1_ASCENT: Source = {
  id: 'jpl-horizons-earth-turn-artemis1ascent',
  title:
    'JPL Horizons — where the point at latitude 0, longitude 0 on Earth was, from Earth’s centre, at Artemis I’s liftoff (2022-11-16 06:47:44 UTC), ecliptic of J2000',
  url: 'https://ssd.jpl.nasa.gov/api/horizons.api?format=text&COMMAND=%27c%3A+0%2C+6378.13700%2C+0.00000+%40399%27&OBJ_DATA=%27NO%27&MAKE_EPHEM=%27YES%27&EPHEM_TYPE=%27VECTORS%27&CENTER=%27500%40399%27&REF_PLANE=%27ECLIPTIC%27&OUT_UNITS=%27KM-S%27&VEC_TABLE=%271%27&CSV_FORMAT=%27YES%27&TLIST=%272459899.783948874%27',
  retrieved: '2026-10-10',
};

export const NASA_SLS_MODEL: Source = {
  id: 'nasa-sls-3d-model',
  title: 'NASA Science — 3D Resources: Space Launch System (SLS) (the 3D model the app draws)',
  url: 'https://science.nasa.gov/3d-resources/space-launch-system-sls/',
  retrieved: '2026-10-10',
};

export const NASA_SATURN_V_STUDENTS: Source = {
  id: 'nasa-saturn-v-students',
  title: 'NASA — What Was the Saturn V? (Grades 5-8)',
  url: 'https://www.nasa.gov/learning-resources/for-kids-and-students/what-was-the-saturn-v-grades-5-8/',
  retrieved: '2026-10-07',
};

export const NSSDC_EARTH_AIR: Source = {
  id: 'nssdc-earth-air',
  title: 'NASA NSSDCA — Earth Fact Sheet (last updated 15 November 2024), terrestrial atmosphere',
  url: 'https://nssdc.gsfc.nasa.gov/planetary/factsheet/earthfact.html',
  retrieved: '2026-10-09',
};

export const NASA_SATURN_V_FIRST_STAGE: Source = {
  id: 'nasa-saturn-v-first-stage',
  title: 'NASA — In 1969… Saturn V First Stage For Apollo 11 Mission',
  url: 'https://www.nasa.gov/image-article/1969-saturn-v-first-stage-apollo-11-mission/',
  retrieved: '2026-10-09',
};

export const NASA_SATURN_V_MODEL: Source = {
  id: 'nasa-saturn-v-3d-model',
  title: 'NASA Science — 3D Resources: Saturn V (the 3D model the app draws)',
  url: 'https://science.nasa.gov/3d-resources/saturn-v/',
  retrieved: '2026-10-04',
};

export const NASA_LUNAR_MODULE_MODEL: Source = {
  id: 'nasa-lunar-module-3d-model',
  title: 'NASA Science — 3D Resources: Apollo Lunar Module (the 3D model the app draws)',
  url: 'https://science.nasa.gov/3d-resources/apollo-lunar-module/',
  retrieved: '2026-10-04',
};

export const NASA_APOLLO_SOYUZ_MODEL: Source = {
  id: 'nasa-apollo-soyuz-3d-model',
  title: 'NASA Science — 3D Resources: Apollo Soyuz (the 3D model whose Apollo the app draws)',
  url: 'https://science.nasa.gov/3d-resources/apollo-soyuz/',
  retrieved: '2026-10-06',
};

// The same record as the catalogue's `si-columbia`, written again here so that the stories
// pull in none of the catalogue's code.
export const SI_COLUMBIA_SIZE: Source = {
  id: 'si-columbia',
  title: 'Smithsonian National Air and Space Museum — Command Module, Apollo 11',
  url: 'https://n2t.net/ark:/65665/nv9ce74610f-62de-46b6-904f-58abfecb555c',
  retrieved: '2026-10-05',
};

export const NASA_ASTRONAUT_MODEL: Source = {
  id: 'nasa-astronaut-3d-model',
  title: 'NASA Science — 3D Resources: Astronaut (the 3D figure the app draws)',
  url: 'https://science.nasa.gov/3d-resources/astronaut/',
  retrieved: '2026-10-09',
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

export const NOAA_GEOMAGNETIC_POLES: Source = {
  id: 'noaa-geomagnetic-poles',
  title:
    'NOAA National Centers for Environmental Information — Wandering of the Geomagnetic Poles: the geomagnetic poles for 2025.0 from the World Magnetic Model, and where the auroral ovals lie',
  url: 'https://www.ncei.noaa.gov/products/wandering-geomagnetic-poles',
  retrieved: '2026-10-07',
};

export const NASA_AURORAS: Source = {
  id: 'nasa-auroras',
  title: 'NASA Science — Auroras',
  url: 'https://science.nasa.gov/sun/auroras/',
  retrieved: '2026-10-07',
};

export const JPL_HORIZONS_TURN_AURORA_2027_EARTH: Source = {
  id: 'jpl-horizons-turn-aurora2027earthturn',
  title:
    'JPL Horizons — where the point at latitude 0, longitude 0 on Earth was, from Earth’s centre, at 2027-01-15 00:00:00 UTC, ecliptic of J2000',
  url: 'https://ssd.jpl.nasa.gov/api/horizons.api?format=text&COMMAND=%27c%3A+0%2C+6378.13700%2C+0.00000+%40399%27&OBJ_DATA=%27NO%27&MAKE_EPHEM=%27YES%27&EPHEM_TYPE=%27VECTORS%27&CENTER=%27500%40399%27&REF_PLANE=%27ECLIPTIC%27&OUT_UNITS=%27KM-S%27&VEC_TABLE=%271%27&CSV_FORMAT=%27YES%27&TLIST=%272461420.500800745%27',
  retrieved: '2026-10-07',
};

export const JPL_HORIZONS_PATH_STS_133_STATION: Source = {
  id: 'jpl-horizons-path-sts133station',
  title:
    'JPL Horizons — position and velocity of the International Space Station (-125544, from its tracked orbit) from the centre of Earth every minute, 2011-02-26 13:00 to 20:40 TDB, ecliptic of J2000',
  url: 'https://ssd.jpl.nasa.gov/api/horizons.api?format=text&COMMAND=%27-125544%27&OBJ_DATA=%27NO%27&MAKE_EPHEM=%27YES%27&EPHEM_TYPE=%27VECTORS%27&CENTER=%27500%40399%27&REF_PLANE=%27ECLIPTIC%27&REF_SYSTEM=%27ICRF%27&OUT_UNITS=%27KM-S%27&VEC_TABLE=%272%27&CSV_FORMAT=%27YES%27&START_TIME=%272011-02-26+13%3A00%27&STOP_TIME=%272011-02-26+20%3A40%27&STEP_SIZE=%271m%27',
  retrieved: '2026-10-07',
};

export const JPL_HORIZONS_TURN_STS_133_EARTH: Source = {
  id: 'jpl-horizons-turn-sts133earthturn',
  title:
    'JPL Horizons — where the point at latitude 0, longitude 0 on Earth was, from Earth’s centre, at 2011-02-26 13:00:00 UTC, ecliptic of J2000',
  url: 'https://ssd.jpl.nasa.gov/api/horizons.api?format=text&COMMAND=%27c%3A+0%2C+6378.13700%2C+0.00000+%40399%27&OBJ_DATA=%27NO%27&MAKE_EPHEM=%27YES%27&EPHEM_TYPE=%27VECTORS%27&CENTER=%27500%40399%27&REF_PLANE=%27ECLIPTIC%27&OUT_UNITS=%27KM-S%27&VEC_TABLE=%271%27&CSV_FORMAT=%27YES%27&TLIST=%272455619.042432700%27',
  retrieved: '2026-10-07',
};

export const NASA_STS_133: Source = {
  id: 'nasa-sts-133',
  title: 'NASA — STS-133',
  url: 'https://www.nasa.gov/mission/sts-133/',
  retrieved: '2026-10-07',
};

export const NASA_STS_133_DOCKING_PHOTO: Source = {
  id: 'nasa-sts-133-docking-photo',
  title: 'NASA — International Space Station (photo S133-E-006859, 26 Feb. 2011)',
  url: 'https://www.nasa.gov/image-article/international-space-station-40/',
  retrieved: '2026-10-07',
};

export const NASA_APOD_RETROGRADE_MARS: Source = {
  id: 'nasa-apod-retrograde-mars',
  title: 'NASA Astronomy Picture of the Day, 2010 June 13 — Retrograde Mars',
  url: 'https://science.nasa.gov/image-article/apod-2010-june-13-retrograde-mars/',
  retrieved: '2026-10-07',
};

// The same page as the catalogue's source of that id, set down again here so the stories pull
// in none of the catalogue's code.
export const JPL_APPROX_POSITIONS: Source = {
  id: 'jpl-approx-positions-story',
  title: 'JPL Solar System Dynamics — Approximate Positions of the Planets',
  url: 'https://ssd.jpl.nasa.gov/planets/approx_pos.html',
  retrieved: '2026-10-07',
};
