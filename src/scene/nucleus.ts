import { IcosahedronGeometry, type BufferGeometry } from 'three';
import { mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { nucleusRelief } from '../sim/comet';

/** How finely the ball is cut up before it is reshaped: enough for the lumps to be smooth. */
const DETAIL = 40;

/**
 * A ball reshaped into a comet's nucleus: long way along x, a waist, two lumpy ends. It stays
 * within the ball it was made from, so scaled to the nucleus's real length and width it keeps them.
 */
export function createNucleusGeometry(): BufferGeometry {
  // Corners shared between faces, so the shading runs smoothly over the lumps.
  const geometry = mergeVertices(new IcosahedronGeometry(1, DETAIL).deleteAttribute('uv'));
  const positions = geometry.getAttribute('position');
  let longest = 0;
  for (let n = 0; n < positions.count; n += 1) {
    const x = positions.getX(n);
    const y = positions.getY(n);
    const z = positions.getZ(n);
    const { width, height } = nucleusRelief({ x, y, z });
    positions.setXYZ(n, x * height, y * width * height, z * width * height);
    longest = Math.max(longest, Math.abs(x * height));
  }
  // The long way is the measured one: its ends stay where the smooth body's ends were.
  geometry.scale(1 / longest, 1, 1);
  geometry.computeVertexNormals();
  return geometry;
}
