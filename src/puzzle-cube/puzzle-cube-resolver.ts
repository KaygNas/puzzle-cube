import { assert } from './assert'
import { COLOR_FACE_MAP, FaceColor, FaceName, FACE_NAMES } from './cube'
import { PuzzleCude } from './puzzle-cube'
/**
 * Reference: https://rubikscu.be/#tutorial
 */
export class PuzzleCubeResolver {
  constructor(private puzzleCube: PuzzleCude) { }
  async solve() {
    await this.nomarlizeCubeFaces()
  }

  async nomarlizeCubeFaces() {
    const rotateWhiteSliceToUpper = async () => {
      const whiteSlice = this.findSliceByColor('white')
      const directivesMap: Record<FaceName, string> = {
        'up': '',
        'down': `L' MRL R L' MRL R`,
        'front': `L' MRL R`,
        'back': `L MRL' R'`,
        'right': `F' MFB' B`,
        'left': `F MFB B'`,
      }
      const directives = directivesMap[whiteSlice.name as FaceName]
      await this.puzzleCube.do(directives)
    }
    const rotatRedSliceToFront = async () => {
      const redSlice = this.findSliceByColor('red')
      const directivesMap: Record<FaceName, string> = {
        'up': ``,
        'down': ``,
        'front': ``,
        'back': `U MUD D' U MUD D'`,
        'right': `U MUD D'`,
        'left': `U' MUD' D`,
      }
      const directives = directivesMap[redSlice.name as FaceName]
      await this.puzzleCube.do(directives)
    }
    await rotateWhiteSliceToUpper()
    await rotatRedSliceToFront()
  }
  private findSliceByColor(color: Exclude<FaceColor, 'black'>) {
    const slice = FACE_NAMES
      .map((face) => this.puzzleCube.getSlice(face))
      .find((slice) => {
        const face = COLOR_FACE_MAP[color]
        assert(face !== undefined, `color ${color} of ${face} should map.`)
        return slice.centerCube.faceColorNames[face] === color
      })
    assert(slice !== undefined, 'slice should be found!')
    return slice
  }

  async step1_WhiteEdges() {
    // check whether the white cross finished
    // if not locate the white edge cube and move it to the down layer
    // 1. at up layer: make 2 rotation
    // 2. at middle layer: make L D L'
    // 3. at down layer: move to correct face
    //    a. white facing down: F F
    //    b. else: D R F' R' 
  }
}
