import { assert } from './assert'
import { Cube, FaceName, FACE_NAMES } from './cube'
import { PuzzleCude, mapSliceNameToShort, Slice } from './puzzle-cube'

const makeDirectives = (faceName: FaceName, time: number, counterClockwise = false) => {
  return new Array(time).fill(mapSliceNameToShort(faceName) + (counterClockwise ? `'` : ''))
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
    await this.step3_CenterLayer()
    console.log('-- doing step4 yellow cross --');
    await this.step4_YellowCross()
    console.log('-- doing step5 swap edges --');
    await this.step5_SwapEdges()
    console.log('-- doing step6 cycle corners --');
    await this.step6_CycleCorners()

    console.log('-- all done! --')
  }

  async nomarlizeCubeFaces() {
    const rotateWhiteSliceToUpper = async () => {
      const whiteSlice = this.puzzleCube.getFaceByColor('white')
      const strategies: Record<FaceName, string> = {
        'up': '',
        'down': `L' L' MRL MRL R R`,
        'front': `L' MRL R`,
        'back': `L MRL' R'`,
        'right': `F' MFB' B`,
        'left': `F MFB B'`,
      }
      const directives = strategies[whiteSlice.name as FaceName]
      await this.puzzleCube.do(directives)
    }
    const rotatRedSliceToFront = async () => {
      const redSlice = this.puzzleCube.getFaceByColor('red')
      const directivesMap: Record<FaceName, string> = {
        'up': ``,
        'down': ``,
        'front': ``,
        'back': `U U MUD MUD D' D'`,
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
    const { puzzleCube } = this
    // check whether the white cross finished
    // if not locate the white edge cube and move it to the down layer
    // 1. at up layer: make 2 rotation
    // 2. at middle layer: make L D L'
    // 3. at down layer: move to correct face
    //    a. white facing down: F F
    //    b. else: D R F' R' 
    const checkPlusFormed = () => {
      const whiteLayer = puzzleCube.getFaceByColor('white')
      return whiteLayer.cubes
        .filter(cube => cube.type === 'edge')
        .every((cube) => puzzleCube.isCubeColorAllFacingCorrect(cube))
    }

    const tryUpperLayer = async () => {
      const upperLayer = puzzleCube.getSlice('up')
      const whiteCube = upperLayer.cubes.find((cube) => cube.type === 'edge' && cube.colors.includes('white') && !puzzleCube.isCubeColorAllFacingCorrect(cube))
      if (!whiteCube) return false

      const moveToDownLayer = (facing: FaceName) => puzzleCube.do(makeDirectives(facing, 2))
      const whiteSticker = whiteCube.getFaceByColor('white')
      if (whiteSticker.facing === 'up') {
        const [adjacentStick] = whiteCube.getAdjacentFacesOfColor(whiteSticker.color)
        await moveToDownLayer(adjacentStick.facing)
      } else {
        await moveToDownLayer(whiteSticker.facing)
      }
      return true
    }
    const tryMiddleLayer = async () => {
      const middleLayer = puzzleCube.getSlice('hfront')
      const whiteCube = middleLayer.cubes.find((cube) => cube.type === 'edge' && cube.colors.includes('white'))
      if (!whiteCube) return false

      const whiteSticker = whiteCube.getFaceByColor('white')
      const [adjacentSticker] = whiteCube.getAdjacentFacesOfColor('white')
      const location = puzzleCube.getCubeLocationOnFace(whiteCube, whiteSticker.facing)
      if (location === 'W') await puzzleCube.rotateFaceToFront(whiteSticker.facing)
      else await puzzleCube.rotateFaceToFront(adjacentSticker.facing)
      await puzzleCube.do(`L D L'`)
      return true
    }
    const tryDownLayer = async () => {
      const downLayer = puzzleCube.getSlice('down')
      const whiteCube = downLayer.cubes.find((cube) => cube.type === 'edge' && cube.colors.includes('white'))
      if (!whiteCube) return

      const whiteSticker = whiteCube.getFaceByColor('white')
      const [adjacentSticker] = whiteCube.getAdjacentFacesOfColor('white')
      if (whiteSticker.facing === 'down') {
        // the adjacentColor and where it facing is needed
        // in order to figure out how many time to rotate the down layer
        while (puzzleCube.getColorByFaceName(adjacentSticker.facing) !== adjacentSticker.color) {
          await puzzleCube.do('D')
        }
        await puzzleCube.rotateFaceToFront(adjacentSticker.facing)
        await puzzleCube.do('F F')
      } else {
        while (puzzleCube.getColorByFaceName(whiteSticker.facing) !== adjacentSticker.color) {
          await puzzleCube.do('D')
        }
        await puzzleCube.rotateFaceToFront(whiteSticker.facing)
        await puzzleCube.do(`D R F' R'`)
      }
    }

    let count = 0
    while (!checkPlusFormed()) {
      await tryUpperLayer()
        || await tryMiddleLayer()
      await tryDownLayer()
      count++
      assert(count < 8, 'forming plus should not try more than 8 times.')
    }
  }

  async step2_FinishWhiteFace() {
    const { puzzleCube } = this
    // put the white corner to the upper layer or down layer at it's coresponding position
    // repeat R' D' R D until it facing upper
    const isAtCorrectCorner = (cube: Cube, layer: 'up' | 'down' = 'up') => {
      assert(cube.type === 'corner', 'cube is not corner.')
      const cornerColors = puzzleCube.getColorsOfCubeFacing(cube)
      assert(cornerColors.length === 3, `cornerColor should has 3 colors: ${cornerColors}`)
      const colors = cube.colors.filter(color => layer === 'down' ? color !== 'white' : true)
      return colors.every(color => cornerColors.includes(color))
    }

    const correctWhiteCorner = async (whiteCorner: Cube) => {
      const whiteSticker = whiteCorner.getFaceByColor('white')
      assert(whiteSticker.facing !== 'up', 'white sticker should not facing up.')

      const stickers = whiteCorner.getAdjacentFacesOfColor('white').concat(whiteSticker)
        .filter(sticker => sticker.facing !== 'up' && sticker.facing !== 'down')
      assert(stickers.length === 2)

      const location = puzzleCube.getCubeLocationOnFace(whiteCorner, stickers[0].facing)
      if (location.includes('E')) {
        await puzzleCube.rotateFaceToFront(stickers[0].facing)
      }
      else if (location.includes('W')) {
        await puzzleCube.rotateFaceToFront(stickers[1].facing)
      }
      else {
        assert(false, 'white sticker should not at other than NW or NE.')
      }

      let count = 0
      while (!puzzleCube.isCubeColorAllFacingCorrect(whiteCorner)) {
        await puzzleCube.do(`R' D' R D`)
        count++
        assert(count < 8, 'correct white corner need less than 8 times.')
      }
    }

    const correctWhiteCornerAtUpper = async () => {
      const upperLayer = puzzleCube.getSlice('up')
      const whiteCorners = upperLayer.cubes
        .filter(cube => cube.type === 'corner'
          && cube.colors.includes('white')
          && !puzzleCube.isCubeColorAllFacingCorrect(cube))

      const moveCornerToDown = async (corner: Cube) => {
        const isAnyWhiteAtDownLayer = puzzleCube.getSlice('down').cubes
          .some(cube => cube.colors.includes('white'))
        if (isAnyWhiteAtDownLayer) return

        const colorNotUp = corner.colors.find(color => corner.getFaceByColor(color).facing !== 'up')
        assert(!!colorNotUp)
        const facing = corner.getFaceByColor(colorNotUp).facing
        const location = puzzleCube.getCubeLocationOnFace(corner, facing)
        await puzzleCube.rotateFaceToFront(facing)
        assert(location === 'NE' || location === 'NW')
        if (location === 'NE') puzzleCube.do(`R' D R`)
        else puzzleCube.do(`L D L'`)
      }

      for (const whiteCorner of whiteCorners) {
        if (!isAtCorrectCorner(whiteCorner)) await moveCornerToDown(whiteCorner);
        else await correctWhiteCorner(whiteCorner)
      }
    }

    const correctWhiteCornerAtDown = async () => {
      const downLayer = puzzleCube.getSlice('down')
      const whiteCorners = downLayer.cubes.filter(cube => cube.type === 'corner' && cube.colors.includes('white'))
      for (const whiteCorner of whiteCorners) {
        let count = 0
        while (!isAtCorrectCorner(whiteCorner, 'down')) {
          await puzzleCube.do('D')
          count++
          assert(count < 4, 'white corner should not rotate more that 4 times.', 'whiteCorner: ', whiteCorner)
        }
        await correctWhiteCorner(whiteCorner)
      }
    }
    const isAllCornerCorrect = () => {
      const upperLayer = puzzleCube.getSlice('up')
      return upperLayer.cubes.every(cube => puzzleCube.isCubeColorAllFacingCorrect(cube))
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

  async step3_CenterLayer() {
    // find the upper layer edge
    // move it to coresponding face
    // do the left or right algorithm to move it to the center layer
    // left: U' L' U L U F U' F'
    // right: U R U' R' U' F' U F
    const { puzzleCube } = this
    const doLeftAligorithm = () => puzzleCube.do(`U' L' U L U F U' F'`)
    const doRightAligorithm = () => puzzleCube.do(`U R U' R' U' F' U F`)
    const rotateEdgeOfUpperLayerToCorrectFace = async (edge: Cube) => {
      // find the color not facing up
      // rotate the upper layer until it facing the correct face
      const colorNotUp = edge.colors.find(color => edge.getFaceByColor(color).facing !== 'up')
      assert(!!colorNotUp, 'edge should have color not facing up.')
      const targetFace = puzzleCube.getFaceByColor(colorNotUp).name
      while (edge.getFaceByColor(colorNotUp).facing !== targetFace) {
        await puzzleCube.do('U')
      }
      while (edge.getFaceByColor(colorNotUp).facing !== 'front') {
        await puzzleCube.do(`U MUD D'`)
      }
    }
    const moveEdgeOfUpperLayerToCenterLayer = async (edge: Cube) => {
      const colorUp = edge.getColorByFacing('up')
      const targetFace = puzzleCube.getFaceByColor(colorUp).name
      assert(targetFace === 'left' || targetFace === 'right', `traget face should not be ${targetFace}`)
      if (targetFace === 'left') {
        await doLeftAligorithm()
      } else {
        await doRightAligorithm()
      }
    }
    const getEdgesOfUpperLayerToCorrect = () => {
      const upperLayer = puzzleCube.getSlice('up')
      const uppperLayerColor = puzzleCube.getColorByFaceName('up')
      const edges = upperLayer.cubes.filter(cube => cube.type === 'edge' && !cube.colors.includes(uppperLayerColor))
      return edges
    }
    const isCenterLayerAllFacingCorrect = () => {
      const centerLayer = puzzleCube.getSlice('hfront')
      return centerLayer.cubes.every((cube) => puzzleCube.isCubeColorAllFacingCorrect(cube))
    }
    const correctEdgesOfUpperLayer = async () => {
      const edges = getEdgesOfUpperLayerToCorrect()
      for (const edge of edges) {
        await rotateEdgeOfUpperLayerToCorrectFace(edge)
        await moveEdgeOfUpperLayerToCenterLayer(edge)
      }
    }
    const moveStuckedEdgeFromCenterLayerToUpper = async () => {
      const centerLayer = puzzleCube.getSlice('hfront')
      const stuckedEdge = centerLayer.cubes.find(cube => cube.type === 'edge'
        && puzzleCube.isCubeAtCorrectLayer(cube, 'hfront')
        && !puzzleCube.isCubeColorAllFacingCorrect(cube))
      if (!stuckedEdge) return

      const sticker = stuckedEdge.getFaceByColor(stuckedEdge.colors[0])
      const location = puzzleCube.getCubeLocationOnFace(stuckedEdge, sticker.facing)
      assert(sticker.facing !== 'up' && sticker.facing !== 'down', 'edge of center layer should not facing up or down.')
      assert(location === 'E' || location === 'W', 'edge of center layer should only at E or W.')
      await puzzleCube.rotateFaceToFront(sticker.facing)
      if (location === 'E') await doRightAligorithm()
      else await doLeftAligorithm()
    }

    let count = 0
    while (!isCenterLayerAllFacingCorrect()) {
      await moveStuckedEdgeFromCenterLayerToUpper()
      await correctEdgesOfUpperLayer()
      count++
      assert(count < 8, 'correcting center layer should run less than 8 times.')
    }
  }

  async step4_YellowCross() {
    // do F R U R' U' F'
    // until corss formed
    const { puzzleCube } = this
    const yellowLayer = puzzleCube.getFaceByColor('yellow')
    assert(yellowLayer.name === 'up', 'yellowLayer should facing up.')

    type CorssState = {
      state: 'dot' | 'line' | 'triangle' | 'cross'
      edges: Cube[]
    }
    const getCrossState = (): CorssState => {
      const edges = yellowLayer.cubes.filter(cube => cube.type === 'edge')
      const yellowFacingUpEdges = edges.filter(cube => cube.getColorByFacing('up') === 'yellow')
      let state: any
      if (yellowFacingUpEdges.length === 0) state = 'dot'
      else if (yellowFacingUpEdges.length === 4) state = 'cross'
      else {
        const edgeLocations = yellowFacingUpEdges.map(edge => puzzleCube.getCubeLocationOnFace(edge, 'up'))
        if ((edgeLocations.includes('N') && edgeLocations.includes('S'))
          || (edgeLocations.indexOf('W') && edgeLocations.includes('E')))
          state = 'line'
        else
          state = 'triangle'
      }
      return { state, edges: yellowFacingUpEdges }
    }
    const formCross = async ({ state, edges }: CorssState) => {
      if (state === 'line' || state === 'triangle') {
        const adjacentFacing = edges.flatMap(edge => edge.getAdjacentFacesOfColor('yellow')[0].facing)
        if (state === 'line' && adjacentFacing.includes('front')) {
          await puzzleCube.do('U')
        }
        else if (state === 'triangle') {
          if (adjacentFacing.includes('left') && adjacentFacing.includes('front')) await puzzleCube.do('U')
          else if (adjacentFacing.includes('front') && adjacentFacing.includes('right')) await puzzleCube.do('U U')
          else if (adjacentFacing.includes('right') && adjacentFacing.includes('back')) await puzzleCube.do(`U'`)
        }
      }

      await puzzleCube.do(`F R U R' U' F'`)
    }

    let count = 0
    let crossState = getCrossState()
    while (crossState.state !== 'cross') {
      await formCross(crossState)
      crossState = getCrossState()
      count++
      assert(count < 12, 'doing to form yellow cross should less than 12 times.')
    }
  }

  async step5_SwapEdges() {
    const { puzzleCube } = this
    const upper = puzzleCube.getSlice('up')
    const edgeStickers = upper.cubes
      .filter((cube) => cube.type === 'edge')
      .flatMap((edge) => edge.getStickers())
      .filter(sticker => sticker.facing !== 'up')
    const doAlgorithm = () => puzzleCube.do(`R U R' U R U U R' U`)
    const getLeftSticker = () => edgeStickers.find(sticker => sticker.facing === 'left')!
    const getFrontSticker = () => edgeStickers.find(sticker => sticker.facing === 'front')!
    const getBackSticker = () => edgeStickers.find((sticker) => sticker.facing === 'back')!

    const rotateUpperToCorrectBackEdge = async () => {
      const backColor = puzzleCube.getColorByFaceName('back')
      while (getBackSticker().color !== backColor) {
        await puzzleCube.do('U')
      }
    }
    const correctLeftEdge = async () => {
      const colorLeft = puzzleCube.getColorByFaceName('left')

      if (getLeftSticker().color === colorLeft) { }
      else if (getFrontSticker().color === colorLeft) {
        await doAlgorithm()
      }
      else {
        await puzzleCube.do(`U`)
        await doAlgorithm()
        await puzzleCube.do(`U'`)
        await doAlgorithm()
      }
    }
    const correctRestEdges = async () => {
      const frontColor = puzzleCube.getColorByFaceName('front')
      if (getFrontSticker().color !== frontColor) {
        await puzzleCube.do(`U`)
        await doAlgorithm()
        await puzzleCube.do(`U'`)
      }
    }

    await rotateUpperToCorrectBackEdge()
    await correctLeftEdge()
    await correctRestEdges()
  }

  async step6_CycleCorners() {
    const { puzzleCube } = this
    const upper = puzzleCube.getSlice('up')
    const corners = upper.cubes.filter(cube => cube.type === 'corner')
    const doAlgorithm = () => puzzleCube.do(`U R U' L' U R' U' L`)
    const findRightCorner = async () => {
      const find = () => corners.find(corner => puzzleCube.isCubeAtCorrectPosition(corner))
      let corner: Cube | undefined
      let count = 0
      while (!(corner = find())) {
        await doAlgorithm()
        count++
        assert(count < 4, 'right corner should be founded before cylce 4 times.')
      }
      return corner
    }
    const rotateCornerToSE = async (corner: Cube) => {
      let count = 0
      while (puzzleCube.getCubeLocationOnFace(corner, 'up') !== 'SE') {
        await puzzleCube.do(`U MUD D'`)
        assert(count < 4, 'rotate corner to SE should run less than 4 times.')
      }
    }
    const cycleRestToPosition = async () => {
      const isAllCornerAtPosition = () => corners.every(corner => puzzleCube.isCubeAtCorrectPosition(corner))
      let count = 0
      while (!isAllCornerAtPosition()) {
        await doAlgorithm()
        count++
        assert(count < 4, 'cycle rest to position should be founded before cylce 4 times.')
      }
    }

    const corner = await findRightCorner()
    await rotateCornerToSE(corner)
    await cycleRestToPosition()
  }
}
