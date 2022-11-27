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
  return equals(cube.faceNormals[sourceFace], mapNomalizeFaceNormal(targetFace))
}
const facingAllCorrect = (cube: Cube) => {
  const faces = Object.keys(cube.faceColorNames) as FaceName[]
  return faces.every(face => isFacing(face, face, cube))
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
    await this.nomarlizeCubeFaces()
    await this.step1_WhiteEdges()
    await this.step2_FinishWhiteFace()
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
      const whiteLayer = findSliceByColor('white', this.puzzleCube)
      return whiteLayer.cubes
        .filter(cube => cube.type === 'edge')
        .every((cube) => cube.faceColorNames.up === 'white' && vec3.equals(cube.faceNormals.up, mapNomalizeFaceNormal('up')))
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

    while (!checkPlusFormed()) {
      await tryUpperLayer()
        || await tryMiddleLayer()
      await tryDownLayer()
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
      return upperLayer.cubes.every(isAtCorrectCorner)
    }

    const correctWhiteCorner = async (whiteCorner: Cube) => {
      const faces: FaceName[] = ['front', 'right', 'back', 'left', 'front']
      const facesAt = this.puzzleCube.facesCubeAt(whiteCorner)
      const rotationFace = find(faces, (_, i) => facesAt.includes(faces[i - 1]) && facesAt.includes(faces[i]), 1)
      assert(!!rotationFace, `rotationFace of ${facesAt} should be founded.`)
      const directive = mapSliceNameToShort(rotationFace)
      const directives = `${directive}' D' ${directive} D`

      while (!facingAllCorrect(whiteCorner)) {
        await this.puzzleCube.do(directives)
      }
    }

    const correctWhiteCornerAtUpper = async () => {
      const upperLayer = this.puzzleCube.getSlice('up')
      const whiteCorners = upperLayer.cubes
        .filter(cube => cube.type === 'corner'
          && cube.faceColorNames.up === 'white'
          && !facingAllCorrect(cube)
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

    while (!isAllCornerCorrect()) {
      await correctWhiteCornerAtUpper()
      await correctWhiteCornerAtDown()
    }
    await rotateWhiteToDown()
  }
}
