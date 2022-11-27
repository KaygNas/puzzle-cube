import { vec3 } from 'gl-matrix'
import { assert } from './assert'
import { Cube, FaceColor, FaceName, FACE_NAMES, mapColorToFace } from './cube'
import { mapNomalizeFaceNormal, PuzzleCude, mapSliceNameToShort, mapNomalizeFaceColorNormal, SliceName } from './puzzle-cube'
import { equal, equals } from './utils'
import { findLast, find } from 'lodash'


const isSameWithColorNormal = (color: FaceColor, normal: vec3) => {
  const colorNormal = mapNomalizeFaceColorNormal(color)
  const angle = vec3.angle(colorNormal, normal)
  return equal(angle, 0)
}

const isFacing = (sourceFace: FaceName, targetFace: FaceName, cube: Cube) => {
  // TODO: fix
  return equals(cube.faceNormals[sourceFace], mapNomalizeFaceNormal(targetFace))
}
const isFacingCorrect = (sourceColor: FaceColor, targetColor: FaceColor, cube: Cube, puzzleCube: PuzzleCude) => {
  const cubeFaceNormal = cube.faceNormals[mapColorToFace(sourceColor)]
  const puzzleCubeFaceNormal = mapNomalizeFaceNormal(puzzleCube.faceColorAt(targetColor))
  const angle = vec3.angle(cubeFaceNormal, puzzleCubeFaceNormal)
  return equal(angle, 0)
}
const facingAllCorrect = (cube: Cube, puzzleCube: PuzzleCude) => {
  const faceColors = Object.values(cube.faceColorNames)
  return faceColors.every(color => isFacingCorrect(color, color, cube, puzzleCube))
}
const facingOf = (sourceFace: FaceName, cube: Cube) => {
  const face = FACE_NAMES.find(face => isFacing(sourceFace, face, cube))
  assert(face !== undefined, `cube should at any of faces: ${FACE_NAMES}.`)
  return face
}
const colorFacingOf = (color: FaceColor, cube: Cube) => {
  const sourceFace = mapColorToFace(color)
  return facingOf(sourceFace, cube)
}
const makeDirectives = (faceName: FaceName, time: number, counterClockwise = false) => {
  return new Array(time).fill(mapSliceNameToShort(faceName) + (counterClockwise ? `'` : ''))
}
const findAdjacentStick = (cube: Cube, targetFace: FaceName) => {
  // TODO: faces to serach is depend on the targetFace
  const faces: FaceName[] = ['front', 'back', 'left', 'right']
  const adjacentStick = faces
    .map(face => {
      return { face, faceNormal: cube.faceNormals[face], color: cube.faceColorNames[face] }
    })
    .filter(({ color }) => !!color)
    .map(({ faceNormal, color }) => {
      const facing = colorFacingOf(color!, cube)
      return { facing, faceNormal, color: color! }
    })
  assert(adjacentStick.length > 0, 'adjacentStick must exist')
  return adjacentStick
}
const findSliceByColor = (color: Exclude<FaceColor, 'black'>, puzzleCube: PuzzleCude) => {
  const slice = FACE_NAMES
    .map((face) => puzzleCube.getSlice(face))
    .find((slice) => {
      const face = mapColorToFace(color)
      assert(face !== undefined, `color ${color} of ${face} should map.`)
      return slice.centerCube.faceColorNames[face] === color
    })
  assert(slice !== undefined, 'slice should be found!')
  return slice
}
/**
 * Reference: https://rubikscu.be/#tutorial
 */
export class PuzzleCubeResolver {
  constructor(private puzzleCube: PuzzleCude) { }
  async scramble() {
    const faces = Object.values(FACE_NAMES)
    const randomFace = () => {
      const index = Math.floor(Math.random() * faces.length)
      return faces[index]
    }
    const randerReverse = (s: string) => Math.random() > 0.5 ? s : `${s}'`
    const directives = Array.from({ length: 20 })
      .map(() => randomFace())
      .map(mapSliceNameToShort)
      .map(randerReverse)
    await this.puzzleCube.do(directives)
  }

