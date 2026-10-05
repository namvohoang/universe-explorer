// Written by tools/narrate/kokoro_narrate.py. Do not edit by hand.
/**
 * The recording of each card being read aloud, a fingerprint of the words it says, and the
 * second at which each line starts.
 */
export const NARRATION: Readonly<
  Record<string, { file: string; fingerprint: string; starts: readonly number[] }>
> = {
  'solar-system': {
    file: 'public/voice/solar-system.mp3',
    fingerprint: '1e60f5c6',
    starts: [0.0, 2.35, 10.95, 15.7, 21.38],
  },
  sun: {
    file: 'public/voice/sun.mp3',
    fingerprint: '4a4e36e8',
    starts: [0.0, 1.98, 8.15, 12.57, 22.73],
  },
  'parker-solar-probe': {
    file: 'public/voice/parker-solar-probe.mp3',
    fingerprint: '25cdb07f',
    starts: [0.0, 2.48, 9.22, 16.3, 22.65],
  },
  mercury: {
    file: 'public/voice/mercury.mp3',
    fingerprint: 'a74b3853',
    starts: [0.0, 2.1, 6.8, 13.45, 17.27],
  },
  venus: {
    file: 'public/voice/venus.mp3',
    fingerprint: '65a5ba33',
    starts: [0.0, 2.02, 7.5, 14.1, 18.95],
  },
  earth: {
    file: 'public/voice/earth.mp3',
    fingerprint: '6ad2e052',
    starts: [0.0, 1.85, 7.08, 10.2, 14.5],
  },
  moon: {
    file: 'public/voice/moon.mp3',
    fingerprint: '73833d54',
    starts: [0.0, 2.0, 6.8, 12.78, 23.85],
  },
  iss: {
    file: 'public/voice/iss.mp3',
    fingerprint: '5ab93e3a',
    starts: [0.0, 2.92, 9.05, 12.88, 18.1],
  },
  hubble: {
    file: 'public/voice/hubble.mp3',
    fingerprint: '1044215d',
    starts: [0.0, 2.73, 7.65, 11.85, 15.1],
  },
  swift: {
    file: 'public/voice/swift.mp3',
    fingerprint: '4bdc60a0',
    starts: [0.0, 2.65, 8.55, 11.35, 16.85],
  },
  chandra: {
    file: 'public/voice/chandra.mp3',
    fingerprint: '81d20d66',
    starts: [0.0, 3.25, 9.85, 16.15, 20.1],
  },
  mars: {
    file: 'public/voice/mars.mp3',
    fingerprint: 'ea780ff9',
    starts: [0.0, 2.02, 7.4, 13.5, 18.55],
  },
  phobos: { file: 'public/voice/phobos.mp3', fingerprint: '897d856f', starts: [0.0, 2.08] },
  deimos: { file: 'public/voice/deimos.mp3', fingerprint: '343449d3', starts: [0.0, 2.05] },
  mro: {
    file: 'public/voice/mro.mp3',
    fingerprint: '3a37196c',
    starts: [0.0, 2.98, 9.85, 12.93, 17.68],
  },
  eros: { file: 'public/voice/eros.mp3', fingerprint: '6ac1c90b', starts: [0.0, 2.0] },
  ida: {
    file: 'public/voice/ida.mp3',
    fingerprint: '91b676da',
    starts: [0.0, 1.9, 6.88, 10.95, 17.23],
  },
  psyche: {
    file: 'public/voice/psyche.mp3',
    fingerprint: '665117b8',
    starts: [0.0, 2.05, 6.65, 10.8, 14.45],
  },
  'asteroid-belt': {
    file: 'public/voice/asteroid-belt.mp3',
    fingerprint: '45d5d740',
    starts: [0.0, 2.35, 8.2, 13.8, 20.07],
  },
  vesta: { file: 'public/voice/vesta.mp3', fingerprint: '0e55bbad', starts: [0.0, 2.0] },
  ceres: { file: 'public/voice/ceres.mp3', fingerprint: '3edaa630', starts: [0.0, 2.0] },
  jupiter: {
    file: 'public/voice/jupiter.mp3',
    fingerprint: '43556e6d',
    starts: [0.0, 2.0, 6.08, 11.7, 19.0],
  },
  io: { file: 'public/voice/io.mp3', fingerprint: '03281b3f', starts: [0.0, 1.95] },
  europa: { file: 'public/voice/europa.mp3', fingerprint: '27290493', starts: [0.0, 2.08] },
  ganymede: { file: 'public/voice/ganymede.mp3', fingerprint: '67d017bf', starts: [0.0, 2.08] },
  callisto: { file: 'public/voice/callisto.mp3', fingerprint: '58d99517', starts: [0.0, 2.05] },
  juno: {
    file: 'public/voice/juno.mp3',
    fingerprint: '09c800ab',
    starts: [0.0, 1.95, 6.65, 11.28, 16.3],
  },
  saturn: {
    file: 'public/voice/saturn.mp3',
    fingerprint: 'e7b2762e',
    starts: [0.0, 1.95, 7.6, 13.93, 20.2],
  },
  mimas: { file: 'public/voice/mimas.mp3', fingerprint: 'c53b595b', starts: [0.0, 2.02] },
  enceladus: { file: 'public/voice/enceladus.mp3', fingerprint: 'a558a311', starts: [0.0, 2.23] },
  tethys: { file: 'public/voice/tethys.mp3', fingerprint: 'e43b934d', starts: [0.0, 2.0] },
  dione: { file: 'public/voice/dione.mp3', fingerprint: '87a29ebf', starts: [0.0, 2.02] },
  rhea: { file: 'public/voice/rhea.mp3', fingerprint: '205b107d', starts: [0.0, 1.9] },
  titan: { file: 'public/voice/titan.mp3', fingerprint: 'd5a8a125', starts: [0.0, 2.0] },
  iapetus: { file: 'public/voice/iapetus.mp3', fingerprint: 'f7eb8f6b', starts: [0.0, 2.1] },
  uranus: {
    file: 'public/voice/uranus.mp3',
    fingerprint: 'f237fd63',
    starts: [0.0, 2.08, 7.33, 14.55, 18.82],
  },
  miranda: { file: 'public/voice/miranda.mp3', fingerprint: '4f75e234', starts: [0.0, 2.08] },
  ariel: { file: 'public/voice/ariel.mp3', fingerprint: '42fa35a6', starts: [0.0, 2.02] },
  umbriel: { file: 'public/voice/umbriel.mp3', fingerprint: 'c2fac85c', starts: [0.0, 2.0] },
  titania: { file: 'public/voice/titania.mp3', fingerprint: '56fd8b68', starts: [0.0, 2.08] },
  oberon: { file: 'public/voice/oberon.mp3', fingerprint: 'dfe39884', starts: [0.0, 2.05] },
  neptune: {
    file: 'public/voice/neptune.mp3',
    fingerprint: 'f56a7f25',
    starts: [0.0, 2.08, 8.38, 15.5, 21.65],
  },
  triton: { file: 'public/voice/triton.mp3', fingerprint: '1fd4838f', starts: [0.0, 2.08] },
  pluto: { file: 'public/voice/pluto.mp3', fingerprint: '26dab258', starts: [0.0, 2.15] },
  makemake: { file: 'public/voice/makemake.mp3', fingerprint: 'b61a3280', starts: [0.0, 2.27] },
  eris: { file: 'public/voice/eris.mp3', fingerprint: 'e25dad8c', starts: [0.0, 1.98] },
  halley: {
    file: 'public/voice/halley.mp3',
    fingerprint: '3da67cf2',
    starts: [0.0, 2.23, 8.53, 14.53, 21.25],
  },
  'kuiper-belt': {
    file: 'public/voice/kuiper-belt.mp3',
    fingerprint: 'c863e17f',
    starts: [0.0, 2.17, 7.78, 13.62, 18.25],
  },
  'proxima-centauri': {
    file: 'public/voice/proxima-centauri.mp3',
    fingerprint: '6ac3e811',
    starts: [0.0, 2.42, 7.5, 10.68, 14.9],
  },
  'trappist-1': {
    file: 'public/voice/trappist-1.mp3',
    fingerprint: '0f6c8bb2',
    starts: [0.0, 2.67, 7.78, 10.85, 14.05],
  },
  pleiades: {
    file: 'public/voice/pleiades.mp3',
    fingerprint: '75991607',
    starts: [0.0, 2.15, 7.72, 13.2, 16.52],
  },
  antares: {
    file: 'public/voice/antares.mp3',
    fingerprint: '117b1eb6',
    starts: [0.0, 2.2, 8.2, 12.57, 18.2],
  },
  betelgeuse: {
    file: 'public/voice/betelgeuse.mp3',
    fingerprint: 'd720cf2a',
    starts: [0.0, 2.25, 7.83, 12.2, 17.27],
  },
  'orion-nebula': {
    file: 'public/voice/orion-nebula.mp3',
    fingerprint: '409c9785',
    starts: [0.0, 2.42, 8.72, 12.65, 16.52],
  },
  'gaia-bh1': {
    file: 'public/voice/gaia-bh1.mp3',
    fingerprint: 'a561812c',
    starts: [0.0, 2.45, 8.12, 12.22, 15.85],
  },
  'vy-canis-majoris': {
    file: 'public/voice/vy-canis-majoris.mp3',
    fingerprint: 'd2d0bed5',
    starts: [0.0, 2.65, 8.1, 16.12, 19.52],
  },
  'crab-nebula': {
    file: 'public/voice/crab-nebula.mp3',
    fingerprint: '262c72d3',
    starts: [0.0, 2.25, 6.78, 14.12, 17.5],
  },
  'sagittarius-a': {
    file: 'public/voice/sagittarius-a.mp3',
    fingerprint: '56483e5e',
    starts: [0.0, 2.52, 9.47, 12.8, 16.57],
  },
  'milky-way': {
    file: 'public/voice/milky-way.mp3',
    fingerprint: 'db08726b',
    starts: [0.0, 2.2, 7.42, 13.07, 19.93],
  },
  andromeda: {
    file: 'public/voice/andromeda.mp3',
    fingerprint: '16f3009e',
    starts: [0.0, 2.7, 8.68, 12.45, 18.6],
  },
  triangulum: {
    file: 'public/voice/triangulum.mp3',
    fingerprint: 'c350763d',
    starts: [0.0, 2.77, 9.35, 12.68, 17.57],
  },
  sombrero: {
    file: 'public/voice/sombrero.mp3',
    fingerprint: '4db10609',
    starts: [0.0, 2.6, 8.53, 11.82, 17.5],
  },
  whirlpool: {
    file: 'public/voice/whirlpool.mp3',
    fingerprint: 'd21469f6',
    starts: [0.0, 2.55, 7.92, 11.38, 15.07],
  },
  m87: {
    file: 'public/voice/m87.mp3',
    fingerprint: 'd56259f0',
    starts: [0.0, 2.88, 8.15, 11.38, 17.32],
  },
  'm87-black-hole': {
    file: 'public/voice/m87-black-hole.mp3',
    fingerprint: '23ce6070',
    starts: [0.0, 2.95, 7.15, 13.8, 18.0],
  },
  orion: {
    file: 'public/voice/orion.mp3',
    fingerprint: '05d2742a',
    starts: [0.0, 2.08, 7.92, 14.2, 18.6],
  },
  'big-dipper': {
    file: 'public/voice/big-dipper.mp3',
    fingerprint: '71a62d0a',
    starts: [0.0, 2.12, 7.2, 11.88, 15.32],
  },
  'southern-cross': {
    file: 'public/voice/southern-cross.mp3',
    fingerprint: 'd173b01f',
    starts: [0.0, 2.33, 6.88, 10.28, 13.9],
  },
  cassiopeia: {
    file: 'public/voice/cassiopeia.mp3',
    fingerprint: 'ec3fb3ed',
    starts: [0.0, 2.17, 7.17, 11.53, 16.27],
  },
  gemini: {
    file: 'public/voice/gemini.mp3',
    fingerprint: 'dbc8a6ee',
    starts: [0.0, 2.4, 7.05, 12.53, 16.35],
  },
  'saturn-v': {
    file: 'public/voice/saturn-v.mp3',
    fingerprint: 'd7b3f603',
    starts: [0.0, 2.52, 7.2, 13.57, 17.62],
  },
  columbia: {
    file: 'public/voice/columbia.mp3',
    fingerprint: '01aa2064',
    starts: [0.0, 3.15, 11.47, 15.65, 19.12],
  },
  'lunar-module': {
    file: 'public/voice/lunar-module.mp3',
    fingerprint: '6d79b2be',
    starts: [0.0, 2.62, 7.92, 12.57, 16.05],
  },
  'pioneer-10': {
    file: 'public/voice/pioneer-10.mp3',
    fingerprint: '44ce1b58',
    starts: [0.0, 2.25, 7.05, 12.47, 21.02],
  },
  voyager: {
    file: 'public/voice/voyager.mp3',
    fingerprint: '5c5db46c',
    starts: [0.0, 2.55, 8.15, 11.8, 18.38],
  },
  'space-shuttle': {
    file: 'public/voice/space-shuttle.mp3',
    fingerprint: '742ab68f',
    starts: [0.0, 2.25, 8.45, 12.05, 16.5],
  },
  discovery: {
    file: 'public/voice/discovery.mp3',
    fingerprint: '3c7b2bf2',
    starts: [0.0, 2.5, 8.65, 11.8, 17.68],
  },
  cassini: {
    file: 'public/voice/cassini.mp3',
    fingerprint: '1bdc5a24',
    starts: [0.0, 2.08, 5.62, 12.07, 15.4],
  },
  'new-horizons': {
    file: 'public/voice/new-horizons.mp3',
    fingerprint: '556eb037',
    starts: [0.0, 2.33, 6.53, 11.03, 17.45],
  },
  curiosity: {
    file: 'public/voice/curiosity.mp3',
    fingerprint: '816034ba',
    starts: [0.0, 2.52, 8.03, 10.78, 15.5],
  },
};
