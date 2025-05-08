'use client'

import { useEffect, useRef } from 'react'

const BirthdayCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const c = canvasRef.current
    if (!c) return

    let w = (c.width = window.innerWidth),
      h = (c.height = window.innerHeight)
    // eslint-disable-next-line prefer-const
    let ctx = c.getContext('2d') as CanvasRenderingContext2D,
      hw = w / 2,
      hh = h / 2

    const Tau = Math.PI * 2
    const TauQuarter = Tau / 4

    const opts = {
      strings: ['HAPPY', 'BIRTHDAY!', 'to You'],
      charSize: 30,
      charSpacing: 35,
      lineHeight: 40,
      cx: w / 2,
      cy: h / 2,

      fireworkPrevPoints: 10,
      fireworkBaseLineWidth: 5,
      fireworkAddedLineWidth: 8,
      fireworkSpawnTime: 200,
      fireworkBaseReachTime: 30,
      fireworkAddedReachTime: 30,
      fireworkCircleBaseSize: 20,
      fireworkCircleAddedSize: 10,
      fireworkCircleBaseTime: 30,
      fireworkCircleAddedTime: 30,
      fireworkCircleFadeBaseTime: 10,
      fireworkCircleFadeAddedTime: 5,
      fireworkBaseShards: 5,
      fireworkAddedShards: 5,
      fireworkShardPrevPoints: 3,
      fireworkShardBaseVel: 4,
      fireworkShardAddedVel: 2,
      fireworkShardBaseSize: 3,
      fireworkShardAddedSize: 3,
      gravity: 0.1,
      upFlow: -0.1,
      letterContemplatingWaitTime: 360,
      balloonSpawnTime: 20,
      balloonBaseInflateTime: 10,
      balloonAddedInflateTime: 10,
      balloonBaseSize: 20,
      balloonAddedSize: 20,
      balloonBaseVel: 0.4,
      balloonAddedVel: 0.4,
      balloonBaseRadian: -(Math.PI / 2 - 0.5),
      balloonAddedRadian: -1,
    }

    const calc = {
      totalWidth: opts.charSpacing * Math.max(...opts.strings.map((s) => s.length)),
    }

    const letters: any[] = []

    ctx.font = `${opts.charSize}px Verdana`

    function generateBalloonPath(
      ctx: CanvasRenderingContext2D,
      x: number,
      y: number,
      size: number,
    ) {
      ctx.moveTo(x, y)
      ctx.bezierCurveTo(x - size / 2, y - size / 2, x - size / 4, y - size, x, y - size)
      ctx.bezierCurveTo(x + size / 4, y - size, x + size / 2, y - size / 2, x, y)
    }

    // ======= Classes =======
    class Shard {
      x: number
      y: number
      vx: number
      vy: number
      color: string
      prevPoints: number[][]
      size: number
      alive: boolean

      constructor(x: number, y: number, vx: number, vy: number, color: string) {
        const vel = opts.fireworkShardBaseVel + opts.fireworkShardAddedVel * Math.random()

        this.vx = vx * vel
        this.vy = vy * vel
        this.x = x
        this.y = y
        this.prevPoints = [[x, y]]
        this.color = color
        this.alive = true
        this.size = opts.fireworkShardBaseSize + opts.fireworkShardAddedSize * Math.random()
      }
    }

    class Letter {
      char: string
      x: number
      y: number
      dx: number
      dy: number
      fireworkDy: number
      color: string
      lightAlphaColor: string
      lightColor: string
      alphaColor: string
      phase: string | undefined
      tick: number | undefined
      tick2: number | undefined
      spawned: boolean | undefined
      spawningTime: number | undefined
      reachTime: number | undefined
      lineWidth: number | undefined
      prevPoints: any[]
      circleFinalSize: number | undefined
      circleCompleteTime: number | undefined
      circleCreating: boolean | undefined
      circleFading: boolean | undefined
      circleFadeTime: number | undefined
      shards: Shard[] | undefined
      cx: number | undefined
      cy: number | undefined
      spawning: boolean | undefined
      spawnTime: number | undefined
      inflating: boolean | undefined
      inflateTime: number | undefined
      size: number | undefined
      vx: number | undefined
      vy: number | undefined

      constructor(char: string, x: number, y: number) {
        this.char = char
        this.x = x
        this.y = y
        this.dx = -ctx.measureText(char).width / 2
        this.dy = +opts.charSize / 2
        this.fireworkDy = this.y - hh

        const hue = (x / calc.totalWidth) * 360
        this.color = `hsl(${hue},80%,50%)`
        this.lightAlphaColor = `hsla(${hue},80%,light%,alp)`
        this.lightColor = `hsl(${hue},80%,light%)`
        this.alphaColor = `hsla(${hue},80%,50%,alp)`

        this.prevPoints = [[0, hh, 0]]
        this.reset()
      }

      reset() {
        this.phase = 'firework'
        this.tick = 0
        this.spawned = false
        this.spawningTime = (opts.fireworkSpawnTime * Math.random()) | 0
        this.reachTime =
          (opts.fireworkBaseReachTime + opts.fireworkAddedReachTime * Math.random()) | 0
        this.lineWidth = opts.fireworkBaseLineWidth + opts.fireworkAddedLineWidth * Math.random()
        this.prevPoints = [[0, hh, 0]]
      }

      step() {
        if (this.phase === 'firework') {
          ++this.tick!
          const proportion = this.tick! / this.reachTime!
          const x = this.x * proportion
          const y = hh + this.fireworkDy * proportion
          this.prevPoints.push([x, y, proportion])
          if (this.prevPoints.length > opts.fireworkPrevPoints) this.prevPoints.shift()

          ctx.strokeStyle = this.lightAlphaColor.replace('light', '50%').replace('alp', '0.5')
          ctx.lineWidth = this.lineWidth!
          ctx.beginPath()
          const [firstX, firstY] = this.prevPoints[0]
          ctx.moveTo(firstX, firstY)
          for (let i = 1; i < this.prevPoints.length; ++i) {
            const [px, py] = this.prevPoints[i]
            ctx.lineTo(px, py)
          }
          ctx.stroke()

          if (this.tick! >= this.reachTime!) {
            this.phase = 'contemplate'
            this.tick = 0
          }
        } else if (this.phase === 'contemplate') {
          ++this.tick!
          ctx.fillStyle = this.color
          ctx.fillText(this.char, this.x + this.dx, this.y + this.dy)
          if (this.tick! >= opts.letterContemplatingWaitTime) {
            this.phase = 'balloon'
            this.tick = 0
            this.inflateTime =
              opts.balloonBaseInflateTime + opts.balloonAddedInflateTime * Math.random()
            this.size = opts.balloonBaseSize + opts.balloonAddedSize * Math.random()
            const rad = opts.balloonBaseRadian + opts.balloonAddedRadian * Math.random()
            const vel = opts.balloonBaseVel + opts.balloonAddedVel * Math.random()
            this.vx = Math.cos(rad) * vel
            this.vy = Math.sin(rad) * vel
          }
        } else if (this.phase === 'balloon') {
          ++this.tick!
          if (this.tick! < this.inflateTime!) {
            const proportion = this.tick! / this.inflateTime!
            ctx.strokeStyle = this.lightColor.replace('light', `${30 + 70 * proportion}%`)
            ctx.beginPath()
            generateBalloonPath(ctx, this.x, this.y, this.size! * proportion)
            ctx.stroke()
          } else {
            this.x += this.vx!
            this.y += this.vy!
            ctx.strokeStyle = this.lightColor.replace('light', '100%')
            ctx.beginPath()
            generateBalloonPath(ctx, this.x, this.y, this.size!)
            ctx.stroke()
            ctx.fillStyle = this.color
            ctx.fillText(this.char, this.x + this.dx, this.y + this.dy)

            if (this.y + this.dy + this.size! < 0) {
              this.phase = 'done'
            }
          }
        }
      }
    }

    // Create letters
    for (let i = 0; i < opts.strings.length; ++i) {
      for (let j = 0; j < opts.strings[i].length; ++j) {
        letters.push(
          new Letter(
            opts.strings[i][j],
            j * opts.charSpacing +
              opts.charSpacing / 2 -
              (opts.strings[i].length * opts.charSize) / 2,
            i * opts.lineHeight + opts.lineHeight / 2 - (opts.strings.length * opts.lineHeight) / 2,
          ),
        )
      }
    }
    function anim() {
      requestAnimationFrame(anim)
      ctx.fillStyle = '#111'
      ctx.fillRect(0, 0, w, h)

      let done = true

      // Vẽ pháo hoa + contemplate (cần translate về tâm màn hình)
      ctx.save()
      ctx.translate(hw, hh)
      for (let l = 0; l < letters.length; ++l) {
        if (letters[l].phase === 'firework' || letters[l].phase === 'contemplate') {
          letters[l].step()
          if (letters[l].phase !== 'done') done = false
        }
      }
      ctx.restore()

      // Vẽ bóng bay bình thường (không cần translate)
      for (let l = 0; l < letters.length; ++l) {
        if (letters[l].phase === 'balloon') {
          letters[l].step()
          if (letters[l].phase !== 'done') done = false
        }
      }

      if (done) letters.forEach((l) => l.reset())
    }

    anim()

    const resizeHandler = () => {
      w = c.width = window.innerWidth
      h = c.height = window.innerHeight
      hw = w / 2
      hh = h / 2
      ctx.font = opts.charSize + 'px Verdana'
    }

    window.addEventListener('resize', resizeHandler)
    return () => window.removeEventListener('resize', resizeHandler)
  }, [])

  return <canvas ref={canvasRef} className="fixed top-0 left-0 w-full h-full z-0" />
}

export default BirthdayCanvas