  async solve() {
    console.log('-- nomarlizing cube faces --');
    await this.nomarlizeCubeFaces()
    console.log('-- doing step1 white edges --');
    await this.step1_WhiteEdges()
    console.log('-- doing step2 finish white faces --');
    await this.step2_FinishWhiteFace()
    console.log('-- doing step3 center layer --');
    await this.setp3_CenterLayer()
    console.log('-- all done! --')
  }

  async nomarlizeCubeFaces() {
    const rotateWhiteSliceToUpper = async () => {
      const whiteSlice = findSliceByColor('white', this.puzzleCube)
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
      const redSlice = findSliceByColor('white', this.puzzleCube)
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

  async step1_WhiteEdges() {
    // check whether the white cross finished
    // if not locate the white edge cube and move it to the down layer
    // 1. at up layer: make 2 rotation
    // 2. at middle layer: make L D L'
    // 3. at down layer: move to correct face
    //    a. white facing down: F F
    //    b. else: D R F' R' 
    const checkPlusFormed = () => {
      const whiteLayer = this.puzzleCube.getSlice('up')
      return whiteLayer.cubes
        .filter(cube => cube.type === 'edge')
        .every((cube) => colorFacingOf('white', cube) === 'up')
    }

    const tryUpperLayer = async () => {
      const upperLayer = this.puzzleCube.getSlice('up')
      const white = upperLayer.cubes.find((cube) => {
        if (cube.type === 'edge' && cube.faceColorNames.up === 'white') {
          const [adjacentStick] = findAdjacentStick(cube, 'up')
          // not facing the correct face
          return !isSameWithColorNormal(adjacentStick.color, adjacentStick.faceNormal)
        } else {
          return false
        }
      })
      if (!white) return false

      assert(white.type === 'edge', 'white should be a edge.')
      const isFacingUp = isFacing('up', 'up', white)
      if (isFacingUp) {
        const [adjacentStick] = findAdjacentStick(white, 'up')
        await this.puzzleCube.do(makeDirectives(adjacentStick.facing, 2))
      } else {
        const facing = colorFacingOf('white', white)
        await this.puzzleCube.do(makeDirectives(facing, 2))
      }
      return true
    }
    const tryMiddleLayer = async () => {
      const middleLayer = this.puzzleCube.getSlice('hfront')
      const white = middleLayer.cubes.find((cube) => cube.type === 'edge' && cube.faceColorNames.up === 'white')
      if (!white) return false

      const slices = FACE_NAMES.filter(face => this.puzzleCube.isCubeAtSlice(white, face))
      const rotationFace = [
        ['left', 'front'],
        ['front', 'right'],
        ['right', 'back'],
        ['back', 'left'],
      ].find((slicesAt) => slices.every(slice => slicesAt.includes(slice)))?.[0]
      assert(rotationFace !== undefined, 'rotationFace should be founded.')
      const directive = mapSliceNameToShort(rotationFace as FaceName)
      await this.puzzleCube.do(`${directive} D ${directive}'`)
      return true
    }
    const tryDownLayer = async () => {
      const downLayer = this.puzzleCube.getSlice('down')
      const white = downLayer.cubes.find((cube) => cube.type === 'edge' && cube.faceColorNames.up === 'white')
      if (!white) return

      const isFacingDown = isFacing('up', 'down', white)
      if (isFacingDown) {
        // the adjacentColor and where it facing is needed
        // in order to figure out how many time to rotate the down layer
        const [adjacentStick] = findAdjacentStick(white, 'up')
        const colorNormal = mapNomalizeFaceColorNormal(adjacentStick.color)
        const angle = vec3.angle(adjacentStick.faceNormal, colorNormal)
        const rotateTime = Math.round(angle / (Math.PI / 2))
        const counterClockwise = vec3.angle(vec3.cross(vec3.create(), adjacentStick.faceNormal, colorNormal), mapNomalizeFaceNormal('up')) > 0
        const colorFace = mapColorToFace(adjacentStick.color)
        const directives = makeDirectives('down', rotateTime, counterClockwise).concat(makeDirectives(colorFace, 2))
        await this.puzzleCube.do(directives)
      }
      else {
        const [adjacentStick] = findAdjacentStick(white, 'up')
        const colorNormal = mapNomalizeFaceColorNormal(adjacentStick.color)
        const angle = vec3.angle(white.faceNormals.up, colorNormal)
        const rotateTime = Math.round(angle / (Math.PI / 2))
        const counterClockwise = vec3.angle(vec3.cross(vec3.create(), adjacentStick.faceNormal, colorNormal), mapNomalizeFaceNormal('up')) < 0
        const colorFace = mapColorToFace(adjacentStick.color)
        const faces: FaceName[] = ['front', 'right', 'back', 'left']
        const [directive1, directive2] = [colorFace, faces[(faces.indexOf(colorFace) + 1) % faces.length]].map(mapSliceNameToShort)
        const directives = makeDirectives('down', rotateTime, counterClockwise)
          .concat([`D`, directive2, `${directive1}'`, `${directive2}'`])
        await this.puzzleCube.do(directives)
      }
    }

    let count = 0
    while (!checkPlusFormed()) {
      await tryUpperLayer()
        || await tryMiddleLayer()
      await tryDownLayer()
      count++
      assert(count < 12, 'forming plus should not try more than 100 times.')
    }
  }

  async step2_FinishWhiteFace() {
    // put the white corner to the upper layer or down layer at it's coresponding position
    // repeat R' D' R D until it facing upper
    const atCorrectCorner = (cube: Cube, facesAt: FaceName[]) => {
      return facesAt.every(face => !!cube.faceColorNames[face])
    }

    const isAtCorrectCorner = (cube: Cube) => atCorrectCorner(
      cube,
      this.puzzleCube.facesCubeAt(cube).filter(face => face !== 'down')
    )

    const isAllCornerCorrect = () => {
      const upperLayer = this.puzzleCube.getSlice('up')
      return upperLayer.cubes.every(cube => colorFacingOf('white', cube) === 'up')
    }

    const correctWhiteCorner = async (whiteCorner: Cube) => {
      const faces: FaceName[] = ['front', 'right', 'back', 'left', 'front']
      const facesAt = this.puzzleCube.facesCubeAt(whiteCorner)
      const rotationFace = find(faces, (_, i) => facesAt.includes(faces[i - 1]) && facesAt.includes(faces[i]), 1)
      assert(!!rotationFace, `rotationFace of ${facesAt} should be founded.`)
      const directive = mapSliceNameToShort(rotationFace)
      const directives = `${directive}' D' ${directive} D`

      while (!facingAllCorrect(whiteCorner, this.puzzleCube)) {
        await this.puzzleCube.do(directives)
      }
    }

    const correctWhiteCornerAtUpper = async () => {
      const upperLayer = this.puzzleCube.getSlice('up')
      const whiteCorners = upperLayer.cubes
        .filter(cube => cube.type === 'corner'
          && cube.faceColorNames.up === 'white'
          && !facingAllCorrect(cube, this.puzzleCube)
        )
      for (const whiteCorner of whiteCorners) {
        if (!isAtCorrectCorner(whiteCorner)) break
        await correctWhiteCorner(whiteCorner)
      }
    }

    const correctWhiteCornerAtDown = async () => {
      const downLayer = this.puzzleCube.getSlice('down')
      const whiteCorners = downLayer.cubes.filter(cube => cube.type === 'corner' && cube.faceColorNames.up === 'white')
      for (const whiteCorner of whiteCorners) {
        while (!isAtCorrectCorner(whiteCorner)) {
          await this.puzzleCube.do('D')
        }
        await correctWhiteCorner(whiteCorner)
      }
    }
    const rotateWhiteToDown = () => this.puzzleCube.do('L L MRL MRL R R')

    let count = 0
    while (!isAllCornerCorrect()) {
      await correctWhiteCornerAtUpper()
      await correctWhiteCornerAtDown()
      count++
      assert(count < 12, `correct white corner should run less than 12 times.`)
    }
    await rotateWhiteToDown()
  }

  async setp3_CenterLayer() {
    // find the upper layer edge
    // move it to coresponding face
    // do the left or right algorithm to move it to the center layer
    // left: U' L' U L U F U' F'
    // right: U R U' R' U' F' U F
    const colorNotFacing = (edge: Cube, face: FaceName) => {
      const color = Object.values(edge.faceColorNames).find(color => colorFacingOf(color, edge) !== face)
      assert(!!color, 'edge color not facing up should be founded.')
      return color
    }
    const colorFacing = (edge: Cube, face: FaceName) => {
      const color = Object.values(edge.faceColorNames).find(color => colorFacingOf(color, edge) === face)
      assert(!!color, `edge color not facing up should be founded. ${JSON.stringify(edge)}`)
      return color
    }
    const rotateToColorFace = async (edge: Cube) => {
      // find the color not facing up
      // rotate the upper layer until it facing the correct face
      const color = colorNotFacing(edge, 'up')
      const targetFace = this.puzzleCube.faceColorAt(color)
      while (colorFacingOf(color, edge) !== targetFace) {
        await this.puzzleCube.do('U')
      }
      while (colorFacingOf(color, edge) !== 'front') {
        await this.puzzleCube.do(`U MUD D'`)
      }
    }
    const runLeftAligorithm = () => this.puzzleCube.do(`U' L' U L U F U' F'`)
    const runRightAligorithm = () => this.puzzleCube.do(`U R U' R' U' F' U F`)
    const moveToCenterLayer = async (edge: Cube) => {
      const colorUp = colorFacing(edge, 'up')
      const targetFace = this.puzzleCube.faceColorAt(colorUp)
      assert(targetFace === 'left' || targetFace === 'right', `traget face should not be ${targetFace}`)
      if (targetFace === 'left') {
        await runLeftAligorithm()
      } else {
        await runRightAligorithm()
      }
    }
    const edgesToCorrect = () => {
      const upperLayer = this.puzzleCube.getSlice('up')
      const edges = upperLayer.cubes.filter(cube => cube.type === 'edge' && !Object.values(cube.faceColorNames).includes('yellow'))
      return edges
    }
    const centerLayerAllFacingCorrect = () => {
      const centerLayer = this.puzzleCube.getSlice('hfront')
      return centerLayer.cubes.every((cube) => facingAllCorrect(cube, this.puzzleCube))
    }

    let count = 0
    while (!centerLayerAllFacingCorrect()) {
      let edges = edgesToCorrect()
      if (edges.length === 0) {
        const centerLayer = this.puzzleCube.getSlice('hfront')
        const stuckCube = centerLayer.cubes.find((cube) => !facingAllCorrect(cube, this.puzzleCube))
        assert(!!stuckCube, `stuckCube at center layer must exist when not edges at uppper layer.`)

        const color = colorNotFacing(stuckCube, 'up')
        console.log('color, stuckCube=', color, stuckCube)
        // while (colorFacingOf(color, stuckCube) !== 'front') {
        // await this.puzzleCube.do(`U MUD D'`)
        // }
        // await runLeftAligorithm()
        edges = edgesToCorrect()
      }
      for (const edge of edges) {
        await rotateToColorFace(edge)
        await moveToCenterLayer(edge)
      }
      count++
      assert(count < 4, 'correcting center layer should run less than 4 times.')
    }
  }
}
